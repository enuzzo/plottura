import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

interface SidebarHeaderProps {
  className?: string;
}

export default function SidebarHeader({ className }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-5 py-4 border-b border-border",
        className
      )}
    >
      <div className="w-[30px] h-[30px] bg-accent rounded-[7px] flex items-center justify-center font-bold text-white text-[15px]">
        P
      </div>
      <span className="text-xl font-bold text-text-primary tracking-tight">
        Plottura
      </span>
      <ThemeToggle className="ml-auto" />
    </div>
  );
}
