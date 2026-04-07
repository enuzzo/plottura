import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import SidebarHeader from "./SidebarHeader";
import SidebarFooter from "./SidebarFooter";

interface SidebarProps {
  children: ReactNode;
  onExport: () => void;
  isExporting: boolean;
  className?: string;
}

export default function Sidebar({
  children,
  onExport,
  isExporting,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-[320px] min-w-[320px] bg-panel border-r border-border flex flex-col h-screen",
        className
      )}
    >
      <SidebarHeader />
      <div className="flex-1 overflow-y-auto">{children}</div>
      <SidebarFooter onExport={onExport} isExporting={isExporting} />
    </aside>
  );
}
