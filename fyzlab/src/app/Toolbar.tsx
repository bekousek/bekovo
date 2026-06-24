/** Levá lišta nástrojů — velká dotyková tlačítka (≥48 px). */
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';
import type { MsgKey } from './i18n/cs';

interface ToolSpec {
  id: string;
  icon: string;
  labelKey: MsgKey;
  shortcut: string;
}

const SHAPE_TOOLS: ToolSpec[] = [
  { id: 'drag', icon: '✋', labelKey: 'toolDrag', shortcut: 'V' },
  { id: 'box', icon: '▭', labelKey: 'toolBox', shortcut: 'B' },
  { id: 'circle', icon: '◯', labelKey: 'toolCircle', shortcut: 'K' },
  { id: 'polygon', icon: '✏️', labelKey: 'toolPolygon', shortcut: 'P' },
  { id: 'plane', icon: '⏤', labelKey: 'toolPlane', shortcut: 'R' },
];

const JOINT_TOOLS: ToolSpec[] = [
  { id: 'axle', icon: '⊙', labelKey: 'toolAxle', shortcut: 'O' },
  { id: 'spring', icon: '∿', labelKey: 'toolSpring', shortcut: 'S' },
  { id: 'fixed', icon: '📌', labelKey: 'toolFixed', shortcut: 'F' },
  { id: 'thruster', icon: '⇑', labelKey: 'toolThruster', shortcut: 'U' },
];

const INSTRUMENT_TOOLS: ToolSpec[] = [
  { id: 'photogate', icon: '┆', labelKey: 'toolPhotogate', shortcut: 'T' },
  { id: 'laser', icon: '⟶', labelKey: 'toolLaser', shortcut: 'L' },
  { id: 'fluid', icon: '💧', labelKey: 'toolFluid', shortcut: 'W' },
];

function ToolButton({
  tool,
  active,
  onSelect,
}: {
  tool: ToolSpec;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tool.id)}
      aria-label={t(tool.labelKey)}
      aria-pressed={active}
      title={`${t(tool.labelKey)} (${tool.shortcut})`}
      className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl transition select-none active:scale-95 ${
        active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {tool.icon}
    </button>
  );
}

export function Toolbar({
  onSelect,
  onToggleSnap,
}: {
  onSelect: (id: string) => void;
  onToggleSnap: () => void;
}) {
  const activeToolId = useUiStore((s) => s.activeToolId);
  const snapEnabled = useUiStore((s) => s.snapEnabled);

  return (
    <div className="pointer-events-auto flex flex-col gap-1 rounded-2xl bg-white/85 p-2 shadow-lg ring-1 ring-slate-200 backdrop-blur">
      {SHAPE_TOOLS.map((tool) => (
        <ToolButton key={tool.id} tool={tool} active={activeToolId === tool.id} onSelect={onSelect} />
      ))}

      <div className="mx-2 my-1 h-px bg-slate-200" />

      {JOINT_TOOLS.map((tool) => (
        <ToolButton key={tool.id} tool={tool} active={activeToolId === tool.id} onSelect={onSelect} />
      ))}

      <div className="mx-2 my-1 h-px bg-slate-200" />

      {INSTRUMENT_TOOLS.map((tool) => (
        <ToolButton key={tool.id} tool={tool} active={activeToolId === tool.id} onSelect={onSelect} />
      ))}

      <div className="mx-2 my-1 h-px bg-slate-200" />

      <button
        type="button"
        onClick={onToggleSnap}
        aria-label={t('snapGrid')}
        aria-pressed={snapEnabled}
        title={`${t('snapGrid')} (G)`}
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl transition select-none active:scale-95 ${
          snapEnabled ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-100'
        }`}
      >
        ⌗
      </button>
    </div>
  );
}
