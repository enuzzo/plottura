import { Lock, Focus, Unlock, Box } from "lucide-react";

interface MapPrimaryControlsProps {
  isMapEditing: boolean;
  isMarkerEditorActive: boolean;
  recenterHint: string;
  unlockHint: string;
  onRecenter: () => void;
  onStartEditing: () => void;
  onFinishEditing: () => void;
  lightColor?: string;
  darkColor?: string;
  is3DEnabled?: boolean;
  onToggle3D?: () => void;
}

const BTN =
  "inline-flex items-center gap-[5px] px-3 py-1.5 text-sm font-semibold uppercase cursor-pointer transition-opacity duration-150 hover:enabled:opacity-80 disabled:opacity-50 disabled:cursor-default";

export default function MapPrimaryControls({
  isMapEditing,
  isMarkerEditorActive,
  recenterHint,
  unlockHint,
  onRecenter,
  onStartEditing,
  onFinishEditing,
  lightColor = "#ffffff",
  darkColor = "#1a1a1a",
  is3DEnabled = false,
  onToggle3D,
}: MapPrimaryControlsProps) {
  const notchStyle = { backgroundColor: darkColor, color: `${lightColor}cc` };
  const dividerStyle = { backgroundColor: `${lightColor}20` };

  return (
    <div
      className="inline-flex items-stretch rounded-t-xl overflow-hidden"
      style={notchStyle}
    >
      <button
        type="button"
        className={BTN}
        onClick={onRecenter}
        title={recenterHint}
      >
        <Focus className="w-4 h-4" />
        <span>Recenter</span>
      </button>

      <div className="w-px self-stretch my-1.5" style={dividerStyle} />

      {isMapEditing ? (
        <button
          type="button"
          className={BTN}
          onClick={onFinishEditing}
          title="Lock map editing"
        >
          <Lock className="w-4 h-4" />
          <span>Lock Map</span>
        </button>
      ) : (
        <button
          type="button"
          className={BTN}
          onClick={onStartEditing}
          title={unlockHint}
          disabled={isMarkerEditorActive}
        >
          <Unlock className="w-4 h-4" />
          <span>Edit Map</span>
        </button>
      )}

      {onToggle3D ? (
        <>
          <div className="w-px self-stretch my-1.5" style={dividerStyle} />
          <button
            type="button"
            className={BTN}
            onClick={onToggle3D}
            title={is3DEnabled ? "Switch to 2D view" : "Switch to 3D view"}
          >
            <Box className="w-4 h-4" />
            <span>{is3DEnabled ? "2D" : "3D"}</span>
          </button>
        </>
      ) : null}
    </div>
  );
}
