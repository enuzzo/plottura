import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface SidebarHeaderProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function SidebarHeader({
  className,
  collapsed,
  onToggle,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-5 py-4 border-b border-border shrink-0",
        className
      )}
    >
      <div className="w-[30px] h-[30px] bg-accent rounded-[7px] flex items-center justify-center font-bold text-white text-[15px]">
        P
      </div>
      <span className="text-xl font-bold text-text-primary tracking-tight whitespace-nowrap">
        Plottura
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-accent-subtle transition-colors"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
