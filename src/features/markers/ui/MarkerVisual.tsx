import { memo, type CSSProperties } from "react";
import type { MarkerIconDefinition } from "@/features/markers/domain/types";

interface MarkerVisualProps {
  icon: MarkerIconDefinition;
  size: number;
  color: string;
  className?: string;
}

const MarkerVisual = memo(function MarkerVisual({
  icon,
  size,
  color,
  className = "",
}: MarkerVisualProps) {
  const isThemeTintedMarkerSvg =
    icon.kind === "image" &&
    Boolean(icon.tintWithMarkerColor) &&
    Boolean(icon.dataUrl);

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`.trim()}
      style={
        {
          "--marker-size": `${size}px`,
          "--marker-color": color,
          width: `${size}px`,
          height: `${size}px`,
        } as CSSProperties
      }
    >
      {isThemeTintedMarkerSvg ? (
        <span
          className="block h-full w-full"
          aria-hidden="true"
          style={
            {
              backgroundColor: color,
              WebkitMaskImage: `url(${icon.dataUrl})`,
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskImage: `url(${icon.dataUrl})`,
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
            } as CSSProperties
          }
        />
      ) : icon.kind === "image" && icon.dataUrl ? (
        <img
          className="block h-full w-full object-contain"
          src={icon.dataUrl}
          alt=""
          aria-hidden="true"
        />
      ) : (
        icon.component ? (
          <span className="flex items-center justify-center" aria-hidden="true">
            <icon.component size={size} color={color} />
          </span>
        ) : (
          <span
            className="flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: icon.svgMarkup ?? "" }}
          />
        )
      )}
    </span>
  );
});

export default MarkerVisual;
