import { cn } from "@/lib/utils";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { getLayoutOption, createCustomLayoutOption, formatLayoutDimensions } from "@/features/layout/infrastructure/layoutRepository";
import { Image, FileCode } from "lucide-react";

interface SidebarFooterProps {
  onExportPng: () => void;
  onExportSvg: () => void;
  isExporting: boolean;
  className?: string;
}

export default function SidebarFooter({
  onExportPng,
  onExportSvg,
  isExporting,
  className,
}: SidebarFooterProps) {
  const { state, effectiveTheme } = usePosterContext();
  const { form } = state;

  const layoutOption = getLayoutOption(form.layout) ??
    createCustomLayoutOption(Number(form.width), Number(form.height));
  const layoutDims = formatLayoutDimensions(layoutOption);

  const city = form.displayCity || "—";
  const country = form.displayCountry || "—";
  const markerCount = state.markers.length;
  const coords = `${Number(form.latitude).toFixed(2)}°, ${Number(form.longitude).toFixed(2)}°`;

  return (
    <div className={cn("shrink-0 bg-[var(--bg-card)] shadow-[0_-8px_16px_rgba(0,0,0,0.06)]", className)}>
      {/* Settings summary */}
      <div className="px-4 py-2 border-t border-border/50">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-[10px] leading-relaxed">
          <span className="text-text-muted">Location</span>
          <span className="text-text-primary truncate text-right">{city}, {country}</span>
          <span className="text-text-muted">Coords</span>
          <span className="text-text-primary truncate text-right">{coords}</span>
          <span className="text-text-muted">Theme</span>
          <span className="text-text-primary truncate text-right">{effectiveTheme.name}</span>
          <span className="text-text-muted">Layout</span>
          <span className="text-text-primary truncate text-right">{layoutOption.name}</span>
          <span className="text-text-muted">Size</span>
          <span className="text-text-primary truncate text-right">{layoutDims}</span>
          <span className="text-text-muted">Markers</span>
          <span className="text-text-primary text-right">{markerCount}</span>
        </div>
      </div>

      {/* Export buttons — slightly different bg to distinguish */}
      <div className="flex gap-2 px-4 py-2.5 border-t border-border/50">
        <button
          type="button"
          onClick={onExportPng}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-xs rounded-lg transition-colors shadow-[0_2px_6px_rgba(0,191,165,0.18)] disabled:opacity-50"
        >
          <Image className="w-3 h-3" />
          {isExporting ? "…" : "PNG"}
        </button>
        <button
          type="button"
          onClick={onExportSvg}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 border border-accent text-accent hover:bg-accent-subtle font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
        >
          <FileCode className="w-3 h-3" />
          SVG
        </button>
      </div>
    </div>
  );
}
