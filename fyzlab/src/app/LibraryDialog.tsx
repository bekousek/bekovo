/**
 * Modální dialog výběru předpřipravené scény.
 * Při kliknutí na dlaždici se scéna načte a dialog se zavře.
 * Klik na backdrop (tmavá plocha za dialogem) dialog také zavře.
 */
import { demoScene, rocketScene } from '@engine/scene/defaults';
import type { SceneDoc } from '@engine/scene/schema';
import { t } from './i18n/t';

interface PresetDef {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  makeScene: () => SceneDoc;
}

const PRESETS: PresetDef[] = [
  {
    id: 'demo-fall',
    icon: '🟡',
    title: 'Padající tělesa',
    description: 'Míče a bedna padají na podlahu. Základní pokusy s pádem.',
    badge: 'Mechanika',
    makeScene: demoScene,
  },
  {
    id: 'preset-raketa',
    icon: '🚀',
    title: 'Raketa s tryskou',
    description: 'Nastav sílu trysky tak, aby raketa vzlétla. Porovnej s tíhovou silou.',
    badge: '8. ročník',
    makeScene: rocketScene,
  },
];

export function LibraryDialog({
  onLoad,
  onClose,
}: {
  onLoad: (doc: SceneDoc) => void;
  onClose: () => void;
}) {
  return (
    // Backdrop — klik zavírá dialog.
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Obsah dialogu — klik se nezpropaguje na backdrop. */}
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hlavička */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{t('libraryTitle')}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t('librarySubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Mřížka presetů */}
        <div className="grid grid-cols-2 gap-3 p-4">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onLoad(p.makeScene());
                onClose();
              }}
              className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98]"
            >
              <span className="text-3xl leading-none">{p.icon}</span>
              <span className="font-semibold text-slate-800">{p.title}</span>
              <span className="text-xs leading-snug text-slate-500">{p.description}</span>
              {p.badge && (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  {p.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
