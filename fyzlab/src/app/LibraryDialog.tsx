/**
 * Modální dialog výběru předpřipravené scény.
 * Při kliknutí na dlaždici se scéna načte a dialog se zavře.
 * Klik na backdrop (tmavá plocha za dialogem) dialog také zavře.
 */
import {
  convergingLensScene,
  demoScene,
  divergingLensScene,
  emptyScene,
  heliumBalloonScene,
  inclineScene,
  laserScene,
  pendulumScene,
  periscopeScene,
  prismScene,
  rocketScene,
  springMassScene,
  twoDensitiesScene,
  waterInBoxScene,
} from '@engine/scene/defaults';
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
    id: 'empty',
    icon: '⬜',
    title: t('libraryEmpty'),
    description: 'Prázdné plátno — začni od nuly.',
    makeScene: emptyScene,
  },
  {
    id: 'demo-fall',
    icon: '🟡',
    title: 'Padající tělesa',
    description: 'Míče a bedna padají na podlahu.',
    badge: 'Mechanika',
    makeScene: demoScene,
  },
  {
    id: 'preset-kyvadlo',
    icon: '🔵',
    title: 'Kyvadlo',
    description: 'Závaží na čepu — perioda závisí na délce závěsu.',
    badge: '8. ročník · Kmitání',
    makeScene: pendulumScene,
  },
  {
    id: 'preset-pruzina',
    icon: '🟡',
    title: 'Pružina se závažím',
    description: 'Závaží na svislé pružině — kmitání kolem rovnovážné polohy.',
    badge: '8. ročník · Kmitání',
    makeScene: springMassScene,
  },
  {
    id: 'preset-naklon',
    icon: '🟫',
    title: 'Nakloněná rovina',
    description: 'Kvádr na rovině 30° — závisí skluz na tření povrchu?',
    badge: '7. ročník · Síly',
    makeScene: inclineScene,
  },
  {
    id: 'preset-balonek',
    icon: '🔴',
    title: 'Heliový balón',
    description: 'Balón stoupá vzduchem — pozoruj vztlak a terminální rychlost.',
    badge: '7. ročník · Vztlak',
    makeScene: heliumBalloonScene,
  },
  {
    id: 'preset-raketa',
    icon: '🚀',
    title: 'Raketa s tryskou',
    description: 'Nastav sílu trysky tak, aby raketa vzlétla.',
    badge: '8. ročník · Síly',
    makeScene: rocketScene,
  },
  {
    id: 'preset-laser-lom',
    icon: '🔦',
    title: 'Lom světla',
    description: 'Laser prochází skleněným blokem — pozoruj lom paprsku.',
    badge: '7. ročník · Optika',
    makeScene: laserScene,
  },
  {
    id: 'preset-hranol-disperze',
    icon: '🌈',
    title: 'Disperze — hranol',
    description: 'Tři lasery prochází hranolem — Cauchyova disperze rozkládá barvy.',
    badge: '7. ročník · Optika',
    makeScene: prismScene,
  },
  {
    id: 'preset-spojka',
    icon: '🔵',
    title: 'Spojná čočka',
    description: 'Svazek rovnoběžných paprsků prochází spojnou čočkou a sbíhá se v ohnisku.',
    badge: '7. ročník · Optika',
    makeScene: convergingLensScene,
  },
  {
    id: 'preset-rozptylka',
    icon: '🔴',
    title: 'Rozptylná čočka',
    description: 'Svazek rovnoběžných paprsků prochází rozptylnou čočkou a rozbíhá se.',
    badge: '7. ročník · Optika',
    makeScene: divergingLensScene,
  },
  {
    id: 'preset-periskop',
    icon: '🪞',
    title: 'Periskop',
    description: 'Dvě zrcadla přesměrují laserový paprsek přes překážku — zákon odrazu.',
    badge: '7. ročník · Optika',
    makeScene: periscopeScene,
  },
  {
    id: 'preset-voda-nadoba',
    icon: '💧',
    title: 'Voda v nádobě',
    description: 'Kapalina se usadí vlivem gravitace — tlak roste s hloubkou.',
    badge: '7. ročník · Kapaliny',
    makeScene: waterInBoxScene,
  },
  {
    id: 'preset-dve-kapaliny',
    icon: '🫧',
    title: 'Dvě kapaliny',
    description: 'Lehčí kapalina plave na těžší — Archimédův zákon v akci.',
    badge: '7. ročník · Kapaliny',
    makeScene: twoDensitiesScene,
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
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
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

        {/* Mřížka presetů — max výška + scroll, ať se vejde i na malá zařízení. */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                <span className="text-sm font-semibold text-slate-800">{p.title}</span>
                <span className="text-xs leading-snug text-slate-500">{p.description}</span>
                {p.badge && (
                  <span className="mt-auto rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {p.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
