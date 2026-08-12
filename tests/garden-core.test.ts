import assert from "node:assert/strict";
import test from "node:test";
import {
  allSignals,
  availableSignals,
  defaultGardenState,
  finalSignal,
  hashString,
  keyedUnit,
  listeningReceipt,
  ordinarySignals,
  signalStrength,
  specimenDescriptor,
  validateStoredState,
} from "../app/garden-core.ts";

test("seed hashing and namespaced random values stay deterministic", () => {
  assert.equal(hashString("lowtide-antenna-0001"), 2764619336);
  assert.equal(keyedUnit("lowtide-antenna-0001", "plant", 3), 0.2561781443655491);
  assert.equal(hashString("e\u0301"), hashString("é"));
  assert.notEqual(
    keyedUnit("lowtide-antenna-0001", "plant", 3),
    keyedUnit("lowtide-antenna-0001", "score", 3),
  );
});

test("signal strength peaks at the center and decays safely", () => {
  const signal = ordinarySignals[0];
  assert.equal(signalStrength(signal.center, signal), 1);
  assert.ok(signalStrength(signal.center + signal.width, signal) > 0.6);
  assert.ok(signalStrength(100, signal) < 0.000001);
  assert.ok(signalStrength(Number.POSITIVE_INFINITY, signal) < 1e-100);
});

test("the impossible band opens only after every ordinary signal is planted", () => {
  const partial = ordinarySignals.slice(0, -1).map((signal, order) => ({
    id: signal.id,
    quality: 0.8,
    tunedFrequency: signal.center,
    order,
  }));
  assert.ok(!availableSignals(partial).some((signal) => signal.id === finalSignal.id));

  const complete = ordinarySignals.map((signal, order) => ({
    id: signal.id,
    quality: 0.8,
    tunedFrequency: signal.center,
    order,
  }));
  assert.deepEqual(availableSignals(complete).map((signal) => signal.id), [finalSignal.id]);
});

test("specimen descriptors have a stable golden output and remain in bounds", () => {
  const descriptor = specimenDescriptor("lowtide-antenna-0001", {
    id: "porch-lamp",
    quality: 0.88,
    tunedFrequency: 13.2,
    order: 0,
  });
  assert.deepEqual(descriptor, {
    height: 0.7389386164490135,
    lean: -0.05077626328915358,
    branches: 7,
    leafStyle: 0,
    crown: 0.5109473304823041,
    phase: 0.40968955124855044,
    rootSpread: 0.5774365162104368,
    asymmetry: 0.061900642383378,
  });
  assert.ok(descriptor.height >= 0.56 && descriptor.height <= 0.9);
  assert.ok(Number.isInteger(descriptor.branches));
  assert.ok(descriptor.leafStyle >= 0 && descriptor.leafStyle <= 2);
});

test("stored state validation clamps values, removes duplicates, and rejects bad versions", () => {
  assert.equal(validateStoredState({ v: 99 }), null);
  const valid = validateStoredState({
    v: 1,
    sessionSeed: "garden-test-seed",
    frequency: 900,
    started: 1,
    motion: "reduced",
    planted: [
      { id: "porch-lamp", quality: 2, tunedFrequency: -40, order: 0 },
      { id: "porch-lamp", quality: 0.1, tunedFrequency: 22, order: 1 },
      { id: "unknown", quality: 0.8, tunedFrequency: 20, order: 2 },
      null,
    ],
  });
  assert.ok(valid);
  assert.equal(valid.frequency, 100);
  assert.equal(valid.started, true);
  assert.deepEqual(valid.planted, [
    { id: "porch-lamp", quality: 1, tunedFrequency: 0, order: 0 },
  ]);
});

test("the receipt describes the same stable state visible in the garden", () => {
  const state = {
    ...defaultGardenState("lowtide-antenna-0001"),
    planted: [
      { id: "porch-lamp", quality: 0.88, tunedFrequency: 13.2, order: 0 },
    ],
  };
  const receipt = listeningReceipt(state);
  assert.match(receipt, /GARDEN NO\. 19336/);
  assert.match(receipt, /SIGNALS KEPT 1/);
  assert.match(receipt, /RAIN \/ 13\s+Lampwick fern/);
  assert.match(receipt, /INLAND-OF-FOG/);
  assert.equal(allSignals.length, ordinarySignals.length + 1);
});
