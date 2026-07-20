/**
 * Hlavička plovoucího panelu — název vlevo, zavírací tlačítko vpravo.
 */
import { Button } from './Button';
import { Icon } from './Icon';

export interface PanelHeaderProps {
  title: string;
  onClose: () => void;
}

export function PanelHeader({ title, onClose }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
      <span className="text-[13px] font-semibold [color:var(--text-primary)]">{title}</span>
      <Button variant="icon" onClick={onClose} aria-label="Zavřít">
        <Icon name="close" size={14} />
      </Button>
    </div>
  );
}
