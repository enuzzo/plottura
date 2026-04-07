import { Lock, Focus, Unlock } from "lucide-react";

interface MapPrimaryControlsProps {
  isMapEditing: boolean;
  isMarkerEditorActive: boolean;
  recenterHint: string;
  unlockHint: string;
  onRecenter: () => void;
  onStartEditing: () => void;
  onFinishEditing: () => void;
}

export default function MapPrimaryControls({
  isMapEditing,
  isMarkerEditorActive,
  recenterHint,
  unlockHint,
  onRecenter,
  onStartEditing,
  onFinishEditing,
}: MapPrimaryControlsProps) {
  return (
    <>
      {!isMapEditing ? (
        <button
          type="button"
          className="map-control-btn"
          onClick={onRecenter}
          title={recenterHint}
        >
          <Focus className="w-4 h-4" />
          <span>Recenter</span>
        </button>
      ) : null}
      {isMapEditing ? (
        <button
          type="button"
          className="map-control-btn map-control-btn--primary map-control-btn--mode"
          onClick={onFinishEditing}
          title="Lock map editing"
        >
          <Lock className="w-4 h-4" />
          <span>Lock Map</span>
        </button>
      ) : (
        <button
          type="button"
          className="map-control-btn map-control-btn--primary map-control-btn--mode"
          onClick={onStartEditing}
          title={unlockHint}
          disabled={isMarkerEditorActive}
        >
          <Unlock className="w-4 h-4" />
          <span>Edit Map</span>
        </button>
      )}
    </>
  );
}
