"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  allSignals,
  availableSignals,
  clamp,
  createSessionSeed,
  defaultGardenState,
  finalSignal,
  gardenOrientation,
  listeningReceipt,
  nearestSignal,
  ordinarySignals,
  sessionNumber,
  specimenDescriptor,
  STORAGE_KEY,
  type MotionPreference,
  type PlantedSignal,
  type SignalDefinition,
  type StoredGardenState,
  validateStoredState,
} from "./garden-core";

type PendingSeed = {
  signal: SignalDefinition;
  quality: number;
};

type CanvasMetrics = {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
};

const PAPER = "#ddd5bd";
const INK = "#20251f";
const VERDIGRIS = "#386c62";
const OXIDE = "#9a4d2c";
const COBALT = "#174fbe";

function prepareCanvas(canvas: HTMLCanvasElement): CanvasMetrics | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  const backingWidth = Math.round(width * dpr);
  const backingHeight = Math.round(height * dpr);
  if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
    canvas.width = backingWidth;
    canvas.height = backingHeight;
  }
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  return { context, width, height, dpr };
}

function drawPaperField(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = PAPER;
  context.fillRect(0, 0, width, height);

  context.save();
  context.strokeStyle = "rgba(32, 37, 31, 0.075)";
  context.lineWidth = 1;
  for (let y = 24; y < height; y += 24) {
    context.beginPath();
    context.moveTo(0, y + 0.5);
    context.lineTo(width, y + 0.5);
    context.stroke();
  }
  for (let x = 24; x < width; x += 24) {
    context.beginPath();
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, height);
    context.stroke();
  }
  context.restore();
}

function drawTrace(
  canvas: HTMLCanvasElement,
  frequency: number,
  strength: number,
  time: number,
  reducedMotion: boolean,
  impossibleSignalActive: boolean,
) {
  const metrics = prepareCanvas(canvas);
  if (!metrics) return;
  const { context, width, height } = metrics;
  drawPaperField(context, width, height);

  context.save();
  context.strokeStyle = "rgba(32, 37, 31, 0.22)";
  context.lineWidth = 1;
  context.setLineDash([3, 5]);
  context.beginPath();
  context.moveTo(0, height * 0.5);
  context.lineTo(width, height * 0.5);
  context.stroke();
  context.setLineDash([]);

  const phase = reducedMotion ? 0 : time * 0.0013;
  const baseAmplitude = height * (0.08 + strength * 0.19);
  context.beginPath();
  for (let x = 0; x <= width; x += 2) {
    const normalized = x / Math.max(1, width);
    const carrier =
      Math.sin(normalized * 57 + frequency * 0.13 + phase * 2.1) * 0.28 +
      Math.sin(normalized * 133 - frequency * 0.07 - phase * 1.4) * 0.15 +
      Math.sin(normalized * 17 + phase) * 0.16;
    const signalEnvelope = Math.exp(-Math.pow((normalized - 0.62) / 0.18, 2));
    const organized = Math.sin(normalized * 28 + phase * 0.55) * strength * signalEnvelope;
    const y = height * 0.5 + (carrier + organized) * baseAmplitude;
    if (x === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.strokeStyle = impossibleSignalActive ? COBALT : strength > 0.74 ? VERDIGRIS : INK;
  context.globalAlpha = 0.82 + strength * 0.18;
  context.lineWidth = strength > 0.74 ? 2 : 1.25;
  context.stroke();

  if (strength > 0.35) {
    const markerX = width * 0.62;
    const radius = 7 + strength * 7;
    context.strokeStyle = impossibleSignalActive ? COBALT : VERDIGRIS;
    context.globalAlpha = 0.32 + strength * 0.5;
    context.beginPath();
    context.arc(markerX, height * 0.5, radius, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(markerX, height * 0.5, 2.5, 0, Math.PI * 2);
    context.fillStyle = context.strokeStyle;
    context.fill();
  }
  context.restore();
}

function plottedColor(signal: SignalDefinition): string {
  if (signal.color === "cobalt") return COBALT;
  if (signal.color === "oxide") return OXIDE;
  return VERDIGRIS;
}

function drawSpecimen(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: StoredGardenState,
  planted: PlantedSignal,
  x: number,
  time: number,
  reducedMotion: boolean,
) {
  const signal = allSignals.find((candidate) => candidate.id === planted.id);
  if (!signal) return;
  const descriptor = specimenDescriptor(state.sessionSeed, planted);
  const groundY = height * 0.68;
  const plantHeight = height * (0.28 + descriptor.height * 0.29);
  const sway = reducedMotion
    ? 0
    : Math.sin(time * 0.00055 + descriptor.phase) * plantHeight * 0.014;
  const topX = x + descriptor.lean * plantHeight + sway;
  const topY = groundY - plantHeight;
  const color = plottedColor(signal);

  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineCap = "round";
  context.lineJoin = "round";

  context.globalAlpha = 0.48;
  context.lineWidth = 1;
  const rootCount = 5 + Math.round(descriptor.rootSpread * 4);
  for (let root = 0; root < rootCount; root += 1) {
    const normalized = rootCount === 1 ? 0.5 : root / (rootCount - 1);
    const spread = (normalized - 0.5) * width * 0.16 * descriptor.rootSpread;
    context.beginPath();
    context.moveTo(x, groundY);
    context.bezierCurveTo(
      x + spread * 0.25,
      groundY + height * 0.06,
      x + spread * 0.8,
      groundY + height * (0.12 + normalized * 0.03),
      x + spread,
      groundY + height * 0.24,
    );
    context.stroke();
  }

  context.globalAlpha = 0.92;
  context.lineWidth = signal.final ? 2.2 : 1.45;
  context.beginPath();
  context.moveTo(x, groundY);
  context.bezierCurveTo(
    x + descriptor.lean * plantHeight * 0.08,
    groundY - plantHeight * 0.36,
    topX - descriptor.lean * plantHeight * 0.2,
    groundY - plantHeight * 0.72,
    topX,
    topY,
  );
  context.stroke();

  const branches = descriptor.branches;
  for (let branch = 0; branch < branches; branch += 1) {
    const u = (branch + 1) / (branches + 1);
    const side = branch % 2 === 0 ? -1 : 1;
    const branchY = groundY - plantHeight * (0.23 + u * 0.62);
    const stemX = x + (topX - x) * Math.pow(0.18 + u * 0.76, 1.25);
    const reach = plantHeight * (0.11 + (1 - u) * 0.09) * (1 + descriptor.asymmetry * side);
    const branchX = stemX + side * reach;
    const branchTipY = branchY - plantHeight * (0.055 + u * 0.03);

    context.lineWidth = 1.05;
    context.beginPath();
    context.moveTo(stemX, branchY);
    context.quadraticCurveTo(
      stemX + side * reach * 0.52,
      branchY - plantHeight * 0.035,
      branchX,
      branchTipY,
    );
    context.stroke();

    const leafCount = 2 + ((branch + descriptor.leafStyle) % 3);
    for (let leaf = 0; leaf < leafCount; leaf += 1) {
      const leafU = (leaf + 1) / (leafCount + 1);
      const leafX = stemX + (branchX - stemX) * leafU;
      const leafY = branchY + (branchTipY - branchY) * leafU;
      const leafSide = leaf % 2 === 0 ? -1 : 1;
      const leafSize = 2.5 + descriptor.crown * 2.8;
      if (descriptor.leafStyle === 0) {
        context.beginPath();
        context.ellipse(
          leafX + side * leafSide * leafSize,
          leafY - leafSize,
          leafSize * 1.55,
          leafSize * 0.72,
          side * 0.62,
          0,
          Math.PI * 2,
        );
        context.stroke();
      } else if (descriptor.leafStyle === 1) {
        context.beginPath();
        context.arc(leafX, leafY - leafSize, leafSize * 0.64, 0, Math.PI * 2);
        context.fill();
      } else {
        context.beginPath();
        context.moveTo(leafX, leafY);
        context.lineTo(leafX + side * leafSide * leafSize * 1.7, leafY - leafSize * 1.8);
        context.stroke();
      }
    }

    context.beginPath();
    context.arc(branchX, branchTipY, 2 + planted.quality * 1.4, 0, Math.PI * 2);
    if ((branch + descriptor.leafStyle) % 2 === 0) context.fill();
    else context.stroke();
  }

  context.lineWidth = 1;
  context.globalAlpha = 0.72;
  context.beginPath();
  if (descriptor.leafStyle === 0) {
    context.arc(topX, topY, 7 + descriptor.crown * 4, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(topX, topY, 2.1, 0, Math.PI * 2);
    context.fill();
  } else if (descriptor.leafStyle === 1) {
    for (let petal = 0; petal < 5; petal += 1) {
      const angle = (petal / 5) * Math.PI * 2 + descriptor.phase;
      context.beginPath();
      context.ellipse(
        topX + Math.cos(angle) * 6,
        topY + Math.sin(angle) * 6,
        4.5,
        2.2,
        angle,
        0,
        Math.PI * 2,
      );
      context.stroke();
    }
  } else {
    context.beginPath();
    context.moveTo(topX - 7, topY + 5);
    context.lineTo(topX, topY - 8);
    context.lineTo(topX + 7, topY + 5);
    context.closePath();
    context.stroke();
  }
  context.restore();

  return { topX, topY, color };
}

function drawGarden(
  canvas: HTMLCanvasElement,
  state: StoredGardenState,
  time: number,
  reducedMotion: boolean,
) {
  const metrics = prepareCanvas(canvas);
  if (!metrics) return;
  const { context, width, height } = metrics;
  drawPaperField(context, width, height);

  context.save();
  context.strokeStyle = "rgba(32, 37, 31, 0.33)";
  context.lineWidth = 1;
  for (let line = 0; line < 7; line += 1) {
    const baseY = height * (0.49 + line * 0.055);
    context.beginPath();
    context.moveTo(-20, baseY);
    for (let x = -20; x <= width + 40; x += 40) {
      const y =
        baseY +
        Math.sin(x * 0.012 + line * 0.84) * (8 + line * 1.8) +
        Math.sin(x * 0.027 - line) * 3;
      context.lineTo(x, y);
    }
    context.stroke();
  }

  context.strokeStyle = "rgba(32, 37, 31, 0.45)";
  context.setLineDash([5, 7]);
  context.beginPath();
  context.moveTo(0, height * 0.68);
  context.lineTo(width, height * 0.68);
  context.stroke();
  context.setLineDash([]);

  if (state.planted.length === 0) {
    context.fillStyle = "rgba(32, 37, 31, 0.62)";
    context.font = "12px 'Atkinson Hyperlegible', sans-serif";
    context.textAlign = "center";
    context.fillText("THE CHART IS WAITING FOR A ROOT", width / 2, height * 0.43);
    context.restore();
    return;
  }

  const plotted: Array<{ topX: number; topY: number; color: string }> = [];
  state.planted.forEach((planted, index) => {
    const spacing = width / (state.planted.length + 1);
    const x = spacing * (index + 1);
    const point = drawSpecimen(context, width, height, state, planted, x, time, reducedMotion);
    if (point) plotted.push(point);
  });

  if (state.planted.some((planted) => planted.id === finalSignal.id) && plotted.length > 1) {
    context.save();
    context.strokeStyle = COBALT;
    context.globalAlpha = 0.42;
    context.lineWidth = 1.2;
    context.beginPath();
    plotted.forEach((point, index) => {
      if (index === 0) context.moveTo(point.topX, point.topY);
      else context.lineTo(point.topX, point.topY);
    });
    context.stroke();
    const centerX = plotted.reduce((sum, point) => sum + point.topX, 0) / plotted.length;
    const centerY = plotted.reduce((sum, point) => sum + point.topY, 0) / plotted.length;
    context.beginPath();
    context.arc(centerX, centerY, reducedMotion ? 8 : 8 + Math.sin(time * 0.0015) * 2, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }
  context.restore();
}

class GardenAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private drones: OscillatorNode[] = [];

  async start() {
    if (this.context) {
      if (this.context.state === "suspended") await this.context.resume();
      return;
    }
    const AudioContextConstructor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) throw new Error("This browser has no Web Audio support.");

    const context = new AudioContextConstructor();
    const master = context.createGain();
    const filter = context.createBiquadFilter();
    const compressor = context.createDynamicsCompressor();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.16);
    filter.type = "lowpass";
    filter.frequency.value = 520;
    filter.Q.value = 1.4;
    master.connect(filter).connect(compressor).connect(context.destination);

    const droneA = context.createOscillator();
    const droneB = context.createOscillator();
    droneA.type = "sine";
    droneB.type = "triangle";
    droneA.frequency.value = 54;
    droneB.frequency.value = 81;
    const gainA = context.createGain();
    const gainB = context.createGain();
    gainA.gain.value = 0.32;
    gainB.gain.value = 0.08;
    droneA.connect(gainA).connect(master);
    droneB.connect(gainB).connect(master);
    droneA.start();
    droneB.start();

    this.context = context;
    this.master = master;
    this.filter = filter;
    this.drones = [droneA, droneB];
    if (context.state === "suspended") await context.resume();
  }

  setTuning(frequency: number, strength: number) {
    if (!this.context || !this.filter) return;
    const now = this.context.currentTime;
    const target = 260 + frequency * 18 + strength * 1050;
    this.filter.frequency.setTargetAtTime(target, now, 0.045);
    this.filter.Q.setTargetAtTime(0.8 + strength * 8, now, 0.06);
    this.drones.forEach((drone, index) => {
      const base = index === 0 ? 48 : 72;
      drone.frequency.setTargetAtTime(base + frequency * (index === 0 ? 0.22 : 0.31), now, 0.08);
    });
  }

  ping(signal: SignalDefinition, quality: number) {
    if (!this.context || !this.master) return;
    const context = this.context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const pan = context.createStereoPanner();
    oscillator.type = signal.final ? "sine" : quality > 0.86 ? "triangle" : "sine";
    oscillator.frequency.value = signal.tone;
    pan.pan.value = (signal.center / 100 - 0.5) * 0.8;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.4);
    oscillator.connect(gain).connect(pan).connect(this.master);
    oscillator.start();
    oscillator.stop(context.currentTime + 1.45);
    oscillator.addEventListener("ended", () => {
      oscillator.disconnect();
      gain.disconnect();
      pan.disconnect();
    });
  }

  async stop() {
    if (!this.context) return;
    const context = this.context;
    const now = context.currentTime;
    if (this.master) {
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0.0001, now, 0.018);
    }
    this.drones.forEach((drone) => {
      try {
        drone.stop(now + 0.06);
      } catch {
        // A previously stopped node needs no second teardown.
      }
    });
    await new Promise((resolve) => window.setTimeout(resolve, 70));
    await context.close();
    this.context = null;
    this.master = null;
    this.filter = null;
    this.drones = [];
  }
}

export function AntennaGarden() {
  const [state, setState] = useState<StoredGardenState>(() => defaultGardenState());
  const [hydrated, setHydrated] = useState(false);
  const [pendingSeed, setPendingSeed] = useState<PendingSeed | null>(null);
  const [lockProgress, setLockProgress] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const [status, setStatus] = useState("This set was not switched off.");
  const [error, setError] = useState<string | null>(null);
  const [idleMessage, setIdleMessage] = useState(false);
  const traceCanvasRef = useRef<HTMLCanvasElement>(null);
  const gardenCanvasRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const audioRef = useRef<GardenAudio | null>(null);

  const nearest = useMemo(
    () => nearestSignal(state.frequency, state.planted),
    [state.frequency, state.planted],
  );
  const strength = nearest?.strength ?? 0;
  const plantedIds = useMemo(() => new Set(state.planted.map((item) => item.id)), [state.planted]);
  const isComplete = plantedIds.has(finalSignal.id);
  const finalUnlocked =
    state.planted.filter((item) => ordinarySignals.some((signal) => signal.id === item.id)).length >=
    ordinarySignals.length;
  const impossibleSignalActive = Boolean(nearest?.signal.final && strength >= 0.35);
  const reducedMotion =
    state.motion === "reduced" || (state.motion === "system" && systemReduced);
  const progressReady = lockProgress >= 100 && Boolean(nearest);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loaded: StoredGardenState | null = null;
    let loadError: string | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = validateStoredState(JSON.parse(raw));
      if (raw && !loaded) {
        loadError = "The old listening record was unreadable. A clean chart has been opened.";
      }
    } catch {
      loadError = "Device storage is unavailable. This garden will live only in the current tab.";
    }
    queueMicrotask(() => {
      if (cancelled) return;
      const nextState = loaded ?? defaultGardenState(createSessionSeed());
      setState(nextState);
      if (loaded?.started) {
        const completed = loaded.planted.some((item) => item.id === finalSignal.id);
        setStatus(
          completed
            ? "The listening garden has been restored. Its antenna remains open."
            : `Listening chart restored with ${loaded.planted.length} ${
                loaded.planted.length === 1 ? "specimen" : "specimens"
              } kept.`,
        );
      }
      if (loadError) setError(loadError);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      queueMicrotask(() =>
        setError("The chart could not be saved on this device. You can still finish this session."),
      );
    }
  }, [hydrated, state]);

  useEffect(() => {
    if (state.started || idleMessage) return;
    const timer = window.setTimeout(() => {
      setIdleMessage(true);
      setStatus("Thank you for not interrupting.");
    }, 40000);
    return () => window.clearTimeout(timer);
  }, [idleMessage, state.started]);

  useEffect(() => {
    if (!state.started || pendingSeed || isComplete || !nearest) {
      return;
    }
    const interval = window.setInterval(() => {
      setLockProgress((current) => {
        if (nearest.strength >= 0.78) {
          return Math.min(100, current + 2.4 + nearest.strength * 2.2);
        }
        return Math.max(0, current - 5.5);
      });
    }, 55);
    return () => window.clearInterval(interval);
  }, [isComplete, nearest, pendingSeed, state.started]);

  useEffect(() => {
    if (soundOn) audioRef.current?.setTuning(state.frequency, strength);
  }, [soundOn, state.frequency, strength]);

  useEffect(() => {
    const traceCanvas = traceCanvasRef.current;
    const gardenCanvas = gardenCanvasRef.current;
    if (!traceCanvas || !gardenCanvas) return;
    let animationFrame = 0;
    let resizeFrame = 0;

    const render = (time: number) => {
      drawTrace(
        traceCanvas,
        state.frequency,
        strength,
        time,
        reducedMotion,
        impossibleSignalActive,
      );
      drawGarden(gardenCanvas, state, time, reducedMotion);
      if (!reducedMotion) animationFrame = window.requestAnimationFrame(render);
    };

    const requestRender = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => render(performance.now()));
    };

    const observer = new ResizeObserver(requestRender);
    observer.observe(traceCanvas);
    observer.observe(gardenCanvas);
    render(performance.now());

    const handleVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrame);
      } else if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(render);
      } else {
        render(performance.now());
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(resizeFrame);
    };
  }, [impossibleSignalActive, reducedMotion, state, strength]);

  useEffect(() => {
    return () => {
      void audioRef.current?.stop();
    };
  }, []);

  const setFrequency = useCallback((next: number) => {
    const frequency = clamp(next, 0, 100);
    setState((current) => ({ ...current, frequency }));
  }, []);

  const wakeReceiver = useCallback(() => {
    setState((current) => ({ ...current, started: true }));
    setIdleMessage(false);
    setStatus("The receiver is awake. Turn slowly; it frightens easily.");
  }, []);

  const lockSignal = useCallback(() => {
    if (!nearest || lockProgress < 100) return;
    const quality = clamp(0.58 + nearest.strength * 0.42, 0, 1);
    setPendingSeed({ signal: nearest.signal, quality });
    setLockProgress(0);
    setStatus(`${nearest.signal.callSign} held. Its fragment has curled into a seed.`);
    audioRef.current?.ping(nearest.signal, quality);
  }, [lockProgress, nearest]);

  const plantPendingSeed = useCallback(() => {
    if (!pendingSeed) return;
    const nextPlant: PlantedSignal = {
      id: pendingSeed.signal.id,
      quality: pendingSeed.quality,
      tunedFrequency: state.frequency,
      order: state.planted.length,
    };
    setState((current) => ({ ...current, planted: [...current.planted, nextPlant] }));
    audioRef.current?.ping(pendingSeed.signal, pendingSeed.quality);
    if (pendingSeed.signal.final) {
      setStatus("The blue band has rooted. The garden was an antenna all along.");
    } else if (state.planted.length + 1 === ordinarySignals.length) {
      setStatus("Five roots have formed one pressure system. The scale now continues past itself.");
      window.setTimeout(() => setFrequency(finalSignal.center - 5.4), 180);
    } else {
      setStatus(`${pendingSeed.signal.specimen} planted. Its overtone has joined the weather.`);
    }
    setPendingSeed(null);
  }, [pendingSeed, setFrequency, state.frequency, state.planted.length]);

  const toggleSound = useCallback(async () => {
    setError(null);
    if (soundOn) {
      await audioRef.current?.stop();
      audioRef.current = null;
      setSoundOn(false);
      setStatus("Silence is also a band.");
      return;
    }
    try {
      const engine = new GardenAudio();
      await engine.start();
      engine.setTuning(state.frequency, strength);
      audioRef.current = engine;
      setSoundOn(true);
      setStatus("Room hum opened. Sound remains under your control.");
    } catch (caught) {
      setSoundOn(false);
      setError(caught instanceof Error ? caught.message : "Sound could not be opened. The visual receiver still works.");
    }
  }, [soundOn, state.frequency, strength]);

  const exportReceipt = useCallback(() => {
    try {
      const blob = new Blob([listeningReceipt(state)], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `antenna-garden-${sessionNumber(state.sessionSeed)}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("Listening receipt exported.");
    } catch {
      setError("The receipt could not be exported. Your garden is still preserved on this device.");
    }
  }, [state]);

  const exportGardenImage = useCallback(() => {
    const canvas = gardenCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("The garden image could not be prepared. Try the text receipt instead.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `antenna-garden-${sessionNumber(state.sessionSeed)}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("Garden plate exported as a PNG.");
    }, "image/png");
  }, [state.sessionSeed]);

  const resetGarden = useCallback(async () => {
    await audioRef.current?.stop();
    audioRef.current = null;
    setSoundOn(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Reset still succeeds in memory when storage is unavailable.
    }
    setState(defaultGardenState(createSessionSeed()));
    setPendingSeed(null);
    setLockProgress(0);
    setError(null);
    setStatus("A clean chart has been fitted. The receiver is asleep.");
    dialogRef.current?.close();
  }, []);

  const motionLabel: Record<MotionPreference, string> = {
    system: "System motion",
    full: "Full motion",
    reduced: "Reduced motion",
  };

  const signalDisplay = isComplete
    ? "GARDEN LISTENING"
    : !state.started
      ? "SET ASLEEP"
      : strength < 0.18
        ? "OPEN WEATHER"
        : strength < 0.48
          ? "TRACE DETECTED"
          : nearest?.signal.callSign ?? "NO OPEN BAND";
  const coherence = Math.round(strength * 100);
  const lockMilestone =
    lockProgress >= 100 ? 100 : lockProgress >= 75 ? 75 : lockProgress >= 50 ? 50 : lockProgress >= 25 ? 25 : 0;
  const tuningValueText = !state.started
    ? `${state.frequency.toFixed(1)} weather units. Receiver asleep; wake it before tuning.`
    : `${state.frequency.toFixed(1)} weather units. ${signalDisplay}, ${coherence}% coherence.${
        progressReady ? " Ready to lock." : strength >= 0.78 ? " Hold steady." : " Keep tuning."
      }`;
  const accessibleLockStatus = pendingSeed
    ? `${pendingSeed.signal.callSign} is held and ready to plant.`
    : isComplete
      ? "All six signals are planted. The antenna circuit is complete."
      : !state.started
        ? "Receiver asleep. Wake the receiver before tuning."
        : progressReady
          ? `${nearest?.signal.callSign ?? "Signal"} is locked. Activate Lock signal.`
          : strength >= 0.78
            ? lockMilestone > 0
              ? `Signal steady. Lock chamber ${lockMilestone}% full. Keep holding this frequency.`
              : "Signal steady. The lock chamber is filling; keep holding this frequency."
            : `${signalDisplay}, ${coherence}% coherence. Keep tuning.`;

  return (
    <main className={`antenna-garden ${isComplete ? "garden-complete" : ""}`}>
      <a className="skip-link" href="#tuning-control">
        Skip to tuning control
      </a>

      <section className="instrument" aria-labelledby="garden-title">
        <header className="title-plate">
          <div>
            <h1 id="garden-title">ANTENNA GARDEN</h1>
            <p>Coastal listening station No. 7</p>
          </div>
          <dl className="session-stamp" aria-label="Current session">
            <div>
              <dt>Garden</dt>
              <dd>No. {sessionNumber(state.sessionSeed)}</dd>
            </div>
            <div>
              <dt>Kept</dt>
              <dd>{state.planted.length} / {allSignals.length}</dd>
            </div>
          </dl>
        </header>

        <section className="tuner-bench" aria-labelledby="tuner-heading">
          <div className="bench-copy">
            <h2 id="tuner-heading">Turn slowly. It frightens easily.</h2>
            <ol className="ritual-steps">
              <li>Turn the dial</li>
              <li>Hold the weather</li>
              <li>Plant what answers</li>
            </ol>
          </div>

          {!state.started ? (
            <button className="primary-lever mobile-wake-lever" type="button" onClick={wakeReceiver}>
              <span>First</span>
              <strong>WAKE THE RECEIVER</strong>
            </button>
          ) : null}

          <div className={`dial ${state.started ? "dial-awake" : ""}`} aria-hidden="true">
            <div className="dial-arc" />
            <div
              className="dial-needle"
              style={{ transform: `rotate(${-64 + state.frequency * 1.28}deg)` }}
            />
            <div className="dial-pivot" />
            <span className="dial-mark dial-mark-start">0</span>
            <span className="dial-mark dial-mark-mid">50</span>
            <span className="dial-mark dial-mark-end">100</span>
          </div>

          <div className="readout-row">
            <div className={`frequency-readout ${impossibleSignalActive ? "is-impossible" : ""}`} aria-live="off">
              <span>Calibration</span>
              <strong>{state.frequency.toFixed(1)}</strong>
              <small>weather units</small>
            </div>
            <div className="signal-readout" role="status" aria-live="polite" aria-atomic="true">
              <span>Receiving</span>
              <strong>{signalDisplay}</strong>
              <small>{isComplete ? "circuit complete" : `${Math.round(strength * 100)}% coherence`}</small>
            </div>
          </div>

          <label className="tuning-control" id="tuning-control">
            <span>Tuning dial</span>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={state.frequency}
              disabled={!state.started || Boolean(pendingSeed) || isComplete}
              onChange={(event) => setFrequency(Number(event.target.value))}
              aria-describedby="tuning-instructions tuning-feedback"
              aria-valuetext={tuningValueText}
            />
          </label>
          <p id="tuning-instructions" className="control-hint">
            Use arrow keys for fine tuning. A steady signal fills the lock chamber.
          </p>
          <p id="tuning-feedback" className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {accessibleLockStatus}
          </p>

          <figure className="trace-plot">
            <figcaption>
              <span>Spectral pressure</span>
              <span>{finalUnlocked ? "Scale extension open" : "Live trace"}</span>
            </figcaption>
            <canvas ref={traceCanvasRef} aria-hidden="true" />
          </figure>

          <div
            className={`lock-chamber ${
              impossibleSignalActive || pendingSeed?.signal.final ? "is-impossible" : ""
            }`}
          >
            <div className="lock-meter-copy">
              <span>{pendingSeed ? "Signal held" : "Lock chamber"}</span>
              <strong>{pendingSeed ? pendingSeed.signal.callSign : `${Math.round(lockProgress)}%`}</strong>
            </div>
            <meter
              min="0"
              max="100"
              value={pendingSeed ? 100 : lockProgress}
              aria-label="Signal lock progress"
              aria-valuetext={
                pendingSeed
                  ? `${pendingSeed.signal.callSign} held and ready to plant`
                  : progressReady
                    ? "100%, ready to lock"
                    : `${Math.round(lockProgress)}%`
              }
            >
              {pendingSeed ? 100 : Math.round(lockProgress)}%
            </meter>
            {!state.started ? (
              <button className="primary-lever desktop-wake-lever" type="button" onClick={wakeReceiver}>
                <span>Wake</span>
                <strong>THE RECEIVER</strong>
              </button>
            ) : pendingSeed ? (
              <button
                className={`primary-lever seed-lever ${pendingSeed.signal.final ? "is-impossible" : ""}`}
                type="button"
                draggable
                onDragStart={(event) => event.dataTransfer.setData("text/plain", pendingSeed.signal.id)}
                onClick={plantPendingSeed}
              >
                <span>Plant</span>
                <strong>THIS SIGNAL</strong>
              </button>
            ) : isComplete ? (
              <button className="primary-lever" type="button" onClick={exportReceipt}>
                <span>Print</span>
                <strong>THE RECEIPT</strong>
              </button>
            ) : (
              <button
                className="primary-lever"
                type="button"
                disabled={!progressReady}
                onClick={lockSignal}
              >
                <span>{progressReady ? "Hold" : "Steady"}</span>
                <strong>{progressReady ? "LOCK SIGNAL" : "THE NEEDLE"}</strong>
              </button>
            )}
          </div>

          {pendingSeed ? (
            <article
              className={`seed-label ${pendingSeed.signal.final ? "is-impossible" : ""}`}
              aria-live="polite"
            >
              <span className="seed-label-call">{pendingSeed.signal.callSign}</span>
              <blockquote>{pendingSeed.signal.fragment}</blockquote>
              <p>
                {pendingSeed.signal.specimen} · {Math.round(pendingSeed.quality * 100)}% held
              </p>
              <small>Drag across the brass seam or use “Plant this signal.”</small>
            </article>
          ) : null}
        </section>

        <section
          className="garden-bench"
          aria-labelledby="garden-heading"
          onDragOver={(event) => {
            if (pendingSeed) event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            if (pendingSeed) plantPendingSeed();
          }}
        >
          <div className="garden-heading-row">
            <div>
              <h2 id="garden-heading">What the weather kept</h2>
              <p>{isComplete ? "The roots have resolved into one listening diagram." : "Captured signals take root at their own calibration."}</p>
            </div>
            <div
              className={`tuning-eye ${strength > 0.74 ? "eye-open" : ""} ${
                impossibleSignalActive ? "is-impossible" : ""
              }`}
              aria-hidden="true"
            >
              <i />
            </div>
          </div>

          <div className="garden-stage">
            <canvas ref={gardenCanvasRef} aria-hidden="true" />
            {pendingSeed ? (
              <button
                className={`drop-field ${pendingSeed.signal.final ? "is-impossible" : ""}`}
                type="button"
                onClick={plantPendingSeed}
              >
                Plant {pendingSeed.signal.specimen} here
              </button>
            ) : null}
            {isComplete ? (
              <article className="listening-receipt" aria-labelledby="receipt-heading">
                <span>Garden No. {sessionNumber(state.sessionSeed)}</span>
                <h3 id="receipt-heading">Your garden listens toward:</h3>
                <strong>{gardenOrientation(state.sessionSeed, state.planted)}</strong>
                <dl>
                  <div>
                    <dt>Signals kept</dt>
                    <dd>{state.planted.length}</dd>
                  </div>
                  <div>
                    <dt>Left wild</dt>
                    <dd>0</dd>
                  </div>
                </dl>
                <p>Nothing you found was lost. It had only grown difficult to tune.</p>
              </article>
            ) : null}
          </div>

          <section className="specimen-ledger" aria-labelledby="ledger-heading">
            <div className="ledger-header">
              <h3 id="ledger-heading">Specimen ledger</h3>
              <span>
                {availableSignals(state.planted).length}{" "}
                {availableSignals(state.planted).length === 1 ? "band remains" : "bands remain"} open
              </span>
            </div>
            {state.planted.length === 0 ? (
              <p className="empty-ledger">No specimen labels yet. The first clear trace is near the lower end of the scale.</p>
            ) : (
              <ol>
                {state.planted.map((planted) => {
                  const signal = allSignals.find((candidate) => candidate.id === planted.id);
                  if (!signal) return null;
                  return (
                    <li key={planted.id} className={`ledger-label label-${signal.color}`}>
                      <span>{String(planted.order + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{signal.specimen}</strong>
                        <q>{signal.fragment}</q>
                      </div>
                      <small>{Math.round(planted.quality * 100)}%</small>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <p className="canvas-equivalent" aria-live="polite">
            {state.planted.length === 0
              ? "The plotted garden is empty."
              : `${state.planted.length} ${
                  state.planted.length === 1 ? "specimen is" : "specimens are"
                } plotted from low to high frequency${
                  isComplete ? ", connected by the impossible blue antenna line." : "."
                }`}
          </p>
        </section>

        <footer className="recorder-tray">
          <div className="tray-status" role="status" aria-live="polite">
            <span className={state.started ? "recording-light is-on" : "recording-light"} />
            <p>{status}</p>
          </div>

          <div className="tray-controls" aria-label="Receiver controls">
            <button type="button" aria-pressed={soundOn} onClick={() => void toggleSound()}>
              <span>Sound</span>
              <strong>{soundOn ? "On" : "Off"}</strong>
            </button>

            <label className="motion-control">
              <span>Motion</span>
              <select
                value={state.motion}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    motion: event.target.value as MotionPreference,
                  }))
                }
              >
                {(Object.keys(motionLabel) as MotionPreference[]).map((preference) => (
                  <option key={preference} value={preference}>
                    {motionLabel[preference]}
                  </option>
                ))}
              </select>
            </label>

            <details className="field-notes">
              <summary>Field notes</summary>
              <div>
                <p>Wake the set, turn the dial, and keep still when the trace begins to organize.</p>
                <p>Sound is optional. Every essential signal also appears as text and plotted motion.</p>
                <p>All transmissions are fictional and generated locally in this browser.</p>
              </div>
            </details>

            <button type="button" onClick={exportGardenImage} disabled={state.planted.length === 0}>
              <span>Export</span>
              <strong>Garden PNG</strong>
            </button>

            <button type="button" onClick={exportReceipt} disabled={state.planted.length === 0}>
              <span>Export</span>
              <strong>Receipt TXT</strong>
            </button>

            <button type="button" className="reset-control" onClick={() => dialogRef.current?.showModal()}>
              <span>Fit</span>
              <strong>New chart</strong>
            </button>
          </div>
        </footer>
      </section>

      {error ? (
        <div className="error-strip" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <dialog ref={dialogRef} className="reset-dialog" onCancel={() => dialogRef.current?.close()}>
        <form method="dialog">
          <h2>Fit a clean chart?</h2>
          <p>This removes only Antenna Garden’s saved specimens from this device. Export first if you want to keep the receipt.</p>
          <div>
            <button type="submit">Keep this garden</button>
            <button type="button" className="danger-button" onClick={() => void resetGarden()}>
              Fit new chart
            </button>
          </div>
        </form>
      </dialog>
    </main>
  );
}
