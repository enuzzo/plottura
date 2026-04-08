import { useState } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import { useCurrentLocation } from "@/features/location/application/useCurrentLocation";
import { useMapSync } from "@/features/map/application/useMapSync";
import { Switch } from "@/components/ui/switch";

import LocationSection from "@/features/location/ui/LocationSection";
import MapSettingsSection from "@/features/map/ui/MapSettingsSection";
import LayoutSection from "@/features/layout/ui/LayoutSection";
import LayersSection from "@/features/map/ui/LayersSection";
import MarkersSection from "@/features/markers/ui/MarkersSection";
import TypographySection from "@/features/poster/ui/TypographySection";

import { Accordion } from "@/components/ui/accordion";
import SidebarSection from "@/components/sidebar/SidebarSection";
import { MapPin, Palette, LayoutGrid, Map, Layers, MapPinPlus, Type } from "lucide-react";

import { themeOptions } from "@/features/theme/infrastructure/themeRepository";
import { layoutGroups } from "@/features/layout/infrastructure/layoutRepository";
import {
  MIN_POSTER_CM,
  MAX_POSTER_CM,
  FONT_OPTIONS,
} from "@/core/config";
import type { SearchResult } from "@/features/location/domain/types";

export default function SettingsPanel({
  mobileTab,
}: {
  mobileTab?: string;
}) {
  const { state, dispatch, mapRef, selectedTheme } = usePosterContext();
  const {
    handleChange,
    handleNumericFieldBlur,
    handleThemeChange,
    handleLayoutChange,
    handleColorChange,
    handleResetColors,
    handleLocationSelect,
    handleClearLocation,
    setLocationFocused,
    handleCreditsChange,
  } = useFormHandlers();
  const { locationSuggestions, isLocationSearching, searchNow } = useLocationAutocomplete(
    state.form.location,
    state.isLocationFocused,
  );
  const { flyToLocation } = useMapSync(state, dispatch, mapRef);
  const { handleUseCurrentLocation, isLocatingUser, locationPermissionMessage } =
    useCurrentLocation(flyToLocation);

  const [isColorEditorActive, setIsColorEditorActive] = useState(false);

  const isAuxEditorActive = isColorEditorActive;
  const showLocationSuggestions =
    state.isLocationFocused && locationSuggestions.length > 0;

  const onLocationSelect = (location: SearchResult) => {
    handleLocationSelect(location);
    flyToLocation(location.lat, location.lon);
  };

  return (
    <form className="settings-panel" onSubmit={(e) => e.preventDefault()}>
      <Accordion type="single" defaultValue="theme" collapsible>
        <SidebarSection value="location" icon={MapPin} label="Location">
          {!isColorEditorActive ? (
            <LocationSection
              form={state.form}
              onChange={handleChange}
              onLocationFocus={() => setLocationFocused(true)}
              onLocationBlur={() => setLocationFocused(false)}
              searchNow={searchNow}
              showLocationSuggestions={showLocationSuggestions}
              locationSuggestions={locationSuggestions}
              isLocationSearching={isLocationSearching}
              onLocationSelect={onLocationSelect}
              onClearLocation={handleClearLocation}
              onUseCurrentLocation={handleUseCurrentLocation}
              isLocatingUser={isLocatingUser}
              locationPermissionMessage={locationPermissionMessage}
            />
          ) : null}
        </SidebarSection>

        <SidebarSection value="theme" icon={Palette} label="Theme">
          {!isColorEditorActive ? (
            <MapSettingsSection
              activeMobileTab={mobileTab}
              form={state.form}
              onThemeChange={handleThemeChange}
              selectedTheme={selectedTheme}
              themeOptions={themeOptions}
              customColors={state.customColors}
              onColorChange={handleColorChange}
              onResetColors={handleResetColors}
              onColorEditorActiveChange={setIsColorEditorActive}
            />
          ) : null}
        </SidebarSection>

        <SidebarSection value="layout" icon={LayoutGrid} label="Layout">
          {!isAuxEditorActive ? (
            <LayoutSection
              form={state.form}
              onChange={handleChange}
              onNumericFieldBlur={handleNumericFieldBlur}
              onLayoutChange={handleLayoutChange}
              layoutGroups={layoutGroups}
              minPosterCm={MIN_POSTER_CM}
              maxPosterCm={MAX_POSTER_CM}
            />
          ) : null}
        </SidebarSection>

        <SidebarSection value="map-settings" icon={Map} label="Map Settings">
          {!isColorEditorActive ? (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-base text-text-secondary">Gradient top</span>
                <Switch
                  checked={Boolean(state.form.showGradientTop)}
                  onCheckedChange={(checked) => {
                    dispatch({ type: "SET_FIELD", name: "showGradientTop", value: checked });
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-text-secondary">Gradient bottom</span>
                <Switch
                  checked={Boolean(state.form.showGradientBottom)}
                  onCheckedChange={(checked) => {
                    dispatch({ type: "SET_FIELD", name: "showGradientBottom", value: checked });
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-text-secondary">Country</span>
                <Switch
                  checked={Boolean(state.form.showCountry)}
                  onCheckedChange={(checked) => {
                    dispatch({ type: "SET_FIELD", name: "showCountry", value: checked });
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-text-secondary">Coordinates</span>
                <Switch
                  checked={Boolean(state.form.showCoordinates)}
                  onCheckedChange={(checked) => {
                    dispatch({ type: "SET_FIELD", name: "showCoordinates", value: checked });
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-text-secondary">Credits</span>
                <Switch
                  checked={Boolean(state.form.includeCredits)}
                  onCheckedChange={handleCreditsChange}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-text-secondary">OpenStreetMap badge</span>
                <Switch
                  checked={Boolean(state.form.includeOsmBadge)}
                  onCheckedChange={(checked) => {
                    dispatch({ type: "SET_FIELD", name: "includeOsmBadge", value: checked });
                  }}
                />
              </div>
              {!state.form.includeCredits && !state.form.includeOsmBadge && (
                <p className="text-xs text-text-muted leading-relaxed">
                  Map data provided by OpenStreetMap contributors. Poster generated with Plottura. Please credit both when sharing publicly.
                </p>
              )}
            </section>
          ) : null}
        </SidebarSection>

        <SidebarSection value="layers" icon={Layers} label="Layers">
          {!isAuxEditorActive ? (
            <LayersSection
              form={state.form}
              onChange={handleChange}
              minPosterCm={MIN_POSTER_CM}
              maxPosterCm={MAX_POSTER_CM}
              onNumericFieldBlur={handleNumericFieldBlur}
            />
          ) : null}
        </SidebarSection>

        <SidebarSection value="markers" icon={MapPinPlus} label="Markers">
          {!isColorEditorActive ? <MarkersSection /> : null}
        </SidebarSection>

        <SidebarSection value="typography" icon={Type} label="Typography">
          {!isAuxEditorActive ? (
            <TypographySection
              form={state.form}
              onChange={handleChange}
              fontOptions={FONT_OPTIONS}
            />
          ) : null}
        </SidebarSection>
      </Accordion>

      {!isAuxEditorActive && state.error ? <p className="error">{state.error}</p> : null}
    </form>
  );
}
