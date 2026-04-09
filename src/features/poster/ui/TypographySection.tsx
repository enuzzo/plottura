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

interface TypographySectionProps {
  form: PosterForm;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onResetTypography?: () => void;
  fontOptions: FontOption[];
}

const TYPOGRAPHY_DEFAULTS = {
  textUppercase: true,
  textLetterSpacing: "2",
} as const;

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
        <span className="text-base text-text-secondary">Overlay layer</span>
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
        <div className="flex flex-col gap-3 pl-1 border-l-2 border-border ml-1">
          <div className="flex items-center justify-between">
            <span className="text-base text-text-secondary">Uppercase</span>
            <Switch
              checked={Boolean(form.textUppercase)}
              onCheckedChange={(checked) =>
                handleToggle("textUppercase", checked)
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-base text-text-secondary">
                Letter spacing
              </span>
              <span className="text-sm text-text-muted tabular-nums">
                {form.textLetterSpacing}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={6}
              step={1}
              value={Number(form.textLetterSpacing) || 2}
              onChange={(e) => {
                const syntheticEvent = {
                  target: {
                    name: "textLetterSpacing",
                    type: "text",
                    value: e.target.value,
                    checked: false,
                  },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
              }}
              className="w-full accent-accent"
            />
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
