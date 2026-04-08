import { useEffect, useMemo, useRef, useState } from "react";
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
import ColorPicker from "@/features/theme/ui/ColorPicker";
import ThemeColorEditor from "@/features/theme/ui/ThemeColorEditor";
import ThemeSummarySection from "@/features/theme/ui/ThemeSummarySection";
import type { ResolvedTheme } from "@/features/theme/domain/types";

const FALLBACK_COLOR = "#000000";

interface ThemeSectionForm {
  theme: string;
}

interface MapSettingsSectionProps {
  activeMobileTab?: string;
  form: ThemeSectionForm;
  onThemeChange: (themeId: string) => void;
  selectedTheme: ResolvedTheme;
  themeOptions: ThemeOption[];
  customColors: Record<string, string>;
  onColorChange: (key: string, value: string) => void;
  onResetColors: () => void;
  onColorEditorActiveChange?: (active: boolean) => void;
}

export default function MapSettingsSection({
  activeMobileTab,
  form,
  onThemeChange,
  selectedTheme,
  themeOptions,
  customColors,
  onColorChange,
  onResetColors,
  onColorEditorActiveChange,
}: MapSettingsSectionProps) {
  const [isThemeEditing, setIsThemeEditing] = useState(false);
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

  function clearColorPickerState() {
    setActiveColorKey(null);
    setActiveColorSession(null);
  }

  function handleThemeSelect(themeId: string) {
    onThemeChange(themeId);
    clearColorPickerState();
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
        "[aria-pressed='true']",
      );
      selectedThemeCard?.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "start",
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [activeMobileTab]);

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
    <section className="space-y-3">

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
    </section>
  );
}
