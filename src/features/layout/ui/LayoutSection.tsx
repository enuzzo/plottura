import { useMemo, useRef, useState, useEffect } from "react";
import { createCustomLayoutOption } from "@/features/layout/infrastructure/layoutRepository";
import { Check, Pencil, ChevronDown, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import MapDimensionFields from "@/features/map/ui/MapDimensionFields";
import LayoutCard from "./LayoutCard";
import type { LayoutGroup } from "../domain/types";

interface LayoutSectionForm {
  layout: string;
  width: string;
  height: string;
  distance: string;
}

interface LayoutSectionProps {
  form: LayoutSectionForm;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNumericFieldBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onLayoutChange: (layoutId: string) => void;
  layoutGroups: LayoutGroup[];
  minPosterCm: number;
  maxPosterCm: number;
}

export default function LayoutSection({
  form,
  onChange,
  onNumericFieldBlur,
  onLayoutChange,
  layoutGroups,
  minPosterCm,
  maxPosterCm,
}: LayoutSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(["print"]));
  const groupsRef = useRef<HTMLDivElement | null>(null);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const layoutOptions = useMemo(
    () => layoutGroups.flatMap((g) => g.options),
    [layoutGroups],
  );

  const selectedLayoutOption = useMemo(() => {
    const match = layoutOptions.find((lo) => lo.id === form.layout);
    if (match) return match;
    return createCustomLayoutOption(Number(form.width), Number(form.height));
  }, [form.height, form.layout, form.width, layoutOptions]);

  useEffect(() => {
    if (isEditing) return;
    const frameId = window.requestAnimationFrame(() => {
      const selected = groupsRef.current?.querySelector<HTMLElement>(
        "[aria-pressed='true']",
      );
      selected?.scrollIntoView({ behavior: "auto", block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [isEditing, form.layout]);

  function handleSelect(layoutId: string) {
    onLayoutChange(layoutId);
    setIsEditing(false);
  }

  function handleOpenEditor() {
    setIsEditing(true);
    onLayoutChange("custom");
  }

  function handleRotate() {
    const currentWidth = form.width;
    const currentHeight = form.height;
    // Swap width and height via synthetic events
    const widthEvent = {
      target: { name: "width", type: "text", value: currentHeight, checked: false },
    } as React.ChangeEvent<HTMLInputElement>;
    const heightEvent = {
      target: { name: "height", type: "text", value: currentWidth, checked: false },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(widthEvent);
    onChange(heightEvent);
    // Switch to custom layout since dimensions no longer match the preset
    onLayoutChange("custom");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {selectedLayoutOption.name}
        </p>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-accent-subtle transition-colors"
            onClick={handleRotate}
            aria-label="Rotate layout (swap width and height)"
            title="Rotate layout"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          {isEditing ? (
            <button
              type="button"
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-accent-subtle transition-colors"
              onClick={() => setIsEditing(false)}
              aria-label="Done editing layout"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-accent-subtle transition-colors"
              onClick={handleOpenEditor}
              aria-label="Customize layout size"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <MapDimensionFields
          form={form}
          minPosterCm={minPosterCm}
          maxPosterCm={maxPosterCm}
          onChange={onChange}
          onNumericFieldBlur={onNumericFieldBlur}
          showDistanceField={false}
        />
      ) : (
        <div className="space-y-2" ref={groupsRef}>
          {layoutGroups.map((group) => {
            const isOpen = openGroups.has(group.id);
            const hasSelected = group.options.some((o) => o.id === form.layout);
            return (
              <section key={group.id}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center justify-between w-full px-1 py-1 text-left"
                >
                  <span className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    hasSelected ? "text-accent" : "text-text-muted"
                  )}>
                    {group.name}
                  </span>
                  <ChevronDown className={cn(
                    "w-3 h-3 text-text-muted transition-transform duration-200",
                    isOpen && "rotate-180"
                  )} />
                </button>
                {isOpen && (
                  <div className="mt-1 grid grid-cols-2 border border-border rounded-md overflow-hidden">
                    {group.options.map((layoutOption, index) => (
                      <LayoutCard
                        key={layoutOption.id}
                        layoutOption={layoutOption}
                        isSelected={layoutOption.id === form.layout}
                        onClick={() => handleSelect(layoutOption.id)}
                        isOdd={index % 2 === 1}
                        isLastRow={index >= group.options.length - 2}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
