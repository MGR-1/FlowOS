export type CursorGlowSurface = "default" | "onboarding" | "performance_report" | "modal";

export const CURSOR_GLOW_CONFIG = {
  color: "#1D9E75",
  opacity: 0.04,
  radiusBySurface: {
    default: 320,
    onboarding: 480,
    performance_report: 200,
    modal: 180,
  } satisfies Record<CursorGlowSurface, number>,
  radiusTransitionMs: 600,
  focusFadeInMs: 300,
  focusFadeOutMs: 200,
  cursorLeaveFadeOutMs: 400,
} as const;

export interface CursorGlowVariables {
  "--flowos-cursor-x": string;
  "--flowos-cursor-y": string;
  "--flowos-cursor-radius": string;
  "--flowos-cursor-opacity": string;
}

export function cursorGlowVariables(
  x: number,
  y: number,
  surface: CursorGlowSurface,
  visible: boolean,
): CursorGlowVariables {
  return {
    "--flowos-cursor-x": `${Math.round(x)}px`,
    "--flowos-cursor-y": `${Math.round(y)}px`,
    "--flowos-cursor-radius": `${CURSOR_GLOW_CONFIG.radiusBySurface[surface]}px`,
    "--flowos-cursor-opacity": visible ? String(CURSOR_GLOW_CONFIG.opacity) : "0",
  };
}
