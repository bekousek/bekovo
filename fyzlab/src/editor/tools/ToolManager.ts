import type { Tool, ToolPointerEvent } from './Tool';

/** Registr nástrojů + směrování pointer eventů na aktivní nástroj. */
export class ToolManager {
  private tools = new Map<string, Tool>();
  private shortcuts = new Map<string, string>(); // klávesa → tool id
  private active: Tool | null = null;

  /** Zapojuje bootstrap → uiStore (zvýraznění v Toolbaru). */
  onActiveChange: ((id: string) => void) | null = null;

  register(tool: Tool, shortcut?: string): void {
    this.tools.set(tool.id, tool);
    if (shortcut) this.shortcuts.set(shortcut.toLowerCase(), tool.id);
    this.active ??= tool;
  }

  get activeId(): string {
    return this.active?.id ?? '';
  }

  setActive(id: string): void {
    const tool = this.tools.get(id);
    if (!tool || tool === this.active) return;
    this.active?.cancel();
    this.active = tool;
    this.onActiveChange?.(id);
  }

  /** Zpracuje klávesovou zkratku nástroje; true = spotřebováno. */
  handleKey(key: string): boolean {
    const id = this.shortcuts.get(key.toLowerCase());
    if (!id) return false;
    this.setActive(id);
    return true;
  }

  pointerDown(e: ToolPointerEvent): void {
    this.active?.pointerDown(e);
  }

  pointerMove(e: ToolPointerEvent): void {
    this.active?.pointerMove(e);
  }

  pointerUp(e: ToolPointerEvent): void {
    this.active?.pointerUp(e);
  }

  cancelActive(): void {
    this.active?.cancel();
  }
}
