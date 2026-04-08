import type { RefObject } from "react";
import ThemeCard from "./ThemeCard";
import { Pencil } from "lucide-react";
import type { ThemeOption } from "../domain/types";

interface ThemeSummarySectionProps {
  listRef?: RefObject<HTMLDivElement>;
  themeOptions: ThemeOption[];
  selectedThemeId: string;
  selectedThemeOption: ThemeOption;
  onThemeSelect: (themeId: string) => void;
  onCustomize: () => void;
}

export default function ThemeSummarySection({
  listRef,
  themeOptions,
  selectedThemeId,
  selectedThemeOption,
  onThemeSelect,
  onCustomize,
}: ThemeSummarySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Theme: <span className="text-text-primary">{selectedThemeOption.name}</span>
        </p>
        <button
          type="button"
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-accent-subtle transition-colors"
          onClick={onCustomize}
          aria-label={`Customize ${selectedThemeOption.name} colors`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        className="grid grid-cols-2 gap-px bg-border/50"
        role="list"
        aria-label="Theme options"
        ref={listRef}
      >
        {themeOptions.map((themeOption) => (
          <ThemeCard
            key={themeOption.id}
            themeOption={themeOption}
            isSelected={themeOption.id === selectedThemeId}
            onClick={() => onThemeSelect(themeOption.id)}
          />
        ))}
      </div>
    </div>
  );
}
