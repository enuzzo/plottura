import { cn } from "@/lib/utils";
import type { Layout } from "../domain/types";
import { formatLayoutDimensions } from "../infrastructure/layoutRepository";

function getLayoutSymbolDataUri(layoutOption: Layout): string {
  const symbol = String(layoutOption?.symbol ?? "").trim();
  if (!symbol) return "";
  const normalizedSymbol = symbol.replace(
    /stroke-width=(['"])([\d.]+)\1/g,
    (_match, quote: string, value: string) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return `stroke-width=${quote}${value}${quote}`;
      }
      const thinner = Math.max(0.8, parsed * 0.5);
      return `stroke-width=${quote}${thinner}${quote}`;
    },
  );
  return `data:image/svg+xml;utf8,${encodeURIComponent(normalizedSymbol)}`;
}

interface LayoutCardProps {
  layoutOption: Layout | null;
  onClick?: () => void;
  isSelected?: boolean;
  /** Whether this cell is in the right column (adds left border) */
  isOdd?: boolean;
  /** Whether this cell is in the last row (no bottom border) */
  isLastRow?: boolean;
}

export default function LayoutCard({
  layoutOption,
  onClick,
  isSelected = false,
  isOdd = false,
  isLastRow = false,
}: LayoutCardProps) {
  if (!layoutOption) {
    return null;
  }
  const symbolDataUri = getLayoutSymbolDataUri(layoutOption);
  const sizeText = formatLayoutDimensions(layoutOption);

  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2 px-2.5 py-2 text-left transition-colors cursor-pointer",
        isOdd && "border-l border-border",
        !isLastRow && "border-b border-border",
        isSelected
          ? "bg-accent-subtle text-accent"
          : "hover:bg-accent-subtle/50"
      )}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {symbolDataUri ? (
        <img
          className="w-5 h-5 shrink-0 opacity-50"
          src={symbolDataUri}
          alt=""
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className={cn(
          "text-[11px] font-medium leading-tight",
          isSelected ? "text-accent" : "text-text-primary"
        )}>
          {layoutOption.name}
        </p>
        <p className="text-[10px] text-text-muted leading-tight">
          {sizeText}
        </p>
      </div>
    </button>
  );
}
