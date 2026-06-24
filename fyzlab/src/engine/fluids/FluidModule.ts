/**
 * FluidModule — 2D Position-Based Fluids (F4).
 *
 * Implementuje PBF solver (Macklin & Müller 2013) se sdílenou hustotní
 * podmínkou, XSPH viskozitou a jednosměrnou vazbou na rigidní tělesa
 * (tělesa odtlačují částice, ale částice tělesem nepohybují).
 *
 * Pořadí v ticku: rigid → fluid → optics → instruments.
 * Modul neimportuje DOM/Pixi/React.
 */
import type { SimModule, TickCtx, BodyState } from '../core/SimModule';
import type { SnapshotWriter } from '../snapshot/layout';
import type { Body, Fluid, SceneDoc } from '../scene/schema';

type PoseGetter = (id: string) => { x: number; y: number; angle: number } | null;

// ---------------------------------------------------------------------------
// Konstanty
// ---------------------------------------------------------------------------

const SOLVER_ITERS = 3;
const EPSILON = 150.0;   // PBF relaxační parametr (větší = stabilnější)
const MAX_N = 4096;      // bezpečnostní limit částic na kapalinu
const XSPH_SCALE = 0.03; // základ XSPH (viscosity je 0–1, scale je multiplikátor)
const MAX_VEL = 20.0;    // clamp rychlosti [m/s]

// ---------------------------------------------------------------------------
// Interní data jedné kapaliny
// ---------------------------------------------------------------------------

interface FluidSim {
  def: Fluid;
  N: number;
  h: number;   // interakční poloměr = 2.5 * particleRadius
  m: number;   // hmotnost části = restDensity × (2r)²
  h2: number;  // h²
  poly6C: number;
  spkyC: number;
  // SoA pozice/rychlosti
  x: Float32Array;
  y: Float32Array;
  px: Float32Array; // predikované
  py: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  // PBF pracovní pole
  rho: Float32Array;
  lam: Float32Array;
  dpx: Float32Array;
  dpy: Float32Array;
  // Prostorový hash (open addressing s linked listy)
  htSize: number;
  htMask: number;
  ht: Int32Array;  // hlavy řetězů (-1 = prázdná buňka)
  hn: Int32Array;  // next ukazatele (-1 = konec řetězu)
}

// ---------------------------------------------------------------------------
// Pomocné funkce
// ---------------------------------------------------------------------------

function nextPow2(n: number): number {
  let v = 1;
  while (v < n) v <<= 1;
  return v;
}

function cellHash(px: number, py: number, h: number, mask: number): number {
  const cx = Math.floor(px / h) | 0;
  const cy = Math.floor(py / h) | 0;
  return ((cx * 73856093) ^ (cy * 19349663)) & mask;
}

function buildHash(sim: FluidSim): void {
  sim.ht.fill(-1);
  const { N, h, htMask, px, py, ht, hn } = sim;
  for (let i = 0; i < N; i++) {
    const c = cellHash(px[i]!, py[i]!, h, htMask);
    hn[i] = ht[c]!;
    ht[c] = i;
  }
}

function buildHashXY(sim: FluidSim): void {
  // Varianta buildHash pro finální (x,y) — pro XSPH po snapnutí pozic.
  sim.ht.fill(-1);
  const { N, h, htMask, x, y, ht, hn } = sim;
  for (let i = 0; i < N; i++) {
    const c = cellHash(x[i]!, y[i]!, h, htMask);
    hn[i] = ht[c]!;
    ht[c] = i;
  }
}

function initFluid(def: Fluid): FluidSim {
  const r = def.particleRadius;
  const h = 2.5 * r;
  const h2 = h * h;
  const poly6C = 4.0 / (Math.PI * Math.pow(h, 8));
  const spkyC = -30.0 / (Math.PI * Math.pow(h, 5));
  const m = def.restDensity * (2 * r) * (2 * r);

  // Spawn částic v mřížce uvnitř regionu.
  const { x: rx, y: ry, width: rw, height: rh } = def.region;
  const spacing = 2 * r;
  const cols = Math.max(1, Math.floor(rw / spacing));
  const rows = Math.max(1, Math.floor(rh / spacing));
  const N = Math.min(cols * rows, MAX_N);

  const xs = new Float32Array(N);
  const ys = new Float32Array(N);
  let k = 0;
  outer: for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (k >= N) break outer;
      xs[k] = rx + r + col * spacing;
      ys[k] = ry + r + row * spacing;
      k++;
    }
  }

  const htSize = nextPow2(Math.max(N * 4, 64));
  return {
    def,
    N,
    h, m, h2, poly6C, spkyC,
    x: xs, y: ys,
    px: new Float32Array(N), py: new Float32Array(N),
    vx: new Float32Array(N), vy: new Float32Array(N),
    rho: new Float32Array(N), lam: new Float32Array(N),
    dpx: new Float32Array(N), dpy: new Float32Array(N),
    htSize, htMask: htSize - 1,
    ht: new Int32Array(htSize).fill(-1),
    hn: new Int32Array(N).fill(-1),
  };
}

// ---------------------------------------------------------------------------
// Kolize s rigidním tělesem (jednosměrná vazba)
// ---------------------------------------------------------------------------

function pushOut(
  ipx: number, ipy: number,
  body: Body,
  pose: { x: number; y: number; angle: number },
): { cx: number; cy: number } | null {
  const ca = Math.cos(-pose.angle);
  const sa = Math.sin(-pose.angle);
  const lx = ca * (ipx - pose.x) - sa * (ipy - pose.y);
  const ly = sa * (ipx - pose.x) + ca * (ipy - pose.y);
  const ca2 = Math.cos(pose.angle);
  const sa2 = Math.sin(pose.angle);

  for (const shape of body.shapes) {
    switch (shape.type) {
      case 'plane': {
        if (ly < 0) {
          const d = -ly;
          return { cx: -sa2 * d, cy: ca2 * d };
        }
        break;
      }
      case 'box': {
        const hw = shape.hw;
        const hh = shape.hh;
        if (Math.abs(lx) < hw && Math.abs(ly) < hh) {
          const dxL = lx + hw;
          const dxR = hw - lx;
          const dyB = ly + hh;
          const dyT = hh - ly;
          let nlx = 0, nly = 0, depth = 0;
          if (dxL < dxR && dxL < dyB && dxL < dyT) {
            nlx = -1; depth = dxL;
          } else if (dxR <= dxL && dxR < dyB && dxR < dyT) {
            nlx = 1; depth = dxR;
          } else if (dyB < dyT) {
            nly = -1; depth = dyB;
          } else {
            nly = 1; depth = dyT;
          }
          return { cx: (ca2 * nlx - sa2 * nly) * depth, cy: (sa2 * nlx + ca2 * nly) * depth };
        }
        break;
      }
      case 'circle': {
        const dr = shape.r;
        const dx = lx - (shape.offset?.x ?? 0);
        const dy = ly - (shape.offset?.y ?? 0);
        const dist2 = dx * dx + dy * dy;
        if (dist2 < dr * dr) {
          const dist = Math.sqrt(dist2);
          const depth = dr - dist;
          if (dist > 1e-9) {
            const nx = ca2 * (dx / dist) - sa2 * (dy / dist);
            const ny = sa2 * (dx / dist) + ca2 * (dy / dist);
            return { cx: nx * depth, cy: ny * depth };
          }
          return { cx: 0, cy: depth };
        }
        break;
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// FluidModule
// ---------------------------------------------------------------------------

export interface FluidExport {
  id: string;
  positions: Float32Array; // [x0, y0, x1, y1, …]
}

export class FluidModule implements SimModule {
  readonly name = 'fluid';

  private sims: FluidSim[] = [];
  private bodies: { body: Body; pose: () => { x: number; y: number; angle: number } | null }[] = [];
  private allBodies: Body[] = [];
  private gravity = { x: 0, y: -9.81 };

  constructor(private readonly getPose: PoseGetter) {}

  build(doc: SceneDoc): void {
    this.gravity = { ...doc.world.gravity };
    this.allBodies = doc.entities.filter((e): e is Body => e.kind === 'body');
    this.sims = doc.entities
      .filter((e): e is Fluid => e.kind === 'fluid')
      .map((f) => initFluid(f));
    this.buildBodies();
  }

  setGravity(g: { x: number; y: number }): void {
    this.gravity = { ...g };
  }

  addFluid(f: Fluid): void {
    if (!this.sims.some((s) => s.def.id === f.id)) {
      this.sims.push(initFluid(f));
    }
  }

  removeFluid(id: string): void {
    this.sims = this.sims.filter((s) => s.def.id !== id);
  }

  replaceFluid(f: Fluid): void {
    const idx = this.sims.findIndex((s) => s.def.id === f.id);
    const next = initFluid(f);
    if (idx >= 0) this.sims[idx] = next;
    else this.sims.push(next);
  }

  addBody(body: Body): void {
    if (!this.allBodies.some((b) => b.id === body.id)) {
      this.allBodies.push(body);
      this.buildBodies();
    }
  }

  removeBody(id: string): void {
    this.allBodies = this.allBodies.filter((b) => b.id !== id);
    this.buildBodies();
  }

  replaceBody(body: Body): void {
    const idx = this.allBodies.findIndex((b) => b.id === body.id);
    if (idx >= 0) this.allBodies[idx] = body;
    else this.allBodies.push(body);
    this.buildBodies();
  }

  private buildBodies(): void {
    this.bodies = this.allBodies.map((body) => ({
      body,
      pose: () => this.getPose(body.id) ?? { x: body.transform.x, y: body.transform.y, angle: body.transform.angle },
    }));
  }

  tick(ctx: TickCtx): void {
    const { dt } = ctx;
    const { x: gx, y: gy } = this.gravity;

    for (const sim of this.sims) {
      const { N, h, h2, m, poly6C, spkyC, ht, hn, htMask } = sim;
      const rho0 = sim.def.restDensity;
      if (N === 0) continue;

      const { x, y, px, py, vx, vy, rho, lam, dpx, dpy } = sim;

      // 1. Predikovane polohy
      for (let i = 0; i < N; i++) {
        vx[i] = vx[i]! + gx * dt;
        vy[i] = vy[i]! + gy * dt;
        px[i] = x[i]! + vx[i]! * dt;
        py[i] = y[i]! + vy[i]! * dt;
      }

      // 2. PBF iterace
      for (let iter = 0; iter < SOLVER_ITERS; iter++) {
        buildHash(sim);

        // Hustota
        for (let i = 0; i < N; i++) {
          const ipx = px[i]!;
          const ipy = py[i]!;
          let d = poly6C * Math.pow(h2, 3); // self-term (r=0)
          // Sousedi v 3×3 celach
          const cx0 = Math.floor(ipx / h) | 0;
          const cy0 = Math.floor(ipy / h) | 0;
          for (let dcx = -1; dcx <= 1; dcx++) {
            for (let dcy = -1; dcy <= 1; dcy++) {
              const c = ((cx0 + dcx) * 73856093 ^ (cy0 + dcy) * 19349663) & htMask;
              let j = ht[c]!;
              while (j >= 0) {
                if (j !== i) {
                  const dx = ipx - px[j]!;
                  const dy = ipy - py[j]!;
                  const r2 = dx * dx + dy * dy;
                  if (r2 < h2) {
                    const x2 = h2 - r2;
                    d += poly6C * x2 * x2 * x2;
                  }
                }
                j = hn[j]!;
              }
            }
          }
          rho[i] = m * d;
        }

        // Lambda
        for (let i = 0; i < N; i++) {
          const C = rho[i]! / rho0 - 1.0;
          const ipx = px[i]!;
          const ipy = py[i]!;
          let sumGrad2 = 0;
          let accx = 0;
          let accy = 0;
          const cx0 = Math.floor(ipx / h) | 0;
          const cy0 = Math.floor(ipy / h) | 0;
          for (let dcx = -1; dcx <= 1; dcx++) {
            for (let dcy = -1; dcy <= 1; dcy++) {
              const c = ((cx0 + dcx) * 73856093 ^ (cy0 + dcy) * 19349663) & htMask;
              let j = ht[c]!;
              while (j >= 0) {
                if (j !== i) {
                  const dx = ipx - px[j]!;
                  const dy = ipy - py[j]!;
                  const r2 = dx * dx + dy * dy;
                  if (r2 < h2 && r2 > 0) {
                    const r = Math.sqrt(r2);
                    const f = spkyC * (h - r) * (h - r) / r / rho0;
                    const gxv = f * dx;
                    const gyv = f * dy;
                    sumGrad2 += gxv * gxv + gyv * gyv;
                    accx += gxv;
                    accy += gyv;
                  }
                }
                j = hn[j]!;
              }
            }
          }
          sumGrad2 += accx * accx + accy * accy;
          lam[i] = -C / (sumGrad2 + EPSILON);
        }

        // Korekce polohy
        dpx.fill(0);
        dpy.fill(0);
        for (let i = 0; i < N; i++) {
          const ipx = px[i]!;
          const ipy = py[i]!;
          const li = lam[i]!;
          const cx0 = Math.floor(ipx / h) | 0;
          const cy0 = Math.floor(ipy / h) | 0;
          for (let dcx = -1; dcx <= 1; dcx++) {
            for (let dcy = -1; dcy <= 1; dcy++) {
              const c = ((cx0 + dcx) * 73856093 ^ (cy0 + dcy) * 19349663) & htMask;
              let j = ht[c]!;
              while (j >= 0) {
                if (j !== i) {
                  const dx = ipx - px[j]!;
                  const dy = ipy - py[j]!;
                  const r2 = dx * dx + dy * dy;
                  if (r2 < h2 && r2 > 0) {
                    const r = Math.sqrt(r2);
                    const f = spkyC * (h - r) * (h - r) / r / rho0;
                    const s = (li + lam[j]!) * f;
                    dpx[i] = dpx[i]! + s * dx;
                    dpy[i] = dpy[i]! + s * dy;
                  }
                }
                j = hn[j]!;
              }
            }
          }
          dpx[i] = dpx[i]! / rho0;
          dpy[i] = dpy[i]! / rho0;
        }

        // Aplikace korekci + kolize s telesy
        for (let i = 0; i < N; i++) {
          px[i] = px[i]! + dpx[i]!;
          py[i] = py[i]! + dpy[i]!;
        }

        // Odtlaceni od telesu
        for (const { body, pose } of this.bodies) {
          const p = pose();
          if (!p) continue;
          for (let i = 0; i < N; i++) {
            const corr = pushOut(px[i]!, py[i]!, body, p);
            if (corr) {
              px[i] = px[i]! + corr.cx;
              py[i] = py[i]! + corr.cy;
            }
          }
        }
      }

      // 3. Aktualizace rychlosti
      for (let i = 0; i < N; i++) {
        vx[i] = (px[i]! - x[i]!) / dt;
        vy[i] = (py[i]! - y[i]!) / dt;
        // Clamp
        const v2 = vx[i]! * vx[i]! + vy[i]! * vy[i]!;
        if (v2 > MAX_VEL * MAX_VEL) {
          const s = MAX_VEL / Math.sqrt(v2);
          vx[i] = vx[i]! * s;
          vy[i] = vy[i]! * s;
        }
      }

      // 4. XSPH viskozita
      const c = sim.def.viscosity * XSPH_SCALE * m;
      if (c > 0) {
        // Pouzijeme px/py jako x/y pro hash (uz obsahuji finalni polohy)
        buildHash(sim);
        const dvx = new Float32Array(N);
        const dvy = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          const ipx = px[i]!;
          const ipy = py[i]!;
          const cx0 = Math.floor(ipx / h) | 0;
          const cy0 = Math.floor(ipy / h) | 0;
          for (let dcx = -1; dcx <= 1; dcx++) {
            for (let dcy = -1; dcy <= 1; dcy++) {
              const cell = ((cx0 + dcx) * 73856093 ^ (cy0 + dcy) * 19349663) & htMask;
              let j = ht[cell]!;
              while (j >= 0) {
                if (j !== i) {
                  const dx = ipx - px[j]!;
                  const dy = ipy - py[j]!;
                  const r2 = dx * dx + dy * dy;
                  if (r2 < h2) {
                    const x2 = h2 - r2;
                    const w = poly6C * x2 * x2 * x2;
                    dvx[i] += (vx[j]! - vx[i]!) * w;
                    dvy[i] += (vy[j]! - vy[i]!) * w;
                  }
                }
                j = hn[j]!;
              }
            }
          }
        }
        for (let i = 0; i < N; i++) {
          vx[i] = vx[i]! + c * dvx[i]!;
          vy[i] = vy[i]! + c * dvy[i]!;
        }
      }

      // 5. Kopie predikci do aktualnich poloh
      x.set(px);
      y.set(py);
    }
  }

  readFluidData(): FluidExport[] {
    return this.sims.map((sim) => {
      const { N, x, y } = sim;
      const positions = new Float32Array(N * 2);
      for (let i = 0; i < N; i++) {
        positions[i * 2] = x[i]!;
        positions[i * 2 + 1] = y[i]!;
      }
      return { id: sim.def.id, positions };
    });
  }

  writeSnapshot(_w: SnapshotWriter): void {}
  readState(): BodyState[] { return []; }
  dispose(): void {
    this.sims = [];
    this.bodies = [];
  }
}
