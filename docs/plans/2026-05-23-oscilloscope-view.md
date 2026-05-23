# Oscilloscope View Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a fourth tab "Scope" to the right panel that shows a real-time waveform chart of simulated PWM duty cycle and analog values as the simulation runs.

**Architecture:** Single HTML file (`index.html`) — add a new tab button, a canvas-based oscilloscope panel, CSS styles, and a JS engine that samples signal values from the existing simulation interval and redraws at ~30 fps using `requestAnimationFrame`.

**Tech Stack:** Vanilla JS, HTML5 Canvas 2D API, Tailwind CSS (CDN), existing simulation variables (`activePreset`, `activeLdrLevel`, `activeButtonState`, `isSimulating`)

---

## What the Oscilloscope Shows

| Preset   | Signal           | Type    | Range   |
|----------|------------------|---------|---------|
| blink    | LED pin (D13)    | Digital | 0 / 5 V |
| night    | LDR analog read  | Analog  | 0–5 V   |
| button   | Digital pin      | Digital | 0 / 5 V |
| alarm    | Buzzer pin       | Digital | 0 / 5 V |
| default  | Heartbeat        | Analog  | ~2.5 V  |

Samples are taken every **100 ms** (independent fast ticker), buffer holds **300 points** (30 s of history at 100 ms).

---

### Task 1: Add "Scope" tab button in the right panel

**Files:**
- Modify: `index.html:849-853` (after the Serial tab button)

**Step 1: Locate the serial tab button**

Find this block around line 849:
```html
<button id="tab-serial" onclick="switchTab('serial')"
    class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-t-xl border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all">
    <i class="fa-solid fa-terminal"></i> Serial
</button>
```

**Step 2: Add Scope tab button directly after it**

```html
<button id="tab-scope" onclick="switchTab('scope')"
    class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-t-xl border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all">
    <i class="fa-solid fa-wave-square"></i> Scope
</button>
```

**Step 3: Verify visually** — four tab buttons appear in right panel header.

---

### Task 2: Add oscilloscope panel HTML

**Files:**
- Modify: `index.html:976` (after `</div><!-- end #panel-serial -->`)

**Step 1: Add the panel div after `#panel-serial` ends**

```html
<!-- ── Oscilloscope Panel ── -->
<div id="panel-scope" class="hidden flex-col flex-1 overflow-hidden">
    <!-- Toolbar -->
    <div class="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
        <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" id="scope-status-dot"></span>
            <span class="text-[10px] code-font font-semibold text-slate-600">Oscilloscope — 100 ms/div</span>
        </div>
        <div class="flex items-center gap-1.5">
            <button onclick="clearOscilloscope()" class="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer">
                <i class="fa-solid fa-trash-can"></i> Clear
            </button>
        </div>
    </div>
    <!-- Canvas -->
    <div class="flex-1 bg-slate-950 relative overflow-hidden">
        <canvas id="osc-canvas" class="absolute inset-0 w-full h-full"></canvas>
        <!-- Idle state message -->
        <div id="osc-idle" class="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <i class="fa-solid fa-wave-square text-slate-700 text-2xl"></i>
            <p class="text-[11px] text-slate-600 font-medium code-font">Run a simulation to see waveform</p>
        </div>
    </div>
    <!-- Footer: voltage/time labels -->
    <div class="px-4 py-2 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between">
        <span class="text-[10px] code-font text-slate-400" id="osc-signal-label">Signal: —</span>
        <span class="text-[10px] code-font text-slate-400" id="osc-freq-label">—</span>
    </div>
</div><!-- end #panel-scope -->
```

---

### Task 3: Add oscilloscope CSS

**Files:**
- Modify: `index.html` — inside the `<style>` block (before the closing `</style>`)

**Step 1: Find the closing `</style>` tag** (around line 530 or near the dark mode section).

**Step 2: Add these rules just before `</style>`:**

```css
/* ── Oscilloscope Panel ── */
#osc-canvas {
    display: block;
    image-rendering: pixelated;
}
body.dark #panel-scope .bg-slate-50 { background: #0f172a !important; }
body.dark #panel-scope .border-slate-100 { border-color: #1e293b !important; }
body.dark #osc-signal-label,
body.dark #osc-freq-label { color: #475569 !important; }
```

---

### Task 4: Add oscilloscope JavaScript engine

**Files:**
- Modify: `index.html` — add JS block near the end of the `<script>` section, before the closing `</script>`

**Step 1: Find a good insertion point** — look for the `clearSerial` function (around line 3520) and add the oscilloscope engine right after it.

**Step 2: Add the oscilloscope JS block:**

```javascript
// ========================================================
// OSCILLOSCOPE ENGINE
// ========================================================
const OSC_BUFFER_SIZE = 300;    // 300 samples × 100 ms = 30 s history
const OSC_SAMPLE_MS   = 100;    // sample interval in ms
let oscBuffer         = [];     // { v: 0-5, t: timestamp }
let oscAnimFrame      = null;
let oscSampleTimer    = null;
let oscRunning        = false;

/** Map current simulation state to a 0–5 V value */
function getOscVoltage() {
    if (!isSimulating) return null;
    switch (activePreset) {
        case 'blink':
            // LED state: ON = 5V, OFF = 0V
            // derive from led mesh emissive intensity if available
            { const led = customMeshes["led"];
              const on = led && led.children[4] && led.children[4].intensity > 0;
              return on ? 5 : 0; }
        case 'night':
            // LDR → 0–5 V analog (inverted: low light = low voltage)
            return (activeLdrLevel / 100) * 5;
        case 'button':
            return activeButtonState ? 5 : 0;
        case 'alarm':
            { const bz = customMeshes["buzzer"];
              const on = bz && Math.abs(bz.position.y) > 0.01;
              return on ? 5 : 0; }
        default:
            // Heartbeat: ~2.5 V + gentle sine
            return 2.5 + Math.sin(Date.now() * 0.002) * 0.3;
    }
}

/** Push one sample into the ring buffer */
function oscSampleTick() {
    const v = getOscVoltage();
    if (v === null) return;
    oscBuffer.push({ v, t: Date.now() });
    if (oscBuffer.length > OSC_BUFFER_SIZE) oscBuffer.shift();
}

/** Start/stop the oscilloscope sampler */
function startOscilloscope() {
    if (oscRunning) return;
    oscRunning = true;
    oscSampleTimer = setInterval(oscSampleTick, OSC_SAMPLE_MS);
    const idle = document.getElementById('osc-idle');
    if (idle) idle.style.display = 'none';
    oscDrawLoop();
}

function stopOscilloscope() {
    oscRunning = false;
    clearInterval(oscSampleTimer);
    oscSampleTimer = null;
    if (oscAnimFrame) { cancelAnimationFrame(oscAnimFrame); oscAnimFrame = null; }
    const idle = document.getElementById('osc-idle');
    if (idle) idle.style.display = '';
}

function clearOscilloscope() {
    oscBuffer = [];
    document.getElementById('osc-signal-label').textContent = 'Signal: —';
    document.getElementById('osc-freq-label').textContent = '—';
}

/** Draw the waveform on the canvas */
function oscDraw() {
    const canvas = document.getElementById('osc-canvas');
    if (!canvas) return;

    // Sync canvas resolution to CSS size
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (canvas.width !== W || canvas.height !== H) {
        canvas.width  = W;
        canvas.height = H;
    }
    const ctx = canvas.getContext('2d');

    const PAD_L = 36, PAD_R = 12, PAD_T = 12, PAD_B = 20;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    // ── Background ──
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, W, H);

    const GRID_ROWS = 5;
    const GRID_COLS = 10;

    // ── Grid ──
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= GRID_ROWS; r++) {
        const y = PAD_T + (r / GRID_ROWS) * plotH;
        ctx.beginPath();
        ctx.moveTo(PAD_L, y);
        ctx.lineTo(PAD_L + plotW, y);
        ctx.stroke();
    }
    for (let c = 0; c <= GRID_COLS; c++) {
        const x = PAD_L + (c / GRID_COLS) * plotW;
        ctx.beginPath();
        ctx.moveTo(x, PAD_T);
        ctx.lineTo(x, PAD_T + plotH);
        ctx.stroke();
    }

    // ── Y-axis labels (0–5 V) ──
    ctx.fillStyle = '#475569';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    for (let r = 0; r <= GRID_ROWS; r++) {
        const v = 5 - (r / GRID_ROWS) * 5;
        const y = PAD_T + (r / GRID_ROWS) * plotH;
        ctx.fillText(v.toFixed(0) + 'V', PAD_L - 4, y + 3);
    }

    if (oscBuffer.length < 2) return;

    // ── Waveform ──
    const samples = oscBuffer.slice(-Math.min(oscBuffer.length, 150));
    const vToY = v => PAD_T + plotH - (v / 5) * plotH;
    const xStep = plotW / (samples.length - 1 || 1);

    // Glow effect: draw wide dim trace first
    ctx.shadowBlur   = 8;
    ctx.shadowColor  = '#4ade80';
    ctx.strokeStyle  = 'rgba(74, 222, 128, 0.25)';
    ctx.lineWidth    = 4;
    ctx.beginPath();
    samples.forEach((s, i) => {
        const x = PAD_L + i * xStep;
        const y = vToY(s.v);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Sharp bright trace
    ctx.shadowBlur   = 4;
    ctx.shadowColor  = '#86efac';
    ctx.strokeStyle  = '#4ade80';
    ctx.lineWidth    = 1.5;
    ctx.beginPath();
    samples.forEach((s, i) => {
        const x = PAD_L + i * xStep;
        const y = vToY(s.v);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ── Footer labels ──
    const last = samples[samples.length - 1];
    const sigNames = {
        blink: 'D13 (LED)',
        night: 'A0 (LDR)',
        button: 'D2 (Button)',
        alarm: 'D8 (Buzzer)',
    };
    const sigLabel = sigNames[activePreset] || 'Signal';
    document.getElementById('osc-signal-label').textContent = `Signal: ${sigLabel}  ${last.v.toFixed(2)} V`;

    // Estimate frequency from zero-crossings (for digital signals)
    const MID = 2.5;
    let crossings = 0;
    for (let i = 1; i < samples.length; i++) {
        if ((samples[i-1].v < MID) !== (samples[i].v < MID)) crossings++;
    }
    const duration = (samples[samples.length-1].t - samples[0].t) / 1000;
    if (duration > 0 && crossings > 1) {
        const freqHz = (crossings / 2) / duration;
        document.getElementById('osc-freq-label').textContent =
            freqHz >= 1 ? `${freqHz.toFixed(1)} Hz` : `${(freqHz * 1000).toFixed(0)} mHz`;
    } else {
        document.getElementById('osc-freq-label').textContent = 'DC';
    }
}

function oscDrawLoop() {
    oscDraw();
    if (oscRunning) oscAnimFrame = requestAnimationFrame(oscDrawLoop);
}

/** Resize canvas when right panel is resized */
function oscHandleResize() {
    // Just redraw — canvas will auto-sync dimensions in oscDraw
    if (activeTab === 'scope') oscDraw();
}
```

---

### Task 5: Wire the oscilloscope into the simulation lifecycle

**Files:**
- Modify: `index.html` — `toggleSimulation()` function (~line 2404) and `switchTab()` function (~line 2732)

**Step 1: In `toggleSimulation()`, start/stop the oscilloscope**

Find the `isSimulating = true;` branch (around line 2421) and add `startOscilloscope();` after `runSimulationInterval();`:

```javascript
isSimulating = true;
// ...existing code...
runSimulationInterval();
startOscilloscope();   // ← ADD THIS
```

Find the `isSimulating = false;` branch (around line 2413) and add `stopOscilloscope();` after `clearInterval(simInterval);`:

```javascript
isSimulating = false;
// ...existing code...
clearInterval(simInterval);
stopOscilloscope();    // ← ADD THIS
resetAllComponentOutputs();
```

**Step 2: Update `switchTab()` to handle 'scope'**

In the `panels` object (line 2735), add the scope panel:
```javascript
const panels = { parts: 'panel-parts', ide: 'panel-ide', serial: 'panel-serial', scope: 'panel-scope' };
```

In the tab-style loop (line 2763), add 'scope':
```javascript
['parts', 'ide', 'serial', 'scope'].forEach(t => { ... });
```

In the header-label block, add an `else if` for 'scope':
```javascript
} else if (tabName === 'scope') {
    iconEl.innerHTML       = '<i class="fa-solid fa-wave-square text-sm"></i>';
    titleEl.textContent    = 'Oscilloscope';
    subtitleEl.textContent = '100 ms/div';
}
```

In the `enterPresetMode` condition (line 2776):
```javascript
if (tabName === 'parts') {
    enterFreeBuildMode();
} else if (tabName !== 'serial' && tabName !== 'scope') {
    enterPresetMode();
}
```

If the scope tab is selected while simulation is running, start the oscilloscope:
```javascript
if (tabName === 'scope' && isSimulating) startOscilloscope();
if (tabName !== 'scope') { /* existing logic */ }
```

**Step 3: Hook resize trigger**

Find where `triggerCanvasResize` is called and also call `oscHandleResize()` (optional — the canvas auto-syncs on draw).

---

### Task 6: Commit

```bash
git add index.html
git commit -m "feat: add oscilloscope tab with real-time waveform chart"
```

---

## Testing Checklist

- [ ] "Scope" tab appears in right panel
- [ ] Clicking "Scope" tab shows dark canvas with idle message
- [ ] Run any preset simulation → waveform appears on canvas with green trace
- [ ] `blink` preset shows square wave toggling 0 V ↔ 5 V at ~1 Hz
- [ ] `night` preset shows LDR slider value as analog level; dragging slider changes waveform height
- [ ] `button` preset shows flat 0 V until hardware button pressed → 5 V spike
- [ ] `alarm` preset shows alternating digital signal
- [ ] Frequency estimate appears in footer (e.g. "1.0 Hz" for blink)
- [ ] Clear button wipes buffer
- [ ] Stop simulation → oscilloscope stops, idle message reappears
- [ ] Switching away from Scope tab and back preserves the waveform buffer
- [ ] Dark mode: oscilloscope panel footer remains readable
- [ ] Resizing the right panel causes canvas to re-fit correctly
