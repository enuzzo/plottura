import { useState } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import { useCurrentLocation } from "@/features/location/application/useCurrentLocation";
import { useMapSync } from "@/features/map/application/useMapSync";
import type { MobileTab } from "@/shared/ui/MobileNavBar";

import LocationSection from "@/features/location/ui/LocationSection";
import MapSettingsSection from "@/features/map/ui/MapSettingsSection";
import LayersSection from "@/features/map/ui/LayersSection";
import MarkersSection from "@/features/markers/ui/MarkersSection";
import TypographySection from "@/features/poster/ui/TypographySection";

import { Accordion } from "@/components/ui/accordion";
import SidebarSection from "@/components/sidebar/SidebarSection";
import { MapPin, Palette, Map, Layers, MapPinPlus, Type } from "lucide-react";

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
  mobileTab?: MobileTab;
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
              onChange={handleChange}
              onNumericFieldBlur={handleNumericFieldBlur}
              onThemeChange={handleThemeChange}
              onLayoutChange={handleLayoutChange}
              selectedTheme={selectedTheme}
              themeOptions={themeOptions}
              layoutGroups={layoutGroups}
              minPosterCm={MIN_POSTER_CM}
              maxPosterCm={MAX_POSTER_CM}
              customColors={state.customColors}
              onColorChange={handleColorChange}
              onResetColors={handleResetColors}
              onColorEditorActiveChange={setIsColorEditorActive}
            />
          ) : null}
        </SidebarSection>

        <SidebarSection value="map-settings" icon={Map} label="Map Settings">
          {!isColorEditorActive ? (
            <MapSettingsSection
              activeMobileTab={mobileTab}
              form={state.form}
              onChange={handleChange}
              onNumericFieldBlur={handleNumericFieldBlur}
              onThemeChange={handleThemeChange}
              onLayoutChange={handleLayoutChange}
              selectedTheme={selectedTheme}
              themeOptions={themeOptions}
              layoutGroups={layoutGroups}
              minPosterCm={MIN_POSTER_CM}
              maxPosterCm={MAX_POSTER_CM}
              customColors={state.customColors}
              onColorChange={handleColorChange}
              onResetColors={handleResetColors}
              onColorEditorActiveChange={setIsColorEditorActive}
            />
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
