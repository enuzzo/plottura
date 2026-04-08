import { withAlpha } from "@/shared/utils/color";

interface GradientFadesProps {
  color: string;
}

/**
 * CSS gradient overlays that fade the top and bottom of the poster frame.
 * Matches the canvas-based `applyFades()` behaviour but runs on the GPU.
 */
export default function GradientFades({ color }: GradientFadesProps) {
  const solid = withAlpha(color, 1);
  const transparent = withAlpha(color, 0);

  return (
    <>
      <div
        className="absolute left-0 right-0 top-0 h-1/4 pointer-events-none z-[2]"
        style={{
          background: `linear-gradient(to bottom, ${solid}, ${transparent})`,
        }}
      />
      <div
        className="absolute left-0 right-0 bottom-0 h-1/4 pointer-events-none z-[2]"
        style={{
          background: `linear-gradient(to top, ${solid}, ${transparent})`,
        }}
      />
    </>
  );
}
