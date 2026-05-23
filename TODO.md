# IoTify AI Lab — Roadmap & To-Do

> Planned features and improvements, roughly ordered by priority.

---

## Core Editor

- [x] **Editable Firmware IDE** — Make the code terminal editable so users can write and modify Arduino C++ directly in the browser; re-run simulation with their custom code
- [x] **Keyboard Shortcuts Overlay** — `?` key opens a cheat-sheet showing all hotkeys (rotate, zoom, run, reset, copy code, etc.)
- [x] **Undo / Redo** — Track circuit configuration changes with an undo stack

---

## Component Library

- [x] **More passive components** — Capacitors (electrolytic + ceramic), potentiometers, thermistors, transistors (NPN/PNP)
- [ ] **Sensors** — DHT11 temperature & humidity, HC-SR04 ultrasonic distance, PIR motion detector
- [ ] **Actuators** — Servo motor, DC motor with L298N driver, relay module
- [ ] **Displays** — 16×2 LCD module (I²C), 7-segment display, OLED 128×64

---

## Board Support

- [ ] **Arduino Nano** — Compact board variant with different pinout
- [ ] **Arduino Mega 2560** — Larger board with more pins for complex circuits
- [ ] **ESP32** — Wi-Fi + Bluetooth-enabled microcontroller for IoT cloud projects

---

## Simulation & Audio

- [x] **Sound Simulation** — Use the **Web Audio API** to play actual tones from the buzzer at the correct frequency (880 Hz / 440 Hz for the alarm preset)
- [x] **Serial Monitor** — Simulate `Serial.println()` output in a mock console panel so users can see debug messages without hardware
- [ ] **Oscilloscope View** — Simple waveform chart showing PWM duty cycle / analog values in real time

---

## Sharing & Export

- [x] **Save / Load Projects** — Export circuit configuration as a JSON file and re-import it later
- [ ] **Export as PDF** — Generate a printable PDF with schematic, code, and step instructions
- [ ] **Share Circuit Link** — Encode circuit state in a URL query parameter for one-click sharing

---

## User Experience

- [x] **Dark / Light Mode Toggle** — Add a toggle in the header, persist preference in `localStorage`
- [ ] **Component Hover Tooltips** — Show 3D labels (component name, pin numbers) when hovering over a mesh in the canvas
- [ ] **Onboarding Tour** — A first-visit guided walkthrough highlighting the main UI regions
- [ ] **PWA Offline Support** — Service worker + manifest so the app works without internet after first load

---

## Community & Education

- [ ] **Community Preset Library** — Let users publish and browse community-contributed circuits (backend required)
- [ ] **AI Circuit Debugger** — Ask Gemini _"Why isn't my LED turning on?"_ and get a diagnosis based on the current circuit state
- [ ] **Teacher Mode** — Create ordered lesson sequences with custom step content, locked navigation, and assessments
- [ ] **Progress Tracking** — Badge system: complete N labs to earn achievement badges, shown in a profile panel
- [ ] **Multi-language Support (i18n)** — Translate the UI and step content into other languages via a locale file

---

## Technical

- [ ] **Tailwind Config File** — Move Tailwind from CDN to a proper `tailwind.config.js` with design tokens
- [ ] **Component Splitting** — Break `index.html` into ES modules (preset data, renderer, UI) for maintainability
- [ ] **Unit Tests** — Test the simulation logic and preset data structure with Vitest
- [ ] **Accessibility Audit** — Full WCAG 2.1 AA pass: keyboard navigation, screen reader labels, reduced-motion support
