import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MapCanvasProps {
  children: ReactNode;
  className?: string;
}

export default function MapCanvas({ children, className }: MapCanvasProps) {
  return (
    <main
      className={cn(
        "flex-1 bg-app flex items-center justify-center relative overflow-hidden",
        className
      )}
    >
      {children}
    </main>
  );
}
