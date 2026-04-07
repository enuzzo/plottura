import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface SidebarSectionProps {
  value: string;
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}

export default function SidebarSection({
  value,
  icon: Icon,
  label,
  children,
}: SidebarSectionProps) {
  return (
    <AccordionItem value={value} className="border-b border-border-subtle">
      <AccordionTrigger className="px-5 py-3 gap-2">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-text-muted" />
          <span>{label}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-5 pb-4">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
