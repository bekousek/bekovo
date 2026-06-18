/**
 * Radiální menu — rychlé akce nad výběrem. Otevírá pravé tlačítko, nebo
 * long-press dotykem (jen v pauze; za běhu prst drží těleso). Sektory jsou
 * dotykové (56 px). Ťuknutí mimo zavírá.
 */
import { freezableBodies } from '@editor/quickActions';
import type { Runtime } from './bootstrap';
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';

interface Item {
  icon: string;
  label: string;
  run: () => void;
}

export function RadialMenu({ runtime }: { runtime: Runtime }) {
  const pos = useUiStore((s) => s.radialMenu);
  if (!pos) return null;

  const close = () => useUiStore.getState().setRadialMenu(null);
  const doc = runtime.controller.store.doc;
  const sel = runtime.state.selection;

  const hasBody = [...sel].some(
    (id) => doc.entities.find((e) => e.id === id)?.kind === 'body',
  );
  const freezables = freezableBodies(doc, sel);
  const willUnfreeze = freezables.length > 0 && freezables.every((b) => b.bodyType === 'static');

  const items: Item[] = [
    { icon: '🗑️', label: t('menuDelete'), run: runtime.actions.deleteSelection },
  ];
  if (hasBody) {
    items.push({ icon: '⧉', label: t('menuDuplicate'), run: runtime.actions.duplicate });
    items.push({ icon: '⇋', label: t('menuMirror'), run: runtime.actions.mirror });
    if (freezables.length > 0) {
      items.push({
        icon: willUnfreeze ? '💧' : '❄️',
        label: willUnfreeze ? t('menuUnfreeze') : t('menuFreeze'),
        run: runtime.actions.toggleFrozen,
      });
    }
  }

  // Střed držet tak daleko od okrajů, ať se sektory vejdou na obrazovku.
  const R = 86;
  const pad = R + 40;
  const cx = Math.min(Math.max(pos.x, pad), window.innerWidth - pad);
  const cy = Math.min(Math.max(pos.y, pad), window.innerHeight - pad);

  return (
    <div
      className="fixed inset-0 z-50"
      onPointerDown={close}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/60"
        style={{ left: cx, top: cy }}
      />
      {items.map((it, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / items.length;
        const x = cx + R * Math.cos(a);
        const y = cy + R * Math.sin(a);
        return (
          <button
            key={it.label}
            type="button"
            className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-200 transition select-none hover:bg-slate-50 active:scale-95"
            style={{ left: x, top: y }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              it.run();
              close();
            }}
          >
            <span className="text-lg leading-none">{it.icon}</span>
            <span className="mt-0.5 text-[9px] leading-none text-slate-500">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
