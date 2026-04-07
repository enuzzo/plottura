import { MIN_DISTANCE_METERS, MAX_DISTANCE_METERS } from "@/core/config";

interface MapDimensionForm {
  width: string;
  height: string;
  distance: string;
}

interface MapDimensionFieldsProps {
  form: MapDimensionForm;
  minPosterCm: number;
  maxPosterCm: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNumericFieldBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  showSizeFields?: boolean;
  showDistanceField?: boolean;
}

export default function MapDimensionFields({
  form,
  minPosterCm,
  maxPosterCm,
  onChange,
  onNumericFieldBlur,
  showSizeFields = true,
  showDistanceField = true,
}: MapDimensionFieldsProps) {
  const SLIDER_MIN = 0;
  const SLIDER_MAX = 1000;

  const clampDistance = (value: number) =>
    Math.min(Math.max(value, MIN_DISTANCE_METERS), MAX_DISTANCE_METERS);

  const getDistanceStep = (distanceMeters: number) => {
    if (distanceMeters < 100_000) return 100;
    if (distanceMeters < 1_000_000) return 1_000;
    if (distanceMeters < 10_000_000) return 10_000;
    return 50_000;
  };

  const snapDistanceToAdaptiveStep = (distanceMeters: number) => {
    const bounded = clampDistance(distanceMeters);
    const step = getDistanceStep(bounded);
    return clampDistance(Math.round(bounded / step) * step);
  };

  const distanceToSliderValue = (distanceMeters: number) => {
    const minLog = Math.log(MIN_DISTANCE_METERS);
    const maxLog = Math.log(MAX_DISTANCE_METERS);
    const ratio =
      (Math.log(clampDistance(distanceMeters)) - minLog) / (maxLog - minLog);
    return Math.round(SLIDER_MIN + ratio * (SLIDER_MAX - SLIDER_MIN));
  };

  const sliderValueToDistance = (sliderValue: number) => {
    const minLog = Math.log(MIN_DISTANCE_METERS);
    const maxLog = Math.log(MAX_DISTANCE_METERS);
    const ratio = (sliderValue - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
    const distance = Math.exp(minLog + ratio * (maxLog - minLog));
    return snapDistanceToAdaptiveStep(distance);
  };

  const formatDistance = (distanceMeters: number) => {
    if (distanceMeters >= 1_000_000) {
      const millions = distanceMeters / 1_000_000;
      const text = Number.isInteger(millions)
        ? millions.toString()
        : millions.toFixed(1).replace(/\.0$/, "");
      return `${text}M m`;
    }

    if (distanceMeters >= 100_000) {
      const thousands = distanceMeters / 1_000;
      const text = Number.isInteger(thousands)
        ? thousands.toString()
        : thousands.toFixed(1).replace(/\.0$/, "");
      return `${text}K m`;
    }

    return `${Math.round(distanceMeters).toLocaleString()} m`;
  };

  const emitDistanceChange = (nextDistance: number) => {
    const syntheticEvent = {
      target: {
        name: "distance",
        value: String(snapDistanceToAdaptiveStep(nextDistance)),
        type: "range",
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  const parsedDistance = Number(form.distance);
  const distanceValue = Number.isFinite(parsedDistance)
    ? clampDistance(parsedDistance)
    : MIN_DISTANCE_METERS;
  const sliderValue = distanceToSliderValue(distanceValue);

  const sliderMetaMarks = [
    MIN_DISTANCE_METERS,
    100_000,
    1_000_000,
    MAX_DISTANCE_METERS,
  ];

  const sliderPositionPercent = (distanceMeters: number) =>
    ((distanceToSliderValue(distanceMeters) - SLIDER_MIN) /
      (SLIDER_MAX - SLIDER_MIN)) *
    100;

  return (
    <div className="space-y-4">
      {showSizeFields ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-text-secondary">Width (cm)</span>
            <input
              className="bg-input border border-border rounded-sm text-base px-2.5 py-1.5 w-full"
              name="width"
              type="number"
              min={minPosterCm}
              max={maxPosterCm}
              step="any"
              value={form.width}
              onChange={onChange}
              onBlur={onNumericFieldBlur}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-text-secondary">Height (cm)</span>
            <input
              className="bg-input border border-border rounded-sm text-base px-2.5 py-1.5 w-full"
              name="height"
              type="number"
              min={minPosterCm}
              max={maxPosterCm}
              step="any"
              value={form.height}
              onChange={onChange}
              onBlur={onNumericFieldBlur}
            />
          </label>
        </div>
      ) : null}

      {showDistanceField ? (
        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Distance (m)</span>
            <input
              className="bg-input border border-border rounded-sm text-sm px-2 py-1 w-24 text-right"
              name="distance"
              type="number"
              min={MIN_DISTANCE_METERS}
              max={MAX_DISTANCE_METERS}
              step="any"
              value={form.distance}
              onChange={onChange}
              onBlur={onNumericFieldBlur}
              aria-label="Distance in meters"
            />
          </span>
          <input
            className="w-full accent-accent"
            name="distance-slider-log"
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={1}
            value={sliderValue}
            onChange={(event) =>
              emitDistanceChange(
                sliderValueToDistance(Number(event.target.value)),
              )
            }
            aria-label="Distance in meters"
          />
          <span className="relative h-4 text-[10px] text-text-secondary">
            {sliderMetaMarks.map((mark, index) => {
              const isFirst = index === 0;
              const isLast = index === sliderMetaMarks.length - 1;
              const left = sliderPositionPercent(mark);
              return (
                <span
                  key={mark}
                  className="absolute whitespace-nowrap"
                  style={{
                    left: `${left}%`,
                    transform: isFirst
                      ? "translateX(0)"
                      : isLast
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                  }}
                >
                  {formatDistance(mark)}
                </span>
              );
            })}
          </span>
        </label>
      ) : null}
    </div>
  );
}
