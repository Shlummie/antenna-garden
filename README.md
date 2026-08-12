# Antenna Garden

Antenna Garden is an original offline-first browser instrument: tune six fictional transmissions, steady each signal, and plant what you hear into a botanical circuit weather chart. The way you listen determines each specimen.

The experience is silent until you wake it. Sound is optional and synthesized locally with Web Audio; the Canvas artwork, persistence, and exports also stay on the device. No account, API, analytics, or runtime internet connection is required.

## Run locally

Prerequisites: Node.js 22.13 or newer.

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:3000`. The preview binds only to IPv4 loopback, so it remains local to this machine. Stop the process with `Ctrl+C` when finished.

## How to play

1. Wake the receiver.
2. Move the native tuning slider. Arrow keys make fine adjustments; Page Up/Down sweep faster; Home/End jump to the dial limits.
3. Hold near a transmission until it locks.
4. Plant the captured fragment with its button or drag it into the garden.
5. Finish all six bands to reveal the full diagram and export a listening receipt or PNG.

The session is saved in one versioned `localStorage` entry. Reset removes only Antenna Garden's own key. Every canvas result has an HTML text equivalent, and reduced-motion mode is available from the instrument panel.

## Verify

```powershell
npm run test:core
npm run typecheck
npm run lint
npm run build
node --test tests/rendered-html.test.mjs
```

`npm test` runs the core tests, full type-check, production build, and rendered-output tests as one command.

## Project map

- `app/AntennaGarden.tsx` — receiver, audio, persistence, exports, and accessible interaction
- `app/garden-core.ts` — deterministic tuning and specimen model
- `app/globals.css` — responsive weather-observatory surface
- `tests/` — deterministic core and built-output checks
- `PRODUCT.md` — product contract
- `WORKLOG.md` — timestamped one-hour creation record
- `DESIGN.md` — durable visual system and machine-readable token contract

## Architecture

```text
native tuning controls -> deterministic garden core -> React state
                       -> Web Audio (opt-in)
                       -> Canvas diagram + semantic text equivalent
                       -> localStorage + PNG/receipt export
```

## Privacy and scope

All transmissions are invented procedural content. The project does not collect data or call external services at runtime. The committed fonts and artwork are local assets, and saved state remains in the browser unless the visitor exports it.

## License

Original code and written content are MIT licensed. Original raster assets are released under CC0 as described in `ASSET_LICENSES.md`. Packaged fonts and dependencies retain their upstream licenses.
