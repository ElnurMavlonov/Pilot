# IoTify AI — Generative 3D IoT Lab & Tutor

> An interactive, browser-based electronics sandbox powered by Three.js 3D rendering and AI-driven circuit generation.

![IoTify AI](https://img.shields.io/badge/IoTify-AI%20Lab-6366f1?style=for-the-badge&logo=arduino)
![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)

## ✨ Features

- **Generative 3D Workspace** — Procedurally built Arduino Uno, breadboard, LED, resistor, buzzer, button, and LDR components rendered in real-time Three.js
- **AI Circuit Architect** — Powered by Gemini 2.5 Flash; describe any IoT idea and get a full step-by-step lab generated automatically
- **Interactive Simulation** — Run the sandbox to see LEDs blink, buzzers vibrate, and buttons trigger outputs in real-time
- **Circuit Schematics** — SVG schematic overlays showing pin connections and current flow
- **Firmware IDE** — In-browser Arduino C++ code viewer with one-click copy
- **4 Built-in Presets** — LED Blink, Night Light (LDR), Siren Alarm, Push Trigger

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open `http://localhost:5173` in your browser.

## 🔑 AI Integration (Optional)

To enable AI-generated circuits, add your Gemini API key to `index.html`:

```js
const apiKey = "YOUR_GEMINI_API_KEY_HERE";
```

Without a key, the app falls back to smart keyword-matched presets automatically.

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Three.js r128 | 3D hardware rendering |
| Tailwind CSS | UI styling |
| Font Awesome 6 | Icons |
| Google Fonts | Typography (Plus Jakarta Sans + JetBrains Mono) |
| Gemini 2.5 Flash | AI circuit generation |
| Vite 5 | Dev server & build tool |

## 📦 Project Structure

```
Pilot/
├── index.html       # Main application (self-contained)
├── package.json     # Project metadata & scripts
├── vite.config.js   # Vite build config
├── vercel.json      # Vercel deployment config
├── .gitignore
└── README.md
```

## 🌐 Deployment

This project is deployed on **Vercel**. Every push to `main` triggers an automatic redeploy.

---

Built with ❤️ using Claude Code
