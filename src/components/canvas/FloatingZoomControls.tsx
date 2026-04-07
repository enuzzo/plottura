import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePosterContext } from "@/features/poster/ui/PosterContext";

export default function FloatingZoomControls({ className }: { className?: string }) {
  const { mapRef } = usePosterContext();

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();

  const btnBase =
    "w-[34px] h-[34px] bg-white/95 dark:bg-card/95 border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-card transition-colors shadow-sm";

  return (
    <div className={cn("absolute bottom-4 right-4 z-10 flex flex-col", className)}>
      <button
        type="button"
        onClick={zoomIn}
        className={cn(btnBase, "rounded-t-md")}
        aria-label="Zoom in"
      >
        <Plus size={16} />
      </button>
      <button
        type="button"
        onClick={zoomOut}
        className={cn(btnBase, "rounded-b-md border-t-0")}
        aria-label="Zoom out"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}
