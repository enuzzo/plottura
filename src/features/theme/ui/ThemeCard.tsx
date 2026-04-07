import { cn } from "@/lib/utils";
import {
  DISPLAY_PALETTE_KEYS,
  type ThemeOption,
  type ThemeColorKey,
} from "../domain/types";

interface ThemeCardProps {
  themeOption: ThemeOption | null;
  onClick?: () => void;
  isSelected?: boolean;
  showFullPalette?: boolean;
}

export default function ThemeCard({
  themeOption,
  onClick,
  isSelected = false,
  showFullPalette = false,
}: ThemeCardProps) {
  if (!themeOption) {
    return null;
  }

  const majorPaletteKeys: ThemeColorKey[] = showFullPalette
    ? DISPLAY_PALETTE_KEYS
    : [
        "ui.text",
        "map.land",
        "map.roads.major",
        "map.roads.minor_high",
        "map.roads.minor_mid",
      ];
  const majorPaletteIndices = majorPaletteKeys
    .map((key) => DISPLAY_PALETTE_KEYS.indexOf(key))
    .filter((index) => index >= 0);
  const palette = (() => {
    if (!Array.isArray(themeOption.palette)) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const index of majorPaletteIndices) {
      const color = themeOption.palette[index];
      if (color && !seen.has(color)) {
        seen.add(color);
        result.push(color);
      }
    }
    return result;
  })();

  return (
    <button
      type="button"
      className={cn(
        "theme-card relative flex flex-col items-center gap-1.5 rounded-md border bg-card p-2 transition-colors cursor-pointer",
        isSelected
          ? "is-selected border-2 border-accent"
          : "border-border hover:border-accent/50"
      )}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={themeOption.name}
    >
      <div
        className={cn(
          "theme-card-palette flex items-center justify-center gap-0.5 w-full",
          showFullPalette ? "theme-card-palette--full flex-wrap" : ""
        )}
        aria-hidden="true"
      >
        {palette.map((color, index) => (
          <span
            key={`${themeOption.id}-${color}-${index}`}
            className="theme-card-swatch inline-block h-5 w-5 rounded-full border border-border/40"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <p className="theme-card-name text-xs text-text-secondary truncate w-full text-center">
        {themeOption.name}
      </p>
    </button>
  );
}
