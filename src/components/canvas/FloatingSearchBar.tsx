import { useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import { useMapSync } from "@/features/map/application/useMapSync";
import type { SearchResult } from "@/features/location/domain/types";

export default function FloatingSearchBar() {
  const { state, dispatch, mapRef } = usePosterContext();
  const { handleChange, handleLocationSelect, handleClearLocation, setLocationFocused } =
    useFormHandlers();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { locationSuggestions, isLocationSearching, searchNow } =
    useLocationAutocomplete(state.form.location, isFocused);
  const { flyToLocation } = useMapSync(state, dispatch, mapRef);

  const showSuggestions = isFocused && locationSuggestions.length > 0;
  const hasValue = state.form.location.trim().length > 0;

  const onSelect = (suggestion: SearchResult) => {
    handleLocationSelect(suggestion);
    flyToLocation(suggestion.lat, suggestion.lon);
    setIsFocused(false);
    setLocationFocused(false);
    inputRef.current?.blur();
  };

  const onFocus = () => {
    setIsFocused(true);
    setLocationFocused(true);
  };

  const onBlur = () => {
    // Delay to allow suggestion click to register
    setTimeout(() => {
      setIsFocused(false);
      setLocationFocused(false);
    }, 150);
  };

  const onClear = () => {
    handleClearLocation();
    inputRef.current?.focus();
  };

  return (
    <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-10 w-full max-w-[360px] px-3">
      <div className="bg-white/95 backdrop-blur-[12px] border border-border rounded-lg shadow-md flex items-center gap-2 px-3 py-2">
        <MapPin className="h-4 w-4 shrink-0 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          name="location"
          value={state.form.location}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") void searchNow(e.currentTarget.value);
          }}
          placeholder="Search location..."
          autoComplete="off"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
        {hasValue && (
          <button
            type="button"
            aria-label="Clear location"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClear}
            className="shrink-0 p-0.5 rounded-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showSuggestions && (
        <ul
          role="listbox"
          className="mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {locationSuggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-accent-subtle transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(suggestion);
                }}
              >
                {suggestion.label}
              </button>
            </li>
          ))}
          {isLocationSearching && (
            <li className="px-3 py-2 text-xs text-text-muted">Searching...</li>
          )}
        </ul>
      )}
    </div>
  );
}
