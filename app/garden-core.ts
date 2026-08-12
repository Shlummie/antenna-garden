export const STORAGE_KEY = "antenna-garden:session:v1";
export const STORAGE_VERSION = 1 as const;

export type MotionPreference = "system" | "full" | "reduced";

export type SignalDefinition = {
  id: string;
  center: number;
  width: number;
  callSign: string;
  fragment: string;
  specimen: string;
  tone: number;
  color: "verdigris" | "oxide" | "cobalt";
  final?: boolean;
};

export type PlantedSignal = {
  id: string;
  quality: number;
  tunedFrequency: number;
  order: number;
};

export type StoredGardenState = {
  v: typeof STORAGE_VERSION;
  sessionSeed: string;
  frequency: number;
  started: boolean;
  planted: PlantedSignal[];
  motion: MotionPreference;
};

export type SpecimenDescriptor = {
  height: number;
  lean: number;
  branches: number;
  leafStyle: number;
  crown: number;
  phase: number;
  rootSpread: number;
  asymmetry: number;
};

export const ordinarySignals: SignalDefinition[] = [
  {
    id: "porch-lamp",
    center: 13.2,
    width: 3.4,
    callSign: "RAIN / 13",
    fragment: "…leave the porch lamp under the soil…",
    specimen: "Lampwick fern",
    tone: 196,
    color: "verdigris",
  },
  {
    id: "surname-rain",
    center: 29.4,
    width: 2.8,
    callSign: "LOW TIDE / 29",
    fragment: "…the rain learned our surname…",
    specimen: "Nameweather sprig",
    tone: 220,
    color: "verdigris",
  },
  {
    id: "three-knocks",
    center: 44.8,
    width: 3.1,
    callSign: "THREE / 45",
    fragment: "Three knocks. Then the weather answered.",
    specimen: "Knockbell reed",
    tone: 246.94,
    color: "oxide",
  },
  {
    id: "quiet-branch",
    center: 62.1,
    width: 2.6,
    callSign: "STILL AIR / 62",
    fragment: "…do not prune the quiet branch…",
    specimen: "Hushwire crown",
    tone: 293.66,
    color: "verdigris",
  },
  {
    id: "listening-roots",
    center: 81.6,
    width: 3.6,
    callSign: "ROOT LINE / 82",
    fragment: "We broadcast because the roots were listening.",
    specimen: "Root aerial",
    tone: 329.63,
    color: "oxide",
  },
];

export const finalSignal: SignalDefinition = {
  id: "impossible-band",
  center: 95.7,
  width: 2.2,
  callSign: "NORTH-BELOW / ∞",
  fragment: "Nothing you found was lost. It had only grown difficult to tune.",
  specimen: "Impossible blue",
  tone: 392,
  color: "cobalt",
  final: true,
};

export const allSignals = [...ordinarySignals, finalSignal];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function mix32(value: number): number {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  return (x ^ (x >>> 16)) >>> 0;
}

export function hashString(value: string): number {
  const normalized = value.normalize("NFC").slice(0, 96);
  let hash = 0x811c9dc5;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return mix32(hash);
}

export function keyedUnit(seed: string, ...keys: Array<string | number>): number {
  let value = hashString(seed);
  for (const key of keys) {
    const keyValue = typeof key === "number" ? key >>> 0 : hashString(key);
    value = mix32(value ^ mix32(keyValue + 0x9e3779b9));
  }
  return value / 0x100000000;
}

export function signalStrength(frequency: number, signal: SignalDefinition): number {
  const distance = Math.abs(clamp(frequency, 0, 100) - signal.center);
  const gaussian = Math.exp(-(distance * distance) / (2 * signal.width * signal.width));
  return clamp(gaussian, 0, 1);
}

export function availableSignals(planted: PlantedSignal[]): SignalDefinition[] {
  const plantedIds = new Set(planted.map((item) => item.id));
  const available = ordinarySignals.filter((signal) => !plantedIds.has(signal.id));
  if (plantedIds.size >= ordinarySignals.length && !plantedIds.has(finalSignal.id)) {
    available.push(finalSignal);
  }
  return available;
}

export function nearestSignal(
  frequency: number,
  planted: PlantedSignal[],
): { signal: SignalDefinition; strength: number } | null {
  const available = availableSignals(planted);
  if (available.length === 0) return null;

  let best = available[0];
  let bestStrength = signalStrength(frequency, best);
  for (const signal of available.slice(1)) {
    const strength = signalStrength(frequency, signal);
    if (strength > bestStrength) {
      best = signal;
      bestStrength = strength;
    }
  }
  return { signal: best, strength: bestStrength };
}

export function specimenDescriptor(
  sessionSeed: string,
  planted: PlantedSignal,
): SpecimenDescriptor {
  const quality = clamp(planted.quality, 0, 1);
  const namespace = `${planted.id}:${planted.order}`;
  return {
    height: 0.56 + keyedUnit(sessionSeed, namespace, "height") * 0.34,
    lean: (keyedUnit(sessionSeed, namespace, "lean") - 0.5) * 0.22,
    branches: 3 + Math.floor(keyedUnit(sessionSeed, namespace, "branches") * 5),
    leafStyle: Math.floor(keyedUnit(sessionSeed, namespace, "leaf-style") * 3),
    crown: 0.2 + keyedUnit(sessionSeed, namespace, "crown") * 0.8,
    phase: keyedUnit(sessionSeed, namespace, "phase") * Math.PI * 2,
    rootSpread: 0.48 + keyedUnit(sessionSeed, namespace, "roots") * 0.44,
    asymmetry: (1 - quality) * (0.25 + keyedUnit(sessionSeed, namespace, "asymmetry") * 0.55),
  };
}

export function createSessionSeed(values?: Uint32Array): string {
  let entropy = values;
  if (!entropy) {
    entropy = new Uint32Array(2);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(entropy);
    } else {
      entropy[0] = 0xa713e11a;
      entropy[1] = 0x6a4d2c09;
    }
  }
  return `lowtide-${entropy[0].toString(16).padStart(8, "0")}-${entropy[1]
    .toString(16)
    .padStart(8, "0")}`;
}

export function defaultGardenState(sessionSeed = "lowtide-antenna-0001"): StoredGardenState {
  return {
    v: STORAGE_VERSION,
    sessionSeed,
    frequency: 4.8,
    started: false,
    planted: [],
    motion: "system",
  };
}

function isMotionPreference(value: unknown): value is MotionPreference {
  return value === "system" || value === "full" || value === "reduced";
}

export function validateStoredState(value: unknown): StoredGardenState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<StoredGardenState>;
  if (candidate.v !== STORAGE_VERSION || typeof candidate.sessionSeed !== "string") return null;
  if (candidate.sessionSeed.length < 3 || candidate.sessionSeed.length > 96) return null;
  if (!Array.isArray(candidate.planted) || !isMotionPreference(candidate.motion)) return null;

  const allowedIds = new Set(allSignals.map((signal) => signal.id));
  const seen = new Set<string>();
  const planted: PlantedSignal[] = [];
  for (const raw of candidate.planted.slice(0, allSignals.length)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Partial<PlantedSignal>;
    if (typeof item.id !== "string" || !allowedIds.has(item.id) || seen.has(item.id)) continue;
    if (!Number.isFinite(item.quality) || !Number.isFinite(item.tunedFrequency)) continue;
    if (!Number.isInteger(item.order)) continue;
    seen.add(item.id);
    planted.push({
      id: item.id,
      quality: clamp(item.quality as number, 0, 1),
      tunedFrequency: clamp(item.tunedFrequency as number, 0, 100),
      order: clamp(item.order as number, 0, allSignals.length - 1),
    });
  }

  return {
    v: STORAGE_VERSION,
    sessionSeed: candidate.sessionSeed.normalize("NFC"),
    frequency: clamp(Number(candidate.frequency) || 0, 0, 100),
    started: Boolean(candidate.started),
    planted: planted.sort((a, b) => a.order - b.order),
    motion: candidate.motion,
  };
}

export function sessionNumber(sessionSeed: string): string {
  return String(hashString(sessionSeed) % 100000).padStart(5, "0");
}

export function gardenOrientation(sessionSeed: string, planted: PlantedSignal[]): string {
  const directions = [
    "NORTH-BELOW",
    "RAINWARD",
    "INLAND-OF-FOG",
    "TOWARD THE QUIET",
    "SEAWARD / UNDER",
    "EAST OF YESTERDAY",
  ];
  return directions[Math.floor(keyedUnit(sessionSeed, planted.length, "orientation") * directions.length)];
}

export function listeningReceipt(state: StoredGardenState): string {
  const entries = state.planted
    .map((planted) => {
      const signal = allSignals.find((candidate) => candidate.id === planted.id);
      return signal
        ? `${String(planted.order + 1).padStart(2, "0")}  ${signal.callSign.padEnd(20)} ${signal.specimen}`
        : null;
    })
    .filter(Boolean)
    .join("\n");

  return [
    "ANTENNA GARDEN — LISTENING RECEIPT",
    `GARDEN NO. ${sessionNumber(state.sessionSeed)}`,
    `SIGNALS KEPT ${state.planted.length}`,
    `LISTENS TOWARD ${gardenOrientation(state.sessionSeed, state.planted)}`,
    "",
    entries,
    "",
    "Nothing you found was lost. It had only grown difficult to tune.",
  ].join("\n");
}
