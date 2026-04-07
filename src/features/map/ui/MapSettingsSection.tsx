import { useEffect, useMemo, useRef, useState } from "react";
import { createCustomLayoutOption } from "@/features/layout/infrastructure/layoutRepository";
import {
  DISPLAY_PALETTE_KEYS,
  PALETTE_COLOR_LABELS,
  type ThemeColorKey,
  type ThemeOption,
} from "@/features/theme/domain/types";
import { getThemeColorByPath } from "@/features/theme/domain/colorPaths";
import { normalizeHexColor } from "@/shared/utils/color";
import {
  buildDynamicColorChoices,
  createFallbackThemeOption,
} from "@/features/theme/domain/colorSuggestions";
import LayoutCard from "@/features/layout/ui/LayoutCard";
import MapDimensionFields from "./MapDimensionFields";
import ColorPicker from "@/features/theme/ui/ColorPicker";
import ThemeColorEditor from "@/features/theme/ui/ThemeColorEditor";
import ThemeSummarySection from "@/features/theme/ui/ThemeSummarySection";
import { CheckIcon, EditIcon } from "@/shared/ui/Icons";
import type { ResolvedTheme } from "@/features/theme/domain/types";
import type { LayoutGroup } from "@/features/layout/domain/types";

const FALLBACK_COLOR = "#000000";

interface MapSettingsForm {
  theme: string;
  layout: string;
  width: string;
  height: string;
  distance: string;
  includeBuildings: boolean;
  includeWater: boolean;
  includeParks: boolean;
  includeAeroway: boolean;
  includeRail: boolean;
  includeRoads: boolean;
  includeRoadPath: boolean;
  includeRoadMinorLow: boolean;
  includeRoadOutline: boolean;
}

interface MapSettingsSectionProps {
  activeMobileTab?: string;
  form: MapSettingsForm;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNumericFieldBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onThemeChange: (themeId: string) => void;
  onLayoutChange: (layoutId: string) => void;
  selectedTheme: ResolvedTheme;
  themeOptions: ThemeOption[];
  layoutGroups: LayoutGroup[];
  minPosterCm: number;
  maxPosterCm: number;
  customColors: Record<string, string>;
  onColorChange: (key: string, value: string) => void;
  onResetColors: () => void;
  onColorEditorActiveChange?: (active: boolean) => void;
}

export default function MapSettingsSection({
  activeMobileTab,
  form,
  onChange,
  onNumericFieldBlur,
  onThemeChange,
  onLayoutChange,
  selectedTheme,
  themeOptions,
  layoutGroups,
  minPosterCm,
  maxPosterCm,
  customColors,
  onColorChange,
  onResetColors,
  onColorEditorActiveChange,
}: MapSettingsSectionProps) {
  const [isThemeEditing, setIsThemeEditing] = useState(false);
  const [isLayoutEditing, setIsLayoutEditing] = useState(false);
  const defaultColorKey: ThemeColorKey = DISPLAY_PALETTE_KEYS[0] ?? "ui.bg";
  const [activeColorKey, setActiveColorKey] = useState<ThemeColorKey | null>(
    null,
  );
  const [activeColorSession, setActiveColorSession] = useState<{
    key: ThemeColorKey;
    seedColor: string;
    seedPalette: string[];
  } | null>(null);
  const themeListRef = useRef<HTMLDivElement | null>(null);
  const layoutGroupsRef = useRef<HTMLDivElement | null>(null);

  const selectedThemeOption = useMemo(() => {
    const matchingOption = themeOptions.find((t) => t.id === form.theme);
    if (matchingOption) return matchingOption;
    return createFallbackThemeOption(form.theme, selectedTheme);
  }, [form.theme, selectedTheme, themeOptions]);

  const currentThemePalette = useMemo(
    () =>
      DISPLAY_PALETTE_KEYS.map((key) => {
        const themeColor =
          getThemeColorByPath(selectedTheme, key) || FALLBACK_COLOR;
        return customColors[key] ?? themeColor;
      }),
    [customColors, selectedTheme],
  );

  const summaryThemeOption = useMemo(
    () => ({ ...selectedThemeOption, palette: currentThemePalette }),
    [currentThemePalette, selectedThemeOption],
  );

  const activeColorChoices = useMemo(() => {
    if (!activeColorKey) return { suggestedColors: [], moreColors: [] };

    const sessionColor =
      activeColorSession?.key === activeColorKey
        ? activeColorSession.seedColor
        : "";
    const sessionPalette =
      activeColorSession?.key === activeColorKey
        ? activeColorSession.seedPalette
        : currentThemePalette;

    return buildDynamicColorChoices(
      sessionColor ||
        customColors[activeColorKey] ||
        getThemeColorByPath(selectedTheme, activeColorKey) ||
        currentThemePalette[0] ||
        "",
      sessionPalette,
    );
  }, [
    activeColorKey,
    activeColorSession,
    customColors,
    currentThemePalette,
    selectedTheme,
  ]);

  const colorTargets = useMemo(
    () =>
      DISPLAY_PALETTE_KEYS.map((key) => {
        const baseColor =
          getThemeColorByPath(selectedTheme, key) || FALLBACK_COLOR;
        const currentColor = customColors[key] ?? baseColor;
        return {
          key,
          label: PALETTE_COLOR_LABELS[key] ?? key,
          color: currentColor,
          isActive: activeColorKey === key,
        };
      }),
    [activeColorKey, customColors, selectedTheme],
  );

  const layoutOptions = useMemo(
    () => layoutGroups.flatMap((g) => g.options),
    [layoutGroups],
  );

  const selectedLayoutOption = useMemo(() => {
    const match = layoutOptions.find((lo) => lo.id === form.layout);
    if (match) return match;
    return createCustomLayoutOption(Number(form.width), Number(form.height));
  }, [form.height, form.layout, form.width, layoutOptions]);
  const selectedLayoutDescription =
    selectedLayoutOption.id === "custom"
      ? "Your custom layout."
      : selectedLayoutOption.description?.trim() || "No description available.";

  function clearColorPickerState() {
    setActiveColorKey(null);
    setActiveColorSession(null);
  }

  function handleThemeSelect(themeId: string) {
    onThemeChange(themeId);
    clearColorPickerState();
  }

  function handleLayoutSelectInline(layoutId: string) {
    onLayoutChange(layoutId);
    setIsLayoutEditing(false);
  }

  function handleSwatchClick(key: ThemeColorKey) {
    const themeColor = getThemeColorByPath(selectedTheme, key);
    const seedColor =
      customColors[key] ?? (themeColor || currentThemePalette[0] || "");
    setActiveColorKey(key);
    setActiveColorSession({
      key,
      seedColor,
      seedPalette: [...currentThemePalette],
    });
  }

  function handleOpenThemeEditor() {
    setIsThemeEditing(true);
    clearColorPickerState();
  }

  function handleDoneThemeEditor() {
    setIsThemeEditing(false);
    clearColorPickerState();
  }

  function handleOpenLayoutEditor() {
    setIsLayoutEditing(true);
    onLayoutChange("custom");
  }

  function handleDoneLayoutEditor() {
    setIsLayoutEditing(false);
  }

  function handleResetThemeColors() {
    onResetColors();
    if (!isThemeEditing) {
      clearColorPickerState();
      return;
    }
    const activeKey = activeColorKey || defaultColorKey;
    const seedPalette = DISPLAY_PALETTE_KEYS.map(
      (key) =>
        normalizeHexColor(getThemeColorByPath(selectedTheme, key)) ||
        normalizeHexColor(currentThemePalette[0]) ||
        "",
    );
    setActiveColorSession({
      key: activeKey,
      seedColor:
        seedPalette[DISPLAY_PALETTE_KEYS.indexOf(activeKey)] ||
        seedPalette[0] ||
        "",
      seedPalette,
    });
  }

  function handleResetSingleColor(key: ThemeColorKey) {
    const originalColor =
      normalizeHexColor(getThemeColorByPath(selectedTheme, key)) ||
      normalizeHexColor(currentThemePalette[0]) ||
      "";
    if (!originalColor) return;
    onColorChange(key, originalColor);
  }

  const hasCustomColors = useMemo(
    () =>
      DISPLAY_PALETTE_KEYS.some((key) => {
        const override = normalizeHexColor(customColors[key]);
        if (!override) return false;
        const original = normalizeHexColor(getThemeColorByPath(selectedTheme, key));
        return override !== original;
      }),
    [customColors, selectedTheme],
  );
  const activeColorLabel = activeColorKey
    ? (PALETTE_COLOR_LABELS[activeColorKey] ?? "Color")
    : "Color";

  useEffect(() => {
    onColorEditorActiveChange?.(false);
    return () => {
      onColorEditorActiveChange?.(false);
    };
  }, [onColorEditorActiveChange]);

  useEffect(() => {
    if (activeMobileTab !== "theme") {
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      const selectedThemeCard = themeListRef.current?.querySelector<HTMLElement>(
        ".theme-card.is-selected",
      );
      selectedThemeCard?.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "start",
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [activeMobileTab]);

  useEffect(() => {
    if (activeMobileTab !== "layout" || isLayoutEditing) {
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      const selectedLayoutCard =
        layoutGroupsRef.current?.querySelector<HTMLElement>(
          ".layout-card.is-selected",
        );
      selectedLayoutCard?.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "start",
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [activeMobileTab, isLayoutEditing]);

  const editorKey = activeColorKey || defaultColorKey;
  const editorChoices = activeColorKey
    ? activeColorChoices
    : buildDynamicColorChoices(currentThemePalette[0] || "", currentThemePalette);
  const editorColor =
    customColors[editorKey] ??
    (getThemeColorByPath(selectedTheme, editorKey) || currentThemePalette[0] || "");
  const originalEditorColor =
    normalizeHexColor(getThemeColorByPath(selectedTheme, editorKey)) ||
    normalizeHexColor(currentThemePalette[0]) ||
    "";
  const normalizedEditorColor = normalizeHexColor(editorColor) || "";
  const canResetEditorColor = Boolean(
    originalEditorColor &&
      normalizedEditorColor &&
      originalEditorColor !== normalizedEditorColor,
  );

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Theme</h2>

        {isThemeEditing ? (
          activeColorKey ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Color Editor</h2>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-text-secondary">Editing: {activeColorLabel}</p>
                <button
                  type="button"
                  className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                  onClick={clearColorPickerState}
                >
                  Done
                </button>
              </div>

              <ColorPicker
                currentColor={editorColor}
                suggestedColors={editorChoices.suggestedColors}
                moreColors={editorChoices.moreColors}
                onChange={(color: string) => onColorChange(editorKey, color)}
                onResetColor={() => handleResetSingleColor(editorKey)}
                canResetColor={canResetEditorColor}
              />
            </section>
          ) : (
            <ThemeColorEditor
              activeColorLabel={activeColorLabel}
              hasCustomColors={hasCustomColors}
              onResetAllColors={handleResetThemeColors}
              onDone={handleDoneThemeEditor}
              colorTargets={colorTargets}
              onTargetSelect={handleSwatchClick}
            />
          )
        ) : (
          <ThemeSummarySection
            listRef={themeListRef}
            themeOptions={themeOptions}
            selectedThemeId={form.theme}
            selectedThemeOption={summaryThemeOption}
            onThemeSelect={handleThemeSelect}
            onCustomize={handleOpenThemeEditor}
          />
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Layout</h2>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              LAYOUT:{" "}
              <span className="text-text-primary">
                {selectedLayoutOption.name}
              </span>
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {selectedLayoutDescription}
            </p>
          </div>
          {isLayoutEditing ? (
            <button
              type="button"
              className="p-1.5 rounded-sm border border-border hover:bg-accent-subtle transition-colors"
              onClick={handleDoneLayoutEditor}
              aria-label="Done editing layout"
            >
              <CheckIcon />
            </button>
          ) : (
            <button
              type="button"
              className="p-1.5 rounded-sm border border-border hover:bg-accent-subtle transition-colors"
              onClick={handleOpenLayoutEditor}
              aria-label="Customize layout size"
            >
              <EditIcon />
            </button>
          )}
        </div>

        {isLayoutEditing ? (
          <div className="pt-1">
            <MapDimensionFields
              form={form}
              minPosterCm={minPosterCm}
              maxPosterCm={maxPosterCm}
              onChange={onChange}
              onNumericFieldBlur={onNumericFieldBlur}
              showDistanceField={false}
            />
          </div>
        ) : (
          <div className="space-y-4" ref={layoutGroupsRef}>
            {layoutGroups.map((group) => (
              <section key={group.id} className="space-y-2">
                <h3 className="text-xs font-medium text-text-secondary">{group.name}</h3>
                <div className="layout-inline-list card-scroll-list flex gap-2 overflow-x-auto pb-1">
                  {group.options.map((layoutOption) => (
                    <LayoutCard
                      key={layoutOption.id}
                      layoutOption={layoutOption}
                      isSelected={layoutOption.id === form.layout}
                      onClick={() => handleLayoutSelectInline(layoutOption.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
