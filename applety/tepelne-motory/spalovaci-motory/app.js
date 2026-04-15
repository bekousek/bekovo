/* ═══════════════════════════════════════════════════
   Tepelné motory – interaktivní applet
   6 typů motorů s animací průřezu
   ═══════════════════════════════════════════════════ */
'use strict';

// ── Engine definitions ──────────────────────────────
const ENGINES = [
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

// Begin drawing in 800×600 logical space, centered and scaled
function beginLogical(c, w, h) {
  const sx = w / 800, sy = h / 600, s = Math.min(sx, sy);
  const ox = (w - 800 * s) / 2, oy = (h - 600 * s) / 2;
  c.save(); c.translate(ox, oy); c.scale(s, s);
  return s;
}

/* ═══════════════════════════════════════════════════
   FOUR-STROKE ENGINE (gasoline / diesel)
   ═══════════════════════════════════════════════════ */
function drawFourStroke(c, phase, w, h, type) {
  beginLogical(c, w, h);

  // Geometry constants (in 800×600 logical space)
  const CX = 400;
  const R = 70;            // crank radius
  const L = 145;           // rod length
  const CRANK_CY = 455;   // crank center y

  const CYL_L = 290, CYL_R = 510;         // cylinder inner edges
  const CYL_W = CYL_R - CYL_L;            // 220
  const WALL = 14;                          // wall thickness
  const HEAD_T = 105, HEAD_B = 150;        // head top/bottom
  const CYL_BOT = 395;                     // cylinder walls end

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

  // ── Gas fill colors ──
  const gasColors = [
    'rgba(147,197,253,0.30)',  // intake blue
    'rgba(251,191,36,0.30)',   // compression amber
    'rgba(239,68,68,0.40)',    // power red
    'rgba(156,163,175,0.25)',  // exhaust gray
  ];

  const gasTop = HEAD_B;
  const gasBot = pistonCY - PISTON_H / 2;

  // ── Draw gas fill ──
  if (gasBot > gasTop + 2) {
    c.fillStyle = gasColors[strokeIdx];
    c.fillRect(CYL_L, gasTop, CYL_W, gasBot - gasTop);
  }

  // ── Combustion glow ──
  if (strokeIdx === 2 && strokePh < 0.35) {
    const t = 1 - strokePh / 0.35;
    c.save();
    c.shadowBlur = 50 * t;
    c.shadowColor = `rgba(255,120,20,${0.8 * t})`;
    c.fillStyle = `rgba(255,160,60,${0.25 * t})`;
    c.fillRect(CYL_L, gasTop, CYL_W, gasBot - gasTop);
    c.restore();
  }

  // ── Spark / injection flash ──
  if (type === 'gasoline' && phase > 0.49 && phase < 0.52) {
    const t = 1 - Math.abs(phase - 0.505) / 0.015;
    c.save();
    c.shadowBlur = 30 * t;
    c.shadowColor = '#fde68a';
    c.fillStyle = `rgba(253,230,138,${0.9 * t})`;
    c.beginPath(); c.arc(CX, HEAD_B + 8, 8 * t, 0, TAU); c.fill();
    c.restore();
  }
  if (type === 'diesel' && phase > 0.49 && phase < 0.55) {
    const t = 1 - Math.abs(phase - 0.52) / 0.03;
    // fuel spray
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

  // ── Cylinder walls ──
  c.fillStyle = metalGrad(c, CYL_L - WALL, HEAD_B, WALL, CYL_BOT - HEAD_B, '#4b5563', 'h');
  c.fillRect(CYL_L - WALL, HEAD_B, WALL, CYL_BOT - HEAD_B);
  c.fillStyle = metalGrad(c, CYL_R, HEAD_B, WALL, CYL_BOT - HEAD_B, '#4b5563', 'h');
  c.fillRect(CYL_R, HEAD_B, WALL, CYL_BOT - HEAD_B);

  // Wall inner highlight
  c.fillStyle = 'rgba(148,163,184,0.08)';
  c.fillRect(CYL_L, HEAD_B, 3, CYL_BOT - HEAD_B);
  c.fillRect(CYL_R - 3, HEAD_B, 3, CYL_BOT - HEAD_B);

  // ── Cylinder head ──
  c.fillStyle = metalGrad(c, 0, HEAD_T, 0, HEAD_B - HEAD_T, '#4b5563', 'v');
  roundRect(c, CYL_L - WALL - 12, HEAD_T, CYL_W + 2 * WALL + 24, HEAD_B - HEAD_T, 6);
  c.fill();
  // head bottom edge
  c.fillStyle = '#374151';
  c.fillRect(CYL_L - WALL, HEAD_B - 3, CYL_W + 2 * WALL, 3);

  // ── Intake valve (left) ──
  const ivx = CYL_L + 50;
  const ivDrop = ivOpen * maxDrop;
  // port opening (gas flow)
  if (ivOpen > 0.05) {
    c.fillStyle = strokeIdx === 0 ? 'rgba(147,197,253,0.5)' : 'rgba(156,163,175,0.3)';
    c.fillRect(ivx - 16, HEAD_B, 32, ivDrop);
  }
  // valve disc
  c.fillStyle = '#78716c';
  roundRect(c, ivx - 16, HEAD_B + ivDrop - 5, 32, 5, 2); c.fill();
  // valve stem
  c.fillStyle = '#94a3b8';
  c.fillRect(ivx - 2.5, HEAD_T - 15, 5, HEAD_B - HEAD_T + 15 + ivDrop);

  // ── Exhaust valve (right) ──
  const evx = CYL_R - 50;
  const evDrop = evOpen * maxDrop;
  if (evOpen > 0.05) {
    c.fillStyle = 'rgba(156,163,175,0.4)';
    c.fillRect(evx - 16, HEAD_B, 32, evDrop);
  }
  c.fillStyle = '#78716c';
  roundRect(c, evx - 16, HEAD_B + evDrop - 5, 32, 5, 2); c.fill();
  c.fillStyle = '#94a3b8';
  c.fillRect(evx - 2.5, HEAD_T - 15, 5, HEAD_B - HEAD_T + 15 + evDrop);

  // ── Spark plug / Injector ──
  if (type === 'gasoline') {
    // Spark plug body
    c.fillStyle = '#d4d4d8';
    roundRect(c, CX - 6, HEAD_T - 28, 12, 25, 3); c.fill();
    c.fillStyle = '#71717a';
    c.fillRect(CX - 8, HEAD_T - 6, 16, 8);
    // Electrode
    c.fillStyle = '#fbbf24';
    c.fillRect(CX - 1.5, HEAD_B - 2, 3, 6);
  } else {
    // Fuel injector body
    c.fillStyle = '#0ea5e9';
    roundRect(c, CX - 7, HEAD_T - 32, 14, 30, 3); c.fill();
    c.fillStyle = '#0284c7';
    c.fillRect(CX - 9, HEAD_T - 6, 18, 8);
    // Nozzle tip
    c.fillStyle = '#0ea5e9';
    c.beginPath();
    c.moveTo(CX - 4, HEAD_B - 2);
    c.lineTo(CX + 4, HEAD_B - 2);
    c.lineTo(CX, HEAD_B + 5);
    c.closePath(); c.fill();
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

  // Piston rings
  c.strokeStyle = '#475569'; c.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ry = pistonTop + 5 + i * 6;
    c.beginPath(); c.moveTo(CYL_L + 4, ry); c.lineTo(CYL_R - 4, ry); c.stroke();
  }

  // Wrist pin
  c.fillStyle = '#a1a1aa';
  c.beginPath(); c.arc(CX, pistonCY + 4, 5, 0, TAU); c.fill();
  c.strokeStyle = '#71717a'; c.lineWidth = 1.5; c.stroke();

  // ── Connecting rod ──
  c.strokeStyle = '#6b7280'; c.lineWidth = 10; c.lineCap = 'round';
  c.beginPath(); c.moveTo(CX, pistonCY + 4); c.lineTo(cpx, cpy); c.stroke();
  // rod edges highlight
  c.strokeStyle = '#94a3b8'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(CX, pistonCY + 4); c.lineTo(cpx, cpy); c.stroke();

  // ── Crankshaft ──
  // Main bearing
  c.fillStyle = '#374151';
  c.beginPath(); c.arc(CX, CRANK_CY, 20, 0, TAU); c.fill();
  c.strokeStyle = '#4b5563'; c.lineWidth = 3; c.stroke();
  // Crank arm
  c.strokeStyle = '#4b5563'; c.lineWidth = 16; c.lineCap = 'round';
  c.beginPath(); c.moveTo(CX, CRANK_CY); c.lineTo(cpx, cpy); c.stroke();
  c.strokeStyle = '#6b7280'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(CX, CRANK_CY); c.lineTo(cpx, cpy); c.stroke();
  // Crank pin
  c.fillStyle = '#94a3b8';
  c.beginPath(); c.arc(cpx, cpy, 8, 0, TAU); c.fill();
  c.strokeStyle = '#64748b'; c.lineWidth = 2; c.stroke();
  // Center dot
  c.fillStyle = '#1e293b';
  c.beginPath(); c.arc(CX, CRANK_CY, 5, 0, TAU); c.fill();

  // ── Flow arrows ──
  if (ivOpen > 0.3) {
    const a = ivOpen * 0.8;
    c.globalAlpha = a;
    arrow(c, ivx - 50, HEAD_T - 30, ivx - 20, HEAD_B + 10, '#93c5fd', 3);
    c.globalAlpha = 1;
  }
  if (evOpen > 0.3) {
    const a = evOpen * 0.8;
    c.globalAlpha = a;
    arrow(c, evx + 20, HEAD_B + 10, evx + 50, HEAD_T - 30, '#9ca3af', 3);
    c.globalAlpha = 1;
  }

  // ── Labels ──
  label(c, 'Sací ventil', ivx, HEAD_T - 42, 11, '#94a3b8');
  label(c, 'Výfukový ventil', evx, HEAD_T - 42, 11, '#94a3b8');
  label(c, type === 'gasoline' ? 'Svíčka' : 'Vstřikovač', CX, HEAD_T - 50, 11, '#94a3b8');
  label(c, 'Píst', CYL_R + WALL + 30, pistonCY, 12, '#94a3b8');
  label(c, 'Ojnice', CX + 60, (pistonCY + cpy) / 2, 11, '#64748b');
  label(c, 'Klikový hřídel', CX, CRANK_CY + 35, 11, '#64748b');

  // ── Dashed lines for labels ──
  c.setLineDash([3, 3]); c.strokeStyle = '#475569'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(CYL_R + WALL + 5, pistonCY); c.lineTo(CYL_R + WALL + 22, pistonCY); c.stroke();
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
    const col = strokeIdx === 0 ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.35)';
    c.fillStyle = col;
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
  c.strokeStyle = '#64748b'; c.lineWidth = 2;
  roundRect(c, CYL_R - 2, exhaustPortY - portH / 2, 37, portH, 4); c.stroke();

  // ── Transfer port ──
  if (transferExposed > 0.05) {
    c.fillStyle = `rgba(147,197,253,${0.4 * transferExposed})`;
    c.fillRect(CYL_R, transferPortY - portH / 2, 30, portH);
    c.fillRect(CYL_L - 30, transferPortY - portH / 2, 30, portH);
    c.globalAlpha = transferExposed * 0.7;
    arrow(c, CYL_R + 25, transferPortY + 15, CYL_R + 5, transferPortY - 5, '#93c5fd', 2);
    arrow(c, CYL_L - 25, transferPortY + 15, CYL_L - 5, transferPortY - 5, '#93c5fd', 2);
    c.globalAlpha = 1;
  }
  c.strokeStyle = '#64748b'; c.lineWidth = 2;
  roundRect(c, CYL_R - 2, transferPortY - portH / 2, 32, portH, 4); c.stroke();
  roundRect(c, CYL_L - 30, transferPortY - portH / 2, 32, portH, 4); c.stroke();

  // ── Cylinder walls ──
  c.fillStyle = metalGrad(c, CYL_L - WALL, HEAD_B, WALL, CYL_BOT - HEAD_B, '#4b5563', 'h');
  c.fillRect(CYL_L - WALL, HEAD_B, WALL, CYL_BOT - HEAD_B);
  c.fillStyle = metalGrad(c, CYL_R, HEAD_B, WALL, CYL_BOT - HEAD_B, '#4b5563', 'h');
  c.fillRect(CYL_R, HEAD_B, WALL, CYL_BOT - HEAD_B);

  // ── Cylinder head ──
  c.fillStyle = metalGrad(c, 0, HEAD_T, 0, HEAD_B - HEAD_T, '#4b5563', 'v');
  roundRect(c, CYL_L - WALL - 10, HEAD_T, CYL_W + 2 * WALL + 20, HEAD_B - HEAD_T, 6); c.fill();

  // Spark plug
  c.fillStyle = '#d4d4d8';
  roundRect(c, CX - 5, HEAD_T - 22, 10, 20, 3); c.fill();
  c.fillStyle = '#fbbf24'; c.fillRect(CX - 1.5, HEAD_B - 2, 3, 5);

  // ── Crankcase walls ──
  c.fillStyle = metalGrad(c, CYL_L - WALL, CYL_BOT, WALL, crankcaseBot - CYL_BOT, '#3f4753', 'h');
  c.fillRect(CYL_L - WALL, CYL_BOT, WALL, crankcaseBot - CYL_BOT);
  c.fillStyle = metalGrad(c, CYL_R, CYL_BOT, WALL, crankcaseBot - CYL_BOT, '#3f4753', 'h');
  c.fillRect(CYL_R, CYL_BOT, WALL, crankcaseBot - CYL_BOT);
  // Bottom
  c.fillStyle = '#3f4753';
  roundRect(c, CYL_L - WALL - 10, crankcaseBot, CYL_W + 2 * WALL + 20, 12, 5); c.fill();

  // ── Piston ──
  const pGrad = c.createLinearGradient(0, pistonTop, 0, pistonBot);
  pGrad.addColorStop(0, '#9ca3b8'); pGrad.addColorStop(1, '#64748b');
  c.fillStyle = pGrad;
  roundRect(c, CYL_L + 2, pistonTop, CYL_W - 4, PISTON_H, 4); c.fill();
  c.strokeStyle = '#475569'; c.lineWidth = 2;
  for (let i = 0; i < 2; i++) {
    const ry = pistonTop + 5 + i * 7;
    c.beginPath(); c.moveTo(CYL_L + 5, ry); c.lineTo(CYL_R - 5, ry); c.stroke();
  }
  c.fillStyle = '#a1a1aa'; c.beginPath(); c.arc(CX, pistonCY + 3, 5, 0, TAU); c.fill();

  // ── Connecting rod ──
  c.strokeStyle = '#6b7280'; c.lineWidth = 9; c.lineCap = 'round';
  c.beginPath(); c.moveTo(CX, pistonCY + 3); c.lineTo(cpx, cpy); c.stroke();
  c.strokeStyle = '#94a3b8'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(CX, pistonCY + 3); c.lineTo(cpx, cpy); c.stroke();

  // ── Crankshaft ──
  c.fillStyle = '#374151'; c.beginPath(); c.arc(CX, CRANK_CY, 18, 0, TAU); c.fill();
  c.strokeStyle = '#4b5563'; c.lineWidth = 3; c.stroke();
  c.strokeStyle = '#4b5563'; c.lineWidth = 14; c.lineCap = 'round';
  c.beginPath(); c.moveTo(CX, CRANK_CY); c.lineTo(cpx, cpy); c.stroke();
  c.fillStyle = '#94a3b8'; c.beginPath(); c.arc(cpx, cpy, 7, 0, TAU); c.fill();
  c.fillStyle = '#1e293b'; c.beginPath(); c.arc(CX, CRANK_CY, 4, 0, TAU); c.fill();

  // ── Labels ──
  label(c, 'Svíčka', CX, HEAD_T - 38, 11, '#94a3b8');
  label(c, 'Výfukový kanál', CYL_R + WALL + 50, exhaustPortY, 11, '#94a3b8');
  label(c, 'Přepouštěcí kanál', CYL_R + WALL + 50, transferPortY, 11, '#94a3b8');
  label(c, 'Kliková skříň', CX, crankcaseBot + 24, 11, '#64748b');

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

  // Crank kinematics (horizontal: piston moves in x)
  const crankA = phase * TAU;
  const cpy_pin = CRANK_CX + R * Math.sin(crankA);   // crank pin x (horizontal)
  const cpx_pin = CY - R * Math.cos(crankA);          // crank pin y

  // Piston position (horizontal slider)
  // piston moves along x-axis at y=CY
  const dcy = cpx_pin - CY;
  const pistonX = cpy_pin - Math.sqrt(L * L - dcy * dcy);
  // Swap: let me redo. For horizontal engine:
  // Crank center at (CRANK_CX, CY)
  // Crank pin: (CRANK_CX - R*cos(A), CY + R*sin(A))  ... hmm, let me simplify

  // Actually, let me redo kinematics for horizontal layout:
  // Crank center at (CRANK_CX, CY)
  // Crank pin rotates: angle A from 3-o'clock, going clockwise
  // pin_x = CRANK_CX + R * cos(A)   // but piston is to the LEFT
  // pin_y = CY + R * sin(A)
  // Piston constrained to y=CY, moves in x
  // Rod from piston to crank pin, length L
  // pistonX + sqrt(L² - (pinY - CY)²) = pinX  ... nah

  // Simpler: use the same approach but rotated 90°
  // The piston-to-crankpin distance along x:
  // pistonX = pinX - sqrt(L² - (pinY - CY)²)
  // where piston is to the LEFT of the crank

  const pinX = CRANK_CX - R * Math.cos(crankA);
  const pinY = CY - R * Math.sin(crankA);
  const dy = pinY - CY;
  const pX = pinX - Math.sqrt(L * L - dy * dy); // piston center x

  const halfStroke = phase < 0.5 ? 0 : 1;

  // ── Steam fill ──
  // Left chamber (between left end and piston)
  const leftSteam = halfStroke === 0;
  if (leftSteam) {
    c.fillStyle = 'rgba(186,230,253,0.25)';
    c.fillRect(CYL_L, CYL_T + WALL, pX - PISTON_W / 2 - CYL_L, CYL_H - 2 * WALL);
  }
  // Right chamber (between piston and right end)
  if (!leftSteam) {
    c.fillStyle = 'rgba(186,230,253,0.25)';
    const rStart = pX + PISTON_W / 2;
    c.fillRect(rStart, CYL_T + WALL, CYL_R - rStart, CYL_H - 2 * WALL);
  }

  // Steam pressure glow
  c.save();
  const glowX = leftSteam ? CYL_L + 20 : CYL_R - 20;
  c.shadowBlur = 30; c.shadowColor = 'rgba(186,230,253,0.4)';
  c.fillStyle = 'rgba(186,230,253,0.1)';
  c.beginPath(); c.arc(glowX, CY, 30, 0, TAU); c.fill();
  c.restore();

  // ── Cylinder ──
  c.fillStyle = metalGrad(c, CYL_L, CYL_T, CYL_R - CYL_L, WALL, '#4b5563', 'v');
  c.fillRect(CYL_L, CYL_T, CYL_R - CYL_L, WALL); // top wall
  c.fillStyle = metalGrad(c, CYL_L, CYL_B - WALL, CYL_R - CYL_L, WALL, '#4b5563', 'v');
  c.fillRect(CYL_L, CYL_B - WALL, CYL_R - CYL_L, WALL); // bottom wall
  // Left end cap
  c.fillStyle = metalGrad(c, CYL_L - 10, CYL_T, 14, CYL_H, '#4b5563', 'h');
  roundRect(c, CYL_L - 10, CYL_T - 5, 14, CYL_H + 10, 4); c.fill();

  // ── Slide valve (D-valve) ──
  const valveY = CYL_T - 40;
  const valveW = 80;
  // Valve moves with piston (simplified)
  const valveCX = pX - 20;
  c.fillStyle = '#374151';
  roundRect(c, CYL_L + 40, valveY, 200, 30, 5); c.fill(); // valve chest
  c.fillStyle = '#64748b';
  roundRect(c, valveCX - valveW / 2, valveY + 4, valveW, 22, 4); c.fill(); // sliding valve

  // Steam in/out labels
  label(c, 'Pára dovnitř', CYL_L + 140, valveY - 12, 11, '#94a3b8');

  // ── Piston ──
  const pGrad = c.createLinearGradient(0, CYL_T + WALL, 0, CYL_B - WALL);
  pGrad.addColorStop(0, '#9ca3b8'); pGrad.addColorStop(1, '#64748b');
  c.fillStyle = pGrad;
  roundRect(c, pX - PISTON_W / 2, CYL_T + WALL + 2, PISTON_W, CYL_H - 2 * WALL - 4, 3); c.fill();

  // Piston rod (extends right from piston to outside cylinder)
  c.strokeStyle = '#94a3b8'; c.lineWidth = 8; c.lineCap = 'round';
  c.beginPath(); c.moveTo(pX + PISTON_W / 2, CY); c.lineTo(CYL_R + 10, CY); c.stroke();

  // ── Connecting rod ──
  c.strokeStyle = '#6b7280'; c.lineWidth = 8; c.lineCap = 'round';
  c.beginPath(); c.moveTo(CYL_R + 10, CY); c.lineTo(pinX, pinY); c.stroke();
  c.strokeStyle = '#94a3b8'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(CYL_R + 10, CY); c.lineTo(pinX, pinY); c.stroke();

  // Crosshead guide
  c.fillStyle = '#374151';
  c.fillRect(CYL_R + 2, CY - 14, 20, 28);

  // ── Flywheel ──
  const FW_R = 90;
  // Outer rim
  c.strokeStyle = '#475569'; c.lineWidth = 16;
  c.beginPath(); c.arc(CRANK_CX, CY, FW_R, 0, TAU); c.stroke();
  c.strokeStyle = '#6b7280'; c.lineWidth = 3;
  c.beginPath(); c.arc(CRANK_CX, CY, FW_R, 0, TAU); c.stroke();
  // Spokes
  c.strokeStyle = '#4b5563'; c.lineWidth = 6;
  for (let i = 0; i < 6; i++) {
    const sa = crankA + i * PI / 3;
    c.beginPath();
    c.moveTo(CRANK_CX + 18 * Math.cos(sa), CY + 18 * Math.sin(sa));
    c.lineTo(CRANK_CX + (FW_R - 10) * Math.cos(sa), CY + (FW_R - 10) * Math.sin(sa));
    c.stroke();
  }
  // Hub
  c.fillStyle = '#374151'; c.beginPath(); c.arc(CRANK_CX, CY, 18, 0, TAU); c.fill();
  c.strokeStyle = '#4b5563'; c.lineWidth = 3; c.stroke();
  // Crank pin
  c.fillStyle = '#94a3b8'; c.beginPath(); c.arc(pinX, pinY, 7, 0, TAU); c.fill();
  // Center
  c.fillStyle = '#1e293b'; c.beginPath(); c.arc(CRANK_CX, CY, 5, 0, TAU); c.fill();

  // ── Labels ──
  label(c, 'Válec', CYL_L + (CYL_R - CYL_L) / 2, CYL_B + 22, 12, '#64748b');
  label(c, 'Píst', pX, CYL_B + 22, 11, '#94a3b8');
  label(c, 'Setrvačník', CRANK_CX, CY + FW_R + 25, 12, '#64748b');
  label(c, 'Šoupátkový rozvod', CYL_L + 140, valveY - 28, 11, '#64748b');

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
  const intake = { x: 80, w: 80 };
  const compressor = { x: 160, w: 180 };
  const combustion = { x: 340, w: 140 };
  const turbine = { x: 480, w: 120 };
  const nozzle = { x: 600, w: 120 };

  const outerR = 100; // max radius of engine
  const hubR = 20;
  const shaftY = CY;

  // ── Outer casing ──
  c.fillStyle = '#374151';
  // Top casing
  c.beginPath();
  c.moveTo(intake.x, CY - outerR + 20);
  c.quadraticCurveTo(intake.x + 30, CY - outerR, compressor.x, CY - outerR);
  c.lineTo(nozzle.x + nozzle.w - 20, CY - outerR + 10);
  c.quadraticCurveTo(nozzle.x + nozzle.w, CY - outerR + 30, nozzle.x + nozzle.w, CY - 50);
  c.lineTo(nozzle.x + nozzle.w, CY - 45);
  c.lineTo(intake.x, CY - 45);
  c.closePath(); c.fill();
  // Bottom casing (mirror)
  c.beginPath();
  c.moveTo(intake.x, CY + outerR - 20);
  c.quadraticCurveTo(intake.x + 30, CY + outerR, compressor.x, CY + outerR);
  c.lineTo(nozzle.x + nozzle.w - 20, CY + outerR - 10);
  c.quadraticCurveTo(nozzle.x + nozzle.w, CY + outerR - 30, nozzle.x + nozzle.w, CY + 50);
  c.lineTo(nozzle.x + nozzle.w, CY + 45);
  c.lineTo(intake.x, CY + 45);
  c.closePath(); c.fill();

  // ── Inner fill zones ──
  // Intake — light blue
  c.fillStyle = 'rgba(147,197,253,0.15)';
  c.fillRect(intake.x, CY - 42, intake.w, 84);

  // Compressor — gradually more blue (higher pressure)
  const compGrad = c.createLinearGradient(compressor.x, 0, compressor.x + compressor.w, 0);
  compGrad.addColorStop(0, 'rgba(147,197,253,0.15)');
  compGrad.addColorStop(1, 'rgba(96,165,250,0.30)');
  c.fillStyle = compGrad;
  c.fillRect(compressor.x, CY - 42, compressor.w, 84);

  // Combustion — orange/red
  const combGrad = c.createLinearGradient(combustion.x, 0, combustion.x + combustion.w, 0);
  combGrad.addColorStop(0, 'rgba(251,191,36,0.35)');
  combGrad.addColorStop(0.5, 'rgba(239,68,68,0.45)');
  combGrad.addColorStop(1, 'rgba(249,115,22,0.40)');
  c.fillStyle = combGrad;
  c.fillRect(combustion.x, CY - 42, combustion.w, 84);

  // Combustion glow
  c.save();
  c.shadowBlur = 35; c.shadowColor = 'rgba(249,115,22,0.5)';
  c.fillStyle = 'rgba(255,150,50,0.15)';
  c.beginPath(); c.arc(combustion.x + combustion.w / 2, CY, 38, 0, TAU); c.fill();
  c.restore();

  // Turbine
  c.fillStyle = 'rgba(249,115,22,0.25)';
  c.fillRect(turbine.x, CY - 42, turbine.w, 84);

  // Nozzle — exhaust
  c.fillStyle = 'rgba(156,163,175,0.20)';
  c.fillRect(nozzle.x, CY - 42, nozzle.w, 84);

  // ── Central shaft ──
  c.fillStyle = '#475569';
  c.fillRect(intake.x + 30, CY - 6, nozzle.x + nozzle.w - intake.x - 40, 12);

  // ── Compressor blades ──
  const numComp = 5; // stages
  for (let s = 0; s < numComp; s++) {
    const bx = compressor.x + 20 + s * (compressor.w - 30) / numComp;
    const nr = 7; // blades per stage
    const bladeR = 36 - s * 1;
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
      c.restore();
    }
    // Hub
    c.fillStyle = '#4b5563';
    c.beginPath(); c.arc(bx, CY, hubR, 0, TAU); c.fill();
  }

  // ── Turbine blades ──
  const numTurb = 3;
  for (let s = 0; s < numTurb; s++) {
    const bx = turbine.x + 20 + s * (turbine.w - 30) / numTurb;
    const nr = 6;
    const bladeR = 34;
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
      c.restore();
    }
    c.fillStyle = '#78350f';
    c.beginPath(); c.arc(bx, CY, hubR, 0, TAU); c.fill();
  }

  // ── Flame in combustion chamber ──
  const flicker = Math.sin(phase * 80) * 0.3 + 0.7;
  c.save();
  c.globalAlpha = 0.6 * flicker;
  const flameGrad = c.createRadialGradient(
    combustion.x + combustion.w / 2, CY, 5,
    combustion.x + combustion.w / 2, CY, 35
  );
  flameGrad.addColorStop(0, '#fde68a');
  flameGrad.addColorStop(0.4, '#f59e0b');
  flameGrad.addColorStop(1, 'rgba(239,68,68,0)');
  c.fillStyle = flameGrad;
  c.beginPath(); c.arc(combustion.x + combustion.w / 2, CY, 35, 0, TAU); c.fill();
  c.restore();

  // ── Flow arrows ──
  c.globalAlpha = 0.5;
  arrow(c, intake.x - 30, CY, intake.x + 15, CY, '#93c5fd', 3);
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

  // Intake cone
  c.fillStyle = '#6b7280';
  c.beginPath();
  c.moveTo(intake.x + 10, CY);
  c.lineTo(intake.x + 45, CY - 15);
  c.lineTo(intake.x + 45, CY + 15);
  c.closePath(); c.fill();

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
  const chamberBot = 280;
  const chamberW = 180;

  // Nozzle (converging-diverging)
  const throatY = 330;
  const throatW = 60;
  const exitY = 500;
  const exitW = 160;

  // ── Fuel / oxidizer inlets ──
  // Fuel (left)
  c.fillStyle = '#3b82f6';
  roundRect(c, CX - chamberW / 2 - 80, chamberTop + 20, 70, 30, 6); c.fill();
  label(c, 'Palivo', CX - chamberW / 2 - 45, chamberTop + 12, 11, '#60a5fa');
  arrow(c, CX - chamberW / 2 - 15, chamberTop + 35, CX - chamberW / 2 + 15, chamberTop + 35, '#60a5fa', 2.5);

  // Oxidizer (right)
  c.fillStyle = '#10b981';
  roundRect(c, CX + chamberW / 2 + 10, chamberTop + 20, 70, 30, 6); c.fill();
  label(c, 'Okysličovadlo', CX + chamberW / 2 + 45, chamberTop + 12, 11, '#34d399');
  arrow(c, CX + chamberW / 2 + 15, chamberTop + 35, CX + chamberW / 2 - 15, chamberTop + 35, '#34d399', 2.5);

  // ── Injector plate ──
  c.fillStyle = '#475569';
  c.fillRect(CX - chamberW / 2, chamberTop, chamberW, 12);
  // Injector holes
  c.fillStyle = '#1e293b';
  for (let i = 0; i < 7; i++) {
    const ix = CX - chamberW / 2 + 18 + i * (chamberW - 36) / 6;
    c.beginPath(); c.arc(ix, chamberTop + 6, 3, 0, TAU); c.fill();
  }

  // ── Combustion chamber walls ──
  c.fillStyle = metalGrad(c, CX - chamberW / 2 - 10, chamberTop, 10, chamberBot - chamberTop, '#4b5563', 'h');
  c.fillRect(CX - chamberW / 2 - 10, chamberTop, 10, chamberBot - chamberTop);
  c.fillStyle = metalGrad(c, CX + chamberW / 2, chamberTop, 10, chamberBot - chamberTop, '#4b5563', 'h');
  c.fillRect(CX + chamberW / 2, chamberTop, 10, chamberBot - chamberTop);

  // ── Combustion fill ──
  const flicker = Math.sin(phase * 120) * 0.15 + 0.85;
  const combGrad = c.createLinearGradient(0, chamberTop + 12, 0, chamberBot);
  combGrad.addColorStop(0, `rgba(251,191,36,${0.4 * flicker})`);
  combGrad.addColorStop(0.3, `rgba(239,68,68,${0.5 * flicker})`);
  combGrad.addColorStop(1, `rgba(249,115,22,${0.6 * flicker})`);
  c.fillStyle = combGrad;
  c.fillRect(CX - chamberW / 2, chamberTop + 12, chamberW, chamberBot - chamberTop - 12);

  // Combustion glow
  c.save();
  c.shadowBlur = 40; c.shadowColor = `rgba(249,115,22,${0.5 * flicker})`;
  c.fillStyle = `rgba(255,200,100,${0.2 * flicker})`;
  c.beginPath(); c.arc(CX, (chamberTop + chamberBot) / 2, 50, 0, TAU); c.fill();
  c.restore();

  // ── Nozzle (converging-diverging) ──
  // Converging part: chamber bottom → throat
  // Diverging part: throat → exit
  c.fillStyle = '#374151';

  // Left wall
  c.beginPath();
  c.moveTo(CX - chamberW / 2 - 10, chamberBot);
  c.lineTo(CX - throatW / 2 - 8, throatY);
  c.lineTo(CX - exitW / 2 - 8, exitY);
  c.lineTo(CX - exitW / 2 - 18, exitY);
  c.lineTo(CX - throatW / 2 - 18, throatY);
  c.lineTo(CX - chamberW / 2 - 10, chamberBot);
  c.closePath(); c.fill();

  // Right wall
  c.beginPath();
  c.moveTo(CX + chamberW / 2 + 10, chamberBot);
  c.lineTo(CX + throatW / 2 + 8, throatY);
  c.lineTo(CX + exitW / 2 + 8, exitY);
  c.lineTo(CX + exitW / 2 + 18, exitY);
  c.lineTo(CX + throatW / 2 + 18, throatY);
  c.lineTo(CX + chamberW / 2 + 10, chamberBot);
  c.closePath(); c.fill();

  // ── Gas in nozzle ──
  // Converging
  const convGrad = c.createLinearGradient(0, chamberBot, 0, throatY);
  convGrad.addColorStop(0, 'rgba(249,115,22,0.45)');
  convGrad.addColorStop(1, 'rgba(251,191,36,0.5)');
  c.fillStyle = convGrad;
  c.beginPath();
  c.moveTo(CX - chamberW / 2, chamberBot);
  c.lineTo(CX - throatW / 2, throatY);
  c.lineTo(CX + throatW / 2, throatY);
  c.lineTo(CX + chamberW / 2, chamberBot);
  c.closePath(); c.fill();

  // Diverging
  const divGrad = c.createLinearGradient(0, throatY, 0, exitY);
  divGrad.addColorStop(0, 'rgba(251,191,36,0.5)');
  divGrad.addColorStop(1, 'rgba(239,68,68,0.15)');
  c.fillStyle = divGrad;
  c.beginPath();
  c.moveTo(CX - throatW / 2, throatY);
  c.lineTo(CX - exitW / 2, exitY);
  c.lineTo(CX + exitW / 2, exitY);
  c.lineTo(CX + throatW / 2, throatY);
  c.closePath(); c.fill();

  // ── Exhaust plume ──
  const plumeLen = 80;
  const plumeFlicker = Math.sin(phase * 90 + 1) * 0.2 + 0.8;
  const plumeGrad = c.createLinearGradient(0, exitY, 0, exitY + plumeLen);
  plumeGrad.addColorStop(0, `rgba(251,191,36,${0.6 * plumeFlicker})`);
  plumeGrad.addColorStop(0.3, `rgba(239,68,68,${0.4 * plumeFlicker})`);
  plumeGrad.addColorStop(1, 'rgba(239,68,68,0)');
  c.fillStyle = plumeGrad;
  c.beginPath();
  c.moveTo(CX - exitW / 2 + 10, exitY);
  c.quadraticCurveTo(CX - exitW / 2 - 15, exitY + plumeLen * 0.7, CX - 10, exitY + plumeLen);
  c.quadraticCurveTo(CX, exitY + plumeLen + 10, CX + 10, exitY + plumeLen);
  c.quadraticCurveTo(CX + exitW / 2 + 15, exitY + plumeLen * 0.7, CX + exitW / 2 - 10, exitY);
  c.closePath(); c.fill();

  // Plume glow
  c.save();
  c.shadowBlur = 50 * plumeFlicker; c.shadowColor = 'rgba(249,115,22,0.4)';
  c.fillStyle = 'rgba(255,200,100,0.1)';
  c.beginPath(); c.arc(CX, exitY + 20, 40, 0, TAU); c.fill();
  c.restore();

  // ── Labels ──
  label(c, 'Spalovací komora', CX, chamberTop - 15, 12, '#94a3b8');
  label(c, 'Vstřikovací deska', CX - chamberW / 2 - 65, chamberTop + 6, 10, '#64748b', 'right');
  label(c, 'Hrdlo trysky', CX + throatW / 2 + 35, throatY, 11, '#94a3b8', 'left');
  label(c, 'Lavalova tryska', CX - exitW / 2 - 30, (throatY + exitY) / 2, 11, '#64748b', 'right');

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
  // Engine tabs
  const tabsEl = document.getElementById('engine-tabs');
  ENGINES.forEach((eng, i) => {
    const btn = document.createElement('button');
    btn.className = 'engine-tab' + (i === cur ? ' active' : '');
    btn.textContent = eng.name;
    btn.onclick = () => { cur = i; phase = 0; playing = true; updateTabs(); updateProgress(); };
    tabsEl.appendChild(btn);
  });

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
