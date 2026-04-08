import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Camera,
  Circle,
  Flag,
  Flower2,
  Heart,
  House,
  MapPin,
  Moon,
  Send,
  Snowflake,
  Square,
  Star,
  Store,
  Sun,
  Target,
  TreePine,
  X,
} from "lucide-react";
import type { MarkerIconDefinition } from "@/features/markers/domain/types";
import { MARKER_FEATURED_ICON_COUNT } from "@/features/markers/infrastructure/constants";

function createSvgIcon(id: string, label: string, component: LucideIcon) {
  return {
    id,
    label,
    source: "predefined",
    kind: "svg",
    component,
    svgMarkup: renderToStaticMarkup(
      createElement(component, {
        size: 24,
        color: "currentColor",
        "aria-hidden": true,
      }),
    ),
  } satisfies MarkerIconDefinition;
}

function createImageIcon(id: string, label: string, sourcePath: string) {
  return {
    id,
    label,
    source: "predefined",
    kind: "image",
    dataUrl: sourcePath,
    tintWithMarkerColor: true,
  } satisfies MarkerIconDefinition;
}

export const predefinedMarkerIcons: MarkerIconDefinition[] = [
  createImageIcon("app-marker", "Plottura", "/favicon.svg"),
  createSvgIcon("pin", "Pin", MapPin),
  createSvgIcon("heart", "Heart", Heart),
  createSvgIcon("home", "Home", House),
  createSvgIcon("star", "Star", Star),
  createSvgIcon("circle", "Circle", Circle),
  createSvgIcon("square", "Square", Square),
  createSvgIcon("x", "X", X),
  createSvgIcon("target", "Target", Target),
  createSvgIcon("sun", "Sun", Sun),
  createSvgIcon("moon", "Moon", Moon),
  createSvgIcon("building", "Building", Building2),
  createSvgIcon("send", "Send", Send),
  createSvgIcon("snowflake", "Snowflake", Snowflake),
  createSvgIcon("shop", "Shop", Store),
  createSvgIcon("camera", "Camera", Camera),
  createSvgIcon("flower", "Flower", Flower2),
  createSvgIcon("tree", "Tree", TreePine),
  createSvgIcon("flag", "Flag", Flag),
];

export const featuredMarkerIcons = predefinedMarkerIcons.slice(
  0,
  MARKER_FEATURED_ICON_COUNT,
);

export function getAllMarkerIcons(customIcons: MarkerIconDefinition[]) {
  return [...predefinedMarkerIcons, ...customIcons];
}

export function findMarkerIcon(
  iconId: string,
  customIcons: MarkerIconDefinition[],
) {
  return (
    getAllMarkerIcons(customIcons).find((icon) => icon.id === iconId) ?? null
  );
}
