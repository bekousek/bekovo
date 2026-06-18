import { useEffect, useRef, useState } from 'react';
import { bootstrap, type Runtime } from './bootstrap';
import { GatePanel } from './GatePanel';
import { PropertiesPanel } from './PropertiesPanel';
import { RadialMenu } from './RadialMenu';
import { SimControls } from './SimControls';
import { Toolbar } from './Toolbar';
import { Toast, TopBar } from './TopBar';
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';
import type { MsgKey } from './i18n/cs';

/** Jednořádková nápověda podle aktivního nástroje. */
const HINT_BY_TOOL: Record<string, MsgKey> = {
  drag: 'hintDrag',
  box: 'hintBox',
  circle: 'hintCircle',
  polygon: 'hintPolygon',
  plane: 'hintPlane',
  axle: 'hintAxle',
  spring: 'hintSpring',
  fixed: 'hintFixed',
  photogate: 'hintPhotogate',
};

function HintLine() {
  const activeToolId = useUiStore((s) => s.activeToolId);
  return (
    <p className="pointer-events-none absolute bottom-24 left-1/2 w-full max-w-xl -translate-x-1/2 text-center text-xs text-slate-400 sm:bottom-20">
      {t(HINT_BY_TOOL[activeToolId] ?? 'hintDrag')}
    </p>
  );
}

function StatsBadge() {
  const stats = useUiStore((s) => s.stats);
  return (
    <div className="pointer-events-none rounded-lg bg-white/70 px-2 py-1 font-mono text-[11px] text-slate-500 ring-1 ring-slate-200 backdrop-blur">
      {stats.fps} fps · tick {stats.tickMs.toFixed(2)} ms · {stats.bodies} {t('bodies')}
      {stats.slowMotion && <span className="ml-1 font-semibold text-amber-600">· {t('slowMotion')}</span>}
    </div>
  );
}

export default function App() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let rt: Runtime | null = null;

    bootstrap(host)
      .then((created) => {
        if (disposed) {
          created.dispose();
          return;
        }
        rt = created;
        setRuntime(created);
      })
      .catch((err: unknown) => {
        console.error(err);
        setError(String(err));
      });

    return () => {
      disposed = true;
      rt?.dispose();
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-100">
      {/* Canvas host — touch-action:none, gesta řeší PointerManager. */}
      <div ref={hostRef} className="absolute inset-0 touch-none" />

      <header className="pointer-events-none absolute left-4 top-4 flex items-baseline gap-2">
        <h1 className="text-xl font-black tracking-tight text-slate-800">{t('appName')}</h1>
        <span className="text-sm text-slate-500">{t('tagline')}</span>
      </header>

      <div className="absolute right-4 top-4">
        <StatsBadge />
      </div>

      {runtime && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <TopBar runtime={runtime} />
        </div>
      )}

      {runtime && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Toolbar
            onSelect={(id) => runtime.tools.setActive(id)}
            onToggleSnap={() => {
              runtime.snap.enabled = !runtime.snap.enabled;
              useUiStore.getState().setSnapEnabled(runtime.snap.enabled);
            }}
          />
        </div>
      )}

      {runtime && (
        <div className="absolute right-4 top-14">
          <PropertiesPanel runtime={runtime} />
        </div>
      )}

      {runtime && (
        <div className="absolute bottom-28 left-4 sm:bottom-24">
          <GatePanel runtime={runtime} />
        </div>
      )}

      {runtime && <RadialMenu runtime={runtime} />}

      <Toast />

      <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
        {runtime ? (
          <SimControls controller={runtime.controller} />
        ) : (
          !error && (
            <div className="rounded-2xl bg-white/85 px-4 py-3 text-sm text-slate-600 shadow-lg ring-1 ring-slate-200">
              {t('loading')}
            </div>
          )
        )}
      </div>

      <HintLine />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 p-6">
          <div className="max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="mb-2 font-bold text-red-600">{t('errorTitle')}</h2>
            <pre className="overflow-auto whitespace-pre-wrap text-xs text-slate-600">{error}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
