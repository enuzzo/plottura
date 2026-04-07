import type { SearchResult } from "../domain/types";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import {
  PLACEHOLDER_LOCATION_SEARCH,
  PLACEHOLDER_EXAMPLE_LATITUDE,
  PLACEHOLDER_EXAMPLE_LONGITUDE,
} from "./constants";
import { LocateFixed } from "lucide-react";

interface LocationSectionProps {
  form: PosterForm;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationFocus: () => void;
  onLocationBlur: () => void;
  searchNow: (query: string) => Promise<void>;
  showLocationSuggestions: boolean;
  locationSuggestions: SearchResult[];
  isLocationSearching: boolean;
  onLocationSelect: (suggestion: SearchResult) => void;
  onClearLocation: () => void;
  onUseCurrentLocation: () => void;
  isLocatingUser: boolean;
  locationPermissionMessage: string;
}

export default function LocationSection({
  form,
  onChange,
  onLocationFocus,
  onLocationBlur,
  searchNow,
  showLocationSuggestions,
  locationSuggestions,
  isLocationSearching,
  onLocationSelect,
  onClearLocation,
  onUseCurrentLocation,
  isLocatingUser,
  locationPermissionMessage,
}: LocationSectionProps) {
  const hasLocationValue = form.location.trim().length > 0;

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm text-text-secondary">Location</span>
        <div className="relative mt-1">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                className="w-full bg-input border border-border rounded-sm text-base px-2.5 py-1.5 text-text-primary placeholder:text-text-muted outline-none focus:border-text-muted transition-colors"
                name="location"
                value={form.location}
                onChange={onChange}
                onFocus={onLocationFocus}
                onBlur={onLocationBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void searchNow(e.currentTarget.value);
                }}
                placeholder={PLACEHOLDER_LOCATION_SEARCH}
                autoComplete="off"
              />
              {hasLocationValue && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs leading-none transition-colors"
                  aria-label="Clear location"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onClearLocation}
                >
                  x
                </button>
              )}
            </div>
            <button
              type="button"
              className="shrink-0 p-1.5 border border-border rounded-sm bg-input text-text-muted hover:text-text-primary hover:bg-accent-subtle transition-colors disabled:opacity-50"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onUseCurrentLocation}
              disabled={isLocatingUser}
              aria-label="Use current location"
              title="Use current location"
            >
              <LocateFixed className="w-4 h-4" />
            </button>
          </div>
          {showLocationSuggestions && (
            <ul
              className="absolute left-0 right-0 top-full mt-1 z-20 bg-card border border-border rounded-sm shadow-lg overflow-hidden"
              role="listbox"
            >
              {locationSuggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    className="w-full text-left px-2.5 py-1.5 text-sm text-text-primary hover:bg-accent-subtle transition-colors"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onLocationSelect(suggestion);
                    }}
                  >
                    {suggestion.label}
                  </button>
                </li>
              ))}
              {isLocationSearching && (
                <li className="px-2.5 py-1.5 text-xs text-text-muted">
                  Searching...
                </li>
              )}
            </ul>
          )}
          {locationPermissionMessage && (
            <p className="mt-1 text-xs text-text-muted">
              {locationPermissionMessage}
            </p>
          )}
        </div>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs text-text-muted font-mono">Latitude</span>
          <input
            className="w-full mt-0.5 bg-input border border-border rounded-sm text-base px-2.5 py-1.5 text-text-primary placeholder:text-text-muted outline-none focus:border-text-muted transition-colors font-mono text-xs"
            name="latitude"
            value={form.latitude}
            onChange={onChange}
            placeholder={PLACEHOLDER_EXAMPLE_LATITUDE}
          />
        </label>
        <label className="block">
          <span className="text-xs text-text-muted font-mono">Longitude</span>
          <input
            className="w-full mt-0.5 bg-input border border-border rounded-sm text-base px-2.5 py-1.5 text-text-primary placeholder:text-text-muted outline-none focus:border-text-muted transition-colors font-mono text-xs"
            name="longitude"
            value={form.longitude}
            onChange={onChange}
            placeholder={PLACEHOLDER_EXAMPLE_LONGITUDE}
          />
        </label>
      </div>
    </div>
  );
}
