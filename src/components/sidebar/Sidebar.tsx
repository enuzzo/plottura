import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import SidebarHeader from "./SidebarHeader";
import SidebarFooter from "./SidebarFooter";

interface SidebarProps {
  children: ReactNode;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportPdf: () => void;
  isExporting: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function Sidebar({
  children,
  onExportPng,
  onExportSvg,
  onExportPdf,
  isExporting,
  collapsed = false,
  onToggle,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "bg-panel border-r border-border flex flex-col h-screen transition-[width,min-width] duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-0 min-w-0 border-r-0" : "w-[360px] min-w-[360px]",
        className
      )}
    >
      <SidebarHeader collapsed={collapsed} onToggle={onToggle} />
      <div className="flex-1 overflow-y-auto scrollbar-slim">{children}</div>
      <SidebarFooter onExportPng={onExportPng} onExportSvg={onExportSvg} onExportPdf={onExportPdf} isExporting={isExporting} />
    </aside>
  );
}
