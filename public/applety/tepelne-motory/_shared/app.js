/* ═══════════════════════════════════════════════════
   Tepelné motory – interaktivní applet
   6 typů motorů s animací průřezu
   ═══════════════════════════════════════════════════ */
'use strict';

// ── Engine definitions ──────────────────────────────
const ALL_ENGINES = [
  {
    id: 'zazehovy', name: 'Zážehový motor', sub: 'benzínový, čtyřdobý',
    phases: [
      { name: '1. Sání', desc: 'Píst jde dolů, sací ventil otevřen — nasává se směs paliva a vzduchu.', color: '#3b82f6' },
      { name: '2. Komprese', desc: 'Oba ventily zavřeny, píst stlačuje směs.', color: '#f59e0b' },
      { name: '3. Expanze', desc: 'Svíčka zapálí směs — plyny tlačí píst dolů.', color: '#ef4444' },
      { name: '4. Výfuk', desc: 'Výfukový ventil otevřen, píst vytlačuje spaliny.', color: '#6b7280' },
    ],
    draw: (c, p, w, h) => drawFourStroke(c, p, w, h, 'gasoline'),
  },
  {
    id: 'vznetovy', name: 'Vznětový motor', sub: 'dieselový, čtyřdobý',
    phases: [
      { name: '1. Sání', desc: 'Píst jde dolů, sací ventil otevřen — nasává se čistý vzduch.', color: '#3b82f6' },
      { name: '2. Komprese', desc: 'Píst silně stlačuje vzduch — ten se zahřívá.', color: '#f59e0b' },
      { name: '3. Expanze', desc: 'Vstříknuté palivo se vznítí — plyny tlačí píst dolů.', color: '#ef4444' },
      { name: '4. Výfuk', desc: 'Výfukový ventil otevřen, píst vytlačuje spaliny.', color: '#6b7280' },
    ],
    draw: (c, p, w, h) => drawFourStroke(c, p, w, h, 'diesel'),
  },
  {
    id: 'dvoutaktovy', name: 'Dvoutaktový motor', sub: 'zjednodušený cyklus',
    phases: [
      { name: 'Komprese + sání', desc: 'Píst jde nahoru — stlačuje směs nahoře, nasává do klikové skříně.', color: '#f59e0b' },
      { name: 'Expanze + výfuk', desc: 'Směs se zapálí, píst jde dolů — otevírají se přepouštěcí a výfukové kanály.', color: '#ef4444' },
    ],
    draw: drawTwoStroke,
  },
  {
    id: 'parni', name: 'Parní stroj', sub: 'dvojčinný',
    phases: [
      { name: 'Expanze vpřed', desc: 'Pára vstupuje zleva a tlačí píst doprava.', color: '#3b82f6' },
      { name: 'Expanze vzad', desc: 'Pára vstupuje zprava a tlačí píst doleva.', color: '#60a5fa' },
    ],
    draw: drawSteam,
  },
  {
    id: 'proudovy', name: 'Proudový motor', sub: 'turbínový',
    phases: [
      { name: 'Kontinuální provoz', desc: 'Vzduch je nasáván, stlačen kompresorem, smíchán s palivem a zapálen. Horké plyny roztáčí turbínu a unikají tryskou.', color: '#f59e0b' },
    ],
    draw: drawJet,
  },
  {
    id: 'raketovy', name: 'Raketový motor', sub: 'na kapalné palivo',
    phases: [
      { name: 'Kontinuální provoz', desc: 'Palivo a okysličovadlo se mísí a hoří ve spalovací komoře. Plyny expandují Lavalovou tryskou a vytvářejí tah.', color: '#ef4444' },
    ],
    draw: drawRocket,
  },
];

// ── Filter engines by window.ENGINE_FILTER (if set) ─
// Each subtopic applet page sets window.ENGINE_FILTER = ['id1', 'id2', ...]
// before loading this script, so only relevant engines appear.
const ENGINES = Array.isArray(window.ENGINE_FILTER)
  ? ALL_ENGINES.filter((e) => window.ENGINE_FILTER.includes(e.id))
  : ALL_ENGINES;

// ── State ───────────────────────────────────────────
let cur = 0;           // engine index
let phase = 0;         // 0–1 cycle progress
let playing = true;
let speed = 1;
const FRAMES = 180;    // steps per cycle
const STEP = 1 / FRAMES;
let lastTs = 0;
let cw = 800, ch = 600; // CSS-pixel canvas size

// ── DOM refs ────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// ── Resize ──────────────────────────────────────────
function resize() {
  const wrap = document.getElementById('canvas-wrap');
  const r = wrap.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const aspect = 4 / 3;
  let w = r.width - 32, h = r.height - 24;
  if (w < 100) w = 100;
  if (h < 100) h = 100;
  if (w / h > aspect) w = h * aspect; else h = w / aspect;
  cw = Math.round(w); ch = Math.round(h);
  canvas.width = cw * dpr; canvas.height = ch * dpr;
  canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);

// ── Drawing helpers ─────────────────────────────────
const PI = Math.PI, TAU = PI * 2;

function roundRect(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

function metalGrad(c, x, y, w, h, base, dir) {
  const g = dir === 'h'
    ? c.createLinearGradient(x, 0, x + w, 0)
    : c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, lighten(base, 18));
  g.addColorStop(0.5, base);
  g.addColorStop(1, darken(base, 12));
  return g;
}

function lighten(hex, pct) { return adjustColor(hex, pct); }
function darken(hex, pct) { return adjustColor(hex, -pct); }
function adjustColor(hex, pct) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.min(255, Math.max(0, r + Math.round(r * pct / 100)));
  g = Math.min(255, Math.max(0, g + Math.round(g * pct / 100)));
  b = Math.min(255, Math.max(0, b + Math.round(b * pct / 100)));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function label(c, text, x, y, size, color, align) {
  c.font = `${size}px 'Segoe UI', system-ui, sans-serif`;
  c.textAlign = align || 'center';
  c.textBaseline = 'middle';
  c.fillStyle = color || '#94a3b8';
  c.fillText(text, x, y);
}

function labelBold(c, text, x, y, size, color, align) {
  c.font = `bold ${size}px 'Segoe UI', system-ui, sans-serif`;
  c.textAlign = align || 'center';
  c.textBaseline = 'middle';
  c.fillStyle = color || '#e2e8f0';
  c.fillText(text, x, y);
}

function arrow(c, x1, y1, x2, y2, color, w) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hl = 10;
  c.strokeStyle = color; c.lineWidth = w || 3; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x2, y2);
  c.lineTo(x2 - hl * Math.cos(a - 0.4), y2 - hl * Math.sin(a - 0.4));
  c.lineTo(x2 - hl * Math.cos(a + 0.4), y2 - hl * Math.sin(a + 0.4));
  c.closePath(); c.fill();
}

// Begin drawing in 800x600 logical space, centered and scaled
function beginLogical(c, w, h) {
  const sx = w / 800, sy = h / 600, s = Math.min(sx, sy);
  const ox = (w - 800 * s) / 2, oy = (h - 600 * s) / 2;
  c.save(); c.translate(ox, oy); c.scale(s, s);
  return s;
}

// ── Draw a coil spring (zigzag) ─────────────────────
function drawSpring(c, x, y1, y2, coils, width) {
  const len = y2 - y1;
  const step = len / (coils * 2);
  c.beginPath();
  c.moveTo(x, y1);
  for (let i = 0; i < coils * 2; i++) {
    const ny = y1 + (i + 1) * step;
    const nx = (i % 2 === 0) ? x + width / 2 : x - width / 2;
    c.lineTo(nx, ny);
  }
  c.lineTo(x, y2);
  c.strokeStyle = '#94a3b8';
  c.lineWidth = 2;
  c.stroke();
}

// ── Outline helper for clean technical drawing look ──
function outlineRect(c, x, y, w, h) {
  c.strokeStyle = '#1e293b'; c.lineWidth = 2;
  c.strokeRect(x, y, w, h);
}

function outlineRoundRect(c, x, y, w, h, r) {
  roundRect(c, x, y, w, h, r);
  c.strokeStyle = '#1e293b'; c.lineWidth = 2;
  c.stroke();
}

function outlineCircle(c, x, y, r) {
  c.beginPath(); c.arc(x, y, r, 0, TAU);
  c.strokeStyle = '#1e293b'; c.lineWidth = 2;
  c.stroke();
}

/* ═══════════════════════════════════════════════════
   FOUR-STROKE ENGINE (gasoline / diesel)
   ═══════════════════════════════════════════════════ */
function drawFourStroke(c, phase, w, h, type) {
  beginLogical(c, w, h);

  // Geometry constants — shifted left to CX=320 for flywheel room
  const CX = 320;
  const R = 65;            // crank radius
  const L = 140;           // rod length
  const CRANK_CY = 455;   // crank center y

  const CYL_L = 210, CYL_R = 430;         // cylinder inner edges
  const CYL_W = CYL_R - CYL_L;            // 220
  const WALL = 14;                          // wall thickness
  const HEAD_T = 100, HEAD_B = 150;        // head top/bottom
  const CYL_BOT = 395;                     // cylinder walls end
  const DOME_DEPTH = 10;                   // combustion chamber dome depth

  const PISTON_H = 28;

  // ── Crank kinematics ──
  const crankA = phase * 4 * PI;           // 2 revolutions per cycle
  const cpx = CX + R * Math.sin(crankA);
  const cpy = CRANK_CY - R * Math.cos(crankA);
  const dx = cpx - CX;
  const pistonCY = cpy - Math.sqrt(L * L - dx * dx);

  const strokeIdx = Math.min(3, Math.floor(phase * 4));
  const strokePh = (phase * 4) % 1;

  // ── Valve openings ──
  let ivOpen = 0, evOpen = 0;
  if (strokeIdx === 0) ivOpen = Math.sin(strokePh * PI);
  if (strokeIdx === 3) evOpen = Math.sin(strokePh * PI);
  const maxDrop = 18;

  // ── Gas fill — gradient-based with density changes ──
  const gasTop = HEAD_B;
  const gasBot = pistonCY - PISTON_H / 2;

  if (gasBot > gasTop + 2) {
    // Compute gas opacity based on compression ratio (volume)
    const maxVolume = 200; // approximate max gas column height
    const curVolume = gasBot - gasTop;
    const compressionRatio = Math.max(0.15, Math.min(1, curVolume / maxVolume));

    let gasGrad;
    if (strokeIdx === 0) {
      // Intake — light blue, opacity increases as more fills
      const fillAmount = 1 - compressionRatio; // more filled = lower compression ratio
      gasGrad = c.createLinearGradient(0, gasTop, 0, gasBot);
      gasGrad.addColorStop(0, `rgba(147,197,253,${0.1 + 0.25 * (1 - compressionRatio)})`);
      gasGrad.addColorStop(1, `rgba(100,160,240,${0.15 + 0.2 * (1 - compressionRatio)})`);
    } else if (strokeIdx === 1) {
      // Compression — amber, density increases (opacity increases as volume shrinks)
      const density = 1 / compressionRatio;
      const opac = Math.min(0.65, 0.15 + 0.35 * (density - 1));
      gasGrad = c.createLinearGradient(0, gasTop, 0, gasBot);
      gasGrad.addColorStop(0, `rgba(251,191,36,${opac})`);
      gasGrad.addColorStop(1, `rgba(245,158,11,${opac * 0.8})`);
    } else if (strokeIdx === 2) {
      // Power — red/orange, very dense at start, fading
      const density = 1 / compressionRatio;
      const opac = Math.min(0.7, 0.2 + 0.3 * (density - 1));
      gasGrad = c.createLinearGradient(0, gasTop, 0, gasBot);
      gasGrad.addColorStop(0, `rgba(239,68,68,${opac})`);
      gasGrad.addColorStop(0.5, `rgba(249,115,22,${opac * 0.9})`);
      gasGrad.addColorStop(1, `rgba(251,191,36,${opac * 0.7})`);
    } else {
      // Exhaust — gray
      gasGrad = c.createLinearGradient(0, gasTop, 0, gasBot);
      gasGrad.addColorStop(0, `rgba(156,163,175,${0.15 + 0.1 * (1 / compressionRatio - 1)})`);
      gasGrad.addColorStop(1, `rgba(120,130,145,${0.1 + 0.1 * (1 / compressionRatio - 1)})`);
    }
    c.fillStyle = gasGrad;
    // Draw gas fill with dome shape at top
    c.beginPath();
    c.moveTo(CYL_L, gasTop);
    c.quadraticCurveTo(CX, gasTop - DOME_DEPTH, CYL_R, gasTop);
    c.lineTo(CYL_R, gasBot);
    c.lineTo(CYL_L, gasBot);
    c.closePath();
    c.fill();
  }

  // ── Combustion glow ──
  if (strokeIdx === 2 && strokePh < 0.35) {
    const t = 1 - strokePh / 0.35;
    c.save();
    c.shadowBlur = 60 * t;
    c.shadowColor = `rgba(255,120,20,${0.9 * t})`;
    c.fillStyle = `rgba(255,160,60,${0.3 * t})`;
    c.beginPath();
    c.moveTo(CYL_L, gasTop);
    c.quadraticCurveTo(CX, gasTop - DOME_DEPTH, CYL_R, gasTop);
    c.lineTo(CYL_R, gasBot);
    c.lineTo(CYL_L, gasBot);
    c.closePath();
    c.fill();
    c.restore();
  }

  // ── Spark / injection flash ──
  if (type === 'gasoline' && phase > 0.49 && phase < 0.52) {
    const t = 1 - Math.abs(phase - 0.505) / 0.015;
    c.save();
    c.shadowBlur = 30 * t;
    c.shadowColor = '#fde68a';
    c.fillStyle = `rgba(253,230,138,${0.9 * t})`;
    c.beginPath(); c.arc(CX, HEAD_B + 4, 8 * t, 0, TAU); c.fill();
    // Spark lightning bolts
    c.strokeStyle = `rgba(253,230,138,${t})`;
    c.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const ang = i * PI / 2 + phase * 20;
      c.beginPath();
      c.moveTo(CX, HEAD_B + 4);
      c.lineTo(CX + Math.cos(ang) * 12 * t, HEAD_B + 4 + Math.sin(ang) * 12 * t);
      c.lineTo(CX + Math.cos(ang + 0.3) * 18 * t, HEAD_B + 4 + Math.sin(ang + 0.3) * 18 * t);
      c.stroke();
    }
    c.restore();
  }
  if (type === 'diesel' && phase > 0.49 && phase < 0.55) {
    const t = 1 - Math.abs(phase - 0.52) / 0.03;
    c.save();
    c.globalAlpha = 0.7 * t;
    c.strokeStyle = '#f59e0b'; c.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      const len = 20 + 15 * t;
      const sx = CX + i * 4;
      c.beginPath(); c.moveTo(sx, HEAD_B + 2); c.lineTo(sx + i * 3, HEAD_B + 2 + len); c.stroke();
    }
    c.restore();
  }

  // ── Cooling fins on cylinder walls ──
  const finLen = 22;
  const finCount = 6;
  const finSpacing = (CYL_BOT - HEAD_B - 20) / (finCount - 1);
  c.strokeStyle = '#4b5563'; c.lineWidth = 3; c.lineCap = 'round';
  for (let i = 0; i < finCount; i++) {
    const fy = HEAD_B + 10 + i * finSpacing;
    // Left side fins
    c.beginPath();
    c.moveTo(CYL_L - WALL, fy);
    c.lineTo(CYL_L - WALL - finLen, fy);
    c.stroke();
    // Right side fins
    c.beginPath();
    c.moveTo(CYL_R + WALL, fy);
    c.lineTo(CYL_R + WALL + finLen, fy);
    c.stroke();
  }
  // Fin outlines
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  for (let i = 0; i < finCount; i++) {
    const fy = HEAD_B + 10 + i * finSpacing;
    c.beginPath();
    c.moveTo(CYL_L - WALL - finLen, fy - 1.5);
    c.lineTo(CYL_L - WALL, fy - 1.5);
    c.moveTo(CYL_L - WALL - finLen, fy + 1.5);
    c.lineTo(CYL_L - WALL, fy + 1.5);
    c.stroke();
    c.beginPath();
    c.moveTo(CYL_R + WALL, fy - 1.5);
    c.lineTo(CYL_R + WALL + finLen, fy - 1.5);
    c.moveTo(CYL_R + WALL, fy + 1.5);
    c.lineTo(CYL_R + WALL + finLen, fy + 1.5);
    c.stroke();
  }

  // ── Cylinder walls ──
  c.fillStyle = metalGrad(c, CYL_L - WALL, HEAD_B, WALL, CYL_BOT - HEAD_B, '#4b5563', 'h');
  c.fillRect(CYL_L - WALL, HEAD_B, WALL, CYL_BOT - HEAD_B);
  outlineRect(c, CYL_L - WALL, HEAD_B, WALL, CYL_BOT - HEAD_B);

  c.fillStyle = metalGrad(c, CYL_R, HEAD_B, WALL, CYL_BOT - HEAD_B, '#4b5563', 'h');
  c.fillRect(CYL_R, HEAD_B, WALL, CYL_BOT - HEAD_B);
  outlineRect(c, CYL_R, HEAD_B, WALL, CYL_BOT - HEAD_B);

  // Wall inner highlight
  c.fillStyle = 'rgba(148,163,184,0.08)';
  c.fillRect(CYL_L, HEAD_B, 3, CYL_BOT - HEAD_B);
  c.fillRect(CYL_R - 3, HEAD_B, 3, CYL_BOT - HEAD_B);

  // ── Cylinder head with domed combustion chamber ──
  c.fillStyle = metalGrad(c, 0, HEAD_T, 0, HEAD_B - HEAD_T, '#4b5563', 'v');
  roundRect(c, CYL_L - WALL - 12, HEAD_T, CYL_W + 2 * WALL + 24, HEAD_B - HEAD_T, 6);
  c.fill();
  outlineRoundRect(c, CYL_L - WALL - 12, HEAD_T, CYL_W + 2 * WALL + 24, HEAD_B - HEAD_T, 6);

  // Draw dome shape on bottom of head
  c.fillStyle = '#374151';
  c.beginPath();
  c.moveTo(CYL_L, HEAD_B);
  c.quadraticCurveTo(CX, HEAD_B - DOME_DEPTH, CYL_R, HEAD_B);
  c.lineTo(CYL_R, HEAD_B);
  c.lineTo(CYL_L, HEAD_B);
  c.closePath();
  c.fillStyle = metalGrad(c, 0, HEAD_B - DOME_DEPTH, 0, DOME_DEPTH, '#3f4753', 'v');
  c.fill();
  // Dome outline
  c.beginPath();
  c.moveTo(CYL_L, HEAD_B);
  c.quadraticCurveTo(CX, HEAD_B - DOME_DEPTH, CYL_R, HEAD_B);
  c.strokeStyle = '#1e293b'; c.lineWidth = 2;
  c.stroke();

  // head bottom edge
  c.fillStyle = '#374151';
  c.fillRect(CYL_L - WALL, HEAD_B - 3, CYL_W + 2 * WALL, 3);

  // ── Intake manifold (left pipe) ──
  const manifoldW = 32;
  const manifoldTopY = 40;
  const ivx = CYL_L + 50;
  const evx = CYL_R - 50;
  const ivDrop = ivOpen * maxDrop;
  const evDrop = evOpen * maxDrop;

  // Intake pipe body
  c.fillStyle = metalGrad(c, ivx - manifoldW / 2 - 35, manifoldTopY, manifoldW, HEAD_T - manifoldTopY + 15, '#4b5563', 'h');
  c.beginPath();
  c.moveTo(ivx - manifoldW / 2, HEAD_T);
  c.lineTo(ivx - manifoldW / 2, HEAD_T - 20);
  c.quadraticCurveTo(ivx - manifoldW / 2, manifoldTopY, ivx - manifoldW / 2 - 35, manifoldTopY);
  c.lineTo(ivx - manifoldW / 2 - 35, manifoldTopY + manifoldW);
  c.quadraticCurveTo(ivx + manifoldW / 2, manifoldTopY + manifoldW + 5, ivx + manifoldW / 2, HEAD_T - 20);
  c.lineTo(ivx + manifoldW / 2, HEAD_T);
  c.closePath();
  c.fill();
  c.strokeStyle = '#1e293b'; c.lineWidth = 2; c.stroke();

  // Intake flow arrows during intake stroke
  if (strokeIdx === 0 && ivOpen > 0.1) {
    const flowAlpha = ivOpen * 0.7;
    c.save();
    c.globalAlpha = flowAlpha;
    // Arrow in pipe
    arrow(c, ivx - manifoldW / 2 - 40, manifoldTopY + manifoldW / 2, ivx - 8, HEAD_T - 5, '#60a5fa', 3);
    // Arrow entering cylinder
    arrow(c, ivx, HEAD_B + 2, ivx, HEAD_B + ivDrop + 15, '#60a5fa', 3);
    c.restore();
  }

  // ── Exhaust manifold (right pipe) ──
  c.fillStyle = metalGrad(c, evx - manifoldW / 2, manifoldTopY, manifoldW, HEAD_T - manifoldTopY + 15, '#4b5563', 'h');
  c.beginPath();
  c.moveTo(evx - manifoldW / 2, HEAD_T);
  c.lineTo(evx - manifoldW / 2, HEAD_T - 20);
  c.quadraticCurveTo(evx - manifoldW / 2, manifoldTopY + manifoldW + 5, evx + manifoldW / 2 + 35, manifoldTopY + manifoldW);
  c.lineTo(evx + manifoldW / 2 + 35, manifoldTopY);
  c.quadraticCurveTo(evx + manifoldW / 2, manifoldTopY, evx + manifoldW / 2, HEAD_T - 20);
  c.lineTo(evx + manifoldW / 2, HEAD_T);
  c.closePath();
  c.fill();
  c.strokeStyle = '#1e293b'; c.lineWidth = 2; c.stroke();

  // Exhaust flow arrows during exhaust stroke
  if (strokeIdx === 3 && evOpen > 0.1) {
    const flowAlpha = evOpen * 0.7;
    c.save();
    c.globalAlpha = flowAlpha;
    // Arrow leaving cylinder
    arrow(c, evx, HEAD_B + evDrop + 15, evx, HEAD_B + 2, '#9ca3af', 3);
    // Arrow in pipe
    arrow(c, evx + 8, HEAD_T - 5, evx + manifoldW / 2 + 40, manifoldTopY + manifoldW / 2, '#9ca3af', 3);
    c.restore();
  }

  // ── Intake valve (left) ──
  // port opening (gas flow)
  if (ivOpen > 0.05) {
    c.fillStyle = strokeIdx === 0 ? 'rgba(147,197,253,0.5)' : 'rgba(156,163,175,0.3)';
    c.fillRect(ivx - 16, HEAD_B, 32, ivDrop);
  }
  // valve disc
  c.fillStyle = '#78716c';
  roundRect(c, ivx - 16, HEAD_B + ivDrop - 5, 32, 5, 2); c.fill();
  c.strokeStyle = '#1e293b'; c.lineWidth = 1.5;
  roundRect(c, ivx - 16, HEAD_B + ivDrop - 5, 32, 5, 2); c.stroke();
  // valve stem
  c.fillStyle = '#94a3b8';
  c.fillRect(ivx - 2.5, HEAD_T - 15, 5, HEAD_B - HEAD_T + 15 + ivDrop);
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  c.strokeRect(ivx - 2.5, HEAD_T - 15, 5, HEAD_B - HEAD_T + 15 + ivDrop);

  // Intake valve spring
  const ivSpringTop = HEAD_T - 32;
  const ivSpringBot = HEAD_T - 15 + ivDrop; // spring compresses when valve opens
  drawSpring(c, ivx, ivSpringTop, ivSpringBot, 5, 14);

  // ── Exhaust valve (right) ──
  if (evOpen > 0.05) {
    c.fillStyle = 'rgba(156,163,175,0.4)';
    c.fillRect(evx - 16, HEAD_B, 32, evDrop);
  }
  c.fillStyle = '#78716c';
  roundRect(c, evx - 16, HEAD_B + evDrop - 5, 32, 5, 2); c.fill();
  c.strokeStyle = '#1e293b'; c.lineWidth = 1.5;
  roundRect(c, evx - 16, HEAD_B + evDrop - 5, 32, 5, 2); c.stroke();
  c.fillStyle = '#94a3b8';
  c.fillRect(evx - 2.5, HEAD_T - 15, 5, HEAD_B - HEAD_T + 15 + evDrop);
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  c.strokeRect(evx - 2.5, HEAD_T - 15, 5, HEAD_B - HEAD_T + 15 + evDrop);

  // Exhaust valve spring
  const evSpringTop = HEAD_T - 32;
  const evSpringBot = HEAD_T - 15 + evDrop;
  drawSpring(c, evx, evSpringTop, evSpringBot, 5, 14);

  // ── Spark plug / Injector ──
  if (type === 'gasoline') {
    // Spark plug body
    c.fillStyle = '#d4d4d8';
    roundRect(c, CX - 6, HEAD_T - 28, 12, 25, 3); c.fill();
    outlineRoundRect(c, CX - 6, HEAD_T - 28, 12, 25, 3);
    c.fillStyle = '#71717a';
    c.fillRect(CX - 8, HEAD_T - 6, 16, 8);
    outlineRect(c, CX - 8, HEAD_T - 6, 16, 8);
    // Electrode
    c.fillStyle = '#fbbf24';
    c.fillRect(CX - 1.5, HEAD_B - 2, 3, 6);
  } else {
    // Fuel injector body
    c.fillStyle = '#0ea5e9';
    roundRect(c, CX - 7, HEAD_T - 32, 14, 30, 3); c.fill();
    outlineRoundRect(c, CX - 7, HEAD_T - 32, 14, 30, 3);
    c.fillStyle = '#0284c7';
    c.fillRect(CX - 9, HEAD_T - 6, 18, 8);
    outlineRect(c, CX - 9, HEAD_T - 6, 18, 8);
    // Nozzle tip
    c.fillStyle = '#0ea5e9';
    c.beginPath();
    c.moveTo(CX - 4, HEAD_B - 2);
    c.lineTo(CX + 4, HEAD_B - 2);
    c.lineTo(CX, HEAD_B + 5);
    c.closePath(); c.fill();
    c.strokeStyle = '#1e293b'; c.lineWidth = 1.5; c.stroke();
  }

  // ── Piston ──
  const pistonTop = pistonCY - PISTON_H / 2;
  const pistonBot = pistonCY + PISTON_H / 2;
  const pistonGrad = c.createLinearGradient(0, pistonTop, 0, pistonBot);
  pistonGrad.addColorStop(0, '#9ca3b8');
  pistonGrad.addColorStop(0.3, '#78818f');
  pistonGrad.addColorStop(1, '#64748b');
  c.fillStyle = pistonGrad;
  roundRect(c, CYL_L + 2, pistonTop, CYL_W - 4, PISTON_H, 4);
  c.fill();
  outlineRoundRect(c, CYL_L + 2, pistonTop, CYL_W - 4, PISTON_H, 4);

  // Piston rings
  c.strokeStyle = '#475569'; c.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ry = pistonTop + 5 + i * 6;
    c.beginPath(); c.moveTo(CYL_L + 4, ry); c.lineTo(CYL_R - 4, ry); c.stroke();
  }

  // Wrist pin
  c.fillStyle = '#a1a1aa';
  c.beginPath(); c.arc(CX, pistonCY + 4, 5, 0, TAU); c.fill();
  outlineCircle(c, CX, pistonCY + 4, 5);

  // ── Connecting rod ──
  c.strokeStyle = '#6b7280'; c.lineWidth = 10; c.lineCap = 'round';
  c.beginPath(); c.moveTo(CX, pistonCY + 4); c.lineTo(cpx, cpy); c.stroke();
  // rod edges highlight
  c.strokeStyle = '#94a3b8'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(CX, pistonCY + 4); c.lineTo(cpx, cpy); c.stroke();
  // Rod outline (draw two thin dark lines along edges)
  const rodAngle = Math.atan2(cpy - (pistonCY + 4), cpx - CX);
  const rodNx = Math.cos(rodAngle + PI / 2) * 5;
  const rodNy = Math.sin(rodAngle + PI / 2) * 5;
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  c.beginPath();
  c.moveTo(CX + rodNx, pistonCY + 4 + rodNy);
  c.lineTo(cpx + rodNx, cpy + rodNy);
  c.stroke();
  c.beginPath();
  c.moveTo(CX - rodNx, pistonCY + 4 - rodNy);
  c.lineTo(cpx - rodNx, cpy - rodNy);
  c.stroke();

  // ── Crankshaft ──
  // Main bearing
  c.fillStyle = '#374151';
  c.beginPath(); c.arc(CX, CRANK_CY, 20, 0, TAU); c.fill();
  outlineCircle(c, CX, CRANK_CY, 20);

  // Crank arm
  c.strokeStyle = '#4b5563'; c.lineWidth = 16; c.lineCap = 'round';
  c.beginPath(); c.moveTo(CX, CRANK_CY); c.lineTo(cpx, cpy); c.stroke();
  c.strokeStyle = '#6b7280'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(CX, CRANK_CY); c.lineTo(cpx, cpy); c.stroke();

  // ── Crankshaft counterweight ──
  // Semi-circular weight opposite the crank pin
  const cwAngle = crankA + PI; // opposite to crank pin
  const cwR = 30; // counterweight radius
  const cwDist = 15; // distance from center
  const cwCx = CX + cwDist * Math.sin(cwAngle);
  const cwCy = CRANK_CY - cwDist * Math.cos(cwAngle);
  c.fillStyle = '#374151';
  c.beginPath();
  c.arc(cwCx, cwCy, cwR, cwAngle - PI / 2 - PI / 2, cwAngle - PI / 2 + PI, false);
  c.closePath();
  c.fill();
  c.strokeStyle = '#1e293b'; c.lineWidth = 2;
  c.beginPath();
  c.arc(cwCx, cwCy, cwR, cwAngle - PI / 2 - PI / 2, cwAngle - PI / 2 + PI, false);
  c.closePath();
  c.stroke();
  // Hatching on counterweight for weight indication
  c.strokeStyle = '#2d3748'; c.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    const hx = cwCx + i * 6;
    const hy = cwCy;
    c.beginPath();
    c.moveTo(hx - 4, hy - 8);
    c.lineTo(hx + 4, hy + 8);
    c.stroke();
  }

  // Crank pin
  c.fillStyle = '#94a3b8';
  c.beginPath(); c.arc(cpx, cpy, 8, 0, TAU); c.fill();
  outlineCircle(c, cpx, cpy, 8);

  // Center dot
  c.fillStyle = '#1e293b';
  c.beginPath(); c.arc(CX, CRANK_CY, 5, 0, TAU); c.fill();

  // ── Flywheel (right side) ──
  const FW_CX = 560;
  const FW_CY = CRANK_CY;
  const FW_R = 70;

  // Shaft connecting crankshaft to flywheel
  c.fillStyle = '#475569';
  c.fillRect(CX + 20, CRANK_CY - 6, FW_CX - CX - 20, 12);
  c.strokeStyle = '#1e293b'; c.lineWidth = 1.5;
  c.strokeRect(CX + 20, CRANK_CY - 6, FW_CX - CX - 20, 12);

  // Flywheel outer rim
  c.lineWidth = 14;
  c.strokeStyle = '#475569';
  c.beginPath(); c.arc(FW_CX, FW_CY, FW_R, 0, TAU); c.stroke();
  // Rim highlight
  c.lineWidth = 2;
  c.strokeStyle = '#6b7280';
  c.beginPath(); c.arc(FW_CX, FW_CY, FW_R + 6, 0, TAU); c.stroke();
  c.beginPath(); c.arc(FW_CX, FW_CY, FW_R - 6, 0, TAU); c.stroke();
  // Rim outlines
  c.strokeStyle = '#1e293b'; c.lineWidth = 2;
  c.beginPath(); c.arc(FW_CX, FW_CY, FW_R + 7, 0, TAU); c.stroke();
  c.beginPath(); c.arc(FW_CX, FW_CY, FW_R - 7, 0, TAU); c.stroke();

  // Flywheel spokes (rotate with crank)
  c.strokeStyle = '#4b5563'; c.lineWidth = 6; c.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const sa = crankA + i * PI / 3;
    c.beginPath();
    c.moveTo(FW_CX + 16 * Math.cos(sa), FW_CY + 16 * Math.sin(sa));
    c.lineTo(FW_CX + (FW_R - 10) * Math.cos(sa), FW_CY + (FW_R - 10) * Math.sin(sa));
    c.stroke();
  }
  // Spoke outlines
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const sa = crankA + i * PI / 3;
    const nx = Math.cos(sa + PI / 2) * 3;
    const ny = Math.sin(sa + PI / 2) * 3;
    c.beginPath();
    c.moveTo(FW_CX + 16 * Math.cos(sa) + nx, FW_CY + 16 * Math.sin(sa) + ny);
    c.lineTo(FW_CX + (FW_R - 10) * Math.cos(sa) + nx, FW_CY + (FW_R - 10) * Math.sin(sa) + ny);
    c.stroke();
    c.beginPath();
    c.moveTo(FW_CX + 16 * Math.cos(sa) - nx, FW_CY + 16 * Math.sin(sa) - ny);
    c.lineTo(FW_CX + (FW_R - 10) * Math.cos(sa) - nx, FW_CY + (FW_R - 10) * Math.sin(sa) - ny);
    c.stroke();
  }

  // Flywheel hub
  c.fillStyle = '#374151';
  c.beginPath(); c.arc(FW_CX, FW_CY, 16, 0, TAU); c.fill();
  outlineCircle(c, FW_CX, FW_CY, 16);
  // Center dot
  c.fillStyle = '#1e293b';
  c.beginPath(); c.arc(FW_CX, FW_CY, 4, 0, TAU); c.fill();

  // ── Labels ──
  label(c, 'Sací ventil', ivx, manifoldTopY - 12, 11, '#94a3b8');
  label(c, 'Výfukový ventil', evx, manifoldTopY - 12, 11, '#94a3b8');
  label(c, type === 'gasoline' ? 'Svíčka' : 'Vstřikovač', CX, HEAD_T - 50, 11, '#94a3b8');
  label(c, 'Píst', CYL_L - WALL - finLen - 8, pistonCY, 12, '#94a3b8', 'right');
  label(c, 'Ojnice', CX + 65, (pistonCY + cpy) / 2, 11, '#64748b');
  label(c, 'Klikový hřídel', CX, CRANK_CY + 40, 11, '#64748b');
  label(c, 'Setrvačník', FW_CX, FW_CY + FW_R + 22, 11, '#64748b');
  label(c, 'Chladicí žebra', CYL_R + WALL + finLen + 8, HEAD_B + 40, 10, '#64748b', 'left');

  // ── Dashed lines for labels ──
  c.setLineDash([3, 3]); c.strokeStyle = '#475569'; c.lineWidth = 1;
  // Piston label line
  c.beginPath(); c.moveTo(CYL_L - WALL - finLen - 5, pistonCY); c.lineTo(CYL_L - WALL - 2, pistonCY); c.stroke();
  c.setLineDash([]);

  c.restore();
}

/* ═══════════════════════════════════════════════════
   TWO-STROKE ENGINE
   ═══════════════════════════════════════════════════ */
function drawTwoStroke(c, phase, w, h) {
  beginLogical(c, w, h);

  const CX = 400;
  const R = 65, L = 135;
  const CRANK_CY = 440;

  const CYL_L = 295, CYL_R = 505, CYL_W = CYL_R - CYL_L;
  const WALL = 14;
  const HEAD_T = 90, HEAD_B = 130;
  const CYL_BOT = 390;
  const PISTON_H = 28;

  // 2-stroke: 1 revolution per cycle
  const crankA = phase * TAU;
  const cpx = CX + R * Math.sin(crankA);
  const cpy = CRANK_CY - R * Math.cos(crankA);
  const dx = cpx - CX;
  const pistonCY = cpy - Math.sqrt(L * L - dx * dx);

  const strokeIdx = phase < 0.5 ? 0 : 1; // 0=compression, 1=power
  const pistonTop = pistonCY - PISTON_H / 2;
  const pistonBot = pistonCY + PISTON_H / 2;

  // Ports (in cylinder wall)
  const exhaustPortY = 290;   // exhaust port center
  const transferPortY = 340;  // transfer port center
  const portH = 35;

  // Port exposure: visible when piston top is below port center
  const exhaustExposed = Math.max(0, Math.min(1, (pistonTop - (exhaustPortY - portH / 2)) / portH));
  const transferExposed = Math.max(0, Math.min(1, (pistonTop - (transferPortY - portH / 2)) / portH));

  // ── Gas fill above piston ──
  const gasTop = HEAD_B;
  const gasBot = pistonTop;
  if (gasBot > gasTop) {
    const curVolume = gasBot - gasTop;
    const maxVolume = 200;
    const compressionRatio = Math.max(0.15, Math.min(1, curVolume / maxVolume));
    const density = 1 / compressionRatio;

    let gasGrad;
    if (strokeIdx === 0) {
      const opac = Math.min(0.55, 0.15 + 0.25 * (density - 1));
      gasGrad = c.createLinearGradient(0, gasTop, 0, gasBot);
      gasGrad.addColorStop(0, `rgba(251,191,36,${opac})`);
      gasGrad.addColorStop(1, `rgba(245,158,11,${opac * 0.7})`);
    } else {
      const opac = Math.min(0.6, 0.2 + 0.25 * (density - 1));
      gasGrad = c.createLinearGradient(0, gasTop, 0, gasBot);
      gasGrad.addColorStop(0, `rgba(239,68,68,${opac})`);
      gasGrad.addColorStop(0.5, `rgba(249,115,22,${opac * 0.8})`);
      gasGrad.addColorStop(1, `rgba(251,191,36,${opac * 0.6})`);
    }
    c.fillStyle = gasGrad;
    c.fillRect(CYL_L, gasTop, CYL_W, gasBot - gasTop);
  }

  // Combustion glow at TDC
  if (phase > 0.48 && phase < 0.58) {
    const t = 1 - Math.abs(phase - 0.53) / 0.05;
    c.save();
    c.shadowBlur = 40 * t; c.shadowColor = `rgba(255,120,20,${0.7 * t})`;
    c.fillStyle = `rgba(255,160,60,${0.2 * t})`;
    c.fillRect(CYL_L, gasTop, CYL_W, Math.max(0, gasBot - gasTop));
    c.restore();
  }

  // ── Crankcase gas ──
  const crankcaseTop = CYL_BOT;
  const crankcaseBot = CRANK_CY + 50;
  c.fillStyle = strokeIdx === 0 ? 'rgba(147,197,253,0.15)' : 'rgba(147,197,253,0.25)';
  c.fillRect(CYL_L - WALL, crankcaseTop, CYL_W + 2 * WALL, crankcaseBot - crankcaseTop);

  // ── Transfer passages (curved channels on sides) ──
  const passageW = 20;
  // Left passage
  c.fillStyle = metalGrad(c, CYL_L - WALL - passageW - 4, transferPortY, passageW, crankcaseTop - transferPortY, '#3f4753', 'h');
  c.beginPath();
  c.moveTo(CYL_L - WALL, transferPortY - portH / 2);
  c.lineTo(CYL_L - WALL - passageW, transferPortY - portH / 2 + 10);
  c.quadraticCurveTo(CYL_L - WALL - passageW - 8, (transferPortY + crankcaseTop) / 2, CYL_L - WALL - passageW, crankcaseTop + 5);
  c.lineTo(CYL_L - WALL, crankcaseTop + 5);
  c.lineTo(CYL_L - WALL, crankcaseTop - 5);
  c.lineTo(CYL_L - WALL - passageW + 8, crankcaseTop - 5);
  c.quadraticCurveTo(CYL_L - WALL - passageW + 2, (transferPortY + crankcaseTop) / 2, CYL_L - WALL, transferPortY + portH / 2);
  c.closePath();
  c.fill();
  c.strokeStyle = '#1e293b'; c.lineWidth = 2; c.stroke();

  // Right passage
  c.fillStyle = metalGrad(c, CYL_R + WALL + 4, transferPortY, passageW, crankcaseTop - transferPortY, '#3f4753', 'h');
  c.beginPath();
  c.moveTo(CYL_R + WALL, transferPortY - portH / 2);
  c.lineTo(CYL_R + WALL + passageW, transferPortY - portH / 2 + 10);
  c.quadraticCurveTo(CYL_R + WALL + passageW + 8, (transferPortY + crankcaseTop) / 2, CYL_R + WALL + passageW, crankcaseTop + 5);
  c.lineTo(CYL_R + WALL, crankcaseTop + 5);
  c.lineTo(CYL_R + WALL, crankcaseTop - 5);
  c.lineTo(CYL_R + WALL + passageW - 8, crankcaseTop - 5);
  c.quadraticCurveTo(CYL_R + WALL + passageW - 2, (transferPortY + crankcaseTop) / 2, CYL_R + WALL, transferPortY + portH / 2);
  c.closePath();
  c.fill();
  c.strokeStyle = '#1e293b'; c.lineWidth = 2; c.stroke();

  // Transfer passage gas flow when exposed
  if (transferExposed > 0.05) {
    c.save();
    c.globalAlpha = transferExposed * 0.4;
    c.fillStyle = 'rgba(147,197,253,0.4)';
    // Left passage fill
    c.beginPath();
    c.moveTo(CYL_L - WALL, transferPortY - portH / 4);
    c.quadraticCurveTo(CYL_L - WALL - passageW / 2, (transferPortY + crankcaseTop) / 2, CYL_L - WALL, crankcaseTop);
    c.lineTo(CYL_L - WALL + 5, crankcaseTop);
    c.quadraticCurveTo(CYL_L - WALL - passageW / 2 + 8, (transferPortY + crankcaseTop) / 2, CYL_L - WALL + 5, transferPortY + portH / 4);
    c.closePath(); c.fill();
    // Right passage fill
    c.beginPath();
    c.moveTo(CYL_R + WALL, transferPortY - portH / 4);
    c.quadraticCurveTo(CYL_R + WALL + passageW / 2, (transferPortY + crankcaseTop) / 2, CYL_R + WALL, crankcaseTop);
    c.lineTo(CYL_R + WALL - 5, crankcaseTop);
    c.quadraticCurveTo(CYL_R + WALL + passageW / 2 - 8, (transferPortY + crankcaseTop) / 2, CYL_R + WALL - 5, transferPortY + portH / 4);
    c.closePath(); c.fill();
    c.restore();
  }

  // ── Exhaust port ──
  if (exhaustExposed > 0.05) {
    c.fillStyle = `rgba(156,163,175,${0.5 * exhaustExposed})`;
    c.fillRect(CYL_R, exhaustPortY - portH / 2, 35, portH);
    // flow arrow
    c.globalAlpha = exhaustExposed * 0.8;
    arrow(c, CYL_R + 10, exhaustPortY, CYL_R + 55, exhaustPortY - 15, '#9ca3af', 2.5);
    c.globalAlpha = 1;
  }
  // port outline
  c.strokeStyle = '#1e293b'; c.lineWidth = 2;
  roundRect(c, CYL_R - 2, exhaustPortY - portH / 2, 37, portH, 4); c.stroke();

  // ── Transfer port openings in cylinder ──
  if (transferExposed > 0.05) {
    c.fillStyle = `rgba(147,197,253,${0.4 * transferExposed})`;
    c.fillRect(CYL_R, transferPortY - portH / 2, 14, portH);
    c.fillRect(CYL_L - 14, transferPortY - portH / 2, 14, portH);
    c.globalAlpha = transferExposed * 0.7;
    arrow(c, CYL_R + 8, transferPortY + 15, CYL_R + 2, transferPortY - 8, '#93c5fd', 2);
    arrow(c, CYL_L - 8, transferPortY + 15, CYL_L - 2, transferPortY - 8, '#93c5fd', 2);
    c.globalAlpha = 1;
  }
  c.strokeStyle = '#1e293b'; c.lineWidth = 2;
  roundRect(c, CYL_R - 2, transferPortY - portH / 2, 16, portH, 3); c.stroke();
  roundRect(c, CYL_L - 14, transferPortY - portH / 2, 16, portH, 3); c.stroke();

  // ── Cooling fins on cylinder ──
  const finLen = 18;
  const finCount = 5;
  const finStart = HEAD_B + 15;
  const finEnd = exhaustPortY - portH / 2 - 10;
  const finSpacing = (finEnd - finStart) / (finCount - 1);
  c.strokeStyle = '#4b5563'; c.lineWidth = 3; c.lineCap = 'round';
  for (let i = 0; i < finCount; i++) {
    const fy = finStart + i * finSpacing;
    c.beginPath(); c.moveTo(CYL_L - WALL, fy); c.lineTo(CYL_L - WALL - finLen, fy); c.stroke();
    c.beginPath(); c.moveTo(CYL_R + WALL, fy); c.lineTo(CYL_R + WALL + finLen, fy); c.stroke();
  }
  // Fin outlines
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  for (let i = 0; i < finCount; i++) {
    const fy = finStart + i * finSpacing;
    c.beginPath(); c.moveTo(CYL_L - WALL - finLen, fy - 1.5); c.lineTo(CYL_L - WALL, fy - 1.5); c.stroke();
    c.beginPath(); c.moveTo(CYL_L - WALL - finLen, fy + 1.5); c.lineTo(CYL_L - WALL, fy + 1.5); c.stroke();
    c.beginPath(); c.moveTo(CYL_R + WALL, fy - 1.5); c.lineTo(CYL_R + WALL + finLen, fy - 1.5); c.stroke();
    c.beginPath(); c.moveTo(CYL_R + WALL, fy + 1.5); c.lineTo(CYL_R + WALL + finLen, fy + 1.5); c.stroke();
  }

  // ── Cylinder walls ──
  c.fillStyle = metalGrad(c, CYL_L - WALL, HEAD_B, WALL, CYL_BOT - HEAD_B, '#4b5563', 'h');
  c.fillRect(CYL_L - WALL, HEAD_B, WALL, CYL_BOT - HEAD_B);
  outlineRect(c, CYL_L - WALL, HEAD_B, WALL, CYL_BOT - HEAD_B);

  c.fillStyle = metalGrad(c, CYL_R, HEAD_B, WALL, CYL_BOT - HEAD_B, '#4b5563', 'h');
  c.fillRect(CYL_R, HEAD_B, WALL, CYL_BOT - HEAD_B);
  outlineRect(c, CYL_R, HEAD_B, WALL, CYL_BOT - HEAD_B);

  // ── Cylinder head ──
  c.fillStyle = metalGrad(c, 0, HEAD_T, 0, HEAD_B - HEAD_T, '#4b5563', 'v');
  roundRect(c, CYL_L - WALL - 10, HEAD_T, CYL_W + 2 * WALL + 20, HEAD_B - HEAD_T, 6); c.fill();
  outlineRoundRect(c, CYL_L - WALL - 10, HEAD_T, CYL_W + 2 * WALL + 20, HEAD_B - HEAD_T, 6);

  // Spark plug
  c.fillStyle = '#d4d4d8';
  roundRect(c, CX - 5, HEAD_T - 22, 10, 20, 3); c.fill();
  outlineRoundRect(c, CX - 5, HEAD_T - 22, 10, 20, 3);
  c.fillStyle = '#fbbf24'; c.fillRect(CX - 1.5, HEAD_B - 2, 3, 5);

  // ── Reed valve at intake port in crankcase (bottom left) ──
  const reedX = CYL_L - WALL - 25;
  const reedY = crankcaseTop + 20;
  const reedOpen = strokeIdx === 0 ? Math.sin(phase * PI * 2) * 0.6 : 0; // opens during compression (piston going up, crankcase expanding)

  // Intake port in crankcase wall
  c.fillStyle = '#374151';
  roundRect(c, reedX - 8, reedY - 12, 35, 24, 3); c.fill();
  outlineRoundRect(c, reedX - 8, reedY - 12, 35, 24, 3);

  // Reed petals (two flexible strips)
  const reedAngle = Math.max(0, reedOpen) * 0.4; // radians of opening
  c.save();
  c.strokeStyle = '#78716c'; c.lineWidth = 3; c.lineCap = 'round';
  // Upper petal
  c.beginPath();
  c.moveTo(reedX + 12, reedY - 8);
  c.lineTo(reedX + 12 - 14 * Math.cos(reedAngle), reedY - 8 - 14 * Math.sin(reedAngle));
  c.stroke();
  // Lower petal
  c.beginPath();
  c.moveTo(reedX + 12, reedY + 8);
  c.lineTo(reedX + 12 - 14 * Math.cos(reedAngle), reedY + 8 + 14 * Math.sin(reedAngle));
  c.stroke();
  c.restore();

  // Reed valve flow arrow when open
  if (reedOpen > 0.15) {
    c.save();
    c.globalAlpha = reedOpen * 0.8;
    arrow(c, reedX - 20, reedY, reedX + 5, reedY, '#93c5fd', 2);
    c.restore();
  }

  // ── Crankcase walls ──
  c.fillStyle = metalGrad(c, CYL_L - WALL, CYL_BOT, WALL, crankcaseBot - CYL_BOT, '#3f4753', 'h');
  c.fillRect(CYL_L - WALL, CYL_BOT, WALL, crankcaseBot - CYL_BOT);
  outlineRect(c, CYL_L - WALL, CYL_BOT, WALL, crankcaseBot - CYL_BOT);

  c.fillStyle = metalGrad(c, CYL_R, CYL_BOT, WALL, crankcaseBot - CYL_BOT, '#3f4753', 'h');
  c.fillRect(CYL_R, CYL_BOT, WALL, crankcaseBot - CYL_BOT);
  outlineRect(c, CYL_R, CYL_BOT, WALL, crankcaseBot - CYL_BOT);

  // Bottom
  c.fillStyle = '#3f4753';
  roundRect(c, CYL_L - WALL - 10, crankcaseBot, CYL_W + 2 * WALL + 20, 12, 5); c.fill();
  outlineRoundRect(c, CYL_L - WALL - 10, crankcaseBot, CYL_W + 2 * WALL + 20, 12, 5);

  // ── Piston with deflector ──
  const pGrad = c.createLinearGradient(0, pistonTop, 0, pistonBot);
  pGrad.addColorStop(0, '#9ca3b8'); pGrad.addColorStop(1, '#64748b');
  c.fillStyle = pGrad;
  roundRect(c, CYL_L + 2, pistonTop, CYL_W - 4, PISTON_H, 4); c.fill();
  outlineRoundRect(c, CYL_L + 2, pistonTop, CYL_W - 4, PISTON_H, 4);

  // Deflector on piston top (raised bump on exhaust side to direct fresh charge upward)
  c.fillStyle = '#8892a2';
  c.beginPath();
  c.moveTo(CYL_L + 10, pistonTop);
  c.lineTo(CX - 20, pistonTop);
  c.quadraticCurveTo(CX - 10, pistonTop - 12, CX + 10, pistonTop - 12);
  c.quadraticCurveTo(CX + 30, pistonTop - 12, CX + 40, pistonTop);
  c.lineTo(CYL_L + 10, pistonTop);
  c.closePath();
  c.fill();
  c.strokeStyle = '#1e293b'; c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(CYL_L + 10, pistonTop);
  c.lineTo(CX - 20, pistonTop);
  c.quadraticCurveTo(CX - 10, pistonTop - 12, CX + 10, pistonTop - 12);
  c.quadraticCurveTo(CX + 30, pistonTop - 12, CX + 40, pistonTop);
  c.stroke();

  // Piston rings
  c.strokeStyle = '#475569'; c.lineWidth = 2;
  for (let i = 0; i < 2; i++) {
    const ry = pistonTop + 5 + i * 7;
    c.beginPath(); c.moveTo(CYL_L + 5, ry); c.lineTo(CYL_R - 5, ry); c.stroke();
  }
  c.fillStyle = '#a1a1aa'; c.beginPath(); c.arc(CX, pistonCY + 3, 5, 0, TAU); c.fill();
  outlineCircle(c, CX, pistonCY + 3, 5);

  // ── Connecting rod ──
  c.strokeStyle = '#6b7280'; c.lineWidth = 9; c.lineCap = 'round';
  c.beginPath(); c.moveTo(CX, pistonCY + 3); c.lineTo(cpx, cpy); c.stroke();
  c.strokeStyle = '#94a3b8'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(CX, pistonCY + 3); c.lineTo(cpx, cpy); c.stroke();
  // Rod outlines
  const rodAngle2s = Math.atan2(cpy - (pistonCY + 3), cpx - CX);
  const rn2x = Math.cos(rodAngle2s + PI / 2) * 4.5;
  const rn2y = Math.sin(rodAngle2s + PI / 2) * 4.5;
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(CX + rn2x, pistonCY + 3 + rn2y); c.lineTo(cpx + rn2x, cpy + rn2y); c.stroke();
  c.beginPath(); c.moveTo(CX - rn2x, pistonCY + 3 - rn2y); c.lineTo(cpx - rn2x, cpy - rn2y); c.stroke();

  // ── Crankshaft ──
  c.fillStyle = '#374151'; c.beginPath(); c.arc(CX, CRANK_CY, 18, 0, TAU); c.fill();
  outlineCircle(c, CX, CRANK_CY, 18);

  c.strokeStyle = '#4b5563'; c.lineWidth = 14; c.lineCap = 'round';
  c.beginPath(); c.moveTo(CX, CRANK_CY); c.lineTo(cpx, cpy); c.stroke();

  c.fillStyle = '#94a3b8'; c.beginPath(); c.arc(cpx, cpy, 7, 0, TAU); c.fill();
  outlineCircle(c, cpx, cpy, 7);

  c.fillStyle = '#1e293b'; c.beginPath(); c.arc(CX, CRANK_CY, 4, 0, TAU); c.fill();

  // ── Labels ──
  label(c, 'Svíčka', CX, HEAD_T - 38, 11, '#94a3b8');
  label(c, 'Výfukový kanál', CYL_R + WALL + passageW + 30, exhaustPortY, 11, '#94a3b8', 'left');
  label(c, 'Přepouštěcí kanál', CYL_R + WALL + passageW + 30, transferPortY, 11, '#94a3b8', 'left');
  label(c, 'Kliková skříň', CX, crankcaseBot + 24, 11, '#64748b');
  label(c, 'Deflektor', CX - 60, pistonTop - 20, 10, '#94a3b8');
  label(c, 'Jazýčkový ventil', reedX - 30, reedY - 22, 10, '#94a3b8');

  c.restore();
}

/* ═══════════════════════════════════════════════════
   STEAM ENGINE (horizontal, double-acting)
   ═══════════════════════════════════════════════════ */
function drawSteam(c, phase, w, h) {
  beginLogical(c, w, h);

  /* ═════════════════════════════════════════════════════
     Full steam locomotive (side cutaway).
     Coordinate system: 800 × 600 logical units.
     Locomotive moves to the RIGHT (chimney on right, cab on left).

     Layering order (back → front):
       1. sky + ground + rails
       2. cab (behind boiler tail)
       3. boiler + firebox cutaway with fire tubes
       4. dome, safety valve, steam pipe to valve chest
       5. smoke box + chimney + smoke plume
       6. valve chest, cylinder, piston, piston rod, crosshead
       7. connecting rod (front)
       8. driving wheels + leading wheel
       9. coupling rod (crosses over wheels – must be drawn on top)
      10. labels
     ═════════════════════════════════════════════════════ */

  // Crank kinematics — phase drives wheel rotation.
  const crankA = phase * TAU;
  const DRV_CY = 450;             // driving-wheel axle y
  const DRV1_CX = 265;            // rear driving wheel
  const DRV2_CX = 445;            // front driving wheel (drives the piston)
  const DRV_R  = 70;              // driving wheel radius
  const R_CRANK = 24;             // crank radius (half the piston stroke)
  const ROD_L  = 160;             // connecting-rod length
  const XHEAD_Y = 455;            // crosshead / piston-rod height (cylinder centerline)

  // Driving-wheel crank pins (both wheels mechanically linked → same angle)
  const pin1X = DRV1_CX + R_CRANK * Math.cos(crankA);
  const pin1Y = DRV_CY  + R_CRANK * Math.sin(crankA);
  const pin2X = DRV2_CX + R_CRANK * Math.cos(crankA);
  const pin2Y = DRV_CY  + R_CRANK * Math.sin(crankA);

  // Crosshead x = pin2X + sqrt(L² - (XHEAD_Y - pin2Y)²). Piston is right of drivers.
  const dyRod = XHEAD_Y - pin2Y;
  const xheadX = pin2X + Math.sqrt(ROD_L * ROD_L - dyRod * dyRod);

  // Half of the cycle = which side of the piston gets live steam.
  //   phase 0.00 – 0.50 : piston moves LEFT  → live steam on RIGHT, exhaust on LEFT
  //   phase 0.50 – 1.00 : piston moves RIGHT → live steam on LEFT,  exhaust on RIGHT
  const pistonMovingRight = (phase >= 0.5);

  // ── 1. Sky + ground ─────────────────────────────────
  const skyG = c.createLinearGradient(0, 0, 0, 540);
  skyG.addColorStop(0, '#0b1220');
  skyG.addColorStop(1, '#1e293b');
  c.fillStyle = skyG;
  c.fillRect(0, 0, 800, 540);

  // Distant stylised hills
  c.fillStyle = '#1f2937';
  c.beginPath();
  c.moveTo(0, 520);
  c.quadraticCurveTo(200, 470, 400, 510);
  c.quadraticCurveTo(600, 535, 800, 505);
  c.lineTo(800, 540); c.lineTo(0, 540); c.closePath(); c.fill();

  // Ground strip
  c.fillStyle = '#0f172a';
  c.fillRect(0, 540, 800, 60);

  // Ballast (gravel-ish tone between ties)
  c.fillStyle = '#1e293b';
  c.fillRect(0, 530, 800, 16);

  // Ties scroll backward (opposite of motion) – fake forward motion
  const tieOffset = (phase * 40) % 40;
  c.fillStyle = '#52525b';
  for (let x = -40; x < 820; x += 40) {
    c.fillRect(x + 40 - tieOffset, 536, 24, 10);
  }
  c.strokeStyle = '#27272a'; c.lineWidth = 1;
  for (let x = -40; x < 820; x += 40) {
    c.strokeRect(x + 40 - tieOffset + 0.5, 536.5, 23, 9);
  }

  // Rails — shiny steel, drawn ON TOP of ties
  c.strokeStyle = '#94a3b8'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(0, 535); c.lineTo(800, 535); c.stroke();
  c.strokeStyle = '#e2e8f0'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, 534.2); c.lineTo(800, 534.2); c.stroke();

  // Cylinder geometry (used later but placed here so the steam chest dimensions
  // are available for the steam-path drawing).
  // Cylinder sits to the RIGHT of the front driving wheel, BELOW the smoke box.
  // (Classic outside-cylinder arrangement: cylinder ahead of the drivers.)
  // pin2X range [421, 469], ROD_L=160 ⇒ xheadX range ≈ [582, 628]
  const CYL_L = 642, CYL_R = 762;
  const CYL_T = 438, CYL_B = 475;
  const CYL_H = CYL_B - CYL_T;
  const WALL = 5;
  const PISTON_W = 24;
  // Piston head x — piston rod has a fixed effective length; piston is rigidly
  // linked to the crosshead so pX travels the same distance as xheadX.
  const pX = xheadX + 90;
  // Fire flicker (used both in firebox and fire-tube glow)
  const flick = 0.85 + Math.sin(phase * 40) * 0.08 + Math.sin(phase * 73 + 1.3) * 0.05;

  // ── 2. Cab with curved roof (signature locomotive cab silhouette) ──
  const CAB_L = 55, CAB_R = 210;
  const CAB_T = 230, CAB_B = 440;
  // Cab body
  c.fillStyle = '#1f2937';
  c.fillRect(CAB_L, CAB_T + 12, CAB_R - CAB_L, CAB_B - CAB_T - 12);
  outlineRect(c, CAB_L, CAB_T + 12, CAB_R - CAB_L, CAB_B - CAB_T - 12);
  // Sloped roof — overhangs cab body with a gentle curve
  c.fillStyle = '#111827';
  c.beginPath();
  c.moveTo(CAB_L - 12, CAB_T + 16);
  c.quadraticCurveTo((CAB_L + CAB_R) / 2, CAB_T - 12, CAB_R + 12, CAB_T + 16);
  c.lineTo(CAB_R + 12, CAB_T + 22);
  c.quadraticCurveTo((CAB_L + CAB_R) / 2, CAB_T - 6, CAB_L - 12, CAB_T + 22);
  c.closePath(); c.fill();
  c.strokeStyle = '#0f172a'; c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(CAB_L - 12, CAB_T + 16);
  c.quadraticCurveTo((CAB_L + CAB_R) / 2, CAB_T - 12, CAB_R + 12, CAB_T + 16);
  c.stroke();
  // Cab side window (arched top)
  c.fillStyle = '#0f2a3a';
  c.beginPath();
  c.moveTo(CAB_L + 22, CAB_T + 38);
  c.lineTo(CAB_L + 22, CAB_T + 100);
  c.lineTo(CAB_L + 100, CAB_T + 100);
  c.lineTo(CAB_L + 100, CAB_T + 38);
  c.quadraticCurveTo(CAB_L + 61, CAB_T + 18, CAB_L + 22, CAB_T + 38);
  c.closePath(); c.fill();
  c.strokeStyle = '#0f172a'; c.lineWidth = 1.5; c.stroke();
  // Cross frame in window
  c.beginPath(); c.moveTo(CAB_L + 61, CAB_T + 22); c.lineTo(CAB_L + 61, CAB_T + 100); c.stroke();
  c.beginPath(); c.moveTo(CAB_L + 22, CAB_T + 65); c.lineTo(CAB_L + 100, CAB_T + 65); c.stroke();
  // Lower cab panel separation line (for detail)
  c.strokeStyle = '#0f172a'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(CAB_L, CAB_T + 120); c.lineTo(CAB_R, CAB_T + 120); c.stroke();
  // Cab grab rail (vertical)
  c.strokeStyle = '#d4a017'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(CAB_R - 8, CAB_T + 40); c.lineTo(CAB_R - 8, CAB_T + 110); c.stroke();

  // ── 3a. Firebox (between cab and boiler) ──
  const FB_L = 180, FB_R = 265;
  const FB_T = 320, FB_B = 460;
  // Outer shell
  c.fillStyle = '#374151';
  roundRect(c, FB_L, FB_T, FB_R - FB_L, FB_B - FB_T, 6); c.fill();
  outlineRoundRect(c, FB_L, FB_T, FB_R - FB_L, FB_B - FB_T, 6);
  // Fire inside (visible through stoker door — round glowing opening)
  const doorCX = FB_L + 42, doorCY = FB_T + 60, doorR = 22;
  const fireGrad = c.createRadialGradient(doorCX, doorCY, 2, doorCX, doorCY, doorR);
  fireGrad.addColorStop(0, `rgba(255, 240, 120, ${0.95 * flick})`);
  fireGrad.addColorStop(0.4, `rgba(255, 150, 40, ${0.85 * flick})`);
  fireGrad.addColorStop(1, `rgba(120, 30, 10, 0.6)`);
  c.fillStyle = fireGrad;
  c.beginPath(); c.arc(doorCX, doorCY, doorR, 0, TAU); c.fill();
  outlineCircle(c, doorCX, doorCY, doorR);
  // Coal heap visible at the bottom of the door
  c.fillStyle = '#1c1917';
  c.beginPath();
  c.moveTo(doorCX - doorR + 2, doorCY + doorR * 0.6);
  for (let k = 0; k < 6; k++) {
    c.lineTo(doorCX - doorR + 2 + k * 7, doorCY + doorR * 0.35 + Math.sin(k * 2) * 3);
  }
  c.lineTo(doorCX + doorR - 2, doorCY + doorR - 2);
  c.lineTo(doorCX - doorR + 2, doorCY + doorR - 2);
  c.closePath(); c.fill();
  // Embers (small flicker dots)
  for (let k = 0; k < 5; k++) {
    const ex = doorCX - doorR + 6 + k * 7;
    const ey = doorCY + doorR * 0.55 + Math.sin(phase * 30 + k) * 2;
    c.fillStyle = `rgba(255, ${120 + Math.sin(phase * 20 + k * 1.7) * 60}, 0, ${0.7 + Math.sin(phase * 25 + k) * 0.3})`;
    c.beginPath(); c.arc(ex, ey, 1.8, 0, TAU); c.fill();
  }

  // ── 3b. Boiler body (cylindrical cutaway) ──
  const B_L = 235, B_R = 575;
  const B_T = 230, B_B = 410;
  const B_H = B_B - B_T;
  // Outer shell — cylinder with 3-stop vertical gradient so it reads as round
  const boilerGrad = c.createLinearGradient(0, B_T, 0, B_B);
  boilerGrad.addColorStop(0, '#334155');      // darker top (shadow)
  boilerGrad.addColorStop(0.35, '#64748b');   // lit upper
  boilerGrad.addColorStop(0.5, '#94a3b8');    // highlight
  boilerGrad.addColorStop(0.65, '#64748b');   // lit lower
  boilerGrad.addColorStop(1, '#1f2937');      // dark bottom (shadow)
  c.fillStyle = boilerGrad;
  c.fillRect(B_L, B_T, B_R - B_L, B_H);
  // Rivets along the top and bottom edges
  c.fillStyle = '#1e293b';
  for (let rx = B_L + 14; rx < B_R; rx += 18) {
    c.beginPath(); c.arc(rx, B_T + 3, 1.6, 0, TAU); c.fill();
    c.beginPath(); c.arc(rx, B_B - 3, 1.6, 0, TAU); c.fill();
  }
  // Elliptical band at the rear of the boiler (meeting the firebox/cab)
  c.strokeStyle = '#0f172a'; c.lineWidth = 2;
  c.beginPath();
  c.ellipse(B_L + 3, (B_T + B_B) / 2, 6, B_H / 2 - 2, 0, Math.PI / 2, -Math.PI / 2);
  c.stroke();
  // Top and bottom horizontal edges
  c.strokeStyle = '#0f172a'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(B_L, B_T); c.lineTo(B_R, B_T); c.stroke();
  c.beginPath(); c.moveTo(B_L, B_B); c.lineTo(B_R, B_B); c.stroke();

  // Cutaway — interior filled with water (bottom) and steam (top)
  c.save();
  // Clip to inside of boiler
  roundRect(c, B_L + 6, B_T + 6, B_R - B_L - 12, B_H - 12, 8);
  c.clip();

  // Water (bottom ~55%)
  const waterTop = B_T + B_H * 0.45;
  const waterGrad = c.createLinearGradient(0, waterTop, 0, B_B);
  waterGrad.addColorStop(0, '#60a5fa');
  waterGrad.addColorStop(1, '#1d4ed8');
  c.fillStyle = waterGrad;
  c.fillRect(B_L, waterTop, B_R - B_L, B_B - waterTop);

  // Steam (top ~45%, pinkish-white because it's hot)
  const steamGrad = c.createLinearGradient(0, B_T, 0, waterTop);
  steamGrad.addColorStop(0, '#fde2e4');
  steamGrad.addColorStop(1, '#f9a8b4');
  c.fillStyle = steamGrad;
  c.fillRect(B_L, B_T, B_R - B_L, waterTop - B_T);

  // Fire-tubes — horizontal hot tubes running the length of the boiler.
  // They transfer hot gases from firebox (left) to smoke box (right).
  const TUBE_X1 = B_L + 8, TUBE_X2 = B_R - 4;
  const tubes = [
    B_T + 26, B_T + 45, B_T + 65, B_T + 85, B_T + 105,       // in steam
    waterTop + 8, waterTop + 28, waterTop + 48, waterTop + 68, waterTop + 88, // in water
  ];
  for (const ty of tubes) {
    // Tube body — heated, the color pulses slightly
    const heat = 0.7 + Math.sin(phase * 12 + ty) * 0.15;
    const g = c.createLinearGradient(TUBE_X1, 0, TUBE_X2, 0);
    g.addColorStop(0, `rgba(255, ${Math.floor(100 * heat)}, 40, 0.95)`); // very hot at firebox side
    g.addColorStop(1, `rgba(255, ${Math.floor(180 * heat)}, 80, 0.85)`);
    c.strokeStyle = g; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(TUBE_X1, ty); c.lineTo(TUBE_X2, ty); c.stroke();
    // Thin dark core
    c.strokeStyle = '#7f1d1d'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(TUBE_X1, ty); c.lineTo(TUBE_X2, ty); c.stroke();
  }

  // Bubble animation in water (rising bubbles from hot tubes)
  for (let i = 0; i < 10; i++) {
    const t = (phase * 0.8 + i / 10) % 1;
    const bx = B_L + 20 + ((i * 47) % (B_R - B_L - 40));
    const by = B_B - t * (B_B - waterTop - 6);
    const bs = 1.5 + Math.sin(t * PI) * 2;
    c.fillStyle = `rgba(200, 230, 255, ${0.55 * Math.sin(t * PI)})`;
    c.beginPath(); c.arc(bx, by, bs, 0, TAU); c.fill();
  }

  // Swirling steam in the top — soft blobs
  for (let i = 0; i < 6; i++) {
    const t = (phase * 0.6 + i / 6) % 1;
    const sx = B_L + 30 + t * (B_R - B_L - 60) + Math.sin(i) * 15;
    const sy = B_T + 40 + Math.sin(t * 6 + i) * 20;
    const sr = 14 + Math.sin(t * PI) * 8;
    c.fillStyle = `rgba(255, 230, 235, ${0.12 + 0.15 * Math.sin(t * PI)})`;
    c.beginPath(); c.arc(sx, sy, sr, 0, TAU); c.fill();
  }

  // Water surface line with tiny ripple
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.5;
  c.beginPath();
  for (let x = B_L; x <= B_R; x += 4) {
    const y = waterTop + Math.sin(x * 0.06 + phase * 12) * 1.2;
    if (x === B_L) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.stroke();

  c.restore(); // end clip

  // ── 3c. Running board (footplate) — horizontal walkway plate ──
  // Runs from cab front all the way to the buffer beam, clearly visible above
  // the wheels. Drawn here, BEFORE wheels and cylinder, so it's layered behind
  // the moving parts.
  const RB_L = 210, RB_R = 792;
  const RB_T = 410, RB_B = 422;
  c.fillStyle = '#4b5563';
  c.fillRect(RB_L, RB_T, RB_R - RB_L, RB_B - RB_T);
  outlineRect(c, RB_L, RB_T, RB_R - RB_L, RB_B - RB_T);
  // Bright top edge (metal highlight)
  c.strokeStyle = '#94a3b8'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(RB_L, RB_T + 0.5); c.lineTo(RB_R, RB_T + 0.5); c.stroke();

  // ── 4. Steam dome + safety valve on top of boiler ──
  const domeCX = 390;
  const domeR = 22;
  c.fillStyle = metalGrad(c, domeCX - domeR, B_T - 30, domeR * 2, 30, '#71717a', 'v');
  roundRect(c, domeCX - domeR, B_T - 30, domeR * 2, 38, 6); c.fill();
  outlineRoundRect(c, domeCX - domeR, B_T - 30, domeR * 2, 38, 6);
  // Brass cap
  c.fillStyle = '#d4a017';
  c.beginPath(); c.ellipse(domeCX, B_T - 30, domeR, 8, 0, 0, TAU); c.fill();
  outlineCircle(c, domeCX, B_T - 30, domeR); // close enough

  // Safety valve (a bit to the right of the dome)
  const svCX = 470;
  c.fillStyle = '#a1a1aa';
  c.fillRect(svCX - 6, B_T - 18, 12, 18);
  outlineRect(c, svCX - 6, B_T - 18, 12, 18);
  c.fillStyle = '#d4a017';
  c.beginPath(); c.arc(svCX, B_T - 22, 8, 0, TAU); c.fill();
  outlineCircle(c, svCX, B_T - 22, 8);
  // Tiny puff of steam from the safety valve when pressure is high
  const svPuff = Math.sin(phase * 8) * 0.5 + 0.5;
  c.fillStyle = `rgba(255,255,255,${0.25 * svPuff})`;
  c.beginPath(); c.arc(svCX, B_T - 34 - svPuff * 6, 5 + svPuff * 4, 0, TAU); c.fill();

  // ── 5a. Smoke box (dark drum at the front of the boiler) ──
  // Widened so it properly overhangs the cylinder / valve chest area
  // (as in real locomotives). Live-steam enters the smoke box from above
  // and drops down inside; the exhaust pipe rises vertically INSIDE the
  // smoke box as the "blast pipe" (dmychací roura) and feeds the chimney.
  const SB_L = 510, SB_R = 720;
  const SB_T = 225, SB_B = 415;
  const SB_H = SB_B - SB_T;
  // Smoke-box shell — darker than boiler, with subtle cylindrical shading
  const sbGrad = c.createLinearGradient(0, SB_T, 0, SB_B);
  sbGrad.addColorStop(0, '#111827');
  sbGrad.addColorStop(0.5, '#1f2937');
  sbGrad.addColorStop(1, '#030712');
  c.fillStyle = sbGrad;
  c.fillRect(SB_L, SB_T, SB_R - SB_L, SB_H);
  c.strokeStyle = '#0f172a'; c.lineWidth = 1.5;
  c.strokeRect(SB_L, SB_T, SB_R - SB_L, SB_H);
  // Front face (the round door we see end-on is drawn as a small plate, NOT a giant circle)
  const sbCX = (SB_L + SB_R) / 2;
  const sbCY = (SB_T + SB_B) / 2;
  // Small central number plate
  c.fillStyle = '#d4a017';
  c.beginPath(); c.arc(sbCX, sbCY, 13, 0, TAU); c.fill();
  outlineCircle(c, sbCX, sbCY, 13);
  c.fillStyle = '#7a5800';
  c.font = 'bold 12px sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('310', sbCX, sbCY + 1);
  // Tiny dog-ear hinges top and bottom (just enough to suggest the smokebox door)
  c.fillStyle = '#475569';
  c.fillRect(sbCX - 3, SB_T + 6, 6, 8);
  c.fillRect(sbCX - 3, SB_B - 14, 6, 8);
  // Handrail along the top of the smoke box
  c.strokeStyle = '#d4a017'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(SB_L + 4, SB_T + 6); c.lineTo(SB_R - 4, SB_T + 6); c.stroke();

  // ── 5a-2. EXHAUST pipe = blast pipe (dmychací roura) INSIDE smokebox ──
  // Carries the low-pressure cooled steam from the cylinder/valve chest
  // vertically UP through the INSIDE of the smoke box into the chimney
  // base. The exhaust blast is what draws fire through the fire-tubes,
  // which makes a steam engine self-draft.
  // Drawn AFTER the smoke-box fill (so it appears in cutaway) but BEFORE
  // the chimney (so the chimney hides the pipe's upper end).
  const VC_EX_X = (CYL_L + CYL_R) / 2;                 // valve-chest exhaust x
  const CH_BASE_X = (SB_L + SB_R) / 2;                 // chimney axis
  const EXH_PATH = [
    [VC_EX_X,     CYL_T - 40],   // leaves valve chest TOP (central exhaust port)
    [VC_EX_X,     SB_T + 135],   // up inside smoke box (below the door)
    [CH_BASE_X,   SB_T + 135],   // bend left toward chimney axis
    [CH_BASE_X,   SB_T + 8],     // up into chimney base
  ];
  function strokePath(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }
  c.save();
  c.lineCap = 'round'; c.lineJoin = 'round';
  // Outer shell — mid-blue so it pops against dark sky
  c.strokeStyle = '#1e3a5f'; c.lineWidth = 14; strokePath(c, EXH_PATH);
  // Main body — lighter blue-steel
  c.strokeStyle = '#3b82f6'; c.lineWidth = 10; strokePath(c, EXH_PATH);
  // Bright highlight stripe — reads as "cool steam"
  c.strokeStyle = '#bfdbfe'; c.lineWidth = 4; strokePath(c, EXH_PATH);
  // Dark outline
  c.strokeStyle = '#0f172a'; c.lineWidth = 1.5; strokePath(c, EXH_PATH);
  // Animated flow dashes — cool steam moving UP toward chimney
  c.setLineDash([12, 12]);
  c.lineDashOffset = -phase * 160;
  c.strokeStyle = 'rgba(219, 234, 254, 0.98)'; c.lineWidth = 4;
  strokePath(c, EXH_PATH);
  c.setLineDash([]);
  c.restore();
  // Arrow tip INTO chimney (points up, just before the chimney base)
  arrow(c, CH_BASE_X, SB_T + 38, CH_BASE_X, SB_T + 12, '#bfdbfe', 2);
  // Arrow tip showing exhaust leaving the valve chest (points UP)
  arrow(c, VC_EX_X, CYL_T - 18, VC_EX_X, CYL_T - 40, '#bfdbfe', 2);

  // ── 5b. Chimney — tall stack on top of smoke box ──
  const CH_CX = (SB_L + SB_R) / 2;
  const CH_T = 55, CH_B = SB_T;
  const CH_W_TOP = 52, CH_W_BOT = 30;
  // Tapered stack body (shaded so it looks round)
  const chGrad = c.createLinearGradient(CH_CX - CH_W_TOP / 2, 0, CH_CX + CH_W_TOP / 2, 0);
  chGrad.addColorStop(0, '#111827');
  chGrad.addColorStop(0.5, '#334155');
  chGrad.addColorStop(1, '#0f172a');
  c.fillStyle = chGrad;
  c.beginPath();
  c.moveTo(CH_CX - CH_W_BOT / 2, CH_B);
  c.lineTo(CH_CX + CH_W_BOT / 2, CH_B);
  c.lineTo(CH_CX + CH_W_TOP / 2, CH_T + 8);
  c.lineTo(CH_CX - CH_W_TOP / 2, CH_T + 8);
  c.closePath(); c.fill();
  c.strokeStyle = '#0f172a'; c.lineWidth = 1.5; c.stroke();
  // Flared rim at the top
  c.fillStyle = '#1f2937';
  roundRect(c, CH_CX - CH_W_TOP / 2 - 5, CH_T, CH_W_TOP + 10, 10, 2); c.fill();
  outlineRoundRect(c, CH_CX - CH_W_TOP / 2 - 5, CH_T, CH_W_TOP + 10, 10, 2);
  // Inner ellipse (top opening)
  c.fillStyle = '#030712';
  c.beginPath();
  c.ellipse(CH_CX, CH_T + 4, CH_W_TOP / 2 - 2, 4, 0, 0, TAU);
  c.fill();

  // ── 5c. Smoke / exhaust plume from the chimney ──
  // Plume pulses with the power strokes (twice per wheel revolution)
  const plumePulse = Math.abs(Math.sin(phase * TAU)); // strong every half-rev
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) {
    const t = (phase * 1.3 + i / 18) % 1;
    const px = CH_CX + Math.sin(t * 5 + i * 0.8) * (10 + t * 25);
    const py = CH_T - t * 80;
    const pr = 6 + t * 26 + plumePulse * 8;
    c.fillStyle = `rgba(220, 210, 200, ${0.28 * (1 - t)})`;
    c.beginPath(); c.arc(px, py, pr, 0, TAU); c.fill();
  }
  c.restore();
  // Soot specks
  for (let i = 0; i < 6; i++) {
    const t = (phase * 1.5 + i / 6) % 1;
    const px = CH_CX + Math.sin(t * 7 + i) * (8 + t * 18);
    const py = CH_T - t * 70;
    c.fillStyle = `rgba(40, 40, 40, ${0.5 * (1 - t)})`;
    c.beginPath(); c.arc(px, py, 1.8, 0, TAU); c.fill();
  }

  // ── 6a. LIVE steam pipe: dome → valve chest (horká pára) ──
  // Carries HIGH-PRESSURE hot steam from the steam dome along the top of
  // the boiler, INTO the smoke box from above, then DOWN INSIDE the smoke
  // box to the valve chest where the slide valve routes it to the piston.
  //
  // Route (drawn AFTER the smoke-box body so it reads as a cutaway):
  //   dome → along boiler top → enters smokebox near its top-left →
  //   drops down inside smokebox → bends right toward valve chest →
  //   into valve chest (top-left corner).
  const LIVE_PATH = [
    [domeCX,      B_T - 18],       // leaves dome
    [SB_L + 24,   B_T - 18],       // along boiler top, crosses into smokebox
    [SB_L + 24,   SB_T + 160],     // drops straight down INSIDE smokebox
    [CYL_L + 14,  SB_T + 160],     // bends right toward valve chest
    [CYL_L + 14,  CYL_T - 40],     // down into valve chest (top-left corner)
  ];
  c.save();
  c.lineCap = 'round'; c.lineJoin = 'round';
  // Outer dark red shell (insulated pipe)
  c.strokeStyle = '#7f1d1d'; c.lineWidth = 14; strokePath(c, LIVE_PATH);
  // Main red body
  c.strokeStyle = '#dc2626'; c.lineWidth = 10; strokePath(c, LIVE_PATH);
  // Bright highlight stripe (hot glow)
  c.strokeStyle = '#fca5a5'; c.lineWidth = 4; strokePath(c, LIVE_PATH);
  // Dark outline
  c.strokeStyle = '#450a0a'; c.lineWidth = 1.5; strokePath(c, LIVE_PATH);
  // Animated flow dashes — live steam racing from dome TOWARD valve chest
  c.setLineDash([12, 12]);
  c.lineDashOffset = -phase * 200;
  c.strokeStyle = 'rgba(255, 240, 220, 0.95)'; c.lineWidth = 4;
  strokePath(c, LIVE_PATH);
  c.setLineDash([]);
  c.restore();
  // Arrow tip showing live steam entering valve chest (points DOWN)
  arrow(c, CYL_L + 14, CYL_T - 62, CYL_L + 14, CYL_T - 40, '#fecaca', 2);
  // Arrow tip showing live steam leaving dome (points RIGHT along boiler)
  arrow(c, domeCX + 60, B_T - 18, domeCX + 90, B_T - 18, '#fecaca', 2);

  // ── 6b. Valve chest (steam chest) with D-slide valve and 3 ports ──
  // The steam chest is always full of LIVE high-pressure steam (from the
  // dome via the red live-steam pipe). A D-shaped slide valve rides on
  // the "valve face" at the bottom and covers/uncovers 3 ports:
  //   • LEFT steam port  → passage to LEFT side of cylinder
  //   • CENTER exhaust port → passage up the blue exhaust pipe to chimney
  //   • RIGHT steam port → passage to RIGHT side of cylinder
  // The valve body has a hollow CAVITY on its underside that connects the
  // exhaust port to whichever steam port is also under the cavity.
  // Valve chest deliberately taller than realistic so students can see
  // the D-slide valve, its cavity, and the three ports clearly.
  const VC_L = CYL_L + 5, VC_R = CYL_R - 5;
  const VC_T = CYL_T - 40, VC_B = CYL_T - 2;
  const VC_W = VC_R - VC_L, VC_H = VC_B - VC_T;
  c.fillStyle = metalGrad(c, VC_L, VC_T, VC_W, VC_H, '#4b5563', 'v');
  roundRect(c, VC_L, VC_T, VC_W, VC_H, 4); c.fill();
  outlineRoundRect(c, VC_L, VC_T, VC_W, VC_H, 4);

  // Live steam fills the whole chest around the valve (pinkish)
  c.fillStyle = 'rgba(248, 180, 190, 0.55)';
  c.fillRect(VC_L + 3, VC_T + 3, VC_W - 6, VC_H - 6);

  // Which side is currently receiving LIVE steam?
  //   phase 0-0.5 : piston moves LEFT  → live on RIGHT, exhaust on LEFT
  //   phase 0.5-1 : piston moves RIGHT → live on LEFT,  exhaust on RIGHT
  const liveIsLeft = pistonMovingRight;

  // Ports in the valve face (port1/portEX/port2 in a row, close together)
  const portW = 10;
  const port1X = VC_L + 14;                           // LEFT steam port
  const port2X = VC_R - 14 - portW;                   // RIGHT steam port
  const portEX = (VC_L + VC_R) / 2 - portW / 2;       // CENTER exhaust port

  // Port passage vertical strip (from valve face down to cylinder top)
  const passageY = VC_B - 1;
  const passageH = CYL_T - VC_B + 3;

  // Draw port openings (dark base)
  c.fillStyle = '#0f172a';
  c.fillRect(port1X, passageY, portW, passageH); outlineRect(c, port1X, passageY, portW, passageH);
  c.fillRect(port2X, passageY, portW, passageH); outlineRect(c, port2X, passageY, portW, passageH);
  c.fillRect(portEX, passageY, portW, passageH); outlineRect(c, portEX, passageY, portW, passageH);

  // Also draw the central exhaust passage going UP from the exhaust port
  // through the valve chest to the top where the exhaust pipe connects.
  c.fillStyle = '#0f172a';
  c.fillRect(portEX, VC_T - 1, portW, VC_H * 0.35);
  outlineRect(c, portEX, VC_T - 1, portW, VC_H * 0.35);

  // Fill ports with steam colour according to current state
  const livePortX = liveIsLeft ? port1X : port2X;
  const exhPortX  = liveIsLeft ? port2X : port1X;
  // Live port — hot pink (admission)
  c.fillStyle = `rgba(248, 140, 160, ${0.75 + 0.2 * Math.sin(phase * 20)})`;
  c.fillRect(livePortX + 1, passageY + 1, portW - 2, passageH - 2);
  // Exhausting steam port — cool blue (exhaust leaving cylinder)
  c.fillStyle = 'rgba(147, 197, 253, 0.70)';
  c.fillRect(exhPortX + 1, passageY + 1, portW - 2, passageH - 2);
  // Central exhaust port and upward passage — blue (always exhausting)
  c.fillRect(portEX + 1, passageY + 1, portW - 2, passageH - 2);
  c.fillStyle = 'rgba(147, 197, 253, 0.55)';
  c.fillRect(portEX + 1, VC_T, portW - 2, VC_H * 0.35 - 1);

  // Slide valve — "D" shape with hollow cavity underneath
  const valveTravel = 18;
  const valveOffset = -Math.sin(crankA) * valveTravel;
  const valveW = 62;                                   // wide enough to cover exhaust+1 steam port
  const valveX = (VC_L + VC_R) / 2 - valveW / 2 + valveOffset;
  const valveT = VC_T + 10;
  const valveB = VC_B - 2;
  const cavityW = 36;
  const cavityX = valveX + (valveW - cavityW) / 2;
  const cavityT = valveB - 12;
  // Solid valve body (top part)
  c.fillStyle = '#52525b';
  roundRect(c, valveX, valveT, valveW, valveB - valveT, 3); c.fill();
  outlineRoundRect(c, valveX, valveT, valveW, valveB - valveT, 3);
  // Cavity on underside — filled with cool exhausting steam
  c.fillStyle = 'rgba(147, 197, 253, 0.85)';
  c.fillRect(cavityX, cavityT, cavityW, valveB - cavityT);
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  c.strokeRect(cavityX + 0.5, cavityT + 0.5, cavityW - 1, valveB - cavityT - 1);
  // Small flow dashes inside cavity (showing exhaust steam flowing sideways)
  c.save();
  c.setLineDash([6, 4]);
  c.lineDashOffset = -phase * 30 * (liveIsLeft ? 1 : -1);
  c.strokeStyle = 'rgba(226, 240, 255, 0.9)'; c.lineWidth = 2; c.lineCap = 'butt';
  c.beginPath();
  c.moveTo(cavityX + 3, (cavityT + valveB) / 2);
  c.lineTo(cavityX + cavityW - 3, (cavityT + valveB) / 2);
  c.stroke();
  c.restore();

  // Valve rod (drives slide valve from eccentric on the axle — we just show a stub)
  c.strokeStyle = '#94a3b8'; c.lineWidth = 4; c.lineCap = 'round';
  c.beginPath();
  c.moveTo(valveX, (valveT + valveB) / 2);
  c.lineTo(VC_L - 10, (valveT + valveB) / 2);
  c.stroke();

  // Arrows inside the valve chest
  c.save();
  c.globalAlpha = 0.9;
  // Live steam: flows DOWN from chest through the OPEN steam port into cylinder
  arrow(c, livePortX + portW / 2, VC_T + 14, livePortX + portW / 2, VC_B - 3, '#ef4444', 2);
  // Exhaust steam: flows UP from chamber through exhausting port
  // into cavity, then through exhaust port UP to exhaust pipe
  arrow(c, exhPortX + portW / 2, VC_B - 3, exhPortX + portW / 2, cavityT + 3, '#3b82f6', 2);
  arrow(c, portEX + portW / 2, VC_T + (VC_H * 0.35), portEX + portW / 2, VC_T + 2, '#3b82f6', 2);
  c.restore();

  // ── 6c. Cylinder body ──
  c.fillStyle = metalGrad(c, CYL_L, CYL_T, CYL_R - CYL_L, CYL_H, '#6b7280', 'v');
  roundRect(c, CYL_L, CYL_T, CYL_R - CYL_L, CYL_H, 6); c.fill();
  outlineRoundRect(c, CYL_L, CYL_T, CYL_R - CYL_L, CYL_H, 6);
  // Cylinder end caps (dark ribbed)
  c.fillStyle = '#334155';
  c.fillRect(CYL_L - 5, CYL_T - 4, 10, CYL_H + 8);
  outlineRect(c, CYL_L - 5, CYL_T - 4, 10, CYL_H + 8);
  c.fillRect(CYL_R - 5, CYL_T - 4, 10, CYL_H + 8);
  outlineRect(c, CYL_R - 5, CYL_T - 4, 10, CYL_H + 8);

  // Interior — chambers with expansion gradient showing cooling
  const pistonLeft = pX - PISTON_W / 2;
  const pistonRight = pX + PISTON_W / 2;
  const chamberTop = CYL_T + WALL;
  const chamberBot = CYL_B - WALL;
  const chamberH = chamberBot - chamberTop;

  // Helper: draw live chamber with horizontal gradient
  //   near the port  → hot pink (freshly admitted, HIGH pressure)
  //   far from port  → pale blue-grey (expanded, LOW pressure, COOLED)
  function fillLiveChamber(x1, x2, portAtLeft) {
    const g = portAtLeft
      ? c.createLinearGradient(x1, 0, x2, 0)
      : c.createLinearGradient(x2, 0, x1, 0);
    g.addColorStop(0.00, 'rgba(248, 120, 150, 0.85)');   // HOT at port
    g.addColorStop(0.35, 'rgba(250, 180, 200, 0.65)');
    g.addColorStop(0.70, 'rgba(220, 210, 220, 0.45)');
    g.addColorStop(1.00, 'rgba(180, 210, 240, 0.40)');   // COOLED near piston
    c.fillStyle = g;
    c.fillRect(x1, chamberTop, x2 - x1, chamberH);
  }
  function fillExhaustChamber(x1, x2) {
    // Uniform cool blue — this side is exhausting
    c.fillStyle = 'rgba(147, 197, 253, 0.40)';
    c.fillRect(x1, chamberTop, x2 - x1, chamberH);
  }

  if (liveIsLeft) {
    fillLiveChamber(CYL_L + 5, pistonLeft, true);           // live LEFT — port on LEFT
    fillExhaustChamber(pistonRight, CYL_R - 5);
  } else {
    fillExhaustChamber(CYL_L + 5, pistonLeft);
    fillLiveChamber(pistonRight, CYL_R - 5, false);         // live RIGHT — port on RIGHT
  }

  // Animated steam particles inside chambers — show flow direction AND
  // temperature transition from hot pink (near port) to cool blue (near piston)
  c.save();
  for (let i = 0; i < 7; i++) {
    const t = (phase * 1.3 + i / 7) % 1;
    let px, py, rCol, gCol, bCol;
    py = (chamberTop + chamberBot) / 2 + Math.sin(t * 5 + i * 1.1) * 5;
    const r = 1.8 + t * 1.8;
    // Color transitions from hot (near port) to cool (near piston)
    rCol = Math.floor(248 - t * 120);
    gCol = Math.floor(130 + t * 80);
    bCol = Math.floor(150 + t * 90);
    if (liveIsLeft) {
      // particles move RIGHT in LEFT chamber (port on left → piston on right)
      const width = Math.max(4, pistonLeft - CYL_L - 14);
      px = CYL_L + 8 + t * width;
    } else {
      // particles move LEFT in RIGHT chamber (port on right → piston on left)
      const width = Math.max(4, CYL_R - pistonRight - 14);
      px = CYL_R - 8 - t * width;
    }
    c.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${0.7 * (1 - t * 0.3)})`;
    c.beginPath(); c.arc(px, py, r, 0, TAU); c.fill();
  }
  // In exhaust chamber — small pale blue particles moving TOWARD the port
  for (let i = 0; i < 5; i++) {
    const t = (phase * 1.5 + i / 5) % 1;
    let px;
    const py = (chamberTop + chamberBot) / 2 + Math.sin(t * 4 + i * 1.3) * 5;
    if (liveIsLeft) {
      // exhaust is on RIGHT — particles move RIGHT toward port2
      const width = Math.max(4, CYL_R - pistonRight - 14);
      px = pistonRight + 4 + t * width;
    } else {
      // exhaust is on LEFT — particles move LEFT toward port1
      const width = Math.max(4, pistonLeft - CYL_L - 14);
      px = pistonLeft - 4 - t * width;
    }
    c.fillStyle = `rgba(180, 210, 240, ${0.55 * (1 - t * 0.4)})`;
    c.beginPath(); c.arc(px, py, 2, 0, TAU); c.fill();
  }
  c.restore();

  // Piston
  const pGrad = c.createLinearGradient(0, chamberTop, 0, chamberBot);
  pGrad.addColorStop(0, '#cbd5e1'); pGrad.addColorStop(1, '#64748b');
  c.fillStyle = pGrad;
  roundRect(c, pistonLeft, chamberTop + 1, PISTON_W, chamberBot - chamberTop - 2, 2); c.fill();
  outlineRoundRect(c, pistonLeft, chamberTop + 1, PISTON_W, chamberBot - chamberTop - 2, 2);

  // Piston rod (goes LEFT toward the crosshead)
  c.fillStyle = '#94a3b8';
  c.fillRect(CYL_L - 12, XHEAD_Y - 4, pistonLeft - (CYL_L - 12), 8);
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  c.strokeRect(CYL_L - 12, XHEAD_Y - 4, pistonLeft - (CYL_L - 12), 8);
  // Stuffing box at cylinder left cap
  c.fillStyle = '#475569';
  c.fillRect(CYL_L - 16, XHEAD_Y - 8, 12, 16);
  outlineRect(c, CYL_L - 16, XHEAD_Y - 8, 12, 16);

  // ── 6d. Crosshead + slide bars ──
  const CH_L = 575, CH_R = CYL_L - 10;   // slide bar extent
  // Top + bottom slide bars
  c.fillStyle = '#334155';
  c.fillRect(CH_L, XHEAD_Y - 14, CH_R - CH_L, 3);
  outlineRect(c, CH_L, XHEAD_Y - 14, CH_R - CH_L, 3);
  c.fillRect(CH_L, XHEAD_Y + 11, CH_R - CH_L, 3);
  outlineRect(c, CH_L, XHEAD_Y + 11, CH_R - CH_L, 3);
  // Crosshead block
  c.fillStyle = '#64748b';
  roundRect(c, xheadX - 12, XHEAD_Y - 10, 18, 22, 2); c.fill();
  outlineRoundRect(c, xheadX - 12, XHEAD_Y - 10, 18, 22, 2);

  // ── 6e. Buffer beam at the front (red with round buffers) ──
  const BB_L = CYL_R, BB_R = 795;
  const BB_T = 425, BB_B = 490;
  c.fillStyle = '#b91c1c';
  c.fillRect(BB_L, BB_T, BB_R - BB_L, BB_B - BB_T);
  outlineRect(c, BB_L, BB_T, BB_R - BB_L, BB_B - BB_T);
  // Two round buffers (stacked) sticking forward
  c.fillStyle = '#52525b';
  c.fillRect(BB_R, BB_T + 8, 5, 14);
  c.fillRect(BB_R, BB_B - 22, 5, 14);
  outlineRect(c, BB_R, BB_T + 8, 5, 14);
  outlineRect(c, BB_R, BB_B - 22, 5, 14);
  c.fillStyle = '#94a3b8';
  c.beginPath(); c.arc(BB_R + 5, BB_T + 15, 5, 0, TAU); c.fill();
  outlineCircle(c, BB_R + 5, BB_T + 15, 5);
  c.beginPath(); c.arc(BB_R + 5, BB_B - 15, 5, 0, TAU); c.fill();
  outlineCircle(c, BB_R + 5, BB_B - 15, 5);
  // Coupling hook in the middle
  c.strokeStyle = '#27272a'; c.lineWidth = 3; c.lineCap = 'round';
  c.beginPath();
  c.moveTo(BB_R - 3, (BB_T + BB_B) / 2);
  c.lineTo(BB_R + 8, (BB_T + BB_B) / 2);
  c.stroke();

  // ── 7. Connecting rod (crosshead → front driving-wheel crank pin) ──
  // Drawn BEFORE wheels so the wheels hub appears on top of the rod end.
  c.strokeStyle = '#94a3b8'; c.lineWidth = 9; c.lineCap = 'round';
  c.beginPath(); c.moveTo(xheadX - 4, XHEAD_Y); c.lineTo(pin2X, pin2Y); c.stroke();
  c.strokeStyle = '#cbd5e1'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(xheadX - 4, XHEAD_Y); c.lineTo(pin2X, pin2Y); c.stroke();
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  const rAng = Math.atan2(pin2Y - XHEAD_Y, pin2X - (xheadX - 4));
  const rnx = Math.cos(rAng + PI / 2) * 4.5;
  const rny = Math.sin(rAng + PI / 2) * 4.5;
  c.beginPath(); c.moveTo(xheadX - 4 + rnx, XHEAD_Y + rny); c.lineTo(pin2X + rnx, pin2Y + rny); c.stroke();
  c.beginPath(); c.moveTo(xheadX - 4 - rnx, XHEAD_Y - rny); c.lineTo(pin2X - rnx, pin2Y - rny); c.stroke();

  // Helper to draw a red driving wheel (locomotive style)
  function drawDrivingWheel(cx, cy, r, angle) {
    // Outer rim (dark)
    c.fillStyle = '#991b1b';
    c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill();
    outlineCircle(c, cx, cy, r);
    // Red face
    c.fillStyle = '#dc2626';
    c.beginPath(); c.arc(cx, cy, r - 8, 0, TAU); c.fill();
    outlineCircle(c, cx, cy, r - 8);
    // Spokes (10 — traditional)
    c.strokeStyle = '#7f1d1d'; c.lineWidth = 6; c.lineCap = 'round';
    for (let k = 0; k < 10; k++) {
      const sa = angle + k * TAU / 10;
      c.beginPath();
      c.moveTo(cx + 12 * Math.cos(sa), cy + 12 * Math.sin(sa));
      c.lineTo(cx + (r - 14) * Math.cos(sa), cy + (r - 14) * Math.sin(sa));
      c.stroke();
    }
    // Hub
    c.fillStyle = '#374151';
    c.beginPath(); c.arc(cx, cy, 12, 0, TAU); c.fill();
    outlineCircle(c, cx, cy, 12);
    c.fillStyle = '#0f172a';
    c.beginPath(); c.arc(cx, cy, 4, 0, TAU); c.fill();
  }

  // ── 8. Wheels ──
  drawDrivingWheel(DRV1_CX, DRV_CY, DRV_R, crankA);
  drawDrivingWheel(DRV2_CX, DRV_CY, DRV_R, crankA);

  // No separate leading wheel — this is a classic 0-4-0 tank-engine layout
  // (two coupled driving wheels, no pilot truck). Visually clean and
  // historically accurate for small shunting/industrial locomotives.

  // ── 9. Coupling rod (connects both driving wheels, ALWAYS horizontal) ──
  // Drawn ON TOP of wheels so it's clearly visible.
  c.strokeStyle = '#cbd5e1'; c.lineWidth = 10; c.lineCap = 'round';
  c.beginPath(); c.moveTo(pin1X, pin1Y); c.lineTo(pin2X, pin2Y); c.stroke();
  c.strokeStyle = '#e2e8f0'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(pin1X, pin1Y); c.lineTo(pin2X, pin2Y); c.stroke();
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(pin1X, pin1Y - 5); c.lineTo(pin2X, pin2Y - 5); c.stroke();
  c.beginPath(); c.moveTo(pin1X, pin1Y + 5); c.lineTo(pin2X, pin2Y + 5); c.stroke();

  // Crank pins (shiny, on top of coupling + connecting rod ends)
  for (const [px, py] of [[pin1X, pin1Y], [pin2X, pin2Y]]) {
    c.fillStyle = '#facc15';
    c.beginPath(); c.arc(px, py, 5, 0, TAU); c.fill();
    outlineCircle(c, px, py, 5);
  }

  // ── 6e. In-chamber text markers + push arrow on piston ──
  // Place "HORKÁ" / "STUDENÁ" NEAR THE TOP of each chamber (not centered
  // vertically) so they don't collide with the horizontal push arrow.
  // Temperature readouts are drawn just below each label when there's room.
  c.save();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const textY = chamberTop + 6;       // top name (HORKÁ/STUDENÁ)
  const tempY = chamberTop + 16;      // small temperature readout beneath
  function drawChamberMark(cx, wPx, kind) {
    // kind: 'hot' or 'cold'
    const hot = kind === 'hot';
    c.font = 'bold 9px sans-serif';
    c.fillStyle = hot ? '#fecaca' : '#bfdbfe';
    c.fillText(hot ? 'HORKÁ' : 'STUDENÁ', cx, textY);
    if (wPx > 44) {
      c.font = 'bold 7.5px sans-serif';
      c.fillStyle = hot ? '#fca5a5' : '#93c5fd';
      c.fillText(hot ? '~180 °C' : '~100 °C', cx, tempY);
    }
  }
  if (liveIsLeft) {
    const liveW = pistonLeft - (CYL_L + 5);
    const exhW = (CYL_R - 5) - pistonRight;
    if (liveW > 28) drawChamberMark((CYL_L + 5 + pistonLeft) / 2, liveW, 'hot');
    if (exhW > 32)  drawChamberMark((pistonRight + CYL_R - 5) / 2, exhW, 'cold');
  } else {
    const exhW = pistonLeft - (CYL_L + 5);
    const liveW = (CYL_R - 5) - pistonRight;
    if (exhW > 32)  drawChamberMark((CYL_L + 5 + pistonLeft) / 2, exhW, 'cold');
    if (liveW > 28) drawChamberMark((pistonRight + CYL_R - 5) / 2, liveW, 'hot');
  }
  c.restore();

  // Push arrow on piston — shows which way the piston is being forced
  c.save();
  c.globalAlpha = 0.95;
  if (liveIsLeft) {
    // Live on LEFT pushes piston RIGHT
    arrow(c, pistonRight + 3, XHEAD_Y, pX + 34, XHEAD_Y, '#fecaca', 3.5);
  } else {
    arrow(c, pistonLeft - 3, XHEAD_Y, pX - 34, XHEAD_Y, '#fecaca', 3.5);
  }
  c.restore();

  // ── 10. Labels ─────────────────────────────────────
  // Minimal set — only what students NEED to follow the steam cycle:
  //   • firebox (where heat comes from)
  //   • steam dome (where live steam is collected)
  //   • the two pipes (hot in, cold out)
  //   • chamber states (HORKÁ/STUDENÁ + temps — drawn inside the cylinder)
  //   • a dynamic phase banner over the valve chest
  c.save();
  c.globalAlpha = 0.95;
  label(c, 'topeniště', (FB_L + FB_R) / 2, FB_B + 18, 11, '#f59e0b');
  label(c, 'parní dóm', domeCX, B_T - 50, 10, '#d4a017');
  // Pipe labels — bold, colored, placed well above the pipes.
  labelBold(c, 'HORKÁ PÁRA →', (domeCX + (SB_L - 4)) / 2, B_T - 55, 12, '#fca5a5');
  labelBold(c, '← ODPADNÍ PÁRA', ((SB_L + SB_R) / 2 + (CYL_L + CYL_R) / 2) / 2, SB_T - 22, 12, '#bfdbfe');
  // Dynamic phase banner above the valve chest.
  // sin(crankA) drives valve offset; |sin| near 1 ⇒ admission opening wide,
  // |sin| near 0 ⇒ valve centred (ports closed, expansion).
  const valveAbs = Math.abs(Math.sin(crankA));
  let phaseTxt, phaseColor;
  if (valveAbs > 0.70) { phaseTxt = 'ADMISE'; phaseColor = '#fca5a5'; }
  else if (valveAbs > 0.30) { phaseTxt = 'EXPANZE'; phaseColor = '#fde68a'; }
  else { phaseTxt = 'VÝFUK'; phaseColor = '#93c5fd'; }
  const dirArrow = liveIsLeft ? '→' : '←';
  // Anchor to the RIGHT edge of the valve chest so the label stays on
  // canvas even on narrower viewports. Right-aligned so text grows left.
  labelBold(c, `${phaseTxt} ${dirArrow}`, VC_R - 2, VC_T - 10, 11, phaseColor, 'right');
  c.restore();

  c.restore();
}

/* ═══════════════════════════════════════════════════
   JET ENGINE (turbine, horizontal cutaway)
   ═══════════════════════════════════════════════════ */
function drawJet(c, phase, w, h) {
  beginLogical(c, w, h);

  const CY = 300;
  const bladeAngle = phase * TAU * 8; // blades rotate fast

  // Sections left to right
  const intake = { x: 60, w: 90 };
  const compressor = { x: 150, w: 190 };
  const combustion = { x: 340, w: 140 };
  const turbine = { x: 480, w: 120 };
  const nozzle = { x: 600, w: 140 };

  const outerR = 100; // max radius of engine
  const hubR = 20;

  // ── Nacelle / outer casing — aerodynamic shape ──
  c.fillStyle = '#374151';

  // Top casing — smooth aerodynamic profile
  c.beginPath();
  c.moveTo(intake.x - 10, CY - 35); // intake lip
  c.quadraticCurveTo(intake.x - 15, CY - outerR + 10, intake.x + 40, CY - outerR);
  c.lineTo(compressor.x + compressor.w, CY - outerR);
  c.lineTo(combustion.x + combustion.w, CY - outerR + 2);
  c.lineTo(turbine.x + turbine.w, CY - outerR + 5);
  // Nozzle taper
  c.quadraticCurveTo(nozzle.x + nozzle.w - 30, CY - outerR + 10, nozzle.x + nozzle.w, CY - 55);
  c.lineTo(nozzle.x + nozzle.w, CY - 48);
  c.lineTo(intake.x - 10, CY - 48);
  c.closePath(); c.fill();

  // Bottom casing (mirror)
  c.beginPath();
  c.moveTo(intake.x - 10, CY + 35);
  c.quadraticCurveTo(intake.x - 15, CY + outerR - 10, intake.x + 40, CY + outerR);
  c.lineTo(compressor.x + compressor.w, CY + outerR);
  c.lineTo(combustion.x + combustion.w, CY + outerR - 2);
  c.lineTo(turbine.x + turbine.w, CY + outerR - 5);
  c.quadraticCurveTo(nozzle.x + nozzle.w - 30, CY + outerR - 10, nozzle.x + nozzle.w, CY + 55);
  c.lineTo(nozzle.x + nozzle.w, CY + 48);
  c.lineTo(intake.x - 10, CY + 48);
  c.closePath(); c.fill();

  // Intake lip (rounded leading edge)
  c.fillStyle = '#5b6370';
  c.beginPath();
  c.moveTo(intake.x - 10, CY - 35);
  c.quadraticCurveTo(intake.x - 18, CY, intake.x - 10, CY + 35);
  c.lineTo(intake.x - 5, CY + 35);
  c.quadraticCurveTo(intake.x - 12, CY, intake.x - 5, CY - 35);
  c.closePath(); c.fill();

  // Casing outlines
  c.strokeStyle = '#1e293b'; c.lineWidth = 2;
  c.beginPath();
  c.moveTo(intake.x - 10, CY - 35);
  c.quadraticCurveTo(intake.x - 15, CY - outerR + 10, intake.x + 40, CY - outerR);
  c.lineTo(turbine.x + turbine.w, CY - outerR + 5);
  c.quadraticCurveTo(nozzle.x + nozzle.w - 30, CY - outerR + 10, nozzle.x + nozzle.w, CY - 55);
  c.stroke();
  c.beginPath();
  c.moveTo(intake.x - 10, CY + 35);
  c.quadraticCurveTo(intake.x - 15, CY + outerR - 10, intake.x + 40, CY + outerR);
  c.lineTo(turbine.x + turbine.w, CY + outerR - 5);
  c.quadraticCurveTo(nozzle.x + nozzle.w - 30, CY + outerR - 10, nozzle.x + nozzle.w, CY + 55);
  c.stroke();

  // ── Inner fill zones ──
  // Intake — light blue
  c.fillStyle = 'rgba(147,197,253,0.15)';
  c.fillRect(intake.x, CY - 45, intake.w, 90);

  // Compressor — gradually more blue (higher pressure)
  const compGrad = c.createLinearGradient(compressor.x, 0, compressor.x + compressor.w, 0);
  compGrad.addColorStop(0, 'rgba(147,197,253,0.15)');
  compGrad.addColorStop(1, 'rgba(96,165,250,0.35)');
  c.fillStyle = compGrad;
  c.fillRect(compressor.x, CY - 45, compressor.w, 90);

  // Combustion — orange/red
  const combGrad = c.createLinearGradient(combustion.x, 0, combustion.x + combustion.w, 0);
  combGrad.addColorStop(0, 'rgba(251,191,36,0.35)');
  combGrad.addColorStop(0.5, 'rgba(239,68,68,0.50)');
  combGrad.addColorStop(1, 'rgba(249,115,22,0.45)');
  c.fillStyle = combGrad;
  c.fillRect(combustion.x, CY - 45, combustion.w, 90);

  // Combustion glow
  c.save();
  c.shadowBlur = 40; c.shadowColor = 'rgba(249,115,22,0.5)';
  c.fillStyle = 'rgba(255,150,50,0.15)';
  c.beginPath(); c.arc(combustion.x + combustion.w / 2, CY, 38, 0, TAU); c.fill();
  c.restore();

  // Turbine
  c.fillStyle = 'rgba(249,115,22,0.25)';
  c.fillRect(turbine.x, CY - 45, turbine.w, 90);

  // Nozzle — exhaust
  const nozGrad = c.createLinearGradient(nozzle.x, 0, nozzle.x + nozzle.w, 0);
  nozGrad.addColorStop(0, 'rgba(249,115,22,0.20)');
  nozGrad.addColorStop(1, 'rgba(156,163,175,0.15)');
  c.fillStyle = nozGrad;
  c.fillRect(nozzle.x, CY - 45, nozzle.w, 90);

  // ── Central shaft ──
  c.fillStyle = '#475569';
  c.fillRect(intake.x + 30, CY - 6, nozzle.x - intake.x - 20, 12);
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(intake.x + 30, CY - 6); c.lineTo(nozzle.x + 10, CY - 6); c.stroke();
  c.beginPath(); c.moveTo(intake.x + 30, CY + 6); c.lineTo(nozzle.x + 10, CY + 6); c.stroke();

  // ── Compressor blades with stator vanes ──
  const numComp = 5; // rotor stages
  for (let s = 0; s < numComp; s++) {
    const bx = compressor.x + 20 + s * (compressor.w - 30) / numComp;
    const nr = 7; // blades per stage
    const bladeR = 38 - s * 1.5;

    // Stator vanes (between stages, stationary)
    if (s > 0) {
      const statorX = bx - (compressor.w - 30) / numComp / 2;
      const statorR = bladeR + 2;
      for (let i = 0; i < 6; i++) {
        const sa = i * TAU / 6 + 0.3; // fixed angle, slightly offset
        c.save();
        c.translate(statorX, CY);
        c.rotate(sa);
        c.fillStyle = '#5b6370';
        c.beginPath();
        c.moveTo(hubR + 4, -2);
        c.lineTo(statorR, -4);
        c.lineTo(statorR + 1, 0);
        c.lineTo(statorR, 3);
        c.lineTo(hubR + 4, 1);
        c.closePath(); c.fill();
        c.strokeStyle = '#1e293b'; c.lineWidth = 0.5; c.stroke();
        c.restore();
      }
      // Stator hub ring
      c.strokeStyle = '#5b6370'; c.lineWidth = 2;
      c.beginPath(); c.arc(statorX, CY, hubR + 3, 0, TAU); c.stroke();
    }

    // Rotor blades (rotating)
    for (let i = 0; i < nr; i++) {
      const a = bladeAngle + i * TAU / nr + s * 0.3;
      c.save();
      c.translate(bx, CY);
      c.rotate(a);
      c.fillStyle = s % 2 === 0 ? '#94a3b8' : '#78818f';
      c.beginPath();
      c.moveTo(hubR - 2, -3);
      c.lineTo(bladeR, -5);
      c.lineTo(bladeR + 2, 0);
      c.lineTo(bladeR, 3);
      c.lineTo(hubR - 2, 2);
      c.closePath(); c.fill();
      c.strokeStyle = '#1e293b'; c.lineWidth = 0.5; c.stroke();
      c.restore();
    }
    // Hub
    c.fillStyle = '#4b5563';
    c.beginPath(); c.arc(bx, CY, hubR, 0, TAU); c.fill();
    outlineCircle(c, bx, CY, hubR);
  }

  // ── Fuel injectors in combustion chamber ──
  const injectorCount = 3;
  for (let i = 0; i < injectorCount; i++) {
    const ix = combustion.x + 15 + i * (combustion.w - 30) / (injectorCount - 1);
    // Injector body (top)
    c.fillStyle = '#0ea5e9';
    c.fillRect(ix - 3, CY - 46, 6, 12);
    outlineRect(c, ix - 3, CY - 46, 6, 12);
    // Spray nozzle
    c.fillStyle = '#0284c7';
    c.beginPath();
    c.moveTo(ix - 2, CY - 34);
    c.lineTo(ix + 2, CY - 34);
    c.lineTo(ix, CY - 30);
    c.closePath(); c.fill();
    // Bottom injector (mirror)
    c.fillStyle = '#0ea5e9';
    c.fillRect(ix - 3, CY + 34, 6, 12);
    outlineRect(c, ix - 3, CY + 34, 6, 12);
    c.fillStyle = '#0284c7';
    c.beginPath();
    c.moveTo(ix - 2, CY + 34);
    c.lineTo(ix + 2, CY + 34);
    c.lineTo(ix, CY + 30);
    c.closePath(); c.fill();
  }

  // ── Flame in combustion chamber — animated pattern ──
  const flicker = Math.sin(phase * 80) * 0.3 + 0.7;
  c.save();
  // Multiple flame kernels
  for (let i = 0; i < 5; i++) {
    const fx = combustion.x + 20 + i * (combustion.w - 40) / 4;
    const fy = CY + Math.sin(phase * 60 + i * 2) * 15;
    const fr = 12 + Math.sin(phase * 40 + i * 3) * 5;
    const flickerI = Math.sin(phase * 80 + i * 1.7) * 0.3 + 0.7;
    c.globalAlpha = 0.4 * flickerI;
    const flameGrad = c.createRadialGradient(fx, fy, 2, fx, fy, fr);
    flameGrad.addColorStop(0, '#fde68a');
    flameGrad.addColorStop(0.3, '#f59e0b');
    flameGrad.addColorStop(0.7, '#ef4444');
    flameGrad.addColorStop(1, 'rgba(239,68,68,0)');
    c.fillStyle = flameGrad;
    c.beginPath(); c.arc(fx, fy, fr, 0, TAU); c.fill();
  }
  c.restore();

  // ── Turbine blades ──
  const numTurb = 3;
  for (let s = 0; s < numTurb; s++) {
    const bx = turbine.x + 20 + s * (turbine.w - 30) / numTurb;
    const nr = 6;
    const bladeR = 36;

    // Stator vanes between turbine stages
    if (s > 0) {
      const statorX = bx - (turbine.w - 30) / numTurb / 2;
      for (let i = 0; i < 5; i++) {
        const sa = i * TAU / 5 + 0.5;
        c.save();
        c.translate(statorX, CY);
        c.rotate(sa);
        c.fillStyle = '#6d4c20';
        c.beginPath();
        c.moveTo(hubR + 4, -2);
        c.lineTo(bladeR - 2, -4);
        c.lineTo(bladeR - 1, 0);
        c.lineTo(bladeR - 2, 3);
        c.lineTo(hubR + 4, 1);
        c.closePath(); c.fill();
        c.strokeStyle = '#1e293b'; c.lineWidth = 0.5; c.stroke();
        c.restore();
      }
    }

    // Rotor blades
    for (let i = 0; i < nr; i++) {
      const a = bladeAngle * 0.8 + i * TAU / nr + s * 0.4;
      c.save();
      c.translate(bx, CY);
      c.rotate(a);
      c.fillStyle = '#b45309';
      c.beginPath();
      c.moveTo(hubR - 2, -3);
      c.lineTo(bladeR, -6);
      c.lineTo(bladeR + 2, 0);
      c.lineTo(bladeR, 4);
      c.lineTo(hubR - 2, 2);
      c.closePath(); c.fill();
      c.strokeStyle = '#1e293b'; c.lineWidth = 0.5; c.stroke();
      c.restore();
    }
    c.fillStyle = '#78350f';
    c.beginPath(); c.arc(bx, CY, hubR, 0, TAU); c.fill();
    outlineCircle(c, bx, CY, hubR);
  }

  // ── Nozzle taper inner walls ──
  c.strokeStyle = '#4b5563'; c.lineWidth = 2;
  c.beginPath();
  c.moveTo(nozzle.x, CY - 45);
  c.lineTo(nozzle.x + nozzle.w, CY - 52);
  c.stroke();
  c.beginPath();
  c.moveTo(nozzle.x, CY + 45);
  c.lineTo(nozzle.x + nozzle.w, CY + 52);
  c.stroke();

  // ── Flow arrows ──
  c.globalAlpha = 0.5;
  arrow(c, intake.x - 40, CY, intake.x - 5, CY, '#93c5fd', 3);
  arrow(c, nozzle.x + nozzle.w + 5, CY, nozzle.x + nozzle.w + 50, CY, '#fb923c', 3);
  c.globalAlpha = 1;

  // ── Section labels ──
  const ly = CY + outerR + 25;
  label(c, 'Sání', intake.x + intake.w / 2, ly, 11, '#94a3b8');
  label(c, 'Kompresor', compressor.x + compressor.w / 2, ly, 11, '#94a3b8');
  label(c, 'Spalovací komora', combustion.x + combustion.w / 2, ly, 11, '#94a3b8');
  label(c, 'Turbína', turbine.x + turbine.w / 2, ly, 11, '#94a3b8');
  label(c, 'Tryska', nozzle.x + nozzle.w / 2, ly, 11, '#94a3b8');

  // Section dividers
  c.setLineDash([4, 4]); c.strokeStyle = '#475569'; c.lineWidth = 1;
  [compressor.x, combustion.x, turbine.x, nozzle.x].forEach(x => {
    c.beginPath(); c.moveTo(x, CY - outerR - 5); c.lineTo(x, CY + outerR + 5); c.stroke();
  });
  c.setLineDash([]);

  // Intake cone (spinner)
  c.fillStyle = '#6b7280';
  c.beginPath();
  c.moveTo(intake.x, CY);
  c.lineTo(intake.x + 45, CY - 16);
  c.lineTo(intake.x + 45, CY + 16);
  c.closePath(); c.fill();
  c.strokeStyle = '#1e293b'; c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(intake.x, CY);
  c.lineTo(intake.x + 45, CY - 16);
  c.lineTo(intake.x + 45, CY + 16);
  c.closePath(); c.stroke();

  // Top label for stator/fuel
  label(c, 'Statorové lopatky', compressor.x + 30, CY - outerR - 15, 10, '#64748b');
  label(c, 'Vstřikovače', combustion.x + combustion.w / 2, CY - outerR - 15, 10, '#0ea5e9');

  c.restore();
}

/* ═══════════════════════════════════════════════════
   ROCKET ENGINE (vertical cutaway)
   ═══════════════════════════════════════════════════ */
function drawRocket(c, phase, w, h) {
  beginLogical(c, w, h);

  const CX = 400;

  // Combustion chamber
  const chamberTop = 120;
  const chamberBot = 275;
  const chamberW = 180;

  // Nozzle (converging-diverging — De Laval)
  const throatY = 325;
  const throatW = 55;
  const exitY = 490;
  const exitW = 155;

  // ── Turbopump visualization (top) ──
  const pumpY = 55;
  const pumpR = 22;

  // Turbopump housing
  c.fillStyle = '#4b5563';
  roundRect(c, CX - 45, pumpY - pumpR - 5, 90, pumpR * 2 + 10, 8); c.fill();
  outlineRoundRect(c, CX - 45, pumpY - pumpR - 5, 90, pumpR * 2 + 10, 8);

  // Pump impeller (rotating)
  const pumpAngle = phase * TAU * 6;
  c.fillStyle = '#6b7280';
  c.beginPath(); c.arc(CX, pumpY, pumpR, 0, TAU); c.fill();
  outlineCircle(c, CX, pumpY, pumpR);
  // Impeller blades
  for (let i = 0; i < 6; i++) {
    const ba = pumpAngle + i * TAU / 6;
    c.strokeStyle = '#94a3b8'; c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(CX + 5 * Math.cos(ba), pumpY + 5 * Math.sin(ba));
    c.lineTo(CX + (pumpR - 3) * Math.cos(ba), pumpY + (pumpR - 3) * Math.sin(ba));
    c.stroke();
  }
  // Center
  c.fillStyle = '#1e293b';
  c.beginPath(); c.arc(CX, pumpY, 4, 0, TAU); c.fill();

  // Pump labels
  label(c, 'Turbočerpadlo', CX, pumpY - pumpR - 14, 10, '#94a3b8');

  // Pipes from pump to chamber
  c.fillStyle = '#4b5563';
  c.fillRect(CX - 4, pumpY + pumpR + 5, 8, chamberTop - pumpY - pumpR - 5);
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  c.strokeRect(CX - 4, pumpY + pumpR + 5, 8, chamberTop - pumpY - pumpR - 5);

  // ── Fuel / oxidizer inlets ──
  // Fuel (left) — into turbopump
  c.fillStyle = '#3b82f6';
  roundRect(c, CX - chamberW / 2 - 80, pumpY - 15, 60, 30, 6); c.fill();
  outlineRoundRect(c, CX - chamberW / 2 - 80, pumpY - 15, 60, 30, 6);
  label(c, 'Palivo', CX - chamberW / 2 - 50, pumpY - 22, 11, '#60a5fa');
  arrow(c, CX - chamberW / 2 - 20, pumpY, CX - 45, pumpY, '#60a5fa', 2.5);

  // Oxidizer (right)
  c.fillStyle = '#10b981';
  roundRect(c, CX + chamberW / 2 + 20, pumpY - 15, 60, 30, 6); c.fill();
  outlineRoundRect(c, CX + chamberW / 2 + 20, pumpY - 15, 60, 30, 6);
  label(c, 'Okysličovadlo', CX + chamberW / 2 + 50, pumpY - 22, 11, '#34d399');
  arrow(c, CX + chamberW / 2 + 20, pumpY, CX + 45, pumpY, '#34d399', 2.5);

  // ── Injector plate ──
  c.fillStyle = '#475569';
  c.fillRect(CX - chamberW / 2, chamberTop, chamberW, 12);
  outlineRect(c, CX - chamberW / 2, chamberTop, chamberW, 12);
  // Injector holes
  c.fillStyle = '#1e293b';
  for (let i = 0; i < 7; i++) {
    const ix = CX - chamberW / 2 + 18 + i * (chamberW - 36) / 6;
    c.beginPath(); c.arc(ix, chamberTop + 6, 3, 0, TAU); c.fill();
  }

  // ── Cooling channels around combustion chamber (regenerative cooling) ──
  const channelW = 8;
  const wallW = 12;
  const channelCount = 12;
  const channelSpacing = (chamberBot - chamberTop - 20) / (channelCount - 1);

  // Left wall with cooling channels
  c.fillStyle = metalGrad(c, CX - chamberW / 2 - wallW, chamberTop, wallW, chamberBot - chamberTop, '#4b5563', 'h');
  c.fillRect(CX - chamberW / 2 - wallW, chamberTop, wallW, chamberBot - chamberTop);
  outlineRect(c, CX - chamberW / 2 - wallW, chamberTop, wallW, chamberBot - chamberTop);

  // Outer cooling jacket (left)
  c.fillStyle = metalGrad(c, CX - chamberW / 2 - wallW - channelW - 4, chamberTop, 4, chamberBot - chamberTop, '#3f4753', 'h');
  c.fillRect(CX - chamberW / 2 - wallW - channelW - 4, chamberTop, 4, chamberBot - chamberTop);
  outlineRect(c, CX - chamberW / 2 - wallW - channelW - 4, chamberTop, 4, chamberBot - chamberTop);

  // Cooling channel (left) — show coolant flow
  for (let i = 0; i < channelCount; i++) {
    const cy = chamberTop + 10 + i * channelSpacing;
    const flowT = (phase * 4 + i * 0.15) % 1;
    const alpha = 0.2 + 0.15 * Math.sin(flowT * TAU);
    c.fillStyle = `rgba(59,130,246,${alpha})`;
    c.fillRect(CX - chamberW / 2 - wallW - channelW, cy - 3, channelW, 6);
  }

  // Right wall with cooling channels
  c.fillStyle = metalGrad(c, CX + chamberW / 2, chamberTop, wallW, chamberBot - chamberTop, '#4b5563', 'h');
  c.fillRect(CX + chamberW / 2, chamberTop, wallW, chamberBot - chamberTop);
  outlineRect(c, CX + chamberW / 2, chamberTop, wallW, chamberBot - chamberTop);

  // Outer cooling jacket (right)
  c.fillStyle = metalGrad(c, CX + chamberW / 2 + wallW + channelW, chamberTop, 4, chamberBot - chamberTop, '#3f4753', 'h');
  c.fillRect(CX + chamberW / 2 + wallW + channelW, chamberTop, 4, chamberBot - chamberTop);
  outlineRect(c, CX + chamberW / 2 + wallW + channelW, chamberTop, 4, chamberBot - chamberTop);

  // Cooling channel (right)
  for (let i = 0; i < channelCount; i++) {
    const cy = chamberTop + 10 + i * channelSpacing;
    const flowT = (phase * 4 + i * 0.15 + 0.5) % 1;
    const alpha = 0.2 + 0.15 * Math.sin(flowT * TAU);
    c.fillStyle = `rgba(59,130,246,${alpha})`;
    c.fillRect(CX + chamberW / 2 + wallW, cy - 3, channelW, 6);
  }

  // Cooling channel label
  label(c, 'Regenerativní', CX + chamberW / 2 + wallW + channelW + 30, chamberTop + 30, 9, '#60a5fa', 'left');
  label(c, 'chlazení', CX + chamberW / 2 + wallW + channelW + 30, chamberTop + 42, 9, '#60a5fa', 'left');

  // ── Combustion fill ──
  const flicker = Math.sin(phase * 120) * 0.15 + 0.85;
  const combGrad2 = c.createLinearGradient(0, chamberTop + 12, 0, chamberBot);
  combGrad2.addColorStop(0, `rgba(251,191,36,${0.4 * flicker})`);
  combGrad2.addColorStop(0.3, `rgba(239,68,68,${0.5 * flicker})`);
  combGrad2.addColorStop(1, `rgba(249,115,22,${0.6 * flicker})`);
  c.fillStyle = combGrad2;
  c.fillRect(CX - chamberW / 2, chamberTop + 12, chamberW, chamberBot - chamberTop - 12);

  // Combustion glow
  c.save();
  c.shadowBlur = 40; c.shadowColor = `rgba(249,115,22,${0.5 * flicker})`;
  c.fillStyle = `rgba(255,200,100,${0.2 * flicker})`;
  c.beginPath(); c.arc(CX, (chamberTop + chamberBot) / 2, 50, 0, TAU); c.fill();
  c.restore();

  // ── Nozzle — smooth curved De Laval shape ──
  // Converging section: smooth curve from chamber to throat
  // Diverging section: smooth bell curve from throat to exit

  const nozzleWall = 10;

  // Left nozzle wall (smooth curve)
  c.fillStyle = '#374151';
  c.beginPath();
  // Outer edge
  c.moveTo(CX - chamberW / 2 - wallW, chamberBot);
  c.bezierCurveTo(
    CX - chamberW / 2 - wallW, chamberBot + (throatY - chamberBot) * 0.6,
    CX - throatW / 2 - nozzleWall, throatY - 20,
    CX - throatW / 2 - nozzleWall, throatY
  );
  c.bezierCurveTo(
    CX - throatW / 2 - nozzleWall, throatY + 30,
    CX - exitW / 2 - nozzleWall - 10, exitY - 40,
    CX - exitW / 2 - nozzleWall, exitY
  );
  // Inner edge (back up)
  c.lineTo(CX - exitW / 2, exitY);
  c.bezierCurveTo(
    CX - exitW / 2 - 5, exitY - 40,
    CX - throatW / 2, throatY + 25,
    CX - throatW / 2, throatY
  );
  c.bezierCurveTo(
    CX - throatW / 2, throatY - 15,
    CX - chamberW / 2, chamberBot + (throatY - chamberBot) * 0.5,
    CX - chamberW / 2, chamberBot
  );
  c.closePath(); c.fill();
  c.strokeStyle = '#1e293b'; c.lineWidth = 2; c.stroke();

  // Right nozzle wall (mirror)
  c.fillStyle = '#374151';
  c.beginPath();
  c.moveTo(CX + chamberW / 2 + wallW, chamberBot);
  c.bezierCurveTo(
    CX + chamberW / 2 + wallW, chamberBot + (throatY - chamberBot) * 0.6,
    CX + throatW / 2 + nozzleWall, throatY - 20,
    CX + throatW / 2 + nozzleWall, throatY
  );
  c.bezierCurveTo(
    CX + throatW / 2 + nozzleWall, throatY + 30,
    CX + exitW / 2 + nozzleWall + 10, exitY - 40,
    CX + exitW / 2 + nozzleWall, exitY
  );
  c.lineTo(CX + exitW / 2, exitY);
  c.bezierCurveTo(
    CX + exitW / 2 + 5, exitY - 40,
    CX + throatW / 2, throatY + 25,
    CX + throatW / 2, throatY
  );
  c.bezierCurveTo(
    CX + throatW / 2, throatY - 15,
    CX + chamberW / 2, chamberBot + (throatY - chamberBot) * 0.5,
    CX + chamberW / 2, chamberBot
  );
  c.closePath(); c.fill();
  c.strokeStyle = '#1e293b'; c.lineWidth = 2; c.stroke();

  // ── Cooling channels on nozzle ──
  // Draw flow lines along nozzle walls
  c.strokeStyle = 'rgba(59,130,246,0.25)'; c.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.5) / 6;
    const ny = chamberBot + t * (exitY - chamberBot);
    // Interpolate nozzle width at this y
    let nw;
    if (ny < throatY) {
      const tt = (ny - chamberBot) / (throatY - chamberBot);
      nw = chamberW / 2 + (throatW / 2 - chamberW / 2) * tt;
    } else {
      const tt = (ny - throatY) / (exitY - throatY);
      nw = throatW / 2 + (exitW / 2 - throatW / 2) * tt;
    }
    const flowAlpha = 0.2 + 0.15 * Math.sin((phase * 4 + i * 0.3) * TAU);
    c.strokeStyle = `rgba(59,130,246,${flowAlpha})`;
    // Left side channel mark
    c.beginPath();
    c.moveTo(CX - nw - 3, ny - 4);
    c.lineTo(CX - nw - 3, ny + 4);
    c.stroke();
    // Right side
    c.beginPath();
    c.moveTo(CX + nw + 3, ny - 4);
    c.lineTo(CX + nw + 3, ny + 4);
    c.stroke();
  }

  // ── Gas in nozzle ──
  // Converging — smooth shape
  const convGrad = c.createLinearGradient(0, chamberBot, 0, throatY);
  convGrad.addColorStop(0, 'rgba(249,115,22,0.50)');
  convGrad.addColorStop(1, 'rgba(251,191,36,0.55)');
  c.fillStyle = convGrad;
  c.beginPath();
  c.moveTo(CX - chamberW / 2, chamberBot);
  c.bezierCurveTo(
    CX - chamberW / 2, chamberBot + (throatY - chamberBot) * 0.5,
    CX - throatW / 2, throatY - 15,
    CX - throatW / 2, throatY
  );
  c.lineTo(CX + throatW / 2, throatY);
  c.bezierCurveTo(
    CX + throatW / 2, throatY - 15,
    CX + chamberW / 2, chamberBot + (throatY - chamberBot) * 0.5,
    CX + chamberW / 2, chamberBot
  );
  c.closePath(); c.fill();

  // Diverging
  const divGrad = c.createLinearGradient(0, throatY, 0, exitY);
  divGrad.addColorStop(0, 'rgba(251,191,36,0.55)');
  divGrad.addColorStop(1, 'rgba(239,68,68,0.12)');
  c.fillStyle = divGrad;
  c.beginPath();
  c.moveTo(CX - throatW / 2, throatY);
  c.bezierCurveTo(
    CX - throatW / 2, throatY + 25,
    CX - exitW / 2 - 5, exitY - 40,
    CX - exitW / 2, exitY
  );
  c.lineTo(CX + exitW / 2, exitY);
  c.bezierCurveTo(
    CX + exitW / 2 + 5, exitY - 40,
    CX + throatW / 2, throatY + 25,
    CX + throatW / 2, throatY
  );
  c.closePath(); c.fill();

  // ── Exhaust plume with Mach diamonds ──
  const plumeLen = 90;
  const plumeFlicker = Math.sin(phase * 90 + 1) * 0.2 + 0.8;

  // Main plume shape
  const plumeGrad = c.createLinearGradient(0, exitY, 0, exitY + plumeLen);
  plumeGrad.addColorStop(0, `rgba(251,191,36,${0.65 * plumeFlicker})`);
  plumeGrad.addColorStop(0.2, `rgba(249,115,22,${0.5 * plumeFlicker})`);
  plumeGrad.addColorStop(0.5, `rgba(239,68,68,${0.35 * plumeFlicker})`);
  plumeGrad.addColorStop(1, 'rgba(239,68,68,0)');
  c.fillStyle = plumeGrad;
  c.beginPath();
  c.moveTo(CX - exitW / 2 + 8, exitY);
  c.quadraticCurveTo(CX - exitW / 2 - 10, exitY + plumeLen * 0.5, CX - 15, exitY + plumeLen);
  c.quadraticCurveTo(CX, exitY + plumeLen + 12, CX + 15, exitY + plumeLen);
  c.quadraticCurveTo(CX + exitW / 2 + 10, exitY + plumeLen * 0.5, CX + exitW / 2 - 8, exitY);
  c.closePath(); c.fill();

  // Mach diamonds (bright shock patterns in exhaust)
  c.save();
  const diamondCount = 4;
  for (let i = 0; i < diamondCount; i++) {
    const dy = exitY + 15 + i * 18;
    const dw = (exitW / 2 - 15) * (1 - i * 0.2);
    const brightness = (1 - i * 0.2) * plumeFlicker;
    const shimmer = Math.sin(phase * 60 + i * 2) * 0.15 + 0.85;

    c.fillStyle = `rgba(253,230,138,${0.35 * brightness * shimmer})`;
    c.beginPath();
    c.moveTo(CX - dw, dy);
    c.lineTo(CX, dy - 6);
    c.lineTo(CX + dw, dy);
    c.lineTo(CX, dy + 6);
    c.closePath();
    c.fill();
  }
  c.restore();

  // Plume glow
  c.save();
  c.shadowBlur = 50 * plumeFlicker; c.shadowColor = 'rgba(249,115,22,0.4)';
  c.fillStyle = 'rgba(255,200,100,0.1)';
  c.beginPath(); c.arc(CX, exitY + 20, 40, 0, TAU); c.fill();
  c.restore();

  // ── Labels ──
  label(c, 'Spalovací komora', CX, chamberTop - 10, 12, '#94a3b8');
  label(c, 'Vstřikovací deska', CX - chamberW / 2 - wallW - channelW - 20, chamberTop + 6, 10, '#64748b', 'right');
  label(c, 'Hrdlo trysky', CX + throatW / 2 + nozzleWall + 20, throatY, 11, '#94a3b8', 'left');
  label(c, 'Lavalova tryska', CX - exitW / 2 - nozzleWall - 20, (throatY + exitY) / 2, 11, '#64748b', 'right');
  label(c, 'Machovy diamanty', CX + exitW / 2 + 15, exitY + 35, 9, '#fbbf24', 'left');

  // Dashed line to Mach diamonds
  c.setLineDash([3, 3]); c.strokeStyle = '#fbbf24'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(CX + exitW / 2 + 12, exitY + 35); c.lineTo(CX + 25, exitY + 35); c.stroke();
  c.setLineDash([]);

  // Direction arrow
  arrow(c, CX, exitY + plumeLen + 15, CX, exitY + plumeLen + 50, '#ef4444', 3);
  labelBold(c, 'TAH', CX, exitY + plumeLen + 65, 13, '#ef4444');

  c.restore();
}

/* ═══════════════════════════════════════════════════
   MAIN DRAW + ANIMATION LOOP
   ═══════════════════════════════════════════════════ */
function draw() {
  ctx.clearRect(0, 0, cw, ch);
  ENGINES[cur].draw(ctx, phase, cw, ch);
}

function tick(ts) {
  if (lastTs === 0) lastTs = ts;
  const dt = Math.min((ts - lastTs) / 1000, 0.1); // cap delta
  lastTs = ts;

  if (playing) {
    const cycleSec = 3; // seconds per full cycle at speed=1
    phase = (phase + dt * speed / cycleSec) % 1;
  }

  draw();
  updateUI();
  requestAnimationFrame(tick);
}

/* ═══════════════════════════════════════════════════
   UI SETUP
   ═══════════════════════════════════════════════════ */
function buildUI() {
  // Engine tabs — hidden entirely when only one engine is present
  const tabsEl = document.getElementById('engine-tabs');
  if (ENGINES.length <= 1) {
    tabsEl.style.display = 'none';
  } else {
    ENGINES.forEach((eng, i) => {
      const btn = document.createElement('button');
      btn.className = 'engine-tab' + (i === cur ? ' active' : '');
      btn.textContent = eng.name;
      btn.onclick = () => { cur = i; phase = 0; playing = true; updateTabs(); updateProgress(); };
      tabsEl.appendChild(btn);
    });
  }

  // Controls
  document.getElementById('btn-play').onclick = () => {
    playing = !playing;
  };
  document.getElementById('btn-fwd').onclick = () => {
    playing = false;
    phase = ((phase + STEP) % 1 + 1) % 1;
  };
  document.getElementById('btn-back').onclick = () => {
    playing = false;
    phase = ((phase - STEP) % 1 + 1) % 1;
  };

  const slider = document.getElementById('speed-slider');
  slider.oninput = () => {
    speed = parseFloat(slider.value);
    document.getElementById('speed-val').innerHTML = speed.toFixed(1) + '&times;';
  };

  updateProgress();
}

function updateTabs() {
  const tabs = document.querySelectorAll('.engine-tab');
  tabs.forEach((t, i) => t.className = 'engine-tab' + (i === cur ? ' active' : ''));
}

function updateProgress() {
  const eng = ENGINES[cur];
  const numPhases = eng.phases.length;

  // Progress labels
  const labelsEl = document.getElementById('progress-labels');
  labelsEl.innerHTML = '';
  eng.phases.forEach(p => {
    const sp = document.createElement('span');
    sp.textContent = p.name;
    labelsEl.appendChild(sp);
  });
}

function updateUI() {
  const eng = ENGINES[cur];
  const numPhases = eng.phases.length;
  const phaseIdx = Math.min(numPhases - 1, Math.floor(phase * numPhases));
  const p = eng.phases[phaseIdx];

  // Progress bar fill
  const fill = document.getElementById('progress-fill');
  fill.style.width = (phase * 100) + '%';
  fill.style.background = p.color;

  // Progress labels highlight
  const labels = document.querySelectorAll('#progress-labels span');
  labels.forEach((l, i) => {
    l.className = i === phaseIdx ? 'active' : '';
    if (i === phaseIdx) l.style.color = p.color;
    else l.style.color = '';
  });

  // Stroke info
  document.getElementById('stroke-label').textContent = p.name;
  document.getElementById('stroke-label').style.color = p.color;
  document.getElementById('stroke-desc').textContent = p.desc;

  // Play button icon
  document.getElementById('btn-play').innerHTML = playing ? '&#9208;' : '&#9654;';
}

/* ═══════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════ */
buildUI();
resize();
requestAnimationFrame(tick);
