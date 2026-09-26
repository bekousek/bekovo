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
import { pointInPolygon } from '../core/math';
import { bodyArea } from '../scene/mass';
import type { Body, Fluid, SceneDoc } from '../scene/schema';

type PoseGetter = (id: string) => { x: number; y: number; angle: number } | null;
/** Rychlost těžiště tělesa — pro výpočet odporu kapaliny. */
type VelGetter = (id: string) => { vx: number; vy: number } | null;
/** Aplikace reakčního impulsu na dynamické těleso (obousměrná vazba). */
type ImpulseApplier = (id: string, ix: number, iy: number) => void;

// ---------------------------------------------------------------------------
// Konstanty
// ---------------------------------------------------------------------------

const SOLVER_ITERS = 4;  // víc iterací = pevnější nestlačitelnost (méně „vaření")
const EPSILON = 60.0;    // PBF relaxační parametr (menší = silnější korekce hustoty)
const MAX_N = 4096;      // bezpečnostní limit částic na kapalinu
const XSPH_SCALE = 0.03; // základ XSPH (viscosity je 0–1, scale je multiplikátor)
const MAX_VEL = 20.0;    // clamp rychlosti [m/s]
/**
 * Mírné tlumení rychlosti za tick. Tlumí energii vstříknutou pozičními
 * korekcemi u stěn/dna (jinak kapalina „vře" a nikdy se neusadí), aniž by
 * znatelně bránila volnému pádu. 1 = bez tlumení.
 */
const VEL_DAMPING = 0.99;
/** Koeficient odporu kapaliny na ponořené těleso. Volen tak, aby vztlaková
 * „pružina" byla u plovoucího tělesa přibližně kriticky tlumená → těleso se
 * na hladině usadí bez dlouhého houpání (ne podtlumené kmitání dno↔hladina).
 * Odpor se měří vůči klidné kapalině, ne lokální rychlosti — tu si klesající
 * těleso strhává s sebou, takže by odpor zmizel. */
const FLUID_DRAG = 40.0;
/**
 * Strop vztlaku jako násobek tíhy tělesa. I plně ponořené lehké těleso tak
 * zrychluje vzhůru nejvýš ~(RATIO−1)·g — nikdy se „nevystřelí" do vesmíru,
 * ať už odhad ponoru selže jakkoli.
 */
const BUOYANCY_MAX_RATIO = 2.5;
/** Strop změny rychlosti tělesa z vazby na kapalinu za tick [m/s] (stabilita). */
const MAX_COUPLE_DV = 0.6;

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


function initFluid(def: Fluid): FluidSim {
  const r = def.particleRadius;
  const h = 2.5 * r;
  const h2 = h * h;
  const poly6C = 4.0 / (Math.PI * Math.pow(h, 8));
  const spkyC = -30.0 / (Math.PI * Math.pow(h, 5));
  const m = def.restDensity * (2 * r) * (2 * r);

  // Spawn částic v mřížce uvnitř regionu.
  const { x: rx, y: ry, width: rw, height: rh } = def.region;
  let spacing = 2 * r;
  let cols = Math.max(1, Math.floor(rw / spacing));
  let rows = Math.max(1, Math.floor(rh / spacing));
  if (cols * rows > MAX_N) {
    // Příliš mnoho částic → zvětši rozteč tak, aby se rozprostřely po CELÉ
    // oblasti. (Jinak se zaplnilo jen dno a vršek regionu zůstal prázdný.)
    spacing = Math.sqrt((rw * rh) / MAX_N);
    cols = Math.max(1, Math.floor(rw / spacing));
    rows = Math.max(1, Math.floor(rh / spacing));
  }
  const N = Math.min(cols * rows, MAX_N);

  const xs = new Float32Array(N);
  const ys = new Float32Array(N);
  let k = 0;
  outer: for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (k >= N) break outer;
      xs[k] = rx + spacing * 0.5 + col * spacing;
      ys[k] = ry + spacing * 0.5 + row * spacing;
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
        const bx = lx - (shape.offset?.x ?? 0);
        const by = ly - (shape.offset?.y ?? 0);
        if (Math.abs(bx) < hw && Math.abs(by) < hh) {
          const dxL = bx + hw;
          const dxR = hw - bx;
          const dyB = by + hh;
          const dyT = hh - by;
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
      case 'polygon': {
        const pts = shape.points;
        if (pointInPolygon({ x: lx, y: ly }, pts)) {
          // Uvnitř polygonu → posun na nejbližší bod obvodu (nejkratší cesta ven).
          let bestD2 = Infinity;
          let qx = lx;
          let qy = ly;
          for (let i = 0; i < pts.length; i++) {
            const a = pts[i]!;
            const b = pts[(i + 1) % pts.length]!;
            const ex = b.x - a.x;
            const ey = b.y - a.y;
            const len2 = ex * ex + ey * ey;
            const tt = len2 > 0 ? Math.max(0, Math.min(1, ((lx - a.x) * ex + (ly - a.y) * ey) / len2)) : 0;
            const cxp = a.x + ex * tt;
            const cyp = a.y + ey * tt;
            const d2 = (lx - cxp) * (lx - cxp) + (ly - cyp) * (ly - cyp);
            if (d2 < bestD2) {
              bestD2 = d2;
              qx = cxp;
              qy = cyp;
            }
          }
          const nlx = qx - lx;
          const nly = qy - ly;
          return { cx: ca2 * nlx - sa2 * nly, cy: sa2 * nlx + ca2 * nly };
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

/** Světový AABB tělesa (bez nekonečných rovin) — pro odhad ponoru. */
function bodyWorldExtent(
  body: Body,
  pose: { x: number; y: number; angle: number },
): { minX: number; maxX: number; minY: number; maxY: number } | null {
  const ca = Math.cos(pose.angle);
  const sa = Math.sin(pose.angle);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let has = false;
  const add = (lx: number, ly: number) => {
    const wx = pose.x + ca * lx - sa * ly;
    const wy = pose.y + sa * lx + ca * ly;
    if (wx < minX) minX = wx;
    if (wx > maxX) maxX = wx;
    if (wy < minY) minY = wy;
    if (wy > maxY) maxY = wy;
    has = true;
  };
  for (const shape of body.shapes) {
    switch (shape.type) {
      case 'circle': {
        const ox = shape.offset?.x ?? 0;
        const oy = shape.offset?.y ?? 0;
        add(ox - shape.r, oy - shape.r);
        add(ox + shape.r, oy + shape.r);
        break;
      }
      case 'box': {
        const ox = shape.offset?.x ?? 0;
        const oy = shape.offset?.y ?? 0;
        const sca = Math.cos(shape.angle);
        const ssa = Math.sin(shape.angle);
        for (const [cx, cy] of [[-shape.hw, -shape.hh], [shape.hw, -shape.hh], [shape.hw, shape.hh], [-shape.hw, shape.hh]] as const) {
          add(ox + sca * cx - ssa * cy, oy + ssa * cx + sca * cy);
        }
        break;
      }
      case 'polygon':
        for (const pt of shape.points) add(pt.x, pt.y);
        break;
      case 'plane':
        break; // nekonečná — ponor nedává smysl
    }
  }
  return has ? { minX, maxX, minY, maxY } : null;
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
  private bodies: {
    body: Body;
    pose: () => { x: number; y: number; angle: number } | null;
    /** Dynamické těleso přijímá reakční impuls od částic. */
    dynamic: boolean;
    /** Odhad hmotnosti [kg] pro dělení korekce podle poměru hmotností. */
    mass: number;
  }[] = [];
  private allBodies: Body[] = [];
  private gravity = { x: 0, y: -9.81 };

  constructor(
    private readonly getPose: PoseGetter,
    private readonly applyImpulse: ImpulseApplier | null = null,
    private readonly getVel: VelGetter | null = null,
  ) {}

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
      dynamic: body.bodyType === 'dynamic',
      mass: Math.max(1e-6, bodyArea(body) * body.material.density),
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
          // Jen STLAČENÍ (C ≥ 0). Záporná podmínka u řídké volné hladiny by
          // částice přitahovala (tahová nestabilita) → shluky a exploze.
          const C = Math.max(0, rho[i]! / rho0 - 1.0);
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
          // Pozn.: `f` už obsahuje 1/rho0 (gradient omezení ∇C = ∇W/rho0),
          // takže korekce Δp = (1/rho0)·Σ(λi+λj)·∇W je HOTOVÁ. Dřívější
          // druhé dělení rho0 zde dělalo tlak ~1000× slabší → kapalina byla
          // fakticky bez tlaku, propadla se ke dnu, tam se rozdrtila a poziční
          // odtlačení ji „vystřelilo" (vaření). Odstraněno.
          // Strop korekce za iteraci ~ zlomek h → tlumí přestřelení (stabilita).
          const maxC = 0.25 * h;
          const dl = Math.hypot(dpx[i]!, dpy[i]!);
          if (dl > maxC) {
            const sc = maxC / dl;
            dpx[i] = dpx[i]! * sc;
            dpy[i] = dpy[i]! * sc;
          }
        }

        // Aplikace korekci + kolize s telesy
        for (let i = 0; i < N; i++) {
          px[i] = px[i]! + dpx[i]!;
          py[i] = py[i]! + dpy[i]!;
        }

        // Odtlačení částic od těles (jednosměrné: tělesa vytlačují částice).
        // Vztlak a odpor na těleso řeší samostatný hydrostatický průchod níže.
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

      // 3. Aktualizace rychlosti (z posunu predikce) + tlumení + clamp
      for (let i = 0; i < N; i++) {
        let nvx = ((px[i]! - x[i]!) / dt) * VEL_DAMPING;
        let nvy = ((py[i]! - y[i]!) / dt) * VEL_DAMPING;
        const v2 = nvx * nvx + nvy * nvy;
        if (v2 > MAX_VEL * MAX_VEL) {
          const s = MAX_VEL / Math.sqrt(v2);
          nvx *= s;
          nvy *= s;
        }
        vx[i] = nvx;
        vy[i] = nvy;
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
                    dvx[i] = (dvx[i] ?? 0) + ((vx[j] ?? 0) - (vx[i] ?? 0)) * w;
                    dvy[i] = (dvy[i] ?? 0) + ((vy[j] ?? 0) - (vy[i] ?? 0)) * w;
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

      // Obousměrná vazba: hydrostatický vztlak + odpor na dynamická tělesa
      // (po finálních polohách i rychlostech kapaliny).
      this.applyBuoyancy(sim, dt);
    }
  }

  /**
   * Hydrostatický vztlak + odpor na dynamická tělesa (obousměrná vazba).
   * Ponor odhadneme z výšky hladiny kapaliny u tělesa: Fb = ρ·g·(šířka·ponor).
   * Lehčí těleso než kapalina vyplave, těžší klesne — bez pronikání částic.
   */
  private applyBuoyancy(sim: FluidSim, dt: number): void {
    if (!this.applyImpulse) return;
    const gMag = Math.hypot(this.gravity.x, this.gravity.y);
    if (gMag < 1e-9) return;
    const rho0 = sim.def.restDensity;
    const ux = -this.gravity.x / gMag; // směr „nahoru" (proti gravitaci)
    const uy = -this.gravity.y / gMag;
    const { N, x, y, h } = sim;
    if (N === 0) return;
    // Bez dynamických těles není na co vztlak aplikovat → přeskočit i řazení.
    if (!this.bodies.some((b) => b.dynamic)) return;

    // Globální hladina kapaliny = vysoký percentil výšky (podél „nahoru").
    // Robustní vůči šplouchnutí i vůči částicím, které si těleso vytáhne s
    // sebou — pár odlehlých bodů percentil neposune, takže vztlak nemá zpětnou
    // vazbu, která dřív těleso vymrštila. Zároveň zjistíme vodorovný rozsah
    // kapaliny pro bránu „těleso je nad kapalinou".
    const proj = new Float64Array(N);
    let fluidMinX = Infinity;
    let fluidMaxX = -Infinity;
    for (let i = 0; i < N; i++) {
      proj[i] = x[i]! * ux + y[i]! * uy;
      const xi = x[i]!;
      if (xi < fluidMinX) fluidMinX = xi;
      if (xi > fluidMaxX) fluidMaxX = xi;
    }
    proj.sort();
    const surfaceLevel = proj[Math.min(N - 1, Math.floor(N * 0.95))]!;

    for (const { body, dynamic, mass } of this.bodies) {
      if (!dynamic) continue;
      const p = this.getPose(body.id);
      if (!p) continue;
      const ext = bodyWorldExtent(body, p);
      if (!ext) continue;
      const width = ext.maxX - ext.minX;
      const height = ext.maxY - ext.minY;
      if (width <= 1e-6 || height <= 1e-6) continue;

      // Těleso musí ležet nad kapalinou i vodorovně (jinak by „vzdálený bazén"
      // dodával fantomový vztlak). Bez nároku na částice těsně u tělesa —
      // ponořené těleso u dna kolem sebe kapalinu vytlačí, ale vztlak dostat má.
      if (ext.maxX < fluidMinX - h || ext.minX > fluidMaxX + h) continue;

      // Ponor = kolik tělesa je pod globální hladinou (podél „nahoru").
      const bottomLevel = ext.minX * ux + ext.minY * uy; // spodní hrana AABB
      const topLevel = ext.maxX * ux + ext.maxY * uy;
      const bodySpan = Math.max(1e-6, topLevel - bottomLevel);
      const submergedFrac = Math.max(0, Math.min(1, (surfaceLevel - bottomLevel) / bodySpan));
      if (submergedFrac <= 0) continue;

      // Vztlak (plošná hustota): Fb = ρ·g·plocha·ponor, se stropem k·tíze.
      const area = Math.max(1e-6, bodyArea(body));
      let Fb = rho0 * gMag * area * submergedFrac;
      Fb = Math.min(Fb, BUOYANCY_MAX_RATIO * mass * gMag);
      let ix = ux * Fb * dt;
      let iy = uy * Fb * dt;

      // Odpor: odebere zlomek rychlosti tělesa (vůči klidné kapalině). Nikdy
      // ji neobrátí (damp ≤ 0,6) → stabilní. Škáluje s ponorem.
      const bv = this.getVel ? this.getVel(body.id) : null;
      if (bv) {
        const damp = Math.min(0.6, FLUID_DRAG * submergedFrac * dt);
        ix += -bv.vx * damp * mass;
        iy += -bv.vy * damp * mass;
      }

      // Strop změny rychlosti za tick (stabilita).
      const dv = Math.hypot(ix, iy) / mass;
      const s = dv > MAX_COUPLE_DV ? MAX_COUPLE_DV / dv : 1;
      this.applyImpulse(body.id, ix * s, iy * s);
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
