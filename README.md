# Pilot — Generative 3D IoT Lab & Tutor

> **An interactive, browser-based 3D electronics sandbox & virtual learning simulator powered by React 18, Three.js procedural rendering, dynamic Mermaid schematics, and Gemini AI.**

[![Pilot](https://img.shields.io/badge/Pilot-AI%20Lab%20v2.0-6366f1?style=for-the-badge&logo=arduino&logoColor=white)](https://github.com/google-deepmind)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r128-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 🌟 What is Pilot?

**Pilot** is a state-of-the-art virtual laboratory that makes learning IoT (Internet of Things) and electronics engaging, interactive, and completely accessible. Leveraging real-time 3D graphics and Google's advanced Generative AI, it allows users to visually design circuits, write firmware, and see hardware come to life in a custom sandbox simulation.

No hardware? No problem. Pilot simulates everything, from basic microcontrollers (Arduino Uno) and sensors to motors, relays, and piezo buzzers — all dynamically generated in real-time.

---

## ✨ Features

### 🛠 Procedural 3D Workspace (Three.js)
* **Zero Pre-made Models** — Every single component, from the breadboard base down to individual diodes, dual transducers on the HC-SR04, and blue plastic tabs on the SG90 Servo, is procedurally built from 3D primitives at runtime.
* **Component Library** Includes:
  * **Microcontrollers**: Arduino Uno R3.
  * **Passives & Discrete**: LEDs (Red/Green/Blue with emissive glows), 220 Ω resistors (color-band accurate), ceramic/electrolytic capacitors, transistors (NPN/PNP), potentiometers, thermistors, and push-buttons.
  * **Sensors**: LDR light sensor, DHT11 Temperature/Humidity sensor (vented casing), HC-SR04 Ultrasonic Distance sensor, and PIR Motion Detector (Fresnel ring dome).
  * **Actuators**: Tower Pro SG90 Servo (horns rotate), L298N Motor Driver (black heatsink fins + red PCB details), DC Motor (shaft spin), and a Relay module (energize indicator led + translucent cover).
  * **Wiring**: Multi-colored jumper wires (GND = Black, VCC = Red, signals = custom colors) connecting nodes perfectly.
* **Smart Camera Control** — Uses an orbit-control camera that smoothly animates (`glideCamera()`) to focus on active nodes as you proceed step-by-step.

### 🧠 AI Circuit Architect (Gemini API)
* **Instant Generative Design** — Enter any prompt (e.g., *"Make a burglar alarm with a PIR sensor and buzzer"*) and watch Pilot generate a custom lab complete with step-by-step instructions, pin layouts, 3D wiring diagrams, and fully functional C++ firmware.
* **Graceful Offline Fallback** — In the absence of an API key, the system leverages an offline keyword-matching search that hooks into built-in expert presets automatically.

### ⚡ Interactive Simulation Engine
* **Physical Hardware Visuals** — Observe active LEDs glowing, the PIR dome tinting on motion triggers, the buzzer vibrating, and the servo horn rotating.
* **Web Audio API Sound Integration** — Buzzers don't just animate; they emit actual simulated sound waves mapped to the output frequencies of your C++ firmware (e.g. siren sounds).
* **Mock Serial Monitor** — View live logging output from simulated `Serial.println()` statements, making firmware debugging easy.
* **Real-time Oscilloscope** — Monitor active PWM signals or analog inputs with a live-updating waveform canvas.
* **Interactive Control Panel** — Toggle push buttons, slide ambient light parameters (LDR), adjust distance (HC-SR04), or toggle temperature (DHT11) right inside the web interface to observe live reactiveness.

### 📊 Dynamic Mermaid.js Schematics
* **2D Schematics Overlay** — Dynamically updates and maps connections into standard 2D schematic designs (microcontroller chips, resistors, ground routes) that automatically sync as the 3D circuit updates.

### 💻 Expandable Firmware IDE
* **Editable Code Workspace** — Inspect, edit, and compile custom Arduino C++ sketches directly inside an integrated drawer styled with `JetBrains Mono`.
* **Restartable Simulation** — Run the sandbox with your custom code adjustments to test logic.

### 💾 Export & Sharing
* **Save/Load JSON Projects** — Download your circuit design to a local file and resume later.
* **PDF Project Reports** — Print beautifully formatted lab reports containing the custom tutorial guide, code editor screenshot details, and schematic SVGs.
* **URL Share Links** — Share a unique URL representing your complete circuit state for a single-click load.

### 🌟 Premium Educational UX
* **Light / Dark Mode** — Fluid toggle reflecting your design preference, saved via local storage.
* **Onboarding Guided Tour** — Smooth introduction pointing out editor areas to new users.
* **Keyboard Shortcuts Overlay** — Quick-reference modal for hotkeys (press `?`).
* **Community Preset Directory** — Browse community-contributed circuits.

---

## ⌨️ Keyboard Shortcuts

Press <kbd>?</kbd> anywhere on the workspace to open the Shortcuts Overlay.

| Category | Shortcut | Description |
| :--- | :--- | :--- |
| **Workspace** | <kbd>Ctrl</kbd> + <kbd>B</kbd> | Toggle left-hand control sidebar |
| | <kbd>Ctrl</kbd> + <kbd>J</kbd> | Toggle IDE panel drawer |
| | <kbd>Ctrl</kbd> + <kbd>Z</kbd> / <kbd>Y</kbd> | Undo / Redo board edits |
| | <kbd>Esc</kbd> | Close overlays / Cancel wiring mode |
| | <kbd>?</kbd> | Show Keyboard Shortcuts overlay |
| **3D Canvas** | <kbd>Left Click + Drag</kbd> | Rotate workspace |
| | <kbd>Right Click + Drag</kbd> | Pan workspace |
| | <kbd>Scroll Wheel</kbd> | Zoom in / out |
| **Components** | <kbd>Del</kbd> / <kbd>Backspace</kbd> | Delete selected component |
| | <kbd>Right Click</kbd> | Open context menu |
| | <kbd>W</kbd> | Toggle Wire Connection tool |
| **Actions** | <kbd>S</kbd> | Copy shareable state link |
| | <kbd>T</kbd> | Restart onboarding guide tour |
| | <kbd>Ctrl</kbd> + <kbd>C</kbd> | Copy IDE Arduino code |

---

## 🛠 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | Main application UI & state controller |
| **Three.js (r128)** | WebGL-based procedural hardware 3D rendering |
| **Mermaid.js** | Live 2D electronic schematic rendering |
| **Tailwind CSS (3.x)** | Sleek visual styling & light-theme configuration |
| **Font Awesome 6** | Modern interactive icon packs |
| **Gemini 1.5 / 2.5 Flash** | AI Generative Circuit synthesis |
| **Vite 5** | Production building & fast hot-reloading dev environment |

---

## 🚀 Quick Start

Ensure you have [Node.js](https://nodejs.org) installed on your system.

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/google-deepmind/pilot.git
cd Pilot

# Install dependencies
npm install
```

### 2. Add Gemini API Key (Optional)
To unlock generative AI circuit creation, create a `.env.local` file in the root directory:
```env
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```
*If no API key is specified, Pilot falls back to keyword-matched built-in presets automatically.*

### 3. Run the Development Server
```bash
# Start Vite development server
npm run dev
```

Open your browser to [http://localhost:5173](http://localhost:5173) to explore the 3D lab.

### 4. Build for Production
```bash
# Build static assets
npm run build

# Preview build locally
npm run preview
```

---

## 📦 Project Structure

The project has been refactored into a scalable modular React architecture:

```
Pilot/
├── .env.local             # Local environment variables (Gemini Key)
├── vercel.json            # Deployment config for Vercel
├── vite.config.js         # Vite compilation rules
├── index.html             # Entry HTML skeleton
├── package.json           # Node configuration & dependencies
├── src/
│   ├── main.jsx           # React app mount entrypoint
│   ├── App.jsx            # Top-level UI & shell layout
│   ├── components/        # Isolated modular React modules
│   │   ├── TopBar.jsx            # Application header with mode/preset actions
│   │   ├── Workspace3D.jsx       # Three.js canvas viewport & AI query promoter
│   │   ├── LeftPanel.jsx         # Component library selector, preset card, simulator toggles
│   │   ├── RightPanel.jsx        # Markdown walkthrough guide, interactive sliders
│   │   ├── StatusBar.jsx         # Sandbox system status & oscilloscope drawer
│   │   ├── ShortcutsOverlay.jsx  # Hotkeys reference guide modal
│   │   ├── TourOverlay.jsx       # Introductory walkthrough module
│   │   └── ProfileModal.jsx      # User profile achievements/badges panel
│   ├── lib/               # Procedural engines and app orchestrator
│   │   ├── iotify-app.js         # Central Three.js rendering, component meshes, logic core
│   │   ├── arduino-runtime.js    # Event-loop engine mapping pins to visual meshes
│   │   └── mermaid-schematic.js  # Mermaid 2D syntax generation and synchronizer
│   └── styles/
│       └── app.css        # Vanilla CSS rules overriding custom features
└── public/                # Static assets (icons, images)
```

---

## 🌐 Deployment

This project is optimized for deployment on **Vercel** with zero-configuration:
1. Connect your repository to Vercel.
2. Add `VITE_GEMINI_API_KEY` as an Environment Variable in the Vercel dashboard.
3. Every push to the `main` branch is automatically built and deployed.

---

Built with ❤️ by DeepMind team.
