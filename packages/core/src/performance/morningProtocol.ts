import type { SequenceStep } from "./sequencer";

export const DEFAULT_MORNING_PROTOCOL_STEPS: SequenceStep[] = [
  { id: "daylight", title: "Daylight check-in", required: true, order: 1 },
  { id: "hydration", title: "Hydration", required: true, order: 2 },
  { id: "caffeine", title: "Start caffeine delay", description: "Delay caffeine for 90–120 minutes.", required: false, order: 3 },
  { id: "movement", title: "Movement", required: true, order: 4 },
];

export interface MorningProtocolConfig {
  enabled: boolean;
  lockMitsUntilComplete: boolean;
  allowOverride: boolean;
  steps: SequenceStep[];
}

export const DEFAULT_MORNING_PROTOCOL_CONFIG: MorningProtocolConfig = {
  enabled: true,
  lockMitsUntilComplete: true,
  allowOverride: true,
  steps: DEFAULT_MORNING_PROTOCOL_STEPS,
};
