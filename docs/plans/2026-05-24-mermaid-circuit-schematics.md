# Mermaid Circuit Schematic Diagrams Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-generate a live Mermaid flowchart diagram of any AI-built circuit and display it in the existing Circuit Schematic panel — so every free-build circuit instantly has a readable connection diagram.

**Architecture:** Install `mermaid` as an npm dependency. Create `src/lib/mermaid-schematic.js` to convert AI circuit JSON → Mermaid `flowchart LR` text and render it into the DOM. Wire the call into `applyAIFreeBuildCircuit()` in `iotify-app.js`. Add a Flow Diagram tab to the schematic panel in `Workspace3D.jsx` so users can toggle between the existing SVG view and the new Mermaid view.

**Tech Stack:** Mermaid.js v11, React 18, Vite 5, vanilla-JS imperative core (`iotify-app.js`), Three.js (untouched).

---

## Context You Need

| Fact | Detail |
|------|--------|
| Schematic panel DOM | `#schematic-panel` (overlay in `Workspace3D.jsx`), toggled by `toggleSchematicPanel` |
| SVG element | `<svg id="svg-schematic">` — used by **presets** only; empty after AI free-build |
| AI free-build output | `data.components[]` + `data.connections[]` — no schematic field |
| Integration point | `applyAIFreeBuildCircuit(data)` at line ~960 in `iotify-app.js` |
| Exports style | `iotify-app.js` uses named ES module exports at the bottom of the file |
| No existing tests | This is a frontend visual feature; verification = visual check in browser |

---

## Task 1: Install Mermaid

**Files:**
- Modify: `package.json` (via npm)

**Step 1: Install the package**

```bash
cd /Users/elnurmavlonov/Developer/Pilot
npm install mermaid
```

Expected output: `added 1 package` (mermaid has no runtime deps beyond its bundled ones).

**Step 2: Verify it's in package.json**

```bash
grep '"mermaid"' package.json
```

Expected: `"mermaid": "^11.x.x"` (or similar) under `"dependencies"`.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add mermaid for circuit flow diagrams"
```

---

## Task 2: Create the Mermaid Schematic Utility Module

**Files:**
- Create: `src/lib/mermaid-schematic.js`

**Step 1: Write the module**

```js
// src/lib/mermaid-schematic.js
// Converts AI free-build circuit JSON → Mermaid flowchart and renders it.

import mermaid from 'mermaid';

/**
 * Call once on app startup.
 */
export function initMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      primaryColor: '#eff6ff',
      primaryTextColor: '#1e3a5f',
      primaryBorderColor: '#3b82f6',
      lineColor: '#6366f1',
      secondaryColor: '#f1f5f9',
      tertiaryColor: '#fff',
      fontSize: '13px',
    },
    flowchart: {
      curve: 'basis',
      padding: 16,
    },
  });
}

/**
 * Convert AI free-build circuit data to a Mermaid flowchart string.
 *
 * @param {{ components: Array<{id?:string, type:string, variant?:string}>,
 *           connections: Array<{fromComponent:number, fromPin:string,
 *                               toComponent:number, toPin:string, color?:string}> }} data
 * @returns {string} Mermaid diagram definition
 */
export function circuitToMermaid(data) {
  const { components = [], connections = [] } = data;

  // Build a human-readable label for each component
  const nodeLabel = (comp, index) => {
    const emoji = componentEmoji(comp.type);
    const variant = comp.variant ? ` ${comp.variant}` : '';
    const label = comp.id
      ? comp.id.replace(/_/g, ' ')
      : `${comp.type}${variant} ${index}`;
    return `${emoji} ${label}`;
  };

  // Safe node ID (no spaces or special chars)
  const nodeId = (comp, index) =>
    `N${index}_${(comp.id || comp.type).replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Color → Mermaid link style class
  const linkClass = (color) => {
    if (!color) return '';
    const map = {
      '#ef4444': 'pwr',   // power red
      '#1e293b': 'gnd',   // ground dark
      '#6366f1': 'sig',   // signal indigo
      '#fbbf24': 'adc',   // analog amber
    };
    return map[color.toLowerCase()] || '';
  };

  // Node declarations
  const nodes = components
    .map((c, i) => `  ${nodeId(c, i)}["${nodeLabel(c, i)}"]`)
    .join('\n');

  // Edge declarations
  const edges = connections.map((conn) => {
    const from = nodeId(components[conn.fromComponent], conn.fromComponent);
    const to   = nodeId(components[conn.toComponent],   conn.toComponent);
    const label = `${conn.fromPin} → ${conn.toPin}`;
    const cls = linkClass(conn.color);
    return `  ${from} -->|"${label}"| ${to}${cls ? `:::${cls}` : ''}`;
  }).join('\n');

  // Class defs for wire colours
  const classDefs = [
    '  classDef pwr stroke:#ef4444,color:#ef4444',
    '  classDef gnd stroke:#475569,color:#475569',
    '  classDef sig stroke:#6366f1,color:#6366f1',
    '  classDef adc stroke:#f59e0b,color:#f59e0b',
  ].join('\n');

  return `flowchart LR\n${nodes}\n${edges}\n${classDefs}`;
}

/**
 * Render a Mermaid diagram into a container element.
 * Replaces any previous diagram content.
 *
 * @param {HTMLElement} container - DOM element to render into
 * @param {string} diagramText    - Mermaid definition string
 */
export async function renderMermaidDiagram(container, diagramText) {
  if (!container) return;
  try {
    const id = `mermaid-${Date.now()}`;
    const { svg } = await mermaid.render(id, diagramText);
    container.innerHTML = svg;
  } catch (err) {
    console.warn('[mermaid-schematic] render error:', err);
    container.innerHTML = `<p style="color:#ef4444;font-size:12px;padding:8px;">
      Diagram render error — check console for details.
    </p>`;
  }
}

// ── Private helpers ──────────────────────────────────────────────

function componentEmoji(type) {
  const map = {
    arduino:    '🤖',
    esp32:      '🤖',
    led:        '💡',
    resistor:   '⚡',
    buzzer:     '🔊',
    button:     '🔘',
    ldr:        '☀️',
    servo:      '⚙️',
    dht11:      '🌡️',
    ultrasonic: '📡',
    lcd:        '🖥️',
    relay:      '🔌',
    motor:      '🔄',
  };
  return map[type?.toLowerCase()] || '🔩';
}
```

**Step 2: Commit**

```bash
git add src/lib/mermaid-schematic.js
git commit -m "feat: add mermaid-schematic utility (circuitToMermaid + renderMermaidDiagram)"
```

---

## Task 3: Update the Schematic Panel UI

**Files:**
- Modify: `src/components/Workspace3D.jsx` (lines 154–180, the `#schematic-panel` div)

**Step 1: Read the current schematic panel section**

Lines 154–180 of `Workspace3D.jsx` contain the floating panel. You need to:
1. Add two tab buttons: **SVG View** and **Flow Diagram**
2. Wrap the existing SVG in a `#schematic-svg-tab` div (hidden by default for free-build)
3. Add a `#mermaid-schematic` div for the Mermaid render target

**Step 2: Replace the schematic panel content area**

Find this block (lines ~154–180):
```jsx
{/* Floating Schematic Overlay */}
<div
  id="schematic-panel"
  className="absolute inset-4 md:inset-8 bg-white border border-slate-200 rounded-3xl p-6 hidden flex-col z-20 shadow-2xl max-w-xl overflow-y-auto"
>
  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
    <div className="flex items-center gap-2">
      <i className="fa-solid fa-diagram-project text-blue-500 text-lg"></i>
      <h3 className="font-bold text-slate-900">Circuit Schematic</h3>
    </div>
    <button
      onClick={toggleSchematicPanel}
      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition rounded-xl cursor-pointer"
    >
      <i className="fa-solid fa-xmark text-lg"></i>
    </button>
  </div>
  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center min-h-[220px]">
    <svg id="svg-schematic" viewBox="0 0 400 300" className="w-full max-h-[260px]"></svg>
  </div>
  <p
    id="schematic-description"
    className="text-xs text-slate-600 mt-4 leading-relaxed"
  >
    Visual connection schematic showing real-time voltage source flows.
  </p>
</div>
```

Replace with:
```jsx
{/* Floating Schematic Overlay */}
<div
  id="schematic-panel"
  className="absolute inset-4 md:inset-8 bg-white border border-slate-200 rounded-3xl p-6 hidden flex-col z-20 shadow-2xl max-w-xl overflow-y-auto"
>
  {/* Header */}
  <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
    <div className="flex items-center gap-2">
      <i className="fa-solid fa-diagram-project text-blue-500 text-lg"></i>
      <h3 className="font-bold text-slate-900">Circuit Schematic</h3>
    </div>
    <button
      onClick={toggleSchematicPanel}
      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition rounded-xl cursor-pointer"
    >
      <i className="fa-solid fa-xmark text-lg"></i>
    </button>
  </div>

  {/* Tab bar */}
  <div className="flex gap-1 mb-3">
    <button
      id="schematic-tab-svg"
      onClick={() => window._switchSchematicTab('svg')}
      className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border-b-2 border-blue-600 text-blue-700 bg-blue-50 transition-all cursor-pointer"
    >
      <i className="fa-solid fa-vector-square text-[10px]"></i> SVG
    </button>
    <button
      id="schematic-tab-flow"
      onClick={() => window._switchSchematicTab('flow')}
      className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
    >
      <i className="fa-solid fa-share-nodes text-[10px]"></i> Flow Diagram
    </button>
  </div>

  {/* SVG view */}
  <div id="schematic-svg-tab" className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center min-h-[220px]">
    <svg id="svg-schematic" viewBox="0 0 400 300" className="w-full max-h-[260px]"></svg>
  </div>

  {/* Mermaid flow diagram view */}
  <div id="schematic-flow-tab" className="hidden flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[220px] overflow-auto">
    <div id="mermaid-schematic" className="w-full flex items-center justify-center">
      <p className="text-xs text-slate-400 italic">Generate an AI circuit to see the flow diagram.</p>
    </div>
  </div>

  <p
    id="schematic-description"
    className="text-xs text-slate-600 mt-4 leading-relaxed"
  >
    Visual connection schematic showing real-time voltage source flows.
  </p>
</div>
```

**Step 3: Commit**

```bash
git add src/components/Workspace3D.jsx
git commit -m "feat: add SVG/Flow diagram tabs to schematic panel"
```

---

## Task 4: Add Tab-Switching Logic and Mermaid Integration to iotify-app.js

**Files:**
- Modify: `src/lib/iotify-app.js`

There are **3** changes to make in this file.

### Change A — Import mermaid utilities at the top of the file

Add right after the opening comment block (around line 13, after `/* global THREE */`):

```js
import { initMermaid, circuitToMermaid, renderMermaidDiagram } from './mermaid-schematic.js';
```

### Change B — Initialize Mermaid inside `initIotifyApp()`

Find the `initIotifyApp` function (search for `export function initIotifyApp`). Add this as the **first line** inside it:

```js
initMermaid();
```

Also add the tab-switching helper right after:

```js
// Schematic panel tab switcher (called from React onClick via window)
window._switchSchematicTab = function(tab) {
    const svgTab   = document.getElementById('schematic-svg-tab');
    const flowTab  = document.getElementById('schematic-flow-tab');
    const btnSvg   = document.getElementById('schematic-tab-svg');
    const btnFlow  = document.getElementById('schematic-tab-flow');
    if (!svgTab || !flowTab) return;
    const isSvg = (tab === 'svg');
    svgTab.classList.toggle('hidden', !isSvg);
    flowTab.classList.toggle('hidden', isSvg);
    // Active tab style
    const active  = 'border-b-2 border-blue-600 text-blue-700 bg-blue-50';
    const inactive = 'border-b-2 border-transparent text-slate-500 hover:text-slate-700';
    if (btnSvg)  { btnSvg.className  = btnSvg.className.replace(/border-b-2[^"]+/g, '');  btnSvg.classList.add(...(isSvg  ? active : inactive).split(' ')); }
    if (btnFlow) { btnFlow.className = btnFlow.className.replace(/border-b-2[^"]+/g, ''); btnFlow.classList.add(...(!isSvg ? active : inactive).split(' ')); }
};
```

> **Simpler approach for the tab buttons**: Since the classList manipulation is fiddly, use a cleaner version below. Replace the `window._switchSchematicTab` block with:

```js
window._switchSchematicTab = function(tab) {
    const svgTab  = document.getElementById('schematic-svg-tab');
    const flowTab = document.getElementById('schematic-flow-tab');
    const btnSvg  = document.getElementById('schematic-tab-svg');
    const btnFlow = document.getElementById('schematic-tab-flow');
    if (!svgTab || !flowTab) return;
    const isSvg = tab === 'svg';
    // Show/hide panes
    svgTab.classList.toggle('hidden', !isSvg);
    flowTab.classList.toggle('hidden', isSvg);
    // Active styles
    const activeClass   = ['border-blue-600','text-blue-700','bg-blue-50','border-b-2'];
    const inactiveClass = ['border-transparent','text-slate-500','border-b-2'];
    const setTab = (btn, isActive) => {
        if (!btn) return;
        btn.classList.remove(...activeClass, ...inactiveClass);
        btn.classList.add(...(isActive ? activeClass : inactiveClass));
    };
    setTab(btnSvg,  isSvg);
    setTab(btnFlow, !isSvg);
};
```

### Change C — Render Mermaid after AI free-build circuit is applied

Find the end of `applyAIFreeBuildCircuit(data)` (around line 1020–1022):

```js
            refreshPlacedList();
            saveUndoSnapshot();
            glideCamera({ x: 0, y: 15, z: 8 }, { x: 0, y: 0, z: 0 });
        }
```

Add the Mermaid render call **before** the closing `}`:

```js
            refreshPlacedList();
            saveUndoSnapshot();
            glideCamera({ x: 0, y: 15, z: 8 }, { x: 0, y: 0, z: 0 });

            // Auto-generate Mermaid flow diagram and switch to it
            try {
                const mermaidContainer = document.getElementById('mermaid-schematic');
                if (mermaidContainer) {
                    const diagramText = circuitToMermaid(data);
                    await renderMermaidDiagram(mermaidContainer, diagramText);
                    // Auto-switch to Flow Diagram tab
                    if (typeof window._switchSchematicTab === 'function') {
                        window._switchSchematicTab('flow');
                    }
                }
            } catch (mErr) {
                console.warn('[IoTify] Mermaid render failed:', mErr);
            }
        }
```

**Step 1: Make Change A** — add import at the top

**Step 2: Make Change B** — add `initMermaid()` + `window._switchSchematicTab` inside `initIotifyApp()`

**Step 3: Make Change C** — add Mermaid render call inside `applyAIFreeBuildCircuit`

**Step 4: Commit**

```bash
git add src/lib/iotify-app.js
git commit -m "feat: integrate mermaid circuit diagrams into AI free-build flow"
```

---

## Task 5: Initialize Mermaid in main.jsx

**Files:**
- Modify: `src/main.jsx`

**Step 1: Check current main.jsx**

```bash
cat src/main.jsx
```

**Step 2: Verify Mermaid is initialized via `initIotifyApp`**

`initMermaid()` is now called inside `initIotifyApp()` which `App.jsx` calls in `useEffect`. This means Mermaid is initialized when the React app mounts — no extra change to `main.jsx` needed.

✅ No change required — skip to verification.

---

## Task 6: Verify in the Browser

**Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:5173`.

**Step 2: Set your Gemini API key**

Open `index.html` and verify `const apiKey = "YOUR_KEY_HERE"` has a real key, or set via `.env.local` if configured.

**Step 3: Generate an AI circuit**

Type in the AI input: `"LED blink with a button"` and press Enter.

**Expected result:**
1. 3D circuit appears on the canvas ✅
2. Click the **Circuit Schematic** toolbar button (diagram-project icon) ✅
3. Schematic panel opens — two tabs visible: **SVG** | **Flow Diagram** ✅
4. **Flow Diagram** tab is auto-selected ✅
5. A Mermaid flowchart shows: `Arduino Uno → Resistor → LED`, `Arduino → Button`, etc. ✅

**Step 4: Test SVG tab still works**

Click one of the 4 preset chips (e.g. "LED Blink"). Open the schematic panel. Click **SVG** tab → preset SVG renders correctly. ✅

**Step 5: Commit verification note (no code change)**

```bash
# No additional commit needed — verification is visual
```

---

## Task 7: Build Check

**Step 1: Run production build**

```bash
npm run build
```

Expected: `✓ built in X.Xs` — no errors.

**Step 2: Commit if build passes**

```bash
git add -A
git commit -m "chore: verify mermaid integration builds cleanly"
```

---

## Troubleshooting Guide

| Issue | Fix |
|-------|-----|
| `mermaid is not defined` | Check import in `mermaid-schematic.js`; verify `npm install mermaid` ran |
| Diagram renders then disappears | Mermaid `startOnLoad: false` must be set — check `initMermaid()` config |
| Tab buttons don't switch | `window._switchSchematicTab` must be set before React `onClick` fires — confirm it's called early in `initIotifyApp()` |
| Build error: `Cannot find module 'mermaid'` | Run `npm install` again; check `node_modules/mermaid` exists |
| SVG tab broken after change | Ensure `#schematic-svg-tab` wrapper div wraps the `<svg id="svg-schematic">` exactly |
| Flow tab shows "Generate an AI circuit..." forever | `applyAIFreeBuildCircuit` didn't call `renderMermaidDiagram` — check Change C was applied correctly and `await` is present |
