/**
 * Horní lišta: otevřít/uložit .fyzlab, zkopírovat odkaz #s=, přepínač
 * vektorů rychlosti. Toast dole hlásí výsledky (zkopírováno, chyba…).
 */
import { useEffect, useRef } from 'react';
import { downloadScene, readSceneFile } from '@share/fileIO';
import { encodeSceneParam, URL_WARN_BYTES } from '@share/urlCodec';
import type { Runtime } from './bootstrap';
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';

function BarButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg transition select-none active:scale-95 ${
        active ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {icon}
    </button>
  );
}

export function TopBar({ runtime }: { runtime: Runtime }) {
  const showVelocityAll = useUiStore((s) => s.showVelocityAll);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = (msg: string) => useUiStore.getState().setToast(msg);

  const onOpenPicked = async (file: File | undefined) => {
    if (!file) return;
    try {
      runtime.loadScene(await readSceneFile(file));
    } catch (err) {
      console.error('[fyzlab] open:', err);
      toast(t('toastLoadError'));
    }
  };

  const onSave = () => {
    downloadScene(runtime.docForSave());
    toast(t('toastSaved'));
  };

  const onShare = async () => {
    const param = await encodeSceneParam(runtime.docForSave());
    const url = `${window.location.origin}${window.location.pathname}#s=${param}`;
    window.history.replaceState(null, '', `#s=${param}`);
    try {
      await navigator.clipboard.writeText(url);
      const kb = (param.length / 1024).toFixed(1);
      toast(
        param.length > URL_WARN_BYTES
          ? t('toastLinkBig')
          : `${t('toastLinkCopied')} (${kb} kB)`,
      );
    } catch {
      // Bez clipboard práv aspoň zůstává odkaz v adresním řádku.
      toast(t('toastLinkCopied'));
    }
  };

  return (
    <div className="pointer-events-auto flex gap-1 rounded-2xl bg-white/85 p-1.5 shadow-lg ring-1 ring-slate-200 backdrop-blur">
      <input
        ref={fileRef}
        type="file"
        accept=".fyzlab,application/json"
        className="hidden"
        onChange={(e) => {
          void onOpenPicked(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <BarButton icon="📂" label={t('topOpen')} onClick={() => fileRef.current?.click()} />
      <BarButton icon="💾" label={t('topSave')} onClick={onSave} />
      <BarButton icon="🔗" label={t('topShare')} onClick={() => void onShare()} />
      <div className="mx-1 my-1.5 w-px bg-slate-200" />
      <BarButton
        icon="➶"
        label={t('topVectors')}
        active={showVelocityAll}
        onClick={() => useUiStore.getState().setShowVelocityAll(!showVelocityAll)}
      />
    </div>
  );
}

/** Pomíjivá zpráva dole uprostřed. */
export function Toast() {
  const toast = useUiStore((s) => s.toast);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => useUiStore.getState().setToast(null), 3500);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (!toast) return null;
  return (
    <div className="pointer-events-none absolute bottom-36 left-1/2 -translate-x-1/2 rounded-xl bg-slate-800/90 px-4 py-2 text-sm text-white shadow-lg">
      {toast}
    </div>
  );
}
