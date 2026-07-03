/**
 * Horní lišta: otevřít/uložit .fyzlab, zkopírovat odkaz #s=, přepínač
 * vektorů rychlosti, stopy pohybu a motivu (světlý/tmavý).
 */
import { useRef } from 'react';
import { downloadScene, readSceneFile } from '@share/fileIO';
import { encodeSceneParam, URL_WARN_BYTES } from '@share/urlCodec';
import type { Runtime } from './bootstrap';
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';
import { Button, Icon, Panel } from './ui';

export function TopBar({
  runtime,
  onLibrary,
  onHelp,
}: {
  runtime: Runtime;
  onLibrary: () => void;
  onHelp: () => void;
}) {
  const showVelocityAll = useUiStore((s) => s.showVelocityAll);
  const tracerEnabled = useUiStore((s) => s.tracerEnabled);
  const theme = useUiStore((s) => s.theme);
  const fileRef = useRef<HTMLInputElement>(null);
  const showToast = (msg: string) => useUiStore.getState().setToast(msg);

  const onOpenPicked = async (file: File | undefined) => {
    if (!file) return;
    try {
      runtime.loadScene(await readSceneFile(file));
    } catch (err) {
      console.error('[fyzlab] open:', err);
      showToast(t('toastLoadError'));
    }
  };

  const onSave = () => {
    downloadScene(runtime.docForSave());
    showToast(t('toastSaved'));
  };

  const onShare = async () => {
    const param = await encodeSceneParam(runtime.docForSave());
    const url = `${window.location.origin}${window.location.pathname}#s=${param}`;
    window.history.replaceState(null, '', `#s=${param}`);
    try {
      await navigator.clipboard.writeText(url);
      const kb = (param.length / 1024).toFixed(1);
      showToast(
        param.length > URL_WARN_BYTES
          ? t('toastLinkBig')
          : `${t('toastLinkCopied')} (${kb} kB)`,
      );
    } catch {
      // Bez clipboard práv odkaz zůstává v adresním řádku.
      showToast(t('toastLinkCopied'));
    }
  };

  return (
    <Panel className="flex items-center gap-0.5 p-1.5 backdrop-blur-sm">
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
      <Button variant="bar" aria-label={t('topLibrary')} title={t('topLibrary')} onClick={onLibrary}>
        <Icon name="library" />
      </Button>
      <Button variant="bar" aria-label={t('topOpen')} title={t('topOpen')} onClick={() => fileRef.current?.click()}>
        <Icon name="open" />
      </Button>
      <Button variant="bar" aria-label={t('topHelp')} title={t('topHelp')} onClick={onHelp}>
        <Icon name="help" />
      </Button>
      <Button variant="bar" aria-label={t('topSave')} title={t('topSave')} onClick={onSave}>
        <Icon name="save" />
      </Button>
      <Button variant="bar" aria-label={t('topShare')} title={t('topShare')} onClick={() => void onShare()}>
        <Icon name="share" />
      </Button>

      <div className="mx-1 my-1.5 w-px self-stretch bg-[var(--border)]" />

      <Button
        variant="bar"
        active={showVelocityAll}
        aria-label={t('topVectors')}
        aria-pressed={showVelocityAll}
        title={t('topVectors')}
        onClick={() => useUiStore.getState().setShowVelocityAll(!showVelocityAll)}
      >
        <Icon name="vectors" />
      </Button>
      <Button
        variant="bar"
        active={tracerEnabled}
        aria-label={t('topTracer')}
        aria-pressed={tracerEnabled}
        title={t('topTracer')}
        onClick={() => useUiStore.getState().setTracerEnabled(!tracerEnabled)}
      >
        <Icon name="tracer" />
      </Button>

      <div className="mx-1 my-1.5 w-px self-stretch bg-[var(--border)]" />

      <Button
        variant="bar"
        aria-label={theme === 'light' ? t('switchToDark') : t('switchToLight')}
        title={theme === 'light' ? t('switchToDark') : t('switchToLight')}
        onClick={() => useUiStore.getState().setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <Icon name={theme === 'light' ? 'moon' : 'sun'} />
      </Button>
    </Panel>
  );
}
