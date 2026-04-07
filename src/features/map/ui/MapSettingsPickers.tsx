import LayoutCard from "@/features/layout/ui/LayoutCard";
import PickerModal from "@/shared/ui/PickerModal";
import type { LayoutGroup } from "@/features/layout/domain/types";

interface MapSettingsPickersProps {
  activePicker: string;
  onClosePicker: () => void;
  layoutGroups: LayoutGroup[];
  selectedLayoutId: string;
  onLayoutSelect: (layoutId: string) => void;
}

export default function MapSettingsPickers({
  activePicker,
  onClosePicker,
  layoutGroups,
  selectedLayoutId,
  onLayoutSelect,
}: MapSettingsPickersProps) {
  return (
    <>
      <PickerModal
        open={activePicker === "layout"}
        title="Choose Layout"
        titleId="layout-picker-title"
        onClose={onClosePicker}
      >
        <div className="space-y-4">
          {layoutGroups.map((group) => (
            <section
              key={group.id}
              className="space-y-2"
              aria-label={group.name}
            >
              <h4 className="text-xs font-medium text-text-secondary">{group.name}</h4>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {group.options.map((layoutOption) => (
                  <LayoutCard
                    key={layoutOption.id}
                    layoutOption={layoutOption}
                    isSelected={layoutOption.id === selectedLayoutId}
                    onClick={() => onLayoutSelect(layoutOption.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </PickerModal>
    </>
  );
}
