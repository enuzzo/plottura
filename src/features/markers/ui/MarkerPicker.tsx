import {
  memo,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import type { MarkerIconDefinition } from "@/features/markers/domain/types";
import {
  featuredMarkerIcons,
  predefinedMarkerIcons,
} from "@/features/markers/infrastructure/iconRegistry";
import MarkerVisual from "./MarkerVisual";

interface MarkerPickerProps {
  selectedIconId?: string;
  markerColor: string;
  customIcons: MarkerIconDefinition[];
  onIconClick: (iconId: string) => void;
  onUploadIcon?: (file: File) => void | Promise<void>;
  onRemoveUploadedIcon?: (iconId: string) => void;
  onClearUploadedIcons?: () => void;
  actionSlot?: ReactNode;
}

const MarkerPicker = memo(function MarkerPicker({
  selectedIconId,
  markerColor,
  customIcons,
  onIconClick,
  onUploadIcon,
  onRemoveUploadedIcon,
  onClearUploadedIcons,
  actionSlot,
}: MarkerPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const appIcons = useMemo(() => predefinedMarkerIcons, []);
  const shouldShowAllIcons =
    isExpanded ||
    (selectedIconId
      ? !appIcons.some((icon) => icon.id === selectedIconId)
      : false);
  const visibleAppIcons = shouldShowAllIcons ? appIcons : featuredMarkerIcons;

  const handleUploadChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onUploadIcon) {
      return;
    }

    if (
      !file.type.startsWith("image/") &&
      !file.name.toLowerCase().endsWith(".svg")
    ) {
      setUploadError("Upload an image or SVG file.");
      return;
    }

    setUploadError("");
    setIsExpanded(true);

    try {
      await onUploadIcon(file);
    } catch {
      setUploadError("Could not upload marker.");
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Marker Icons</p>
      <div className="grid grid-cols-4 gap-1.5">
        {visibleAppIcons.map((icon) => (
          <button
            key={icon.id}
            type="button"
            className={`flex flex-col items-center gap-1 rounded-md p-2 text-center transition-colors ${
              selectedIconId === icon.id
                ? "bg-accent/10 ring-1 ring-accent"
                : "hover:bg-surface-hover"
            }`}
            onClick={() => onIconClick(icon.id)}
            title={icon.label}
          >
            <MarkerVisual icon={icon} size={30} color={markerColor} />
            <span className="text-[10px] text-text-secondary truncate w-full">{icon.label}</span>
          </button>
        ))}
        {appIcons.length > featuredMarkerIcons.length ? (
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 rounded-md p-2 text-center hover:bg-surface-hover transition-colors"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={shouldShowAllIcons ? "Show icon list" : "Show more icons"}
          >
            <span className="text-lg font-bold text-text-secondary" aria-hidden="true">
              {shouldShowAllIcons ? "-" : "+"}
            </span>
            <span className="text-[10px] text-text-secondary">
              {shouldShowAllIcons ? "Show less" : "More Icons"}
            </span>
          </button>
        ) : null}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Uploaded Markers</p>
      <div className="grid grid-cols-4 gap-1.5">
        {customIcons.map((icon) => (
          <button
            key={icon.id}
            type="button"
            className={`relative flex flex-col items-center gap-1 rounded-md p-2 text-center transition-colors ${
              selectedIconId === icon.id
                ? "bg-accent/10 ring-1 ring-accent"
                : "hover:bg-surface-hover"
            }`}
            onClick={() => onIconClick(icon.id)}
            title={icon.label}
          >
            {onRemoveUploadedIcon ? (
              <span
                role="button"
                tabIndex={0}
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-card border border-border text-[10px] text-text-secondary hover:text-red-500 transition-colors"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveUploadedIcon(icon.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onRemoveUploadedIcon(icon.id);
                  }
                }}
                aria-label={`Remove uploaded icon ${icon.label}`}
                title="Remove uploaded icon"
              >
                x
              </span>
            ) : null}
            <MarkerVisual icon={icon} size={30} color={markerColor} />
            <span className="text-[10px] text-text-secondary truncate w-full">{icon.label}</span>
          </button>
        ))}

        {onUploadIcon ? (
          <>
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border p-2 text-center hover:bg-surface-hover transition-colors"
              onClick={() => inputRef.current?.click()}
              title="Upload marker"
            >
              <span className="text-lg font-bold text-text-secondary" aria-hidden="true">
                +
              </span>
              <span className="text-[10px] text-text-secondary">Upload Marker</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".svg,image/*"
              className="hidden"
              onChange={handleUploadChange}
            />
          </>
        ) : null}
      </div>

      {onClearUploadedIcons && customIcons.length > 0 ? (
        <div>
          <button
            type="button"
            className="text-xs text-text-secondary hover:text-red-500 transition-colors"
            onClick={onClearUploadedIcons}
          >
            Remove uploaded icons from storage
          </button>
        </div>
      ) : null}

      {actionSlot ? (
        <>
          <div className="border-t border-border" />
          <div>{actionSlot}</div>
        </>
      ) : null}

      {uploadError ? <p className="text-xs text-red-500">{uploadError}</p> : null}
    </div>
  );
});

export default MarkerPicker;
