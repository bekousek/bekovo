import { useEffect, useRef, useState } from 'react';
import { useGame, type Screen } from '../state';
import { Dialog, PixelStage } from '../ui';
import { ArtSvg, Icon, Rects } from '../pixel/Sprite';
import { AVATARS, avatarArt, type IconKey, type Px } from '../pixel/sprites';
import { PAL } from '../pixel/palette';
import { formatKc } from '../data/parts';
import { GOAL_BY_ID } from '../logic/bench';
import { sfx } from '../sfx';

/** Městečko 320 × 180 herních pixelů. Budovy jsou jediný zdroj geometrie pro kresbu i klikací zóny. */
const W = 320;
const H = 180;
const STREET_Y = 120; // chodidla postavičky na silnici
const PAVE_Y = 109; // chodidla před dveřmi
const PARK = { x: 156, y: 156 };

interface Building {
  id: string;
  screen: Screen;
  sign: string;
  label: string;
  icon: IconKey;
  x: number;
  top: number;
  w: number;
  /** Střed dveří (x) — sem postavička dojde. */
  doorX: number;
}

const BASE = 104;

const BUILDINGS: Building[] = [
  { id: 'jobs', screen: 'jobs', sign: 'BRIGÁDY', label: 'Brigády: vydělej si peníze', icon: 'bag', x: 10, top: 40, w: 64, doorX: 42 },
  { id: 'shop', screen: 'shop', sign: 'PC OBCHOD', label: 'PC obchod: kup díly', icon: 'cart', x: 88, top: 46, w: 66, doorX: 140 },
  { id: 'home', screen: 'workshop', sign: 'DOMA', label: 'Doma: slož počítač v dílně', icon: 'wrench', x: 168, top: 34, w: 66, doorX: 216 },
  { id: 'library', screen: 'library', sign: 'KNIHOVNA', label: 'Knihovna: taháky a rady', icon: 'book', x: 248, top: 38, w: 64, doorX: 280 },
];

export default function Town() {
  const { s, update, go } = useGame();
  const look = AVATARS[s.avatar] ?? AVATARS[0];
  const startPos = spotOf(s.at);
  const [pos, setPos] = useState(startPos);
  const [frame, setFrame] = useState<0 | 1>(0);
  const walking = useRef(false);
  const goal = s.goal ? GOAL_BY_ID[s.goal] : null;

  const visit = (b: Building) => {
    if (walking.current) return;
    sfx('click');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = { x: b.doorX - 5, y: PAVE_Y };
    const enter = () => {
      walking.current = false;
      update((d) => { d.at = b.id; });
      go(b.screen);
    };
    if (reduce) { setPos(target); enter(); return; }
    const path = [pos, { x: pos.x, y: STREET_Y }, { x: target.x, y: STREET_Y }, target];
    walking.current = true;
    walk(path, setPos, setFrame, enter);
  };

  return (
    <div className="town-wrap">
      <PixelStage artW={W} artH={H} reserveH={260}>
        {(scale) => (
          <>
            <svg className="stage__svg" width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges" aria-hidden="true">
              <TownScene />
            </svg>
            <div className="town-avatar" style={{ transform: `translate(${pos.x * scale}px, ${(pos.y - 16) * scale}px)` }}>
              <ArtSvg art={avatarArt(look, frame)} scale={scale} />
            </div>
            {BUILDINGS.map((b) => (
              <button
                key={b.id}
                type="button"
                className="town-hit"
                style={{ left: b.x * scale, top: b.top * scale, width: b.w * scale, height: (BASE - b.top) * scale }}
                aria-label={b.label}
                onClick={() => visit(b)}
              >
                <span className="town-hit__ring" />
              </button>
            ))}
          </>
        )}
      </PixelStage>

      <nav className="town-legend" aria-label="Kam půjdeš">
        {BUILDINGS.map((b) => (
          <button key={b.id} type="button" className="px-btn px-btn--dark" onClick={() => visit(b)}>
            <Icon name={b.icon} /> {b.label.split(':')[0]}
          </button>
        ))}
      </nav>
      <p className="town-hint">{nextHint(s)}</p>

      {!s.intro ? (
        <Dialog
          title={`Ahoj, ${s.name}!`}
          actions={
            <button type="button" className="px-btn" onClick={() => update((d) => { d.intro = true; })}>
              Jdu na to <Icon name="arrow" />
            </button>
          }
        >
          <p>
            Tvůj starý počítač už nestačí. Chceš si postavit vlastní: <b>{goal?.title.toLowerCase()}</b>.
          </p>
          <p className="t-muted">Zadání: {goal?.target}</p>
          <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 6 }}>
            <li>Na <b>brigádách</b> si vyděláš. Na účtu máš zatím {formatKc(s.money)}.</li>
            <li>V <b>PC obchodě</b> nakoupíš díly. Hlídej, aby k sobě pasovaly.</li>
            <li><b>Doma v dílně</b> počítač složíš a nainstaluješ systém.</li>
            <li>V <b>knihovně</b> najdeš taháky, když si nebudeš jistý.</li>
          </ul>
        </Dialog>
      ) : null}
    </div>
  );
}

function spotOf(at: string) {
  const b = BUILDINGS.find((x) => x.id === at);
  return b ? { x: b.doorX - 5, y: PAVE_Y } : { x: PARK.x, y: PARK.y };
}

function nextHint(s: ReturnType<typeof useGame>['s']): string {
  if (s.owned.length === 0 && s.jobsDone === 0) return 'Začni na brigádě: za každou správnou odpověď dostaneš zaplaceno.';
  if (s.owned.length === 0) return 'Až budeš mít dost peněz, zajdi do PC obchodu. V knihovně je tahák, co k čemu pasuje.';
  if (!s.os.done) return 'Díly máš doma. V dílně je slož podle účtenky.';
  return 'Počítač běží. Doma můžeš dokončit programy a podívat se na výsledek.';
}

function walk(
  path: { x: number; y: number }[],
  setPos: (p: { x: number; y: number }) => void,
  setFrame: (f: 0 | 1) => void,
  done: () => void,
) {
  const speed = 200; // herních px za sekundu
  const segs = path.slice(1).map((p, i) => ({ a: path[i], b: p, len: Math.abs(p.x - path[i].x) + Math.abs(p.y - path[i].y) }));
  const total = segs.reduce((s, x) => s + x.len, 0);
  const t0 = performance.now();
  const tick = (now: number) => {
    let dist = ((now - t0) / 1000) * speed;
    setFrame(Math.floor(dist / 6) % 2 === 0 ? 0 : 1);
    if (dist >= total) { setPos(path[path.length - 1]); setFrame(0); done(); return; }
    for (const sg of segs) {
      if (dist <= sg.len) {
        const k = sg.len === 0 ? 1 : dist / sg.len;
        setPos({ x: Math.round(sg.a.x + (sg.b.x - sg.a.x) * k), y: Math.round(sg.a.y + (sg.b.y - sg.a.y) * k) });
        break;
      }
      dist -= sg.len;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ——— Kresba městečka ———

function tree(x: number, y: number): Px[] {
  return [
    [x + 3, y, 6, 1, 'teal'],
    [x + 1, y + 1, 10, 2, 'teal'],
    [x, y + 3, 12, 5, 'teal'],
    [x + 1, y + 8, 10, 2, 'teal'],
    [x + 3, y + 2, 3, 2, 'green'],
    [x + 2, y + 4, 2, 2, 'green'],
    [x + 5, y + 10, 2, 3, 'ink'],
  ];
}

function windows(x0: number, y0: number, cols: number, rows: number, dx: number, dy: number): Px[] {
  const out: Px[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = x0 + c * dx;
    const y = y0 + r * dy;
    out.push([x, y, 8, 7, 'navy'], [x + 1, y + 1, 6, 5, 'sky'], [x + 1, y + 1, 2, 2, 'cyan']);
  }
  return out;
}

function jobsBuilding(): Px[] {
  const x = 10, t = 40, w = 64;
  return [
    [x, t, w, BASE - t, 'blue'],
    [x, t, w, 6, 'navy'],
    [x - 1, t + 6, w + 2, 2, 'slate'],
    [x + w - 4, t + 8, 4, BASE - t - 8, 'navy'],
    ...windows(x + 6, t + 12, 3, 2, 18, 12),
    [x + 24, BASE - 20, 16, 20, 'silver'],
    [x + 26, BASE - 18, 12, 18, 'night'],
    [x + 31, BASE - 18, 2, 18, 'ink'],
  ];
}

function shopBuilding(): Px[] {
  const x = 88, t = 46, w = 66;
  const awning: Px[] = [];
  for (let i = 0; i < 11; i++) awning.push([x + 2 + i * 6, t + 22, 6, 6, i % 2 ? 'white' : 'red']);
  return [
    [x, t, w, BASE - t, 'white'],
    [x, t, w, 6, 'red'],
    [x - 1, t + 6, w + 2, 2, 'plum'],
    [x + w - 4, t + 8, 4, BASE - t - 8, 'silver'],
    ...awning,
    [x + 2, t + 28, 66 - 4, 2, 'plum'],
    // výloha s počítačem
    [x + 4, t + 32, 38, 24, 'ink'],
    [x + 5, t + 33, 36, 22, 'navy'],
    [x + 9, t + 37, 9, 16, 'ink'],
    [x + 11, t + 39, 5, 1, 'slate'],
    [x + 11, t + 41, 5, 1, 'slate'],
    [x + 13, t + 49, 1, 1, 'sky'],
    [x + 22, t + 38, 16, 11, 'ink'],
    [x + 23, t + 39, 14, 9, 'sky'],
    [x + 24, t + 40, 4, 2, 'cyan'],
    [x + 28, t + 49, 4, 3, 'ink'],
    // dveře
    [x + 46, BASE - 22, 16, 22, 'silver'],
    [x + 48, BASE - 20, 12, 20, 'teal'],
    [x + 49, BASE - 19, 10, 9, 'cyan'],
    [x + 57, BASE - 9, 1, 2, 'gold'],
  ];
}

function homeBuilding(): Px[] {
  const x = 168, t = 34, w = 66;
  const roof: Px[] = [];
  // stupňovitá sedlová střecha
  for (let i = 0; i < 9; i++) roof.push([x + 30 - i * 4, t + i * 3, 6 + i * 8, 3, i % 3 === 0 ? 'plum' : 'red']);
  return [
    ...roof,
    [x + 2, t + 27, w - 4, BASE - t - 27, 'gold'],
    [x + w - 6, t + 27, 4, BASE - t - 27, 'orange'],
    [x + 2, t + 27, w - 4, 2, 'orange'],
    ...windows(x + 8, t + 33, 1, 1, 0, 0),
    [x + 8 + 10, t + 33, 8, 7, 'navy'], [x + 19, t + 34, 6, 5, 'sky'], [x + 19, t + 34, 2, 2, 'cyan'],
    // garáž = dílna
    [x + 32, BASE - 26, 28, 26, 'slate'],
    [x + 34, BASE - 24, 24, 24, 'silver'],
    [x + 34, BASE - 20, 24, 1, 'slate'],
    [x + 34, BASE - 15, 24, 1, 'slate'],
    [x + 34, BASE - 10, 24, 1, 'slate'],
    [x + 34, BASE - 5, 24, 1, 'slate'],
    // dveře domu
    [x + 10, BASE - 20, 14, 20, 'plum'],
    [x + 12, BASE - 18, 10, 18, 'red'],
    [x + 20, BASE - 9, 1, 2, 'gold'],
  ];
}

function libraryBuilding(): Px[] {
  const x = 248, t = 38, w = 64;
  const ped: Px[] = [];
  for (let i = 0; i < 5; i++) ped.push([x + 26 - i * 6, t + i * 3, 12 + i * 12, 3, i % 2 ? 'white' : 'silver']);
  const cols: Px[] = [];
  for (let i = 0; i < 4; i++) cols.push([x + 6 + i * 15, t + 21, 6, BASE - t - 27, 'white'], [x + 10 + i * 15, t + 21, 2, BASE - t - 27, 'silver']);
  return [
    ...ped,
    [x - 2, t + 15, w + 4, 4, 'white'],
    [x - 2, t + 19, w + 4, 2, 'silver'],
    [x + 2, t + 21, w - 4, BASE - t - 27, 'slate'],
    ...cols,
    [x + 24, BASE - 22, 16, 16, 'night'],
    [x + 31, BASE - 22, 2, 16, 'ink'],
    [x - 2, BASE - 6, w + 4, 2, 'silver'],
    [x - 4, BASE - 4, w + 8, 2, 'slate'],
    [x - 6, BASE - 2, w + 12, 2, 'silver'],
  ];
}

function park(): Px[] {
  const flowers: Px[] = [];
  const spots = [[20, 142], [34, 160], [60, 150], [210, 146], [232, 164], [262, 150], [292, 160], [118, 168], [184, 170]];
  spots.forEach(([fx, fy], i) => flowers.push([fx, fy, 2, 2, i % 3 === 0 ? 'red' : i % 3 === 1 ? 'gold' : 'white']));
  return [
    // pěšina do parku
    [148, 132, 24, 48, 'silver'],
    [150, 132, 20, 48, 'white'],
    // rybník
    [70, 146, 44, 22, 'sky'],
    [66, 150, 52, 14, 'sky'],
    [74, 150, 10, 2, 'cyan'],
    [92, 158, 14, 2, 'cyan'],
    // lavička
    [196, 150, 24, 3, 'orange'],
    [196, 155, 24, 2, 'orange'],
    [198, 157, 2, 5, 'ink'],
    [214, 157, 2, 5, 'ink'],
    // lampa
    [130, 138, 2, 22, 'ink'],
    [127, 135, 8, 4, 'ink'],
    [128, 136, 6, 2, 'gold'],
    ...flowers,
    ...tree(8, 150), ...tree(240, 136), ...tree(286, 154), ...tree(40, 136),
  ];
}

function TownScene() {
  const speck: Px[] = [];
  for (let i = 0; i < 70; i++) {
    const x = (i * 53) % W;
    const y = (i * 97) % H;
    if (y > 100 && y < 134) continue;
    speck.push([x, y, 2, 1, 'teal']);
  }
  const dashes: Px[] = [];
  for (let x = 4; x < W; x += 16) dashes.push([x, 119, 8, 2, 'gold']);
  return (
    <>
      <rect x={0} y={0} width={W} height={H} fill={PAL.green} />
      <Rects px={speck} />
      <Rects px={[...tree(-2, 6), ...tree(76, 2), ...tree(156, 4), ...tree(236, 2), ...tree(306, 8)]} />
      {/* chodník a silnice */}
      <Rects px={[[0, 104, W, 7, 'silver'], [0, 104, W, 1, 'white'], [0, 111, W, 18, 'slate'], [0, 129, W, 3, 'silver'], ...dashes]} />
      <Rects px={jobsBuilding()} />
      <Rects px={shopBuilding()} />
      <Rects px={homeBuilding()} />
      <Rects px={libraryBuilding()} />
      <Rects px={park()} />
      {BUILDINGS.map((b) => <Sign key={b.id} b={b} />)}
    </>
  );
}

function Sign({ b }: { b: Building }) {
  // DotGothic16 má znak široký asi půl em: 8 px písma ≈ 4 px na znak.
  const w = Math.max(30, b.sign.length * 4 + 10);
  const cx = b.x + b.w / 2;
  const sy = b.id === 'home' ? BASE - 35 : b.id === 'library' ? b.top + 13 : b.top + 7;
  return (
    <g>
      <rect x={Math.round(cx - w / 2)} y={sy - 1} width={w} height={11} fill={PAL.night} />
      <rect x={Math.round(cx - w / 2) + 1} y={sy} width={w - 2} height={9} fill={PAL.ink} />
      <text
        x={cx}
        y={sy + 7.5}
        textAnchor="middle"
        fontFamily="'DotGothic16', sans-serif"
        fontSize={8}
        fill={PAL.gold}
      >
        {b.sign}
      </text>
    </g>
  );
}
