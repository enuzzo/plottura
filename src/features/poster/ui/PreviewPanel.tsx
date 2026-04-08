import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePosterContext } from "./PosterContext";
import { useMapSync } from "@/features/map/application/useMapSync";
import MapPreview from "@/features/map/ui/MapPreview";
import MarkerOverlay from "@/features/markers/ui/MarkerOverlay";
import GradientFades from "./GradientFades";
import PosterTextOverlay from "./PosterTextOverlay";
import MapPrimaryControls from "./MapPrimaryControls";
import { ZoomIn, ZoomOut, RotateCw, RotateCcw } from "lucide-react";
import {
  MAP_BUTTON_ZOOM_DURATION_MS,
  MAP_BUTTON_ZOOM_STEP,
} from "@/features/map/infrastructure";
import { MAP_OVERZOOM_SCALE } from "@/features/map/infrastructure/constants";
import {
  DEFAULT_POSTER_WIDTH_CM,
  DEFAULT_POSTER_HEIGHT_CM,
  DEFAULT_DISTANCE_METERS,
  DEFAULT_LAT,
  DEFAULT_LON,
  DEFAULT_CITY,
  DEFAULT_COUNTRY,
} from "@/core/config";
import { ensureGoogleFont, reverseGeocodeCoordinates } from "@/core/services";
import {
  createCustomLayoutOption,
  formatLayoutDimensions,
  getLayoutOption,
} from "@/features/layout/infrastructure/layoutRepository";

const LOCKED_HINT = "Map is locked to prevent unintended movement.";
const UNLOCK_HINT = `${LOCKED_HINT}\nClick to unlock map editing.`;
const RECENTER_HINT = "Recenter map to the current location";
const COUNTRY_VIEW_ZOOM_LEVEL = 10;
const CONTINENT_VIEW_ZOOM_LEVEL = 6;
const DEFAULT_LOCATION_LABEL =
  "Hanover, Region Hannover, Lower Saxony, Germany";

/* Tailwind class constants for map control buttons */
const CTL_BTN = "inline-flex items-center gap-[5px] px-3 py-1.5 border border-[var(--border)] rounded-lg bg-[var(--bg-card)] text-[var(--text-secondary)] text-[0.78rem] cursor-pointer transition-[background,border-color] duration-150 hover:enabled:bg-[var(--accent-subtle)] hover:enabled:border-[var(--accent)] hover:enabled:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-default";
const CTL_BTN_PRIMARY = `${CTL_BTN} !bg-[var(--accent-subtle)] !border-[var(--accent)] !text-[var(--accent)] hover:enabled:!bg-[var(--accent)] hover:enabled:!text-white`;
const CTL_BTN_ACTIVE = "!bg-[var(--accent-subtle)] !border-[var(--accent)] !text-[var(--accent)]";
const CTL_GROUP = "flex flex-nowrap justify-center gap-1.5 items-center max-[768px]:w-full";
const CTL_SLIDER_ROW = `${CTL_GROUP} w-[min(560px,100%)] !grid grid-cols-[auto_minmax(180px,1fr)_auto] gap-2`;
const CTL_SLIDER = "w-full h-1.5 m-0 rounded-full appearance-none bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--border)] [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_var(--bg-card)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[var(--border)] [&::-moz-range-thumb]:bg-[var(--accent)] [&::-moz-range-thumb]:shadow-[0_0_0_2px_var(--bg-card)] [&::-moz-range-thumb]:cursor-pointer";

export default function PreviewPanel() {
  const { state, dispatch, effectiveTheme, mapStyle, mapRef } =
    usePosterContext();
  const {
    form,
    selectedLocation,
    userLocation,
    isMarkerEditorActive,
    activeMarkerId,
  } = state;
  const hasVisibleMarkers = form.showMarkers && state.markers.length > 0;
  const {
    mapCenter,
    mapZoom,
    mapMinZoom,
    mapMaxZoom,
    handleMove,
    handleMoveEnd,
    setContainerWidth,
  } = useMapSync(state, dispatch, mapRef);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const ghostCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mapBearing, setMapBearing] = useState(0);
  const [isRotationEnabled, setIsRotationEnabled] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(
      "(max-width: 768px), (hover: none) and (pointer: coarse)",
    );
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [setContainerWidth]);

  useEffect(() => {
    const family = form.fontFamily.trim();
    if (!family) return;

    void ensureGoogleFont(family).catch(() => {
      // Ignore font loading failures; fallback stack remains in place.
    });
  }, [form.fontFamily]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const syncBearing = () => {
      setMapBearing(map.getBearing());
    };

    map.on("rotate", syncBearing);
    return () => {
      map.off("rotate", syncBearing);
    };
  }, [mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const syncGhostCanvas = () => {
      const ghost = ghostCanvasRef.current;
      if (!ghost) return;
      const src = map.getCanvas();
      if (!src) return;

      if (ghost.width !== src.width || ghost.height !== src.height) {
        ghost.width = src.width;
        ghost.height = src.height;
      }

      const ctx = ghost.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(src, 0, 0);
    };

    map.on("render", syncGhostCanvas);
    return () => {
      map.off("render", syncGhostCanvas);
    };
  }, [mapRef]);

  useEffect(() => {
    if (!isMarkerEditorActive) {
      return;
    }
    setIsEditing(false);
    setIsRotationEnabled(false);
  }, [isMarkerEditorActive]);

  const widthCm = Number(form.width) || DEFAULT_POSTER_WIDTH_CM;
  const heightCm = Number(form.height) || DEFAULT_POSTER_HEIGHT_CM;
  const aspect = widthCm / heightCm;
  const formLat = Number(form.latitude) || 0;
  const formLon = Number(form.longitude) || 0;
  const layoutOption =
    getLayoutOption(form.layout) ?? createCustomLayoutOption(widthCm, heightCm);
  const layoutLabel = `${layoutOption.name} (${formatLayoutDimensions(layoutOption)})`;
  const isCityCountryView = mapZoom >= COUNTRY_VIEW_ZOOM_LEVEL;
  const isCountryContinentView =
    mapZoom >= CONTINENT_VIEW_ZOOM_LEVEL && mapZoom < COUNTRY_VIEW_ZOOM_LEVEL;
  const cityLabel = isCityCountryView
    ? form.displayCity || form.location || "Hanover"
    : isCountryContinentView
      ? form.displayCountry || "Germany"
      : form.displayContinent || "Earth";
  const countryLabel = isCityCountryView
    ? form.displayCountry || "Germany"
    : isCountryContinentView
      ? form.displayContinent || "Europe"
      : "Earth";

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
    const map = mapRef.current;
    if (map) {
      setMapBearing(map.getBearing());
    }
  }, [mapRef]);

  const handleFinishEditing = useCallback(() => {
    setIsEditing(false);
    setIsRotationEnabled(false);
  }, []);

  const handleToggleRotation = useCallback(() => {
    setIsRotationEnabled((prev) => !prev);
  }, []);

  const handleZoomIn = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextZoom = Math.min(map.getZoom() + MAP_BUTTON_ZOOM_STEP, mapMaxZoom);
    if (Math.abs(nextZoom - map.getZoom()) < 0.0001) return;

    map.zoomTo(nextZoom, { duration: MAP_BUTTON_ZOOM_DURATION_MS });
  }, [mapRef, mapMaxZoom]);

  const handleZoomOut = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextZoom = Math.max(map.getZoom() - MAP_BUTTON_ZOOM_STEP, mapMinZoom);
    if (Math.abs(nextZoom - map.getZoom()) < 0.0001) return;

    map.zoomTo(nextZoom, { duration: MAP_BUTTON_ZOOM_DURATION_MS });
  }, [mapRef, mapMinZoom]);

  const handleZoomSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const map = mapRef.current;
      if (!map) return;
      const nextZoom = Number(event.target.value);
      if (!Number.isFinite(nextZoom)) return;
      map.zoomTo(nextZoom, { duration: MAP_BUTTON_ZOOM_DURATION_MS });
    },
    [mapRef],
  );

  const handleRotationSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const map = mapRef.current;
      if (!map) return;
      const nextBearing = Number(event.target.value);
      if (!Number.isFinite(nextBearing)) return;
      setMapBearing(nextBearing);
      map.rotateTo(nextBearing, { duration: MAP_BUTTON_ZOOM_DURATION_MS });
    },
    [mapRef],
  );

  const handleRotateBy = useCallback(
    (deltaDeg: number) => {
      const map = mapRef.current;
      if (!map) return;
      const current = map.getBearing();
      const nextBearing = Math.max(-180, Math.min(180, current + deltaDeg));
      setMapBearing(nextBearing);
      map.rotateTo(nextBearing, { duration: MAP_BUTTON_ZOOM_DURATION_MS });
    },
    [mapRef],
  );

  const handleRecenter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const target = selectedLocation ||
      userLocation || {
        id: "fallback:hanover",
        label: DEFAULT_LOCATION_LABEL,
        city: DEFAULT_CITY,
        country: DEFAULT_COUNTRY,
        continent: "Europe",
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON,
      };
    const applyTarget = (
      city: string,
      country: string,
      continent: string,
      label: string,
      includeCoordinates = true,
    ) => {
      dispatch({
        type: "SET_FORM_FIELDS",
        resetDisplayNameOverrides: true,
        fields: {
          ...(includeCoordinates
            ? {
                location: label,
                latitude: target.lat.toFixed(6),
                longitude: target.lon.toFixed(6),
                distance: String(DEFAULT_DISTANCE_METERS),
              }
            : { location: label }),
          displayCity: city,
          displayCountry: country,
          displayContinent: continent,
        },
      });
    };

    const city = String(target.city ?? "").trim();
    const country = String(target.country ?? "").trim();
    const continent = String(target.continent ?? "").trim();
    const label = String(target.label ?? "").trim() || DEFAULT_LOCATION_LABEL;
    map.stop();
    map.jumpTo({
      bearing: 0,
      pitch: 0,
    });
    setMapBearing(0);

    if (city && country) {
      // All display names known — single dispatch with coordinates + correct names.
      applyTarget(city, country, continent || "Europe", label, true);
      return;
    }

    // Coordinates known but names aren't — set coordinates with fallback names
    // immediately, then overwrite names once reverse-geocoding resolves.
    applyTarget(DEFAULT_CITY, DEFAULT_COUNTRY, "Europe", label, true);

    void reverseGeocodeCoordinates(target.lat, target.lon)
      .then((resolved) => {
        dispatch({ type: "SET_USER_LOCATION", location: resolved });
        dispatch({
          type: "SET_FORM_FIELDS",
          resetDisplayNameOverrides: true,
          fields: {
            displayCity: String(resolved.city ?? "").trim() || DEFAULT_CITY,
            displayCountry:
              String(resolved.country ?? "").trim() || DEFAULT_COUNTRY,
            displayContinent:
              String(resolved.continent ?? "").trim() || "Europe",
          },
        });
      })
      .catch(() => {
        // fallback names already applied above — nothing more to do.
      });
  }, [mapRef, selectedLocation, userLocation, dispatch]);

  const handleMarkerPositionChange = useCallback(
    (markerId: string, lat: number, lon: number) => {
      dispatch({
        type: "UPDATE_MARKER",
        markerId,
        changes: { lat, lon },
      });
    },
    [dispatch],
  );

  const handleMarkerActiveChange = useCallback(
    (markerId: string | null) => {
      dispatch({ type: "SET_ACTIVE_MARKER", markerId });
    },
    [dispatch],
  );

  const handleMarkerSizeChange = useCallback(
    (markerId: string, size: number) => {
      dispatch({
        type: "UPDATE_MARKER",
        markerId,
        changes: { size },
      });
    },
    [dispatch],
  );

  return (
    <section className="relative w-full h-full">
      <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[var(--bg-app)]">
        {/* Desktop ghost layer: canvas clone of the main map at reduced opacity */}
        <div className="absolute -inset-x-6 -inset-y-12 z-0 opacity-35 blur-[6px] saturate-[0.75] brightness-[0.85] pointer-events-none" aria-hidden="true">
          <div className="overflow-hidden w-full h-full">
            <div
              style={{
                width: `${MAP_OVERZOOM_SCALE * 100}%`,
                height: `${MAP_OVERZOOM_SCALE * 100}%`,
                transform: `scale(${1 / MAP_OVERZOOM_SCALE})`,
                transformOrigin: "top left",
              }}
            >
              <canvas
                ref={ghostCanvasRef}
                className="w-full h-full block"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[2] text-xs font-medium text-[var(--text-muted)] opacity-70 pointer-events-none whitespace-nowrap" aria-hidden="true">
          {layoutLabel}
        </div>
        <div
          ref={frameRef}
          className="relative z-[1] max-w-full overflow-visible rounded-[4px] shadow-[0_24px_48px_rgba(0,0,0,0.25),0_8px_14px_rgba(0,0,0,0.15)]"
          style={
            {
              aspectRatio: aspect,
              width: `min(calc(100% - 48px), calc((84vh - 44px) * ${aspect}))`,
              maxHeight: "calc(84vh - 44px)",
              backgroundColor: effectiveTheme.ui.bg,
            } as CSSProperties
          }
        >
          <MapPreview
            style={mapStyle}
            center={mapCenter}
            zoom={mapZoom}
            mapRef={mapRef}
            interactive={isEditing && !isMarkerEditorActive}
            allowRotation={isEditing && isRotationEnabled}
            minZoom={mapMinZoom}
            maxZoom={mapMaxZoom}
            overzoomScale={MAP_OVERZOOM_SCALE}
            onMove={handleMove}
            onMoveEnd={handleMoveEnd}
          />
          {form.showMarkers ? (
            <GradientFades color={effectiveTheme.ui.bg} />
          ) : null}
          {hasVisibleMarkers ? (
            <MarkerOverlay
              markers={state.markers}
              customIcons={state.customMarkerIcons}
              mapRef={mapRef}
              isMarkerEditMode={isMarkerEditorActive}
              activeMarkerId={activeMarkerId}
              onActiveMarkerChange={handleMarkerActiveChange}
              onMarkerPositionChange={handleMarkerPositionChange}
              onMarkerSizeChange={handleMarkerSizeChange}
            />
          ) : null}
          <PosterTextOverlay
            city={cityLabel}
            country={countryLabel}
            lat={formLat}
            lon={formLon}
            fontFamily={form.fontFamily}
            textColor={effectiveTheme.ui.text}
            landColor={effectiveTheme.map.land}
            showPosterText={form.showPosterText}
            includeCredits={form.includeCredits}
            showOverlay={form.showMarkers}
          />

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+12px)] z-20 flex flex-row items-center gap-1.5 flex-wrap justify-center whitespace-nowrap max-[768px]:w-[calc(100%-8px)] max-[768px]:flex-col max-[768px]:top-[calc(100%+8px)] max-[768px]:bottom-auto max-[768px]:z-[12]" aria-label="Map controls">
            {!isEditing ? (
              <>
                <div className="flex flex-nowrap justify-center gap-1.5 items-center max-[768px]:w-full">
                  <MapPrimaryControls
                    isMapEditing={false}
                    isMarkerEditorActive={isMarkerEditorActive}
                    recenterHint={RECENTER_HINT}
                    unlockHint={UNLOCK_HINT}
                    onRecenter={handleRecenter}
                    onStartEditing={handleStartEditing}
                    onFinishEditing={handleFinishEditing}
                  />
                </div>
              </>
            ) : (
              <>
                <div className={CTL_GROUP}>
                  <MapPrimaryControls
                    isMapEditing
                    isMarkerEditorActive={isMarkerEditorActive}
                    recenterHint={RECENTER_HINT}
                    unlockHint={UNLOCK_HINT}
                    onRecenter={handleRecenter}
                    onStartEditing={handleStartEditing}
                    onFinishEditing={handleFinishEditing}
                  />
                  {isMobileViewport ? (
                    <button
                      type="button"
                      className={`${CTL_BTN}${isRotationEnabled ? ` ${CTL_BTN_ACTIVE}` : ""}`}
                      onClick={handleToggleRotation}
                      title={
                        isRotationEnabled ? "Disable rotation" : "Enable rotation"
                      }
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>
                        {isRotationEnabled ? "Disable Rotation" : "Enable Rotation"}
                      </span>
                    </button>
                  ) : null}
                </div>
                {!isMobileViewport ? (
                  <div className={CTL_GROUP}>
                    <button
                      type="button"
                      className={`${CTL_BTN}${isRotationEnabled ? ` ${CTL_BTN_ACTIVE}` : ""}`}
                      onClick={handleToggleRotation}
                      title={
                        isRotationEnabled ? "Disable rotation" : "Enable rotation"
                      }
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>
                        {isRotationEnabled ? "Disable Rotation" : "Enable Rotation"}
                      </span>
                    </button>
                  </div>
                ) : null}
                {!isMobileViewport ? (
                  <div className={CTL_SLIDER_ROW}>
                    <button
                      type="button"
                      className={CTL_BTN}
                      onClick={handleZoomOut}
                      title="Zoom out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <input
                      className={CTL_SLIDER}
                      type="range"
                      min={mapMinZoom}
                      max={mapMaxZoom}
                      step={0.1}
                      value={mapZoom}
                      onChange={handleZoomSliderChange}
                      aria-label="Zoom level"
                    />
                    <button
                      type="button"
                      className={CTL_BTN}
                      onClick={handleZoomIn}
                      title="Zoom in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
                {!isMobileViewport && isRotationEnabled ? (
                  <div className={CTL_SLIDER_ROW}>
                    <button
                      type="button"
                      className={CTL_BTN}
                      onClick={() => handleRotateBy(-15)}
                      title="Rotate left 15 degrees"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <input
                      className={CTL_SLIDER}
                      type="range"
                      min={-180}
                      max={180}
                      step={15}
                      value={Math.round(mapBearing / 15) * 15}
                      onChange={handleRotationSliderChange}
                      aria-label="Rotation angle"
                    />
                    <button
                      type="button"
                      className={CTL_BTN}
                      onClick={() => handleRotateBy(15)}
                      title="Rotate right 15 degrees"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
