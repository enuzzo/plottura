import { useEffect } from "react";
import {
  DEFAULT_LAT,
  DEFAULT_LON,
  DEFAULT_CITY,
  DEFAULT_COUNTRY,
} from "@/core/config";
import type { PosterAction } from "@/features/poster/application/posterReducer";

/**
 * Initializes map start position to London.
 * No browser geolocation request — the app always starts with the default location.
 * Users can search for any location via the sidebar.
 */
export function useGeolocation(dispatch: React.Dispatch<PosterAction>) {
  useEffect(() => {
    dispatch({ type: "SET_USER_LOCATION", location: null });
    dispatch({
      type: "SET_FORM_FIELDS",
      resetDisplayNameOverrides: true,
      fields: {
        location: "London, Greater London, England, United Kingdom",
        latitude: DEFAULT_LAT.toFixed(6),
        longitude: DEFAULT_LON.toFixed(6),
        displayCity: DEFAULT_CITY,
        displayCountry: DEFAULT_COUNTRY,
        displayContinent: "Europe",
      },
    });
  }, [dispatch]);
}
