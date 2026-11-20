import { PAL, type PalKey } from './palette';
import { ICONS, SPRITES, type Art, type IconKey, type SpriteKey } from './sprites';

interface ArtProps {
  art: Art;
  /** Kolik CSS pixelů má jeden herní pixel. Vždy celé číslo, aby nic nebylo rozmazané. */
  scale?: number;
  title?: string;
  className?: string;
  /** Otočení po 90°, jen pro čtvercové sprity (procesor). */
  rotate?: 0 | 90 | 180 | 270;
  /** Přebarví všechny pixely jednou barvou (jednobarevné ikony na papíře). */
  tint?: PalKey;
}

export function ArtSvg({ art, scale = 4, title, className, rotate = 0, tint }: ArtProps) {
  const s = Math.max(1, scale);
  return (
    <svg
      className={className}
      width={art.w * s}
      height={art.h * s}
      viewBox={`0 0 ${art.w} ${art.h}`}
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g transform={rotate ? `rotate(${rotate} ${art.w / 2} ${art.h / 2})` : undefined}>
        {art.px.map(([x, y, pw, ph, c], i) => (
          <rect key={i} x={x} y={y} width={pw} height={ph} fill={PAL[tint ?? c]} />
        ))}
      </g>
    </svg>
  );
}

/** Největší měřítko, ve kterém se kresba vejde do rámečku. Od 2× jen celá čísla, ať jsou všechny pixely stejně velké. */
export function fitScale(art: Art, maxW: number, maxH: number): number {
  const f = Math.min(maxW / art.w, maxH / art.h);
  if (f >= 2) return Math.floor(f);
  return f >= 1.5 ? 1.5 : 1;
}

/** `fit` = rámeček [šířka, výška] v CSS px, do kterého se díl zvětší. */
export function Sprite({ name, fit, scale, ...rest }: { name: SpriteKey; fit?: readonly [number, number] } & Omit<ArtProps, 'art'>) {
  const art = SPRITES[name];
  return <ArtSvg art={art} scale={fit ? fitScale(art, fit[0], fit[1]) : scale} {...rest} />;
}

export function Icon({ name, scale = 2, ...rest }: { name: IconKey } & Omit<ArtProps, 'art'>) {
  return <ArtSvg art={ICONS[name]} scale={scale} {...rest} />;
}

/** Vykreslí seznam obdélníků přímo do rodičovského <svg> (pro scény). */
export function Rects({ px, dx = 0, dy = 0 }: { px: Art['px']; dx?: number; dy?: number }) {
  return (
    <>
      {px.map(([x, y, w, h, c], i) => (
        <rect key={i} x={x + dx} y={y + dy} width={w} height={h} fill={PAL[c]} />
      ))}
    </>
  );
}
