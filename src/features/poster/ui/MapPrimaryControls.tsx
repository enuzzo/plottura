import { Lock, Focus, Unlock } from "lucide-react";

const CTL_BTN = "inline-flex items-center gap-[5px] px-3 py-1.5 border border-[var(--border)] rounded-lg bg-[var(--bg-card)] text-[var(--text-secondary)] text-[0.78rem] cursor-pointer transition-[background,border-color] duration-150 hover:enabled:bg-[var(--accent-subtle)] hover:enabled:border-[var(--accent)] hover:enabled:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-default";
const CTL_BTN_PRIMARY = `${CTL_BTN} !bg-[var(--accent-subtle)] !border-[var(--accent)] !text-[var(--accent)] hover:enabled:!bg-[var(--accent)] hover:enabled:!text-white`;

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
          className={CTL_BTN}
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
          className={CTL_BTN_PRIMARY}
          onClick={onFinishEditing}
          title="Lock map editing"
        >
          <Lock className="w-4 h-4" />
          <span>Lock Map</span>
        </button>
      ) : (
        <button
          type="button"
          className={CTL_BTN_PRIMARY}
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
