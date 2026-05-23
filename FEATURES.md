# IoTify AI Lab — Features

> Complete reference of all features currently available in the platform.

---

## 1. Generative 3D Hardware Simulation

The 3D workspace is procedurally built at runtime using **Three.js r128** — no pre-made models, every component is generated from geometry primitives.

**Rendered components:**

| Component | Description |
|-----------|-------------|
| Arduino Uno | PCB board with USB port, power jack, MCU chip, and labelled pin headers |
| Breadboard | White base with tie-point grid, red (+) and blue (−) power rails |
| LED (Red) | Transparent dome cap, polarised pins, emissive light source |
| Resistor (220 Ω) | Cylindrical body with Red-Red-Brown colour bands and metal leads |
| Piezo Buzzer | Acoustic barrel with signal/ground pins |
| Push Button | Plastic casing with a spring-loaded red cap |
| LDR Sensor | Ceramic disc with photoresistor trace and metal pins |
| Jumper Wires | Colour-coded paths: black (GND), red/yellow/indigo/pink (signal) |

**Camera system:**
- Smooth `glideCamera()` transitions between component focus points per step
- OrbitControls: drag to rotate, scroll to zoom
- Reset View button restores default perspective

---

## 2. AI Circuit Architect

Powered by **Gemini 2.5 Flash** via the Google Generative Language API.

**How it works:**
1. User describes an IoT idea in plain English (e.g. _"Turn on buzzer when button pressed"_)
2. Gemini returns a structured JSON payload with:
   - `title` — circuit name
   - `topic` — educational category
   - `steps[]` — step-by-step walkthrough with camera positions
   - `wires[]` — 3D wire path coordinates and colours
   - `activeComponent` — which component to highlight
   - `interactiveType` — `"slider"`, `"button"`, or `"none"`
   - `schematic` — inline SVG schematic markup
   - `code` — Arduino C++ firmware
3. The app parses the JSON and renders the custom circuit live

**Fallback (no API key):**  
Keyword matching against the 4 built-in presets — the closest match is applied automatically. The app is fully functional without an API key.

---

## 3. Built-in Preset Circuits

Four ready-to-load circuits accessible via the preset buttons:

### LED Blink
- **Components:** Arduino Uno, Breadboard, LED, 220 Ω Resistor, 2 Jumper Wires
- **Concept:** Digital output, `digitalWrite()`, `delay()`
- **Steps:** 4 (workspace → LED placement → resistor → wiring)
- **Pin:** Digital 13

### Night Light (LDR)
- **Components:** Arduino Uno, Breadboard, LDR, LED, 220 Ω Resistor, 2 Jumper Wires
- **Concept:** Analog input, voltage divider, `analogRead()`, threshold logic
- **Steps:** 4 (LDR → LED → voltage divider → full wiring)
- **Pin:** Analog A0 + Digital 13
- **Interactive:** Light-level slider

### Siren Alarm
- **Components:** Arduino Uno, Breadboard, Piezo Buzzer, 2 Jumper Wires
- **Concept:** PWM output, `tone()`, frequency modulation
- **Steps:** 2 (buzzer placement → signal wiring)
- **Pin:** Digital 9 (PWM)

### Push Trigger
- **Components:** Arduino Uno, Breadboard, Push Button, LED, 220 Ω Resistor, 2 Jumper Wires
- **Concept:** Digital input, `INPUT_PULLUP`, momentary switch logic
- **Steps:** 3 (button → LED → full wiring)
- **Pins:** Digital 2 (input) + Digital 13 (output)
- **Interactive:** Clickable/holdable button

---

## 4. Interactive Simulation Engine

Clicking **Run Sandbox** starts a real-time loop that executes the circuit's firmware logic visually:

| Circuit | Simulation Behaviour |
|---------|---------------------|
| LED Blink | LED emissive material toggles on/off every 500 ms |
| Night Light | LED activates when slider value < 40 % (darkness threshold) |
| Siren Alarm | Buzzer vibrates (Y-axis animation) and tints the canvas background |
| Push Trigger | LED mirrors the held state of the on-screen button |

**Run → Halt toggle:** The button changes colour and label; clicking again terminates the simulation loop and resets all component outputs.

---

## 5. Hardware Input Controls

Interactive controls appear inside the Step Box when a preset requires them:

### LDR Slider (Night Light preset)
- Range: 0 – 100 % (ambient light level)
- Moves the LDR's Y-rotation to hint at sensor orientation
- Drives the simulation threshold in real time

### Push Button (Push Trigger preset)
- `mousedown` / `touchstart` = pressed state
- `mouseup` / `mouseleave` / `touchend` = released state
- Presses the button cap mesh down visually (Y-position animation)

---

## 6. Circuit Schematic SVG Overlay

A floating panel over the 3D canvas shows a 2D schematic for the active circuit:

- Inline SVG generated per preset (Arduino Uno block + component symbols + wires)
- Component symbols: LED triangle, resistor zigzag, LDR circle, buzzer rectangle, switch arc
- Current flow paths drawn with coloured `<path>` strokes matching wire colours
- Pin labels on the Arduino block (D13, D9, D2, A0, GND)
- Responsive: `max-w-xl`, scrollable on small screens

---

## 7. Firmware IDE Terminal

An expandable drawer at the bottom of the sidebar:

- Displays Arduino C++ sketch for the active circuit
- Monospace `JetBrains Mono` font, syntax-coloured
- **Copy Code** button copies the full sketch to clipboard
- Default state: open on page load
- Chevron rotates to indicate open/closed state

---

## 8. Step-by-step Learning Walkthroughs

Each circuit includes a guided tutorial rendered in the Step Box:

- **Step index badge** — `Step N of M` (solid indigo pill)
- **Step title** — H3 heading, component focus name
- **Step description** — plain-English explanation of what to do and why
- **Tip callout** — amber-tinted hint box with an extra insight or safety note
- **Camera animation** — `glideCamera()` moves to the step's defined `camera` + `lookAt` coordinates
- **Component visibility** — only relevant parts are visible per step (`visible[]` array)
- **Navigation** — Back / dot indicators / Next buttons; Next on final step launches the simulation

---

## 9. Responsive Layout

| Viewport | Layout |
|----------|--------|
| Mobile (< md) | Stacked: sidebar takes 50 vh (top), canvas takes 50 vh (bottom) |
| Desktop (≥ md) | Side-by-side: 480 px fixed sidebar (left) + flex-1 canvas (right) |

---

## 10. Deployment

- Hosted on **Vercel** with automatic CI/CD
- Every push to `main` triggers a production redeploy
- Zero-config — no environment variables required for basic use
- Optional: set `apiKey` in `index.html` to enable Gemini AI generation
