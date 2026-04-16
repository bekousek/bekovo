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

  const CY = 260;           // cylinder center y
  const R = 55;              // crank radius
  const L = 150;             // rod length
  const CRANK_CX = 620;     // crank/flywheel center x

  // Cylinder geometry (horizontal)
  const CYL_T = CY - 70, CYL_B = CY + 70;
  const CYL_L = 120, CYL_R = 430;
  const CYL_H = CYL_B - CYL_T;
  const WALL = 12;
  const PISTON_W = 24;

  // Crank kinematics (horizontal layout)
  const crankA = phase * TAU;
  const pinX = CRANK_CX - R * Math.cos(crankA);
  const pinY = CY - R * Math.sin(crankA);
  const dy = pinY - CY;
  const pX = pinX - Math.sqrt(L * L - dy * dy); // piston center x

  const halfStroke = phase < 0.5 ? 0 : 1;

  // ── Valve chest (above cylinder) ──
  const vcTop = CYL_T - 70;
  const vcBot = CYL_T - 5;
  const vcLeft = CYL_L + 60;
  const vcRight = CYL_R - 60;
  const vcH = vcBot - vcTop;
  const vcW = vcRight - vcLeft;

  // Valve chest body
  c.fillStyle = metalGrad(c, vcLeft, vcTop, vcW, vcH, '#4b5563', 'v');
  roundRect(c, vcLeft, vcTop, vcW, vcH, 6); c.fill();
  outlineRoundRect(c, vcLeft, vcTop, vcW, vcH, 6);

  // Steam ports (two openings from valve chest into cylinder)
  const portW = 20;
  const port1X = vcLeft + 40; // left port
  const port2X = vcRight - 40 - portW; // right port
  const portY = vcBot;
  const portH2 = CYL_T + WALL - vcBot + 5;

  // Port passages
  c.fillStyle = '#374151';
  c.fillRect(port1X, portY, portW, portH2);
  outlineRect(c, port1X, portY, portW, portH2);
  c.fillRect(port2X, portY, portW, portH2);
  outlineRect(c, port2X, portY, portW, portH2);

  // D-shaped slide valve
  // The valve slides horizontally to cover/uncover ports
  // In first half (phase 0-0.5): uncovers left port (steam pushes right), covers right port
  // In second half: uncovers right port, covers left port
  const valveTravel = 50;
  const valveOffset = Math.sin(crankA) * valveTravel / 2; // driven by eccentric
  const valveX = (vcLeft + vcRight) / 2 + valveOffset - 40;
  const valveW = 80;
  const valveH = vcH - 12;

  // Steam fill in valve chest (live steam — bright blue)
  c.fillStyle = 'rgba(120,190,255,0.25)';
  c.fillRect(vcLeft + 4, vcTop + 4, vcW - 8, vcH - 8);

  // Draw slide valve (D-shape)
  c.fillStyle = '#64748b';
  roundRect(c, valveX, vcTop + 6, valveW, valveH, 4); c.fill();
  outlineRoundRect(c, valveX, vcTop + 6, valveW, valveH, 4);
  // Valve cavity (the D opening underneath)
  c.fillStyle = '#2d3748';
  c.fillRect(valveX + 15, vcTop + 6 + valveH - 12, valveW - 30, 12);

  // Color the ports based on which is active
  const leftPortActive = (valveOffset < -5); // left port uncovered = steam enters left side
  const rightPortActive = (valveOffset > 5);

  if (leftPortActive) {
    // Live steam through left port (bright blue)
    c.fillStyle = 'rgba(100,180,255,0.45)';
    c.fillRect(port1X + 2, portY + 2, portW - 4, portH2 - 2);
    // Exhaust through right port (faded)
    c.fillStyle = 'rgba(180,190,200,0.2)';
    c.fillRect(port2X + 2, portY + 2, portW - 4, portH2 - 2);
  } else if (rightPortActive) {
    c.fillStyle = 'rgba(100,180,255,0.45)';
    c.fillRect(port2X + 2, portY + 2, portW - 4, portH2 - 2);
    c.fillStyle = 'rgba(180,190,200,0.2)';
    c.fillRect(port1X + 2, portY + 2, portW - 4, portH2 - 2);
  }

  // ── Steam inlet pipe (from left, going to valve chest) ──
  const inletPipeY = vcTop + vcH / 2;
  c.fillStyle = metalGrad(c, 30, inletPipeY - 12, vcLeft - 30, 24, '#4b5563', 'h');
  c.fillRect(30, inletPipeY - 12, vcLeft - 25, 24);
  outlineRect(c, 30, inletPipeY - 12, vcLeft - 25, 24);

  // Pipe flange
  c.fillStyle = '#5b6370';
  c.fillRect(30, inletPipeY - 16, 10, 32);
  outlineRect(c, 30, inletPipeY - 16, 10, 32);

  // ── Exhaust pipe (going up from valve chest) ──
  const exhaustPipeX = vcLeft + vcW / 2;
  c.fillStyle = metalGrad(c, exhaustPipeX - 12, 10, 24, vcTop - 10, '#4b5563', 'v');
  c.fillRect(exhaustPipeX - 12, 10, 24, vcTop - 10);
  outlineRect(c, exhaustPipeX - 12, 10, 24, vcTop - 10);
  // Exhaust arrow
  c.globalAlpha = 0.5;
  arrow(c, exhaustPipeX, vcTop - 5, exhaustPipeX, 15, '#9ca3af', 2.5);
  c.globalAlpha = 1;

  // ── Steam fill in cylinder chambers ──
  const pistonLeft = pX - PISTON_W / 2;
  const pistonRight = pX + PISTON_W / 2;

  // Left chamber (between left end and piston)
  if (halfStroke === 0) {
    // Active steam on left — bright blue
    const steamGrad = c.createLinearGradient(CYL_L, 0, pistonLeft, 0);
    steamGrad.addColorStop(0, 'rgba(100,180,255,0.35)');
    steamGrad.addColorStop(1, 'rgba(120,190,255,0.2)');
    c.fillStyle = steamGrad;
    c.fillRect(CYL_L + 2, CYL_T + WALL, pistonLeft - CYL_L - 2, CYL_H - 2 * WALL);

    // Animated steam particles on active side
    c.save();
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const t = ((phase * 3 + i / particleCount) % 1);
      const px = CYL_L + 10 + t * (pistonLeft - CYL_L - 20);
      const py = CY + Math.sin(t * 8 + i * 2.5) * 25;
      const size = 3 + Math.sin(t * PI) * 4;
      c.fillStyle = `rgba(150,210,255,${0.3 * Math.sin(t * PI)})`;
      c.beginPath(); c.arc(px, py, size, 0, TAU); c.fill();
    }
    c.restore();
  } else {
    // Exhaust on left — faded
    c.fillStyle = 'rgba(180,190,200,0.12)';
    c.fillRect(CYL_L + 2, CYL_T + WALL, pistonLeft - CYL_L - 2, CYL_H - 2 * WALL);
  }

  // Right chamber
  if (halfStroke === 1) {
    const steamGrad = c.createLinearGradient(pistonRight, 0, CYL_R, 0);
    steamGrad.addColorStop(0, 'rgba(120,190,255,0.2)');
    steamGrad.addColorStop(1, 'rgba(100,180,255,0.35)');
    c.fillStyle = steamGrad;
    c.fillRect(pistonRight, CYL_T + WALL, CYL_R - pistonRight - 2, CYL_H - 2 * WALL);

    c.save();
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const t = ((phase * 3 + i / particleCount) % 1);
      const px = pistonRight + 10 + t * (CYL_R - pistonRight - 20);
      const py = CY + Math.sin(t * 8 + i * 2.5) * 25;
      const size = 3 + Math.sin(t * PI) * 4;
      c.fillStyle = `rgba(150,210,255,${0.3 * Math.sin(t * PI)})`;
      c.beginPath(); c.arc(px, py, size, 0, TAU); c.fill();
    }
    c.restore();
  } else {
    c.fillStyle = 'rgba(180,190,200,0.12)';
    c.fillRect(pistonRight, CYL_T + WALL, CYL_R - pistonRight - 2, CYL_H - 2 * WALL);
  }

  // ── Cylinder ──
  c.fillStyle = metalGrad(c, CYL_L, CYL_T, CYL_R - CYL_L, WALL, '#4b5563', 'v');
  c.fillRect(CYL_L, CYL_T, CYL_R - CYL_L, WALL); // top wall
  outlineRect(c, CYL_L, CYL_T, CYL_R - CYL_L, WALL);

  c.fillStyle = metalGrad(c, CYL_L, CYL_B - WALL, CYL_R - CYL_L, WALL, '#4b5563', 'v');
  c.fillRect(CYL_L, CYL_B - WALL, CYL_R - CYL_L, WALL); // bottom wall
  outlineRect(c, CYL_L, CYL_B - WALL, CYL_R - CYL_L, WALL);

  // Left end cap with stuffing box
  c.fillStyle = metalGrad(c, CYL_L - 14, CYL_T, 18, CYL_H, '#4b5563', 'h');
  roundRect(c, CYL_L - 14, CYL_T - 5, 18, CYL_H + 10, 4); c.fill();
  outlineRoundRect(c, CYL_L - 14, CYL_T - 5, 18, CYL_H + 10, 4);

  // Right end cap (where piston rod exits)
  c.fillStyle = metalGrad(c, CYL_R - 4, CYL_T, 18, CYL_H, '#4b5563', 'h');
  roundRect(c, CYL_R - 4, CYL_T - 5, 18, CYL_H + 10, 4); c.fill();
  outlineRoundRect(c, CYL_R - 4, CYL_T - 5, 18, CYL_H + 10, 4);

  // Stuffing box (seal where piston rod passes through right end cap)
  c.fillStyle = '#5b6370';
  c.fillRect(CYL_R + 8, CY - 10, 12, 20);
  outlineRect(c, CYL_R + 8, CY - 10, 12, 20);
  // Packing lines
  c.strokeStyle = '#3f4753'; c.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    c.beginPath(); c.moveTo(CYL_R + 9, CY - 6 + i * 5); c.lineTo(CYL_R + 19, CY - 6 + i * 5); c.stroke();
  }

  // ── Piston ──
  const pGrad = c.createLinearGradient(0, CYL_T + WALL, 0, CYL_B - WALL);
  pGrad.addColorStop(0, '#9ca3b8'); pGrad.addColorStop(1, '#64748b');
  c.fillStyle = pGrad;
  roundRect(c, pX - PISTON_W / 2, CYL_T + WALL + 2, PISTON_W, CYL_H - 2 * WALL - 4, 3); c.fill();
  outlineRoundRect(c, pX - PISTON_W / 2, CYL_T + WALL + 2, PISTON_W, CYL_H - 2 * WALL - 4, 3);

  // Piston rod (extends right from piston through stuffing box)
  c.fillStyle = '#94a3b8';
  c.fillRect(pX + PISTON_W / 2, CY - 5, CYL_R + 20 - (pX + PISTON_W / 2), 10);
  c.strokeStyle = '#1e293b'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(pX + PISTON_W / 2, CY - 5); c.lineTo(CYL_R + 20, CY - 5); c.stroke();
  c.beginPath(); c.moveTo(pX + PISTON_W / 2, CY + 5); c.lineTo(CYL_R + 20, CY + 5); c.stroke();

  // ── Crosshead guide rails ──
  const crossheadX = CYL_R + 22;
  const guideLen = 60;
  // Top rail
  c.fillStyle = '#374151';
  c.fillRect(crossheadX, CY - 20, guideLen, 6);
  outlineRect(c, crossheadX, CY - 20, guideLen, 6);
  // Bottom rail
  c.fillRect(crossheadX, CY + 14, guideLen, 6);
  outlineRect(c, crossheadX, CY + 14, guideLen, 6);
  // Crosshead slider
  c.fillStyle = '#5b6370';
  roundRect(c, crossheadX + 5, CY - 14, 18, 28, 3); c.fill();
  outlineRoundRect(c, crossheadX + 5, CY - 14, 18, 28, 3);

  // ── Connecting rod ──
  c.strokeStyle = '#6b7280'; c.lineWidth = 8; c.lineCap = 'round';
  c.beginPath(); c.moveTo(crossheadX + 14, CY); c.lineTo(pinX, pinY); c.stroke();
  c.strokeStyle = '#94a3b8'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(crossheadX + 14, CY); c.lineTo(pinX, pinY); c.stroke();
  // Rod outlines
  const srodAngle = Math.atan2(pinY - CY, pinX - (crossheadX + 14));
  const srnx = Math.cos(srodAngle + PI / 2) * 4;
  const srny = Math.sin(srodAngle + PI / 2) * 4;
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(crossheadX + 14 + srnx, CY + srny); c.lineTo(pinX + srnx, pinY + srny); c.stroke();
  c.beginPath(); c.moveTo(crossheadX + 14 - srnx, CY - srny); c.lineTo(pinX - srnx, pinY - srny); c.stroke();

  // ── Eccentric on crankshaft (drives the valve) ──
  // The eccentric is offset from crank center and rotates with it
  const eccR = 16;
  const eccOffset = 8;
  const eccX = CRANK_CX + eccOffset * Math.cos(crankA + PI / 2);
  const eccY = CY + eccOffset * Math.sin(crankA + PI / 2);
  c.fillStyle = '#5b6370';
  c.beginPath(); c.arc(eccX, eccY, eccR, 0, TAU); c.fill();
  outlineCircle(c, eccX, eccY, eccR);
  // Eccentric strap (ring around eccentric)
  c.strokeStyle = '#78716c'; c.lineWidth = 4;
  c.beginPath(); c.arc(eccX, eccY, eccR + 4, 0, TAU); c.stroke();
  outlineCircle(c, eccX, eccY, eccR + 4);

  // ── Valve rod (from eccentric to slide valve) ──
  const valveRodEndX = valveX + valveW / 2;
  const valveRodEndY = vcTop + 6 + valveH / 2;
  c.strokeStyle = '#78716c'; c.lineWidth = 4; c.lineCap = 'round';
  // Route: from eccentric strap up then left to valve
  const vrodMidY = vcTop + vcH / 2;
  c.beginPath();
  c.moveTo(eccX, eccY - eccR - 4);
  c.lineTo(eccX, vrodMidY);
  c.lineTo(valveRodEndX, vrodMidY);
  c.stroke();
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  c.beginPath();
  c.moveTo(eccX, eccY - eccR - 4);
  c.lineTo(eccX, vrodMidY);
  c.lineTo(valveRodEndX, vrodMidY);
  c.stroke();

  // ── Flywheel ──
  const FW_R = 110;
  // Outer rim (thick)
  c.strokeStyle = '#475569'; c.lineWidth = 18;
  c.beginPath(); c.arc(CRANK_CX, CY, FW_R, 0, TAU); c.stroke();
  // Rim highlights
  c.strokeStyle = '#6b7280'; c.lineWidth = 2;
  c.beginPath(); c.arc(CRANK_CX, CY, FW_R + 8, 0, TAU); c.stroke();
  c.beginPath(); c.arc(CRANK_CX, CY, FW_R - 8, 0, TAU); c.stroke();
  // Rim outlines
  c.strokeStyle = '#1e293b'; c.lineWidth = 2;
  c.beginPath(); c.arc(CRANK_CX, CY, FW_R + 9, 0, TAU); c.stroke();
  c.beginPath(); c.arc(CRANK_CX, CY, FW_R - 9, 0, TAU); c.stroke();

  // 8 proper spokes
  c.strokeStyle = '#4b5563'; c.lineWidth = 7; c.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const sa = crankA + i * TAU / 8;
    c.beginPath();
    c.moveTo(CRANK_CX + 22 * Math.cos(sa), CY + 22 * Math.sin(sa));
    c.lineTo(CRANK_CX + (FW_R - 12) * Math.cos(sa), CY + (FW_R - 12) * Math.sin(sa));
    c.stroke();
  }
  // Spoke outlines
  c.strokeStyle = '#1e293b'; c.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const sa = crankA + i * TAU / 8;
    const snx = Math.cos(sa + PI / 2) * 3.5;
    const sny = Math.sin(sa + PI / 2) * 3.5;
    c.beginPath();
    c.moveTo(CRANK_CX + 22 * Math.cos(sa) + snx, CY + 22 * Math.sin(sa) + sny);
    c.lineTo(CRANK_CX + (FW_R - 12) * Math.cos(sa) + snx, CY + (FW_R - 12) * Math.sin(sa) + sny);
    c.stroke();
    c.beginPath();
    c.moveTo(CRANK_CX + 22 * Math.cos(sa) - snx, CY + 22 * Math.sin(sa) - sny);
    c.lineTo(CRANK_CX + (FW_R - 12) * Math.cos(sa) - snx, CY + (FW_R - 12) * Math.sin(sa) - sny);
    c.stroke();
  }

  // Hub
  c.fillStyle = '#374151'; c.beginPath(); c.arc(CRANK_CX, CY, 22, 0, TAU); c.fill();
  outlineCircle(c, CRANK_CX, CY, 22);
  // Crank pin
  c.fillStyle = '#94a3b8'; c.beginPath(); c.arc(pinX, pinY, 7, 0, TAU); c.fill();
  outlineCircle(c, pinX, pinY, 7);
  // Center
  c.fillStyle = '#1e293b'; c.beginPath(); c.arc(CRANK_CX, CY, 5, 0, TAU); c.fill();

  // ── Steam flow arrows in inlet pipe ──
  c.save();
  c.globalAlpha = 0.5;
  arrow(c, 15, inletPipeY, 50, inletPipeY, '#60a5fa', 3);
  c.restore();

  // ── Labels ──
  label(c, 'Válec', CYL_L + (CYL_R - CYL_L) / 2, CYL_B + 22, 12, '#64748b');
  label(c, 'Píst', pX, CYL_B + 22, 11, '#94a3b8');
  label(c, 'Setrvačník', CRANK_CX, CY + FW_R + 28, 12, '#64748b');
  label(c, 'Šoupátko', (vcLeft + vcRight) / 2, vcTop - 14, 11, '#94a3b8');
  label(c, 'Přívod páry', 50, inletPipeY - 22, 10, '#60a5fa');
  label(c, 'Výfuk', exhaustPipeX, 5, 10, '#9ca3af');
  label(c, 'Excentr', eccX + 28, eccY, 10, '#94a3b8', 'left');
  label(c, 'Křížová hlava', crossheadX + 30, CY + 30, 10, '#64748b');
  label(c, 'Ucpávka', CYL_R + 14, CY + 22, 9, '#64748b');

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
