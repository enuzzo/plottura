import { formatCoordinates } from "@/shared/geo/posterBounds";
import { APP_CREDIT_URL } from "@/core/config";
import {
  TEXT_DIMENSION_REFERENCE_PX,
  TEXT_CITY_Y_RATIO,
  TEXT_DIVIDER_Y_RATIO,
  TEXT_COUNTRY_Y_RATIO,
  TEXT_COORDS_Y_RATIO,
  TEXT_EDGE_MARGIN_RATIO,
  CITY_FONT_BASE_PX,
  COUNTRY_FONT_BASE_PX,
  COORDS_FONT_BASE_PX,
  ATTRIBUTION_FONT_BASE_PX,
  formatCityLabel,
  computeCityFontScale,
  computeAttributionColor,
} from "@/features/poster/domain/textLayout";

interface PosterTextOverlayProps {
  city: string;
  country: string;
  lat: number;
  lon: number;
  fontFamily: string;
  textColor: string;
  landColor: string;
  showPosterText: boolean;
  includeCredits: boolean;
  showOverlay: boolean;
}

/**
 * DOM-based poster text overlay (sharp at any resolution, GPU-composited).
 * Renders city name, divider, country, coordinates, and attribution
 * positioned to match the canvas export layout exactly.
 */
export default function PosterTextOverlay({
  city,
  country,
  lat,
  lon,
  fontFamily,
  textColor,
  landColor,
  showPosterText,
  includeCredits,
  showOverlay,
}: PosterTextOverlayProps) {
  const toCqMin = (px: number) => (px / TEXT_DIMENSION_REFERENCE_PX) * 100;

  const titleFont = fontFamily
    ? `"${fontFamily}", "Space Grotesk", sans-serif`
    : '"Space Grotesk", sans-serif';
  const bodyFont = fontFamily
    ? `"${fontFamily}", "IBM Plex Mono", monospace`
    : '"IBM Plex Mono", monospace';

  const cityLabel = formatCityLabel(city);
  const cityFontSize = `${toCqMin(CITY_FONT_BASE_PX) * computeCityFontScale(city)}cqmin`;
  const countryFontSize = `${toCqMin(COUNTRY_FONT_BASE_PX)}cqmin`;
  const coordsFontSize = `${toCqMin(COORDS_FONT_BASE_PX)}cqmin`;
  const attributionFontSize = `${toCqMin(ATTRIBUTION_FONT_BASE_PX)}cqmin`;
  const attributionColor = computeAttributionColor(textColor, landColor, showOverlay);
  const attributionOpacity = showOverlay ? 0.55 : 0.9;

  return (
    <div className="absolute inset-0 pointer-events-none z-[4] [container-type:size]" style={{ color: textColor }}>
      {showPosterText && (
        <>
          <p
            className="absolute left-0 right-0 m-0 font-bold uppercase text-center leading-[1.1] -translate-y-1/2 whitespace-pre-wrap"
            style={{
              fontFamily: titleFont,
              top: `${TEXT_CITY_Y_RATIO * 100}%`,
              fontSize: cityFontSize,
            }}
          >
            {cityLabel}
          </p>
          <hr
            className="absolute left-[40%] right-[40%] border-0 border-t-2 border-current h-0 m-0 -translate-y-1/2"
            style={{
              top: `${TEXT_DIVIDER_Y_RATIO * 100}%`,
            }}
          />
          <p
            className="absolute left-0 right-0 m-0 font-light uppercase text-center leading-[1.2] -translate-y-1/2"
            style={{
              fontFamily: titleFont,
              top: `${TEXT_COUNTRY_Y_RATIO * 100}%`,
              fontSize: countryFontSize,
            }}
          >
            {country.toUpperCase()}
          </p>
          <p
            className="absolute left-0 right-0 m-0 font-normal text-center opacity-75 -translate-y-1/2"
            style={{
              fontFamily: bodyFont,
              top: `${TEXT_COORDS_Y_RATIO * 100}%`,
              fontSize: coordsFontSize,
            }}
          >
            {formatCoordinates(lat, lon)}
          </p>
        </>
      )}

      <span
        className="absolute font-light text-right opacity-55"
        style={{
          fontFamily: bodyFont,
          color: attributionColor,
          opacity: attributionOpacity,
          fontSize: attributionFontSize,
          bottom: `${TEXT_EDGE_MARGIN_RATIO * 100}%`,
          right: `${TEXT_EDGE_MARGIN_RATIO * 100}%`,
        }}
      >
        &copy; OpenStreetMap contributors
      </span>

      {includeCredits && (
        <span
          className="absolute font-light text-left opacity-55"
          style={{
            fontFamily: bodyFont,
            color: attributionColor,
            opacity: attributionOpacity,
            fontSize: attributionFontSize,
            bottom: `${TEXT_EDGE_MARGIN_RATIO * 100}%`,
            left: `${TEXT_EDGE_MARGIN_RATIO * 100}%`,
          }}
        >
          created with {APP_CREDIT_URL}
        </span>
      )}
    </div>
  );
}
