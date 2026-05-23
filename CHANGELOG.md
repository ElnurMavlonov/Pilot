# Changelog

All notable changes to **IoTify AI Lab** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added — Sensors (Parts Library)
- **DHT11**, **HC-SR04**, and **PIR** components in the Parts Library (Sensors category) with procedural Three.js meshes
- Free-build sandbox simulation: temperature/humidity sliders, distance slider, and motion hold button when sensors are placed
- Serial Monitor output for live sensor readings; emissive/visual feedback on placed sensor meshes

### Added — Actuators (Parts Library)
- **Servo (SG90)**, **L298N Driver**, **DC Motor**, and **Relay Module** in the Parts Library (Actuators category) with procedural Three.js meshes
- Free-build sandbox simulation: servo angle slider, bipolar motor speed slider, relay energize hold button
- Serial Monitor actuator output; horn rotation, motor shaft spin, driver/relay LED visuals

### Changed — 3D part detailing
- Shared builders (`partMetalMat`, `partPcbMat`, `addThroughHolePins`, `addSmdPad`) for consistent scale with LEDs, resistors, and breadboard parts
- Refined meshes for **LDR**, **push button**, **DHT11**, **HC-SR04** (dual transducers + IC/pads), **PIR** (Fresnel rings + lens), **L298N** (heatsink fins, screw terminals, motor band), and **relay** (coil, cover, indicator LED)
- **SG90** restyled to match Tower Pro reference: blue housing, side mounting tabs with screw, gold/silver front label, cross horn (6+2+2 holes) with center screw
- **L298N** restyled to match module reference: dark-red PCB, corner mount rings, black finned heatsink, vertical IC with tab and legs, blue 2/3/2-pin terminals, silver caps, SMD diodes and logic header
- **DC Motor** and **L298N Driver** split into separate Parts Library entries (was combined “DC Motor + L298N”)
- **Breadboard-scale sizing** via `partU(mm)` and shared `PART_DIM` (13 mm/unit from real dimensions): all passives, sensors, actuators, and wire pins aligned; duplicate legacy builders removed
- Visual simulation hooks preserved (`dhtBody`, `sonarEyeLeft`/`sonarEyeRight`, `pirDome`, `servoHorn`, `driverBoard`, `motorShaft`, `relayLed`)

See [TODO.md](./TODO.md) for the full roadmap.

---

## [1.1.0] — 2026-05-23

### Changed — UI Restyled (Clean Educational Light Theme)
- Switched from dark to **light educational theme**: white sidebar, off-white (`#F8FAFC`) body background, indigo-600 accents, slate-900 text
- Step index badge changed to solid indigo pill for high contrast and readability
- Tip callout box restyled to amber-50/amber-200 for clear visual hierarchy
- Preset buttons now use inline SVG icons (Heroicons) instead of emoji characters
- AI prompter block, step box, and all cards updated to `bg-white` with `shadow-sm` and `border-slate-200`
- Interactive hardware control panel updated to `bg-indigo-50` for better affordance
- Camera reset button and schematic panel updated to white/light style
- Scrollbar restyled to light grey track and thumb
- Grid background pattern updated to subtle slate-400 lines on white
- `cursor-pointer` added to all interactive buttons
- IDE Terminal footer kept dark (`bg-slate-900`) for terminal/code-editor feel
- Three.js canvas background (`#020617`) preserved — hardware workbench remains dark

### Added — Documentation
- `FEATURES.md` — complete reference of all shipped features
- `TODO.md` — roadmap with 20+ planned improvements
- `CHANGELOG.md` — this file

---

## [1.0.0] — 2026-05-22

### Added — Initial Release

#### 3D Hardware Simulation Engine
- Procedural Three.js r128 rendering of Arduino Uno, breadboard, LED, 220 Ω resistor, piezo buzzer, push button, LDR sensor, and colour-coded jumper wires
- Smooth `glideCamera()` transitions between step-defined focus points
- OrbitControls (drag to rotate, scroll to zoom) with Reset View button

#### AI Circuit Architect
- Gemini 2.5 Flash integration via Google Generative Language API
- Structured JSON response parsing: steps, wires, schematic SVG, Arduino firmware, interactive type
- Keyword-match fallback when no API key is set — app works fully offline

#### 4 Built-in Preset Circuits
- **LED Blink** — 4-step tutorial, Digital Pin 13, `digitalWrite()` + `delay()`
- **Night Light (LDR)** — 4-step tutorial, Analog A0, `analogRead()`, threshold logic, interactive slider
- **Siren Alarm** — 2-step tutorial, Digital Pin 9 (PWM), `tone()`, frequency cycling
- **Push Trigger** — 3-step tutorial, Digital Pin 2 + 13, `INPUT_PULLUP`, interactive hold button

#### Interactive Simulation Engine
- Real-time simulation loop at 500 ms tick
- LED emissive material toggle (on/off glow via Three.js `MeshPhongMaterial.emissive`)
- Buzzer vibration animation and canvas background tint
- LDR slider drives light-level threshold in real time
- Push button state mirrors the on-screen hold button

#### Step-by-step Learning Walkthroughs
- Per-step camera position + look-at target
- Per-step component visibility control
- Step index badge, title, description, tip callout
- Dot progress indicators + Back / Next navigation
- Next on final step launches simulation automatically

#### Circuit Schematic SVG Overlay
- Inline SVG per preset with Arduino block, component symbols, and current-flow paths
- Floating panel over 3D canvas, dismissible

#### Firmware IDE Terminal
- Expandable drawer with Arduino C++ sketch
- JetBrains Mono font, one-click Copy to Clipboard
- Opens by default on page load

#### Responsive Layout
- Mobile: stacked 50/50 sidebar + canvas
- Desktop: 480 px sidebar + flex-1 canvas

#### Deployment
- Vercel hosting with automatic CI/CD on push to `main`
- Vite 5 dev server and build pipeline
