---
name: Antenna Garden
description: "A coastal rain ledger where tuned weather grows into plotted specimens."
colors:
  paper: "#ddd5bd"
  paper-bright: "#eee8d3"
  paper-shadow: "#b8ad91"
  ink: "#20251f"
  ink-soft: "#4c5147"
  night: "#071310"
  metal: "#102a27"
  metal-light: "#24473f"
  brass: "#9d7b36"
  brass-bright: "#c1a15b"
  brass-dark: "#4f3c19"
  verdigris: "#386c62"
  oxide: "#9a4d2c"
  cobalt: "#174fbe"
  danger: "#7d2f22"
typography:
  display:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "clamp(2.45rem, 5vw, 4.9rem)"
    fontWeight: 600
    lineHeight: 0.82
    letterSpacing: "0.035em"
  headline:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "clamp(1.7rem, 2.2vw, 2.7rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "1.05rem"
    fontWeight: 600
    letterSpacing: "0.06em"
  body:
    fontFamily: '"Atkinson Hyperlegible", Verdana, sans-serif'
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "0.78rem"
    fontWeight: 600
    letterSpacing: "0.1em"
rounded:
  meter: "1px"
  track: "2px"
  control: "3px"
  chamber: "4px"
  frame: "6px"
  knob: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
components:
  primary-lever:
    backgroundColor: "#aa853b"
    textColor: "#1c1d17"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
    height: "70px"
  seed-lever:
    backgroundColor: "{colors.verdigris}"
    textColor: "{colors.paper-bright}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
    height: "70px"
  seed-lever-impossible:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.paper-bright}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
    height: "70px"
  drop-field:
    backgroundColor: "rgba(238, 232, 211, 0.94)"
    textColor: "{colors.verdigris}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "48px"
    width: "210px"
  drop-field-impossible:
    backgroundColor: "rgba(238, 232, 211, 0.94)"
    textColor: "{colors.cobalt}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "48px"
    width: "210px"
  tuning-range:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.track}"
    height: "44px"
    width: "100%"
  trace-plot:
    backgroundColor: "rgba(238, 232, 211, 0.42)"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "0"
    padding: "0"
    height: "128px"
  lock-chamber:
    backgroundColor: "{colors.metal}"
    textColor: "{colors.paper-bright}"
    typography: "{typography.label}"
    rounded: "{rounded.chamber}"
    padding: "10px"
  ledger-label:
    backgroundColor: "rgba(241, 234, 211, 0.78)"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "0"
    padding: "9px 10px"
    height: "78px"
    width: "clamp(205px, 20vw, 280px)"
  listening-receipt:
    backgroundColor: "rgba(245, 239, 218, 0.94)"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "0"
    padding: "18px 18px 16px"
    width: "min(320px, 56%)"
  tray-control:
    backgroundColor: "transparent"
    textColor: "#eee2c4"
    typography: "{typography.label}"
    rounded: "0"
    padding: "7px 11px"
    height: "56px"
  field-notes:
    backgroundColor: "{colors.metal}"
    textColor: "#f1e6c9"
    typography: "{typography.body}"
    rounded: "0"
    padding: "15px"
    width: "min(330px, 80vw)"
---

# Design System: Antenna Garden

## Overview

**Creative North Star: "The Rain Ledger"**

The Rain Ledger treats Antenna Garden as a 1930s coastal weather-station recording drum opened after rain. Damp chart paper is the working field; black plotted ink, oxidized brass, verdigris, and oxide make the receiver feel maintained rather than styled. The instrument is compact and operational, but the garden stays broad enough to become the artifact.

Listening behavior is the drawing tool. A single structural brass seam divides tuning from growth, and the active trace crosses that seam at soil level before becoming a specimen. The visual system rejects both neon retro-radio spectacle and the frictionless white audio mixer: mystery comes from calibrated evidence, not obscured controls.

**Key Characteristics:**

- A single brass seam turns signal into specimen.
- Damp chart paper is the dominant field; dark metal is the supporting frame.
- Narrow instrument lettering carries hierarchy; hyperlegible copy carries meaning.
- Plotting, not ornament, creates the garden.
- Cobalt appears only for the impossible signal or final completion evidence.

## Colors

The palette reads as rain-darkened paper and maintained coastal machinery, with one impossible blue that behaves like evidence.

### Primary

- **Verdigris Signal** (`verdigris`): ordinary coherent traces, markers, lock progress, held-signal controls, planting targets, tuning-eye response, and cool specimen plots.

### Secondary

- **Oxidized Brass** (`brass`): the structural seam, tuning track, actuation plates, and physical control hardware.
- **Wet Brass Highlight** (`brass-bright`): thumb faces, pivots, inset rims, and small caught-light edges.
- **Brass Shadow** (`brass-dark`): control borders, recessed edges, and the dark side of the structural seam.

### Tertiary

- **Oxide Calibration** (`oxide`): the warm biological plotting family, ordinary frequency readout, and the system-wide visible focus outline.
- **Impossible Cobalt** (`cobalt`): the impossible-signal variants, final specimen ledger, completion orientation, and final antenna line only.
- **Reset Red** (`danger`): destructive reset and dismiss actions only; it never enters the garden plot.

### Neutral

- **Damp Chart Paper** (`paper`): the dominant instrument and canvas field.
- **Dry Receipt Paper** (`paper-bright`): loose labels, receipts, dialogs, and high-legibility paper surfaces.
- **Pressed Paper Shadow** (`paper-shadow`): muted weathered depth and secondary paper edges.
- **Plotted Ink** (`ink`): primary copy, dial geometry, isobars, and quiet structural lines.
- **Faded Field Ink** (`ink-soft`): instructions, metadata, captions, and secondary ledger copy.
- **Rain Night** (`night`): the page surround beyond the instrument.
- **Recorder Metal** (`metal`): lock chamber, recorder tray, and dark operational wells.
- **Worn Metal Edge** (`metal-light`): lifted green-metal edges and inset definition.

### Named Rules

**The Impossible Blue Rule.** Cobalt is exception, not activity. It appears only for the impossible signal and completion or final-ledger evidence. Ordinary focus, coherence, locks, held seeds, and planting targets never use it.

**The Patina Has a Job Rule.** Brass defines structure and actuation, verdigris confirms ordinary receiver response, oxide carries focus and calibration, and cobalt marks the impossible or final state. Do not exchange those roles casually.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow and sans-serif fallbacks)  
**Body Font:** Atkinson Hyperlegible (with Verdana and sans-serif fallbacks)  
**Label Font:** Barlow Condensed (with Arial Narrow and sans-serif fallbacks)

**Character:** The pairing feels like a narrow instrument face annotated by a humane field manual. Width, case, and placement carry hierarchy; decorative type effects do not.

### Hierarchy

- **Display** (600, `clamp(2.45rem, 5vw, 4.9rem)`, `0.82`): the Antenna Garden title plate only; uppercase with open tracking.
- **Headline** (600, `clamp(1.7rem, 2.2vw, 2.7rem)`, `0.98`): bench and garden headings, balanced and short, normally no wider than 14 characters on the tuner side.
- **Title** (600, `1.05rem`, `0.06em` tracking): ledger and instrument subheads, uppercase and compact.
- **Body** (400, `0.9rem`, `1.4`): explanatory copy, receipt language, and field notes; working paragraphs stay around 56–58 characters wide.
- **Label** (600, `0.78rem`, `0.1em` tracking): calibration labels, control verbs, state labels, and captions, normally uppercase.

### Named Rules

**The One Instrument Voice Rule.** Barlow Condensed speaks for plates, numerals, calls, and controls; Atkinson Hyperlegible explains. Do not use the condensed face for long prose.

## Layout

The instrument is a single bounded machine, capped by a title plate and recorder tray. Above 900px, its working area is a two-column split: the tuner occupies roughly 41% and the garden 59%, with minimum working widths of 330px and 480px. The shell is centered, capped at 1780px, and inset from the viewport by a fluid 8–20px margin.

The 12px brass seam is the transformation axis. The tuner uses a compact vertical sequence while the garden reserves most of its area for the canvas plot; labels form an uneven horizontal ledger rather than a card grid. The recurring spacing rhythm is 8px, 12px, 16px, and 24px, with larger fluid padding only at the two benches.

At 1120px, the recorder controls become a three-by-two bank. At 900px and below, the title, tuner, garden, and tray stack in that order; the brass seam turns horizontal and the title remains sticky. At 620px and below, readouts and the lock chamber become single-column, the tray becomes two columns, and paper artifacts expand within 17px side gutters. A separate short-desktop treatment compacts vertical measurements without changing the split composition.

### Named Rules

**The Brass Seam Rule.** On wide screens the seam is vertical and splits tuning from garden; below 900px it becomes the horizontal threshold between them. The transformation axis never disappears.

## Elevation & Depth

This is a physically layered system, not a floating-card system. The outer instrument uses a broad dark shell shadow plus inset metal rims. Recessed wells combine dark fills with inner highlights; loose chart labels and receipts use small offsets and low-contrast paper shadows. Texture, border weight, and physical offset do more work than blur.

### Shadow Vocabulary

- **Instrument Shell** (`0 18px 48px rgba(0, 0, 0, 0.5), 0 3px 8px rgba(0, 0, 0, 0.34), inset 0 0 0 3px #182a25, inset 0 0 0 5px #8f7334`): separates the complete receiver from rain-night surroundings.
- **Recessed Well** (`inset 0 0 0 2px #3f5f56, 0 4px 11px rgba(58, 39, 8, 0.22)`): seats the lock chamber inside the paper bench.
- **Control Plate** (`inset 0 0 0 2px #d2b66d, 0 4px 8px rgba(0, 0, 0, 0.35)`): gives the primary lever a bright rim and mechanical offset.
- **Loose Paper** (`0 8px 22px rgba(48, 37, 13, 0.24)`): lifts the listening receipt above the plotted garden.
- **Field Notes** (`0 9px 22px rgba(0, 0, 0, 0.44)`): lifts the temporary disclosure from the dark recorder tray.

### Named Rules

**The Pressure, Not Glow Rule.** Depth comes from broad low-contrast shadows, inset wells, and metal offsets. No luminous bloom, glassy blur, or ambient neon is part of this system.

**The Loose Paper Lifts Rule.** Only detached paper artifacts and temporary overlays lift noticeably above the chart. Benches, plots, and tray controls remain seated in the instrument.

## Shapes

The form language is mechanical and nearly square. Meter slots use 1px corners, tuning tracks 2px, active controls 3px, chambers and dialogs 4px, and the outer instrument 6px. Pivots, knobs, the tuning eye, indicator lights, and range thumbs are the only fully circular forms. The tuning arc is deliberately oversized; receipts end in a torn serration, ledger labels sit slightly out of register, and plotted isobars use thin irregular curves rather than container borders.

### Named Rules

**The Only Knobs Go Round Rule.** Circles belong to pivots, eyes, lights, and range thumbs. Plates, labels, wells, receipts, and controls keep mechanical corners.

## Components

The component grammar is tactile, stateful, and terse. Controls look built into a recorder; chart artifacts look handled and removable.

### Tuning Dial and Range

- **Shape:** an oversized semicircular arc, fine tick field, brass needle, circular pivot, and a native range input with a 2px track and round brass thumb.
- **State:** the asleep dial is desaturated and translucent; waking restores full saturation. Needle movement uses a fast, damped response, and disabled tuning drops to 42% opacity.
- **Focus:** the native range keeps the system-wide 3px oxide focus outline with a 3px offset; its interactive box is 44px high.

### Primary and Seed Levers

- **Shape:** small mechanical corners (3px), a minimum 70px plate, and stacked uppercase verb/action text.
- **Primary:** a warm brass plate with a bright inset rim and dark structural border.
- **Held Signal:** the ordinary held-signal lever is verdigris. It becomes cobalt only for the impossible final seed.
- **Hover / Active / Disabled:** hover brightens and lifts 1px; active presses 2px with an inset shadow; disabled controls desaturate and fall to 48% opacity.

### Lock Chamber

- **Style:** a dark recorder-metal well with a 4px radius, inset green edge, pale instrument copy, and a verdigris native meter fill. The meter becomes cobalt only in the impossible-signal state.
- **Behavior:** it holds the current coherence state and the single largest relevant action; it remains sticky at the bottom of the desktop tuner.

### Spectral Pressure Plot

- **Style:** an unrounded paper plot with a ruled caption, 24px chart grid, dashed centerline, and an irregular live trace.
- **State:** the trace remains plotted ink while searching and becomes verdigris at the ordinary coherent-signal threshold. The marker and tuning eye are also verdigris for ordinary coherence; trace, marker, and eye become cobalt only while the impossible signal is active.

### Garden Stage and Drop Field

- **Style:** a broad chart-paper canvas with isobars, a dashed soil line, thin rooted specimens, and no card frame.
- **State:** an ordinary pending seed reveals a centered paper button outlined in verdigris; hover reverses it to verdigris. The button changes to cobalt only for the impossible final seed. Completion draws the faint impossible-blue antenna through specimen crowns and overlays the receipt.

### Specimen Ledger Labels

- **Style:** clipped paper labels with no corner radius, thin ink borders, 9px by 10px padding, and a restrained paper shadow.
- **Variation:** labels remain horizontally scrollable and uneven; every even label shifts down 4px and rotates 0.35 degrees. The index alone carries verdigris or oxide until the cobalt final specimen marks the whole label.

### Listening Receipt

- **Style:** a bright loose-paper artifact, rotated 0.8 degrees, with a torn lower edge and an 18px inset.
- **Hierarchy:** calibration metadata stays narrow and quiet; the generated listening orientation is the only large cobalt text.

### Recorder Tray and Field Notes

- **Style:** a dark metal control bank with no card radius, pale condensed labels, 1px dividers, and a small live recording lamp.
- **Behavior:** controls hover by filling with worn metal; the motion select remains native; Field Notes opens as a dark, brass-bordered disclosure above the tray. The bank resolves from six columns to three and then two.

### Named Rules

**The Behavior Draws the Garden Rule.** Controls may change state and wording, but every visible transformation must correspond to waking, tuning, locking, planting, exporting, or resetting.

## Do's and Don'ts

### Do:

- Do keep the damp paper field broad and quiet enough for plotted lines and copy to remain legible.
- Do make the brass seam structural: it divides the listening bench from the garden and becomes a horizontal threshold when stacked.
- Do let tuning quality and frequency determine visible specimen anatomy, trace behavior, and completion.
- Do preserve native controls, keyboard operation, visible oxide focus, text equivalents, reduced motion, and the silent visual mode.
- Do use verdigris for ordinary coherence, lock progress, held seeds, planting targets, and tuning-eye response.
- Do use small mechanical offsets, clipped labels, inset wells, and physical shadows to make the instrument feel handled.

### Don't:

- Don't use cobalt for focus, ordinary coherence, ordinary lock progress, ordinary held seeds, or ordinary planting targets; reserve it for the impossible signal and final completion evidence.
- Don't use neon glow, equalizer spectacle, glossy retro-radio chrome, or sci-fi console tropes.
- Don't flatten the surface into a frictionless white audio mixer or a grid of interchangeable rounded cards.
- Don't make every boundary a one-pixel box; use hairline plotting, open paper, and one heavy brass axis.
- Don't add decorative motion that is unrelated to needle response, signal stabilization, seed transfer, specimen growth, or completion.
