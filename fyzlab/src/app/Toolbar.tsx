/** Levá lišta nástrojů — velká dotyková tlačítka (≥48 px). */
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';
import type { MsgKey } from './i18n/cs';
import { Button, Icon, Panel } from './ui';
import type { IconName } from './ui';

interface ToolSpec {
  id: string;
  icon: IconName;
  labelKey: MsgKey;
  shortcut: string;
}

const SHAPE_TOOLS: ToolSpec[] = [
  { id: 'drag', icon: 'drag', labelKey: 'toolDrag', shortcut: 'V' },
  { id: 'box', icon: 'box', labelKey: 'toolBox', shortcut: 'B' },
  { id: 'circle', icon: 'circle', labelKey: 'toolCircle', shortcut: 'K' },
  { id: 'polygon', icon: 'polygon', labelKey: 'toolPolygon', shortcut: 'P' },
  { id: 'plane', icon: 'plane', labelKey: 'toolPlane', shortcut: 'R' },
];

const JOINT_TOOLS: ToolSpec[] = [
  { id: 'axle', icon: 'axle', labelKey: 'toolAxle', shortcut: 'O' },
  { id: 'spring', icon: 'spring', labelKey: 'toolSpring', shortcut: 'S' },
  { id: 'fixed', icon: 'fixed', labelKey: 'toolFixed', shortcut: 'F' },
  { id: 'thruster', icon: 'thruster', labelKey: 'toolThruster', shortcut: 'U' },
];

const INSTRUMENT_TOOLS: ToolSpec[] = [
  { id: 'photogate', icon: 'photogate', labelKey: 'toolPhotogate', shortcut: 'T' },
  { id: 'laser', icon: 'laser', labelKey: 'toolLaser', shortcut: 'L' },
  { id: 'fluid', icon: 'fluid', labelKey: 'toolFluid', shortcut: 'W' },
];

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
    <Panel className="flex flex-col gap-0.5 p-1.5 backdrop-blur-sm">
      {SHAPE_TOOLS.map((tool) => (
        <Button
          key={tool.id}
          variant="tool"
          active={activeToolId === tool.id}
          aria-label={t(tool.labelKey)}
          aria-pressed={activeToolId === tool.id}
          title={`${t(tool.labelKey)} (${tool.shortcut})`}
          onClick={() => onSelect(tool.id)}
        >
          <Icon name={tool.icon} size={20} />
        </Button>
      ))}

      <div className="mx-2 my-0.5 h-px bg-[var(--border)]" />

      {JOINT_TOOLS.map((tool) => (
        <Button
          key={tool.id}
          variant="tool"
          active={activeToolId === tool.id}
          aria-label={t(tool.labelKey)}
          aria-pressed={activeToolId === tool.id}
          title={`${t(tool.labelKey)} (${tool.shortcut})`}
          onClick={() => onSelect(tool.id)}
        >
          <Icon name={tool.icon} size={20} />
        </Button>
      ))}

      <div className="mx-2 my-0.5 h-px bg-[var(--border)]" />

      {INSTRUMENT_TOOLS.map((tool) => (
        <Button
          key={tool.id}
          variant="tool"
          active={activeToolId === tool.id}
          aria-label={t(tool.labelKey)}
          aria-pressed={activeToolId === tool.id}
          title={`${t(tool.labelKey)} (${tool.shortcut})`}
          onClick={() => onSelect(tool.id)}
        >
          <Icon name={tool.icon} size={20} />
        </Button>
      ))}

      <div className="mx-2 my-0.5 h-px bg-[var(--border)]" />

      <Button
        variant="tool"
        active={snapEnabled}
        aria-label={t('snapGrid')}
        aria-pressed={snapEnabled}
        title={`${t('snapGrid')} (G)`}
        onClick={onToggleSnap}
      >
        <Icon name="snap" size={20} />
      </Button>
    </Panel>
  );
}
