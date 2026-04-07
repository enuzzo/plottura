import { useState } from "react";
import {
  DEFAULT_CITY,
  DEFAULT_COUNTRY,
  DEFAULT_DISTANCE_METERS,
  DEFAULT_LAT,
  DEFAULT_LON,
} from "@/core/config";
import { geocodeLocation, reverseGeocodeCoordinates } from "@/core/services";
import { GEOLOCATION_TIMEOUT_MS } from "@/features/map/infrastructure";
import {
  getGeolocationFailureMessage,
  requestCurrentPositionWithRetry,
} from "@/features/location/infrastructure";
import { LocateFixed } from "lucide-react";
import { usePosterDispatch } from "@/features/poster/ui/PosterContext";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import type { SearchResult } from "@/features/location/domain/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const DEFAULT_LOCATION_LABEL = "Hanover, Region Hannover, Lower Saxony, Germany";

interface PendingLocation {
  label: string;
  lat: number;
  lon: number;
  city: string;
  country: string;
  continent: string;
}

interface StartupLocationModalProps {
  onComplete?: () => void;
}

export default function StartupLocationModal({
  onComplete,
}: StartupLocationModalProps) {
  const { dispatch } = usePosterDispatch();
  const [isOpen, setIsOpen] = useState(true);
  const [locationInput, setLocationInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<PendingLocation | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { locationSuggestions, isLocationSearching, clearLocationSuggestions, searchNow } =
    useLocationAutocomplete(locationInput, isInputFocused);

  const showSuggestions = isInputFocused && locationSuggestions.length > 0;

  const closeModal = () => {
    setIsOpen(false);
    onComplete?.();
  };

  const applyResolvedLocation = (location: PendingLocation | null) => {
    if (!location) {
      dispatch({ type: "SET_USER_LOCATION", location: null });
      dispatch({
        type: "SET_FORM_FIELDS",
        resetDisplayNameOverrides: true,
        fields: {
          location: DEFAULT_LOCATION_LABEL,
          latitude: DEFAULT_LAT.toFixed(6),
          longitude: DEFAULT_LON.toFixed(6),
          distance: String(DEFAULT_DISTANCE_METERS),
          displayCity: DEFAULT_CITY,
          displayCountry: DEFAULT_COUNTRY,
          displayContinent: "Europe",
        },
      });
      return;
    }

    dispatch({
      type: "SET_FORM_FIELDS",
      resetDisplayNameOverrides: true,
      fields: {
        location: location.label,
        latitude: location.lat.toFixed(6),
        longitude: location.lon.toFixed(6),
        distance: String(DEFAULT_DISTANCE_METERS),
        displayCity: location.city,
        displayCountry: location.country,
        displayContinent: location.continent,
      },
    });
    dispatch({
      type: "SET_USER_LOCATION",
      location: {
        id: `startup:${location.lat.toFixed(6)},${location.lon.toFixed(6)}`,
        label: location.label,
        city: location.city,
        country: location.country,
        continent: location.continent,
        lat: location.lat,
        lon: location.lon,
      },
    });
  };

  const handleUseMyLocation = () => {
    if (isResolving) {
      return;
    }

    setIsResolving(true);
    setErrorMessage("");
    void (async () => {
      const positionResult = await requestCurrentPositionWithRetry({
        timeoutMs: GEOLOCATION_TIMEOUT_MS,
        maxAttempts: 2,
      });

      if (!positionResult.ok) {
        setErrorMessage(
          getGeolocationFailureMessage(positionResult.reason, {
            includeManualFallback: true,
          }),
        );
        setIsResolving(false);
        return;
      }

      const { lat, lon } = positionResult;
      try {
        const resolved = await reverseGeocodeCoordinates(lat, lon);
        const pending: PendingLocation = {
          label:
            String(resolved.label ?? "").trim() ||
            `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
          lat,
          lon,
          city: String(resolved.city ?? "").trim(),
          country: String(resolved.country ?? "").trim(),
          continent: String(resolved.continent ?? "").trim(),
        };
        setPendingLocation(pending);
        setLocationInput(pending.label);
      } catch {
        const label = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        const pending: PendingLocation = {
          label,
          lat,
          lon,
          city: "",
          country: "",
          continent: "",
        };
        setPendingLocation(pending);
        setLocationInput(label);
      } finally {
        setIsResolving(false);
      }
    })();
  };

  const onSuggestionSelect = (suggestion: SearchResult) => {
    setPendingLocation({
      label: suggestion.label,
      lat: suggestion.lat,
      lon: suggestion.lon,
      city: suggestion.city,
      country: suggestion.country,
      continent: String(suggestion.continent ?? "").trim(),
    });
    setLocationInput(suggestion.label);
    setIsInputFocused(false);
    clearLocationSuggestions();
  };

  const handleConfirm = async () => {
    if (isResolving) {
      return;
    }

    setIsResolving(true);
    setErrorMessage("");

    const query = locationInput.trim();
    if (!query) {
      applyResolvedLocation(null);
      closeModal();
      setIsResolving(false);
      return;
    }

    if (pendingLocation && pendingLocation.label === query) {
      applyResolvedLocation(pendingLocation);
      closeModal();
      setIsResolving(false);
      return;
    }

    try {
      const resolved = await geocodeLocation(query);
      applyResolvedLocation({
        label: resolved.label,
        lat: resolved.lat,
        lon: resolved.lon,
        city: resolved.city,
        country: resolved.country,
        continent: String(resolved.continent ?? "").trim(),
      });
      closeModal();
    } catch {
      setErrorMessage("Could not resolve that location. Try another name.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // User pressed escape or clicked overlay — apply defaults and close
      applyResolvedLocation(pendingLocation);
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton
        className="max-w-sm gap-0 p-0 overflow-visible"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Logo header */}
        <div className="flex flex-col items-center gap-1 pt-6 pb-4" aria-hidden="true">
          <img className="h-10 w-10" src="/favicon.svg" alt="" />
          <p className="text-sm font-medium text-text-muted">Plottura</p>
        </div>

        <div className="px-6 pb-6 space-y-3">
          <DialogTitle className="text-center text-lg font-semibold text-text-primary">
            Choose Location
          </DialogTitle>

          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              className="w-full bg-input border border-border rounded-sm text-base px-3 py-2 text-text-primary placeholder:text-text-muted outline-none focus:border-text-muted transition-colors"
              value={locationInput}
              onChange={(event) => {
                setLocationInput(event.target.value);
                setPendingLocation(null);
                if (!isInputFocused) setIsInputFocused(true);
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 120)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void searchNow(e.currentTarget.value);
              }}
              placeholder="Type a city or place"
              autoComplete="off"
            />

            {showSuggestions && (
              <ul
                className="absolute left-0 right-0 top-full mt-1 z-20 bg-card border border-border rounded-sm shadow-lg overflow-hidden"
                role="listbox"
              >
                {locationSuggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-accent-subtle transition-colors"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onSuggestionSelect(suggestion);
                      }}
                    >
                      {suggestion.label}
                    </button>
                  </li>
                ))}
                {isLocationSearching && (
                  <li className="px-3 py-2 text-xs text-text-muted">
                    Searching...
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Geolocation button */}
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2 border border-border rounded-sm text-sm text-text-primary hover:bg-accent-subtle transition-colors disabled:opacity-50"
            onClick={handleUseMyLocation}
            disabled={isResolving}
          >
            <LocateFixed className="w-4 h-4" />
            <span>{isResolving ? "Locating..." : "Get my location"}</span>
          </button>

          {/* Confirm button */}
          <button
            type="button"
            className="w-full py-2 rounded-sm bg-text-primary text-card font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={() => void handleConfirm()}
            disabled={isResolving}
          >
            OK
          </button>

          {/* Error message */}
          {errorMessage && (
            <p className="text-xs text-red-500 text-center" role="status">
              {errorMessage}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
