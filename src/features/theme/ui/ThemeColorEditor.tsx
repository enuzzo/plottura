import type { ThemeColorKey } from "../domain/types";

interface ColorTarget {
  key: ThemeColorKey;
  label: string;
  color: string;
  isActive: boolean;
}

interface ThemeColorEditorProps {
  activeColorLabel: string;
  hasCustomColors: boolean;
  onResetAllColors: () => void;
  onDone: () => void;
  colorTargets: ColorTarget[];
  onTargetSelect: (key: ThemeColorKey) => void;
}

export default function ThemeColorEditor({
  activeColorLabel,
  hasCustomColors,
  onResetAllColors,
  onDone,
  colorTargets,
  onTargetSelect,
}: ThemeColorEditorProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-text-primary">Color Editor</h2>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-text-secondary">
          Editing: <span className="font-medium text-text-primary">{activeColorLabel}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary hover:bg-accent-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            onClick={onResetAllColors}
            disabled={!hasCustomColors}
          >
            Reset All
          </button>
          <button
            type="button"
            className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white hover:bg-accent/90 transition-colors"
            onClick={onDone}
          >
            Done
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {colorTargets.map((target) => (
          <button
            key={target.key}
            type="button"
            className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
              target.isActive
                ? "bg-accent/10 ring-1 ring-accent"
                : "hover:bg-accent-subtle"
            }`}
            onClick={() => onTargetSelect(target.key)}
            aria-pressed={target.isActive}
            aria-label={`${target.label}: ${target.color}`}
          >
            <span
              className="inline-block h-5 w-5 shrink-0 rounded-full border border-border/40"
              style={{ backgroundColor: target.color }}
            />
            <span className="text-xs text-text-secondary">{target.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
