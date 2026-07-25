/**
 * Radiální menu — rychlé akce nad výběrem. Otevírá pravé tlačítko, nebo
 * long-press dotykem (jen v pauze; za běhu prst drží těleso). Sektory jsou
 * dotykové (56 px). Ťuknutí mimo zavírá.
 */
import { freezableBodies } from '@editor/quickActions';
import type { Runtime } from './bootstrap';
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';
import { Icon, type IconName } from './ui';

interface Item {
  icon: IconName;
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

  const items: Item[] = [{ icon: 'delete', label: t('menuDelete'), run: runtime.actions.deleteSelection }];
  if (hasBody) {
    items.push({ icon: 'duplicate', label: t('menuDuplicate'), run: runtime.actions.duplicate });
    items.push({ icon: 'mirror', label: t('menuMirror'), run: runtime.actions.mirror });
    if (freezables.length > 0) {
      items.push({
        icon: willUnfreeze ? 'unfreeze' : 'freeze',
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
      {/* Středový terč — tečka + jemný prstenec, ať nepůsobí jako artefakt. */}
      <div
        className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--accent)]/30"
        style={{ left: cx, top: cy }}
      />
      <div
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]"
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
            className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full bg-[var(--surface-1)] [box-shadow:var(--shadow-panel)] transition select-none hover:bg-[var(--surface-2)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            style={{ left: x, top: y }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              it.run();
              close();
            }}
          >
            <Icon name={it.icon} size={18} className="[color:var(--text-secondary)]" />
            <span className="text-[9px] leading-none [color:var(--text-muted)]">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
