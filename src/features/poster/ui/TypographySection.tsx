import { useEffect, useState } from "react";
import { ensureGoogleFont } from "@/core/services";
import { Switch } from "@/components/ui/switch";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import type { FontOption } from "@/core/config";
import {
  PLACEHOLDER_EXAMPLE_CITY,
  PLACEHOLDER_EXAMPLE_COUNTRY,
} from "@/features/location/ui/constants";
import { ChevronDown, RotateCcw } from "lucide-react";

/** Compact slider row for per-element typography controls */
function SliderRow({
  label,
  name,
  min,
  max,
  step,
  value,
  onChange,
  unit,
}: {
  label: string;
  name: string;
  min: number;
  max: number;
  step: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit: string;
}) {
  const numValue = Number(value) || min;
  const display = unit === "×" ? numValue.toFixed(2) : `${numValue.toFixed(2)}${unit}`;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-xs text-text-muted tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numValue}
        onChange={(e) => {
          const syntheticEvent = {
            target: { name, type: "text", value: e.target.value, checked: false },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }}
        className="w-full accent-accent"
      />
    </div>
  );
}

interface TypographySectionProps {
  form: PosterForm;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onResetTypography?: () => void;
  fontOptions: FontOption[];
}

const TYPOGRAPHY_DEFAULTS: Record<string, string | boolean> = {
  textUppercase: true,
  textLetterSpacing: "0.3",
  cityFontScale: "1",
  countryFontScale: "1",
  coordsFontScale: "1",
  creditsFontScale: "1",
  countryUppercase: true,
  coordsLetterSpacing: "0",
};

export default function TypographySection({
  form,
  onChange,
  onResetTypography,
  fontOptions,
}: TypographySectionProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    const families = fontOptions
      .map((option) => String(option.value || "").trim())
      .filter(Boolean);

    void Promise.allSettled(families.map((family) => ensureGoogleFont(family)));
  }, [fontOptions]);

  /** Bridge Radix Switch onCheckedChange to the existing ChangeEvent handler. */
  function handleToggle(name: string, checked: boolean) {
    const syntheticEvent = {
      target: { name, type: "checkbox", checked, value: String(checked) },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  }

  function handleReset() {
    // Reset typography fields to defaults
    for (const [name, value] of Object.entries(TYPOGRAPHY_DEFAULTS)) {
      const syntheticEvent = {
        target: {
          name,
          type: typeof value === "boolean" ? "checkbox" : "text",
          checked: typeof value === "boolean" ? value : false,
          value: String(value),
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    onResetTypography?.();
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-base text-text-secondary">Poster text</span>
        <Switch
          checked={Boolean(form.showPosterText)}
          onCheckedChange={(checked) => handleToggle("showPosterText", checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base text-text-secondary">Show markers</span>
        <Switch
          checked={Boolean(form.showMarkers)}
          onCheckedChange={(checked) => handleToggle("showMarkers", checked)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-text-secondary">Display city</span>
          <input
            className="bg-input border border-border rounded-sm text-base w-full px-3 py-2"
            name="displayCity"
            value={form.displayCity}
            onChange={onChange}
            placeholder={PLACEHOLDER_EXAMPLE_CITY}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-text-secondary">Display country</span>
          <input
            className="bg-input border border-border rounded-sm text-base w-full px-3 py-2"
            name="displayCountry"
            value={form.displayCountry}
            onChange={onChange}
            placeholder={PLACEHOLDER_EXAMPLE_COUNTRY}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-text-secondary">Font</span>
        <select
          className="bg-input border border-border rounded-sm text-base w-full px-3 py-2"
          name="fontFamily"
          value={form.fontFamily}
          onChange={onChange}
        >
          {fontOptions.map((fontOption) => (
            <option
              key={fontOption.value || "default"}
              value={fontOption.value}
              style={{
                fontFamily: fontOption.value
                  ? `"${fontOption.value}", "Space Grotesk", sans-serif`
                  : `"Space Grotesk", sans-serif`,
              }}
            >
              {fontOption.label}
            </option>
          ))}
        </select>
      </label>

      {/* Customize Typography expandable panel */}
      <button
        type="button"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer mt-1"
        onClick={() => setIsCustomizing(!isCustomizing)}
      >
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200${isCustomizing ? " rotate-180" : ""}`}
        />
        <span>Customize text</span>
      </button>

      {isCustomizing && (
        <div className="flex flex-col gap-4 pl-1 border-l-2 border-border ml-1">
          {/* ── City ── */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">City</span>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Uppercase</span>
              <Switch
                checked={Boolean(form.textUppercase)}
                onCheckedChange={(checked) => handleToggle("textUppercase", checked)}
              />
            </div>
            <SliderRow label="Size" name="cityFontScale" min={0.3} max={2} step={0.05} value={form.cityFontScale} onChange={onChange} unit="×" />
            <SliderRow label="Spacing" name="textLetterSpacing" min={-0.1} max={0.5} step={0.02} value={form.textLetterSpacing} onChange={onChange} unit="em" />
          </div>

          {/* ── Country ── */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Country</span>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Uppercase</span>
              <Switch
                checked={Boolean(form.countryUppercase)}
                onCheckedChange={(checked) => handleToggle("countryUppercase", checked)}
              />
            </div>
            <SliderRow label="Size" name="countryFontScale" min={0.3} max={2} step={0.05} value={form.countryFontScale} onChange={onChange} unit="×" />
          </div>

          {/* ── Coordinates ── */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Coordinates</span>
            <SliderRow label="Size" name="coordsFontScale" min={0.3} max={2} step={0.05} value={form.coordsFontScale} onChange={onChange} unit="×" />
            <SliderRow label="Spacing" name="coordsLetterSpacing" min={-0.1} max={0.3} step={0.02} value={form.coordsLetterSpacing} onChange={onChange} unit="em" />
          </div>

          {/* ── Credits ── */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Credits</span>
            <SliderRow label="Size" name="creditsFontScale" min={0.3} max={2} step={0.05} value={form.creditsFontScale} onChange={onChange} unit="×" />
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer self-start mt-1"
            onClick={handleReset}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to defaults</span>
          </button>
        </div>
      )}
    </section>
  );
}
