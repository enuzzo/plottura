import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  onExport: () => void;
  isExporting: boolean;
  className?: string;
}

export default function SidebarFooter({
  onExport,
  isExporting,
  className,
}: SidebarFooterProps) {
  return (
    <div
      className={cn(
        "px-5 py-3.5 border-t border-border bg-panel",
        className
      )}
    >
      <button
        type="button"
        onClick={onExport}
        disabled={isExporting}
        className="w-full h-10 bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-[15px] rounded-[9px] transition-colors shadow-[0_2px_8px_rgba(0,191,165,0.2)] disabled:opacity-50"
      >
        {isExporting ? "Exporting\u2026" : "Export Poster"}
      </button>
    </div>
  );
}
