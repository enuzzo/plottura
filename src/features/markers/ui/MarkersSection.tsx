import { useCallback, useEffect, useMemo, useState } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import type {
  MarkerDefaults,
  MarkerItem,
} from "@/features/markers/domain/types";
import MarkerPicker from "./MarkerPicker";
import {
  createMarkerItem,
  createUploadedMarkerIcon,
  getUploadLabel,
} from "@/features/markers/infrastructure/helpers";
import { findMarkerIcon } from "@/features/markers/infrastructure/iconRegistry";
import {
  DEFAULT_MARKER_SIZE,
  MAX_MARKER_SIZE,
  MIN_MARKER_SIZE,
} from "@/features/markers/domain/constants";
import MarkerVisual from "./MarkerVisual";
import {
  Check,
  Info,
  Pencil,
  RotateCcw,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import ColorPicker from "@/features/theme/ui/ColorPicker";
import { buildDynamicColorChoices } from "@/features/theme/domain/colorSuggestions";
import {
  DISPLAY_PALETTE_KEYS,
  type ThemeColorKey,
} from "@/features/theme/domain/types";
import { getThemeColorByPath } from "@/features/theme/domain/colorPaths";
import { normalizeHexColor } from "@/shared/utils/color";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read marker upload."));
    reader.readAsDataURL(file);
  });
}

function isSvgFile(file: File) {
  return (
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")
  );
}

function formatCoordinate(value: number) {
  return Number(value).toFixed(6);
}

function DeleteAllMarkersDialog({
  open,
  markerCount,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  markerCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="max-w-sm" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Delete all markers?</DialogTitle>
          <DialogDescription>
            This will remove {markerCount} marker{markerCount === 1 ? "" : "s"}{" "}
            from the map.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-2 pt-4">
          <button
            type="button"
            className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors"
            onClick={onCancel}
          >
            Keep markers
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            onClick={onConfirm}
          >
            <Trash2 size={14} />
            Delete all markers
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MarkersSection() {
  const { state, dispatch, mapRef, effectiveTheme } = usePosterContext();
  const {
    form,
    markers,
    customMarkerIcons,
    markerDefaults,
    isMarkerEditorActive,
    activeMarkerId,
  } = state;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDefaultColorPickerOpen, setIsDefaultColorPickerOpen] =
    useState(false);
  const [openMarkerColorPickerId, setOpenMarkerColorPickerId] = useState<
    string | null
  >(null);
  const [expandedMarkerId, setExpandedMarkerId] = useState<string | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const markerThemeColor = effectiveTheme.ui.text;
  const hasMarkers = markers.length > 0;
  const isColorPickerFocused =
    isMarkerEditorActive &&
    expandedMarkerId !== null &&
    openMarkerColorPickerId === expandedMarkerId;

  const toggleMarkerEditor = useCallback((markerId: string) => {
    setExpandedMarkerId((current) => {
      const next = current === markerId ? null : markerId;
      dispatch({ type: "SET_ACTIVE_MARKER", markerId: next });
      return next;
    });
    setOpenMarkerColorPickerId((current) =>
      current === markerId ? null : current,
    );
  }, [dispatch]);

  const openMarkerEditor = useCallback(
    (markerId: string) => {
      setExpandedMarkerId(markerId);
      setOpenMarkerColorPickerId(null);
      dispatch({ type: "SET_ACTIVE_MARKER", markerId });
    },
    [dispatch],
  );

  const removeMarker = useCallback(
    (markerId: string) => {
      dispatch({ type: "REMOVE_MARKER", markerId });
      if (activeMarkerId === markerId) {
        dispatch({ type: "SET_ACTIVE_MARKER", markerId: null });
        setExpandedMarkerId(null);
        setOpenMarkerColorPickerId(null);
      }
    },
    [activeMarkerId, dispatch],
  );

  const updateMarker = useCallback(
    (markerId: string, changes: Partial<MarkerItem>) => {
      dispatch({ type: "UPDATE_MARKER", markerId, changes });
    },
    [dispatch],
  );

  const applyMarkerDefaults = useCallback(
    (defaults: Partial<MarkerDefaults>) => {
      dispatch({
        type: "SET_MARKER_DEFAULTS",
        defaults,
        applyToMarkers: true,
      });
    },
    [dispatch],
  );

  const addMarker = useCallback(
    (iconId: string) => {
      const center = mapRef.current?.getCenter();
      const fallbackLat = Number(form.latitude) || 0;
      const fallbackLon = Number(form.longitude) || 0;
      const lat = center?.lat ?? fallbackLat;
      const lon = center?.lng ?? fallbackLon;

      dispatch({
        type: "ADD_MARKER",
        marker: createMarkerItem({
          lat,
          lon,
          iconId,
          defaults: markerDefaults,
        }),
      });
    },
    [dispatch, form.latitude, form.longitude, mapRef, markerDefaults],
  );

  const handleUploadIcon = useCallback(
    async (file: File) => {
      const dataUrl = await readFileAsDataUrl(file);
      const icon = createUploadedMarkerIcon({
        label: getUploadLabel(file.name),
        dataUrl,
        tintWithMarkerColor: isSvgFile(file),
      });

      dispatch({ type: "ADD_CUSTOM_MARKER_ICON", icon });
      addMarker(icon.id);
    },
    [addMarker, dispatch],
  );

  const markerRows = useMemo(
    () => {
      const iconCounts = new Map<string, number>();
      return markers.map((marker, index) => {
        const icon = findMarkerIcon(marker.iconId, customMarkerIcons);
        const iconLabel = String(icon?.label ?? "Marker").trim() || "Marker";
        const nextCount = (iconCounts.get(iconLabel) ?? 0) + 1;
        iconCounts.set(iconLabel, nextCount);
        return {
          marker,
          index,
          icon,
          markerLabel: `${iconLabel} ${nextCount}`,
          isExpanded: expandedMarkerId === marker.id,
        };
      });
    },
    [customMarkerIcons, expandedMarkerId, markers],
  );

  const markerColorPalette = useMemo(
    () =>
      DISPLAY_PALETTE_KEYS.map((key) =>
        getThemeColorByPath(effectiveTheme, key as ThemeColorKey),
      ).filter(Boolean),
    [effectiveTheme],
  );

  const defaultColorChoices = useMemo(
    () => buildDynamicColorChoices(markerDefaults.color, markerColorPalette),
    [markerDefaults.color, markerColorPalette],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mediaQuery = window.matchMedia(
      "(max-width: 768px), (hover: none) and (pointer: coarse)",
    );
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (isMarkerEditorActive) {
      return;
    }
    setExpandedMarkerId(null);
    setOpenMarkerColorPickerId(null);
    setIsDefaultColorPickerOpen(false);
  }, [isMarkerEditorActive]);

  useEffect(() => {
    if (!isMarkerEditorActive) {
      return;
    }

    if (!activeMarkerId) {
      return;
    }

    const activeMarkerStillExists = markers.some(
      (marker) => marker.id === activeMarkerId,
    );
    if (!activeMarkerStillExists) {
      setExpandedMarkerId(null);
      setOpenMarkerColorPickerId(null);
      return;
    }

    setExpandedMarkerId(activeMarkerId);
  }, [activeMarkerId, isMarkerEditorActive, markers]);

  const toggleMarkerSettings = useCallback(() => {
    setIsSettingsOpen((current) => {
      const next = !current;
      if (!next) {
        setIsDefaultColorPickerOpen(false);
      }
      return next;
    });
  }, []);

  const toggleDefaultColorPicker = useCallback(() => {
    setIsDefaultColorPickerOpen((current) => !current);
  }, []);

  const handleResetMarkers = useCallback(() => {
    dispatch({
      type: "SET_MARKER_DEFAULTS",
      defaults: { size: DEFAULT_MARKER_SIZE, color: markerThemeColor },
      applyToMarkers: true,
    });
  }, [dispatch, markerThemeColor]);

  const handleDeleteAllMarkers = useCallback(() => {
    if (markers.length > 0) {
      setIsDeleteAllModalOpen(true);
    }
  }, [markers.length]);

  const toggleMarkerEditMode = useCallback(() => {
    const next = !isMarkerEditorActive;
    if (next) {
      setIsSettingsOpen(false);
      setIsDefaultColorPickerOpen(false);
    }
    dispatch({ type: "SET_MARKER_EDITOR_ACTIVE", active: next });
    if (!next) {
      dispatch({ type: "SET_ACTIVE_MARKER", markerId: null });
      setExpandedMarkerId(null);
      setOpenMarkerColorPickerId(null);
    }
  }, [dispatch, isMarkerEditorActive]);

  const visibleMarkerRows =
    isMarkerEditorActive && expandedMarkerId
      ? markerRows.filter(({ marker }) => marker.id === expandedMarkerId)
      : markerRows;
  const activeColorPickerMarker =
    expandedMarkerId && openMarkerColorPickerId === expandedMarkerId
      ? markerRows.find(({ marker }) => marker.id === expandedMarkerId) ?? null
      : null;
  const activeMarkerColorChoices = activeColorPickerMarker
    ? buildDynamicColorChoices(activeColorPickerMarker.marker.color, markerColorPalette)
    : null;
  const markerHelpText = isMobileViewport
    ? "Click an icon to drop a marker on the current map location. Marker settings apply to all markers and can be moved directly on the map. In marker edit mode, drag to move markers and use the marker size slider below the location row to resize."
    : "Click an icon to drop a marker on the current map location. Marker settings apply to all markers and can be moved directly on the map. In marker edit mode, drag to move, use the arrow keys for fine nudging, use two-finger pinch or mouse wheel to resize, and use scroll or the +/- map controls to zoom.";

  return (
    <section className="space-y-3">
      <DeleteAllMarkersDialog
        open={isDeleteAllModalOpen}
        markerCount={markers.length}
        onCancel={() => setIsDeleteAllModalOpen(false)}
        onConfirm={() => {
          dispatch({ type: "CLEAR_MARKERS" });
          setExpandedMarkerId(null);
          setOpenMarkerColorPickerId(null);
          setIsDeleteAllModalOpen(false);
        }}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Markers</p>
        <div className="flex items-center gap-1">
          {!isMarkerEditorActive ? (
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                isSettingsOpen
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
              onClick={toggleMarkerSettings}
              aria-label={
                isSettingsOpen
                  ? "Done with marker settings"
                  : "Open marker settings"
              }
              title={
                isSettingsOpen
                  ? "Done with marker settings"
                  : "Open marker settings"
              }
            >
              {isSettingsOpen ? <Check size={14} /> : <Settings size={14} />}
              {isSettingsOpen ? <span>Done</span> : null}
            </button>
          ) : null}
          {isMarkerEditorActive || !isSettingsOpen ? (
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                isMarkerEditorActive
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
              onClick={toggleMarkerEditMode}
              aria-label={
                isMarkerEditorActive ? "Done editing markers" : "Edit markers"
              }
              title={
                isMarkerEditorActive ? "Done editing markers" : "Edit markers"
              }
              disabled={!isMarkerEditorActive && !hasMarkers}
            >
              {isMarkerEditorActive ? <Check size={14} /> : <Pencil size={14} />}
              <span>
                {isMarkerEditorActive ? "Done" : "Edit Markers"}
              </span>
            </button>
          ) : null}
          <div className="group relative">
            <button
              type="button"
              className="rounded-md p-1 text-text-secondary hover:bg-surface-hover transition-colors"
              aria-label="Marker picker help"
            >
              <Info size={14} />
            </button>
            <div className="pointer-events-none absolute right-0 top-full z-30 mt-1 hidden w-64 rounded-md bg-card p-3 text-xs text-text-secondary shadow-lg border border-border group-hover:block" role="tooltip">
              {markerHelpText}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {!isMarkerEditorActive && !isSettingsOpen ? (
          <MarkerPicker
            markerColor={markerDefaults.color}
            customIcons={customMarkerIcons}
            onIconClick={addMarker}
            onUploadIcon={handleUploadIcon}
            onRemoveUploadedIcon={(iconId) =>
              dispatch({ type: "REMOVE_CUSTOM_MARKER_ICON", iconId })
            }
            onClearUploadedIcons={() =>
              dispatch({ type: "CLEAR_CUSTOM_MARKER_ICONS" })
            }
          />
        ) : null}

        {!isMarkerEditorActive && isSettingsOpen ? (
          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Marker Settings</h3>
            </div>
            <p className="text-xs text-text-secondary">
              Marker settings apply to all markers. Unlock markers to edit each
              marker directly.
            </p>

            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-text-secondary">Default Size</span>
                <div className="flex items-center gap-2">
                  <input
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-surface-hover accent-accent"
                    type="range"
                    min={MIN_MARKER_SIZE}
                    max={MAX_MARKER_SIZE}
                    step="1"
                    value={markerDefaults.size}
                    onChange={(event) =>
                      applyMarkerDefaults({
                        size: Number(event.target.value),
                      })
                    }
                  />
                  <input
                    className="w-16 rounded-md border border-border bg-surface px-2 py-1 text-sm text-text"
                    type="number"
                    min={MIN_MARKER_SIZE}
                    max={MAX_MARKER_SIZE}
                    step="1"
                    value={markerDefaults.size}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      if (Number.isFinite(nextValue)) {
                        applyMarkerDefaults({
                          size: Math.max(MIN_MARKER_SIZE, Math.min(MAX_MARKER_SIZE, nextValue)),
                        });
                      }
                    }}
                  />
                </div>
              </label>

              <div className="space-y-1">
                <span className="text-xs font-medium text-text-secondary">
                  Default Color
                </span>
                <div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm hover:bg-surface-hover transition-colors"
                    onClick={toggleDefaultColorPicker}
                  >
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-border"
                      aria-hidden="true"
                      style={{
                        backgroundColor:
                          normalizeHexColor(markerDefaults.color) || "#000000",
                      }}
                    />
                    <span className="text-text">
                      {markerDefaults.color}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {isDefaultColorPickerOpen ? (
              <ColorPicker
                currentColor={markerDefaults.color}
                suggestedColors={defaultColorChoices.suggestedColors}
                moreColors={defaultColorChoices.moreColors}
                onChange={(color) => applyMarkerDefaults({ color })}
                onResetColor={() =>
                  applyMarkerDefaults({ color: markerThemeColor })
                }
              />
            ) : null}
          </div>
        ) : null}

        {isMarkerEditorActive ? (
          <>
            {isColorPickerFocused && activeColorPickerMarker ? (
              <article className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Edit Marker Color</h3>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-hover transition-colors"
                    onClick={() => setOpenMarkerColorPickerId(null)}
                  >
                    <span>Done</span>
                  </button>
                </div>
                <ColorPicker
                  currentColor={activeColorPickerMarker.marker.color}
                  suggestedColors={activeMarkerColorChoices!.suggestedColors}
                  moreColors={activeMarkerColorChoices!.moreColors}
                  onChange={(color) =>
                    updateMarker(activeColorPickerMarker.marker.id, { color })
                  }
                  onResetColor={() =>
                    updateMarker(activeColorPickerMarker.marker.id, {
                      color: markerDefaults.color,
                    })
                  }
                />
              </article>
            ) : (
              <>
                {visibleMarkerRows.length > 0 ? (
                  <>
                    {isMobileViewport && !expandedMarkerId ? (
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" role="list">
                        {markerRows.map(({ marker, icon, markerLabel }) => {
                          const isSelected = marker.id === activeMarkerId;
                          return (
                            <article
                              key={marker.id}
                              className={`relative flex-shrink-0 rounded-lg border p-2 text-center transition-colors ${
                                isSelected
                                  ? "border-accent bg-accent/10"
                                  : "border-border bg-card hover:bg-surface-hover"
                              }`}
                              role="listitem"
                            >
                              <button
                                type="button"
                                className="absolute -right-1 -top-1 rounded-full bg-card border border-border p-0.5 text-text-secondary hover:text-red-500 transition-colors"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeMarker(marker.id);
                                }}
                                title="Delete marker"
                                aria-label={`Delete ${markerLabel}`}
                              >
                                <X size={12} />
                              </button>
                              <button
                                type="button"
                                className="flex flex-col items-center gap-1 px-2"
                                onClick={() => openMarkerEditor(marker.id)}
                                title={`Edit ${markerLabel}`}
                              >
                                {icon ? (
                                  <MarkerVisual
                                    icon={icon}
                                    size={24}
                                    color={marker.color}
                                  />
                                ) : null}
                                <span className="text-[10px] text-text-secondary whitespace-nowrap">
                                  {markerLabel}
                                </span>
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    ) : !expandedMarkerId ? (
                      <div className="grid grid-cols-3 gap-2" role="list">
                        {markerRows.map(({ marker, icon, markerLabel }) => {
                          const isSelected = marker.id === activeMarkerId;
                          return (
                            <article
                              key={marker.id}
                              className={`relative rounded-lg border p-2 text-center transition-colors ${
                                isSelected
                                  ? "border-accent bg-accent/10"
                                  : "border-border bg-card hover:bg-surface-hover"
                              }`}
                              role="listitem"
                            >
                              <button
                                type="button"
                                className="absolute -right-1 -top-1 rounded-full bg-card border border-border p-0.5 text-text-secondary hover:text-red-500 transition-colors"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeMarker(marker.id);
                                }}
                                title="Delete marker"
                                aria-label={`Delete ${markerLabel}`}
                              >
                                <X size={12} />
                              </button>
                              <button
                                type="button"
                                className="flex flex-col items-center gap-1 w-full"
                                onClick={() => openMarkerEditor(marker.id)}
                                title={`Edit ${markerLabel}`}
                              >
                                {icon ? (
                                  <MarkerVisual
                                    icon={icon}
                                    size={24}
                                    color={marker.color}
                                  />
                                ) : null}
                                <span className="text-[10px] text-text-secondary truncate w-full">
                                  {markerLabel}
                                </span>
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {visibleMarkerRows.map(
                          ({ marker, icon, markerLabel, isExpanded }) => {
                            return (
                              <article key={marker.id} className="rounded-lg border border-border bg-card p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {icon ? (
                                      <MarkerVisual
                                        icon={icon}
                                        size={26}
                                        color={marker.color}
                                      />
                                    ) : null}
                                    <span className="text-sm font-medium">{markerLabel}</span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-hover transition-colors"
                                      onClick={() => toggleMarkerEditor(marker.id)}
                                      title={
                                        isExpanded
                                          ? "Finish marker editing"
                                          : "Edit marker"
                                      }
                                    >
                                      {isExpanded ? <Check size={14} /> : <Pencil size={14} />}
                                      <span>
                                        {isExpanded ? "Done" : "Edit"}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      className="rounded-md p-1 text-text-secondary hover:text-red-500 transition-colors"
                                      onClick={() => removeMarker(marker.id)}
                                      title="Delete marker"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {isExpanded ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="block space-y-1">
                                        <span className="text-xs font-medium text-text-secondary">Latitude</span>
                                        <input
                                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm text-text"
                                          type="number"
                                          step="0.000001"
                                          min={-90}
                                          max={90}
                                          value={formatCoordinate(marker.lat)}
                                          onChange={(event) => {
                                            const nextValue = Number(event.target.value);
                                            if (Number.isFinite(nextValue)) {
                                              updateMarker(marker.id, {
                                                lat: Math.max(-90, Math.min(90, nextValue)),
                                              });
                                            }
                                          }}
                                        />
                                      </label>
                                      <label className="block space-y-1">
                                        <span className="text-xs font-medium text-text-secondary">Longitude</span>
                                        <input
                                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm text-text"
                                          type="number"
                                          step="0.000001"
                                          min={-180}
                                          max={180}
                                          value={formatCoordinate(marker.lon)}
                                          onChange={(event) => {
                                            const nextValue = Number(event.target.value);
                                            if (Number.isFinite(nextValue)) {
                                              updateMarker(marker.id, {
                                                lon: Math.max(-180, Math.min(180, nextValue)),
                                              });
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>

                                    <div className="space-y-3">
                                      <label className="block space-y-1">
                                        <span className="text-xs font-medium text-text-secondary">Size</span>
                                        <div className="flex items-center gap-2">
                                          <input
                                            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-surface-hover accent-accent"
                                            type="range"
                                            min={MIN_MARKER_SIZE}
                                            max={MAX_MARKER_SIZE}
                                            step="1"
                                            value={marker.size}
                                            onChange={(event) =>
                                              updateMarker(marker.id, {
                                                size: Number(event.target.value),
                                              })
                                            }
                                          />
                                          <input
                                            className="w-16 rounded-md border border-border bg-surface px-2 py-1 text-sm text-text"
                                            type="number"
                                            min={MIN_MARKER_SIZE}
                                            max={MAX_MARKER_SIZE}
                                            step="1"
                                            value={marker.size}
                                            onChange={(event) => {
                                              const nextValue = Number(event.target.value);
                                              if (Number.isFinite(nextValue)) {
                                                updateMarker(marker.id, {
                                                  size: Math.max(MIN_MARKER_SIZE, Math.min(MAX_MARKER_SIZE, nextValue)),
                                                });
                                              }
                                            }}
                                          />
                                        </div>
                                      </label>
                                      <div className="space-y-1">
                                        <span className="text-xs font-medium text-text-secondary">
                                          Color
                                        </span>
                                        <div>
                                          <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm hover:bg-surface-hover transition-colors"
                                            onClick={() =>
                                              setOpenMarkerColorPickerId((current) =>
                                                current === marker.id ? null : marker.id,
                                              )
                                            }
                                          >
                                            <span
                                              className="inline-block h-4 w-4 rounded-full border border-border"
                                              aria-hidden="true"
                                              style={{
                                                backgroundColor:
                                                  normalizeHexColor(marker.color) || "#000000",
                                              }}
                                            />
                                            <span className="text-text">
                                              {marker.color}
                                            </span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                              </article>
                            );
                          },
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-text-secondary">
                    Add at least one marker, then unlock markers to edit.
                  </p>
                )}
                {!expandedMarkerId && hasMarkers ? (
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {isMobileViewport
                      ? "Swipe the marker row to choose one, then tap it to edit. Drag it on the map to move it, and use the marker-size slider below the location row to resize."
                      : "Click a marker card to edit it. Drag the selected marker on the map to move it, use the arrow keys for fine nudging, then adjust size and color in the editor."}
                  </p>
                ) : null}

                {!expandedMarkerId && hasMarkers ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-hover transition-colors"
                      onClick={handleResetMarkers}
                      title="Reset all markers"
                    >
                      <RotateCcw size={14} />
                      <span>Reset Markers</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                      onClick={handleDeleteAllMarkers}
                      title="Delete all markers"
                    >
                      <Trash2 size={14} />
                      <span>
                        Delete All Markers
                      </span>
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
