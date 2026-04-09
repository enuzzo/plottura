import MapDimensionFields from "./MapDimensionFields";
import { Switch } from "@/components/ui/switch";

interface LayerForm {
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
  includeBoundary: boolean;
  includeLandcover: boolean;
  includePlaceLabels: boolean;
  placeLabelDensity: string;
  includeWaterLabels: boolean;
  includeMountainPeaks: boolean;
}

interface LayersSectionProps {
  form: LayerForm;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  minPosterCm: number;
  maxPosterCm: number;
  onNumericFieldBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const LAYERS = [
  { name: "includeBuildings", label: "Show buildings" },
  { name: "includeWater", label: "Show water" },
  { name: "includeParks", label: "Show parks" },
  { name: "includeRoads", label: "Show roads" },
  { name: "includeRail", label: "Show rail" },
  { name: "includeAeroway", label: "Show aeroway" },
  { name: "includeBoundary", label: "Show borders" },
  { name: "includeLandcover", label: "Show landcover" },
  { name: "includePlaceLabels", label: "Place names" },
  { name: "includeWaterLabels", label: "Water names" },
  { name: "includeMountainPeaks", label: "Mountain peaks" },
] as const;

export default function LayersSection({
  form,
  onChange,
  minPosterCm,
  maxPosterCm,
  onNumericFieldBlur,
}: LayersSectionProps) {
  /** Bridge Radix Switch onCheckedChange to the existing ChangeEvent handler. */
  function handleToggle(name: string, checked: boolean) {
    const syntheticEvent = {
      target: { name, type: "checkbox", checked, value: String(checked) },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  }

  return (
    <section className="flex flex-col gap-3">
      {LAYERS.map(({ name, label }) => (
        <div key={name} className="flex items-center justify-between">
          <span className="text-base text-text-secondary">{label}</span>
          <Switch
            checked={Boolean(form[name as keyof LayerForm])}
            onCheckedChange={(checked) => handleToggle(name, checked)}
          />
        </div>
      ))}

      {form.includePlaceLabels && (
        <div className="flex flex-col gap-1.5 pl-1 border-l-2 border-border ml-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Label density</span>
            <span className="text-sm text-text-muted tabular-nums">
              {form.placeLabelDensity}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={16}
            step={1}
            value={Number(form.placeLabelDensity) || 6}
            onChange={(e) => {
              const syntheticEvent = {
                target: {
                  name: "placeLabelDensity",
                  type: "text",
                  value: e.target.value,
                  checked: false,
                },
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(syntheticEvent);
            }}
            className="w-full accent-accent"
          />
          <p className="text-xs text-text-muted">
            1 = major cities only, 16 = villages &amp; hamlets
          </p>
        </div>
      )}

      <div className="mt-2">
        <h3 className="text-sm font-medium text-text-secondary mb-2">
          Map Details
        </h3>
        <div>
          <MapDimensionFields
            form={form}
            minPosterCm={minPosterCm}
            maxPosterCm={maxPosterCm}
            onChange={onChange}
            onNumericFieldBlur={onNumericFieldBlur}
            showSizeFields={false}
          />
        </div>
      </div>
    </section>
  );
}
