import { useEffect } from "react";
import { ensureGoogleFont } from "@/core/services";
import { Switch } from "@/components/ui/switch";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import type { FontOption } from "@/core/config";
import {
  PLACEHOLDER_EXAMPLE_CITY,
  PLACEHOLDER_EXAMPLE_COUNTRY,
} from "@/features/location/ui/constants";

interface TypographySectionProps {
  form: PosterForm;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  fontOptions: FontOption[];
}

export default function TypographySection({
  form,
  onChange,
  fontOptions,
}: TypographySectionProps) {
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
    </section>
  );
}
