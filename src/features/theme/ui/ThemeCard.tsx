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
        "relative flex flex-col items-center gap-1 bg-panel p-2 pt-2.5 cursor-pointer transition-colors hover:bg-accent-subtle",
        isSelected && "ring-2 ring-accent ring-inset"
      )}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={themeOption.name}
    >
      <div
        className="flex items-center justify-center gap-0 w-full"
        aria-hidden="true"
      >
        {palette.map((color, index) => (
          <span
            key={`${themeOption.id}-${color}-${index}`}
            className="inline-block h-5 flex-1"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <p className="text-[10px] text-text-secondary truncate w-full text-center">
        {themeOption.name}
      </p>
    </button>
  );
}
