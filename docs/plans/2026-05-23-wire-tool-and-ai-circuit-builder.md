# Wire Tool & AI Circuit Builder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add TinkerCAD-style pin-to-pin wire connecting and an AI free-build circuit generator to IoTify AI Lab.

**Architecture:** All code lives in `index.html` (5020-line single-file app). New code is injected at 7 precise locations: CSS block, canvas HTML toolbar, state vars, pin registry, wire functions, modified event handlers, and AI function. No new files needed.

**Tech Stack:** Three.js r128, Vanilla JS, Tailwind CSS CDN, Gemini 2.5 Flash API

---

### Task 1: CSS — Wire Tool Styles

**Files:**
- Modify: `index.html` — CSS `<style>` block (ends ~line 512)

**Step 1: Append CSS before `</style>`**

```css
/* ── Wire Tool ── */
#wire-tool-btn.active {
    background: #6366f1 !important;
    color: white !important;
    border-color: #6366f1 !important;
}
#wire-mode-indicator {
    position: fixed;
    top: 72px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15,23,42,0.92);
    color: #e0e7ff;
    padding: 7px 18px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 600;
    z-index: 55;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    white-space: nowrap;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(99,102,241,0.4);
}
#wire-mode-indicator.visible { opacity: 1; }
#pin-tooltip {
    position: fixed;
    background: #1e293b;
    color: #e2e8f0;
    padding: 3px 10px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 700;
    z-index: 65;
    pointer-events: none;
    display: none;
    white-space: nowrap;
    letter-spacing: 0.03em;
    border: 1px solid #334155;
}
body.dark #wire-mode-indicator { background: rgba(99,102,241,0.18); }
```

**Step 2: Verify** — no syntax errors in browser console

---

### Task 2: HTML — Wire Tool Toolbar Buttons + Overlays

**Files:**
- Modify: `index.html` — canvas bottom-right toolbar (line ~803–816)

**Step 1: Add after the "Reset View" button** (inside the `absolute bottom-6 right-6` div):

```html
<!-- Wire color picker -->
<input type="color" id="wire-color-input" value="#ef4444"
    title="Wire color"
    oninput="activeWireColor=this.value"
    class="p-1 bg-white/95 border border-slate-200 rounded-xl shadow-lg h-10 w-10 cursor-pointer">
<!-- Wire Tool Toggle -->
<button id="wire-tool-btn" onclick="toggleWireMode()"
    title="Wire Tool (W)"
    class="p-3 bg-white/95 border border-slate-200 text-slate-700 rounded-xl shadow-lg hover:bg-white transition flex items-center gap-2 text-xs font-semibold cursor-pointer">
    <i class="fa-solid fa-bezier-curve text-indigo-400"></i> Wire
</button>
```

**Step 2: Add wire mode indicator + pin tooltip** — before the closing `</main>` tag (~line 854):

```html
<!-- Wire mode status indicator -->
<div id="wire-mode-indicator">⚡ Wire Mode — click a pin to start</div>
<!-- Pin name tooltip -->
<div id="pin-tooltip"></div>
```

**Step 3: Add W shortcut to keyboard overlay** (~line 4830):
```html
<div class="shortcut-row"><span class="sh-label">Toggle Wire Tool</span><span class="sh-keys"><kbd class="sh-key">W</kbd></span></div>
```

---

### Task 3: State Variables — Wire Tool State

**Files:**
- Modify: `index.html` — state vars block (~line 1582–1586)

**Step 1: Append after `let _inRestore = false;`**

```javascript
// Wire Tool State
let isWireMode      = false;
let wireDrawStart   = null;   // { group, pinIndex, pinName, worldPos }
let wirePreviewMesh = null;
let placedWires     = [];     // { id, fromCompId, fromPinIdx, toCompId, toPinIdx, color, mesh }
let wireIdCounter   = 0;
let activeWireColor = '#ef4444';
let hoveredPinSphere = null;
```

---

### Task 4: COMPONENT_PINS Registry

**Files:**
- Modify: `index.html` — after `PARTS_REGISTRY` array (~line 1541)

**Step 1: Insert after the closing `];` of PARTS_REGISTRY**

```javascript
// ========================================================
// COMPONENT PIN REGISTRY (local-space offsets from group.position)
// ========================================================
const COMPONENT_PINS = {
  arduino: [
    { name:'GND',   pos:[ 1.8,0.35,-2.0], color:'#1e293b' },
    { name:'5V',    pos:[-1.8,0.35,-2.0], color:'#ef4444' },
    { name:'3.3V',  pos:[-1.8,0.35,-1.8], color:'#f97316' },
    { name:'GND2',  pos:[-1.8,0.35,-1.6], color:'#1e293b' },
    { name:'D13',   pos:[ 1.8,0.35,-1.6], color:'#6366f1' },
    { name:'D12',   pos:[ 1.8,0.35,-1.4], color:'#6366f1' },
    { name:'D11~',  pos:[ 1.8,0.35,-1.2], color:'#a855f7' },
    { name:'D10~',  pos:[ 1.8,0.35,-1.0], color:'#a855f7' },
    { name:'D9~',   pos:[ 1.8,0.35,-0.8], color:'#a855f7' },
    { name:'D8',    pos:[ 1.8,0.35,-0.6], color:'#6366f1' },
    { name:'D7',    pos:[ 1.8,0.35,-0.4], color:'#6366f1' },
    { name:'D6~',   pos:[ 1.8,0.35,-0.2], color:'#a855f7' },
    { name:'D5~',   pos:[ 1.8,0.35, 0.0], color:'#a855f7' },
    { name:'D4',    pos:[ 1.8,0.35, 0.2], color:'#6366f1' },
    { name:'D3~',   pos:[ 1.8,0.35, 0.4], color:'#a855f7' },
    { name:'D2',    pos:[ 1.8,0.35, 0.6], color:'#6366f1' },
    { name:'A0',    pos:[-1.8,0.35, 0.4], color:'#fbbf24' },
    { name:'A1',    pos:[-1.8,0.35, 0.2], color:'#fbbf24' },
    { name:'A2',    pos:[-1.8,0.35, 0.0], color:'#fbbf24' },
    { name:'A3',    pos:[-1.8,0.35,-0.2], color:'#fbbf24' },
    { name:'A4',    pos:[-1.8,0.35,-0.4], color:'#fbbf24' },
    { name:'A5',    pos:[-1.8,0.35,-0.6], color:'#fbbf24' },
  ],
  esp32: [
    { name:'3.3V', pos:[ 1.3,0.25,-1.5], color:'#f97316' },
    { name:'GND',  pos:[ 1.3,0.25,-1.3], color:'#1e293b' },
    { name:'D4',   pos:[ 1.3,0.25,-0.9], color:'#6366f1' },
    { name:'D5',   pos:[ 1.3,0.25,-0.5], color:'#6366f1' },
    { name:'D13',  pos:[ 1.3,0.25,-0.1], color:'#6366f1' },
    { name:'D14',  pos:[ 1.3,0.25, 0.1], color:'#6366f1' },
    { name:'D25',  pos:[ 1.3,0.25, 0.5], color:'#a855f7' },
    { name:'D26',  pos:[ 1.3,0.25, 0.7], color:'#a855f7' },
    { name:'D27',  pos:[ 1.3,0.25, 0.9], color:'#a855f7' },
    { name:'D32',  pos:[ 1.3,0.25, 1.1], color:'#fbbf24' },
    { name:'VIN',  pos:[-1.3,0.25,-1.5], color:'#ef4444' },
    { name:'GND2', pos:[-1.3,0.25,-1.3], color:'#1e293b' },
    { name:'D22',  pos:[-1.3,0.25,-0.1], color:'#6366f1' },
    { name:'D21',  pos:[-1.3,0.25, 0.1], color:'#6366f1' },
    { name:'D19',  pos:[-1.3,0.25, 0.3], color:'#6366f1' },
    { name:'D18',  pos:[-1.3,0.25, 0.5], color:'#6366f1' },
  ],
  led:          [{ name:'anode(+)',    pos:[-0.15,0,0],    color:'#ef4444' },
                 { name:'cathode(-)',  pos:[ 0.15,0,0],    color:'#94a3b8' }],
  resistor:     [{ name:'pin1',        pos:[-0.22,-0.4,0], color:'#94a3b8' },
                 { name:'pin2',        pos:[ 0.22,-0.4,0], color:'#94a3b8' }],
  capacitor:    [{ name:'positive(+)', pos:[-0.08,0,0],    color:'#ef4444' },
                 { name:'negative(-)', pos:[ 0.08,0,0],    color:'#94a3b8' }],
  potentiometer:[{ name:'pinA',        pos:[-0.18,0,0],    color:'#94a3b8' },
                 { name:'wiper',       pos:[ 0,   0,0],    color:'#6366f1' },
                 { name:'pinB',        pos:[ 0.18,0,0],    color:'#94a3b8' }],
  thermistor:   [{ name:'pin1',        pos:[-0.09,0,0],    color:'#94a3b8' },
                 { name:'pin2',        pos:[ 0.09,0,0],    color:'#94a3b8' }],
  transistor:   [{ name:'base(B)',     pos:[-0.18,0,0],    color:'#fbbf24' },
                 { name:'collector(C)',pos:[ 0,   0,0],    color:'#6366f1' },
                 { name:'emitter(E)',  pos:[ 0.18,0,0],    color:'#ef4444' }],
  buzzer:       [{ name:'positive(+)', pos:[-0.15,0,0.45], color:'#ef4444' },
                 { name:'negative(-)', pos:[ 0.15,0,0.45], color:'#94a3b8' }],
  button:       [{ name:'pin1',        pos:[-0.2,-0.1,-0.2],color:'#94a3b8' },
                 { name:'pin2',        pos:[ 0.2,-0.1,-0.2],color:'#94a3b8' },
                 { name:'pin3',        pos:[-0.2,-0.1, 0.2],color:'#94a3b8' },
                 { name:'pin4',        pos:[ 0.2,-0.1, 0.2],color:'#94a3b8' }],
  ldr:          [{ name:'pin1',        pos:[-0.1,0,0],     color:'#94a3b8' },
                 { name:'pin2',        pos:[ 0.1,0,0],     color:'#94a3b8' }],
  dht11:        [{ name:'VCC',         pos:[-0.15,0,0],    color:'#ef4444' },
                 { name:'DATA',        pos:[-0.05,0,0],    color:'#6366f1' },
                 { name:'NC',          pos:[ 0.05,0,0],    color:'#94a3b8' },
                 { name:'GND',         pos:[ 0.15,0,0],    color:'#1e293b' }],
  hcsr04:       [{ name:'VCC',         pos:[-0.3,0,0],     color:'#ef4444' },
                 { name:'TRIG',        pos:[-0.1,0,0],     color:'#6366f1' },
                 { name:'ECHO',        pos:[ 0.1,0,0],     color:'#fbbf24' },
                 { name:'GND',         pos:[ 0.3,0,0],     color:'#1e293b' }],
  pir:          [{ name:'VCC',         pos:[-0.12,0,0],    color:'#ef4444' },
                 { name:'OUT',         pos:[ 0,  0,0],     color:'#6366f1' },
                 { name:'GND',         pos:[ 0.12,0,0],    color:'#1e293b' }],
  servo:        [{ name:'GND',         pos:[-0.12,0,0],    color:'#1e293b' },
                 { name:'5V',          pos:[ 0,  0,0],     color:'#ef4444' },
                 { name:'Signal',      pos:[ 0.12,0,0],    color:'#f97316' }],
  motor_l298n:  [{ name:'ENA',         pos:[-0.4,0,-0.42], color:'#6366f1' },
                 { name:'IN1',         pos:[-0.2,0,-0.42], color:'#6366f1' },
                 { name:'IN2',         pos:[ 0,  0,-0.42], color:'#6366f1' },
                 { name:'IN3',         pos:[ 0.2,0,-0.42], color:'#6366f1' },
                 { name:'ENB',         pos:[ 0.4,0,-0.42], color:'#6366f1' }],
  relay:        [{ name:'VCC',         pos:[-0.2,0,-0.42], color:'#ef4444' },
                 { name:'GND',         pos:[ 0,  0,-0.42], color:'#1e293b' },
                 { name:'IN',          pos:[ 0.2,0,-0.42], color:'#6366f1' }],
  breadboard:   [{ name:'VCC+',        pos:[ 1.55,0.14,-3.0],color:'#ef4444' },
                 { name:'GND-',        pos:[ 1.65,0.14,-3.0],color:'#1e293b' },
                 { name:'VCC+2',       pos:[ 1.55,0.14, 3.0],color:'#ef4444' },
                 { name:'GND-2',       pos:[ 1.65,0.14, 3.0],color:'#1e293b' }],
};
```

---

### Task 5: Wire Tool Functions

**Files:**
- Modify: `index.html` — insert before `function initGraphics()` (~line 1875)

**Step 1: Insert full wire-tool function block**

```javascript
// ========================================================
// WIRE TOOL — Pin spheres, draw, preview, render
// ========================================================

function getComponentPinDefs(group) {
    return COMPONENT_PINS[group.userData.type] || [];
}

/** Attach invisible pin-sphere children to a component group */
function attachPinSpheres(group) {
    const defs = getComponentPinDefs(group);
    const geom = new THREE.SphereGeometry(0.085, 8, 8);
    defs.forEach((pin, idx) => {
        const mat = new THREE.MeshStandardMaterial({
            color: pin.color || '#6366f1',
            emissive: pin.color || '#6366f1',
            emissiveIntensity: 0.55,
            transparent: true, opacity: 0.88
        });
        const sphere = new THREE.Mesh(geom, mat.clone());
        sphere.position.set(...pin.pos);
        sphere.userData = {
            isPinSphere: true,
            pinIndex: idx,
            pinName: pin.name,
            pinColor: pin.color || '#6366f1',
            componentGroup: group
        };
        sphere.visible = false;
        sphere.name = `pin_${idx}`;
        group.add(sphere);
    });
}

/** Show / hide all pin spheres on placed components */
function setPinSpheresVisible(show) {
    placedComponents.forEach(g =>
        g.traverse(c => { if (c.userData.isPinSphere) c.visible = show; })
    );
}

/** Raycast only against visible pin spheres; returns mesh or null */
function raycastPinSpheres(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    const ray  = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        -((e.clientY - rect.top)  / rect.height) * 2 + 1
    ), camera);
    const allSpheres = [];
    placedComponents.forEach(g =>
        g.traverse(c => { if (c.userData.isPinSphere && c.visible) allSpheres.push(c); })
    );
    const hits = ray.intersectObjects(allSpheres, false);
    return hits.length ? hits[0].object : null;
}

/** Toggle wire mode on / off */
function toggleWireMode() {
    if (!isFreeBuildMode) {
        showToast("Open the Parts Library tab first to use the Wire Tool", false);
        return;
    }
    isWireMode = !isWireMode;
    document.getElementById('wire-tool-btn')?.classList.toggle('active', isWireMode);
    if (isWireMode) {
        controls.enabled = false;
        setPinSpheresVisible(true);
    } else {
        cancelWireDraw();
        clearPinHighlight();
        setPinSpheresVisible(false);
        controls.enabled = true;
    }
    updateWireModeIndicator();
}

function updateWireModeIndicator() {
    const el = document.getElementById('wire-mode-indicator');
    if (!el) return;
    if (!isWireMode) { el.classList.remove('visible'); return; }
    el.textContent = wireDrawStart
        ? `⚡ Wiring from "${wireDrawStart.pinName}" — click another pin to connect  •  Esc to cancel`
        : '⚡ Wire Mode — click a pin to start  •  W or Esc to exit';
    el.classList.add('visible');
}

/** Begin drawing a wire from pinSphere */
function startWireDraw(pinSphere) {
    const worldPos = new THREE.Vector3();
    pinSphere.getWorldPosition(worldPos);
    wireDrawStart = {
        group:    pinSphere.userData.componentGroup,
        pinIndex: pinSphere.userData.pinIndex,
        pinName:  pinSphere.userData.pinName,
        worldPos: worldPos.clone()
    };
    pinSphere.material.emissiveIntensity = 1.2;
    pinSphere.scale.setScalar(1.6);
    updateWireModeIndicator();
}

/** Cancel in-progress wire draw */
function cancelWireDraw() {
    if (wirePreviewMesh) {
        scene.remove(wirePreviewMesh);
        wirePreviewMesh.geometry?.dispose();
        wirePreviewMesh = null;
    }
    if (wireDrawStart) {
        wireDrawStart.group.traverse(c => {
            if (c.userData.isPinSphere && c.userData.pinIndex === wireDrawStart.pinIndex) {
                c.material.emissiveIntensity = 0.55;
                c.scale.setScalar(1.0);
            }
        });
        wireDrawStart = null;
    }
    updateWireModeIndicator();
}

/** Clear hovered pin highlight + tooltip */
function clearPinHighlight() {
    if (hoveredPinSphere) {
        const isStart = wireDrawStart &&
            hoveredPinSphere.userData.componentGroup === wireDrawStart.group &&
            hoveredPinSphere.userData.pinIndex === wireDrawStart.pinIndex;
        if (!isStart) {
            hoveredPinSphere.material.emissiveIntensity = 0.55;
            hoveredPinSphere.scale.setScalar(1.0);
        }
        hoveredPinSphere = null;
    }
    const tt = document.getElementById('pin-tooltip');
    if (tt) tt.style.display = 'none';
}

/** Smooth catmull arc path between two world-space points */
function generateWirePath(from, to) {
    const dist = from.distanceTo(to);
    const h    = Math.max(0.8, dist * 0.45);
    const midX = (from.x + to.x) / 2;
    const midZ = (from.z + to.z) / 2;
    return [
        from.clone(),
        new THREE.Vector3(from.x, from.y + h * 0.6, from.z),
        new THREE.Vector3(midX,   Math.max(from.y, to.y) + h, midZ),
        new THREE.Vector3(to.x,   to.y   + h * 0.6, to.z),
        to.clone()
    ];
}

/** Build a CatmullRom tube mesh */
function createWireTube(pathPoints, color, radius = 0.05, opacity = 1.0) {
    const curve = new THREE.CatmullRomCurve3(pathPoints);
    const geom  = new THREE.TubeGeometry(curve, 24, radius, 6, false);
    const mat   = new THREE.MeshStandardMaterial({
        color, roughness: 0.55, metalness: 0.0,
        transparent: opacity < 1, opacity
    });
    return new THREE.Mesh(geom, mat);
}

/** Update the live preview wire as mouse moves */
function updateWirePreview(e) {
    if (!wireDrawStart) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const ray  = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        -((e.clientY - rect.top)  / rect.height) * 2 + 1
    ), camera);
    const target = new THREE.Vector3();
    if (!ray.ray.intersectPlane(groundPlane, target)) return;

    if (wirePreviewMesh) {
        scene.remove(wirePreviewMesh);
        wirePreviewMesh.geometry?.dispose();
        wirePreviewMesh = null;
    }
    wirePreviewMesh = createWireTube(
        generateWirePath(wireDrawStart.worldPos, target),
        activeWireColor, 0.04, 0.55
    );
    wirePreviewMesh.userData.isWirePreview = true;
    scene.add(wirePreviewMesh);
}

/** Complete wire from wireDrawStart → toPinSphere */
function finishWireDraw(toPinSphere) {
    if (!wireDrawStart) return;
    const toGroup    = toPinSphere.userData.componentGroup;
    const toPinIndex = toPinSphere.userData.pinIndex;
    if (wireDrawStart.group === toGroup && wireDrawStart.pinIndex === toPinIndex) {
        cancelWireDraw(); return;
    }
    if (wirePreviewMesh) {
        scene.remove(wirePreviewMesh);
        wirePreviewMesh.geometry?.dispose();
        wirePreviewMesh = null;
    }
    const fromPos = new THREE.Vector3();
    const toPos   = new THREE.Vector3();
    const fromSph = wireDrawStart.group.getObjectByName(`pin_${wireDrawStart.pinIndex}`);
    const toSph   = toPinSphere;
    (fromSph ? fromSph : { getWorldPosition: v => v.copy(wireDrawStart.worldPos) })
        .getWorldPosition(fromPos);
    toSph.getWorldPosition(toPos);

    const mesh = createWireTube(generateWirePath(fromPos, toPos), activeWireColor);
    scene.add(mesh);
    placedWires.push({
        id:         `wire_${++wireIdCounter}`,
        fromCompId: wireDrawStart.group.userData.instanceId,
        fromPinIdx: wireDrawStart.pinIndex,
        toCompId:   toGroup.userData.instanceId,
        toPinIdx:   toPinIndex,
        color:      activeWireColor,
        mesh
    });
    // Reset visuals
    wireDrawStart.group.traverse(c => {
        if (c.userData.isPinSphere && c.userData.pinIndex === wireDrawStart.pinIndex) {
            c.material.emissiveIntensity = 0.55; c.scale.setScalar(1.0);
        }
    });
    toPinSphere.material.emissiveIntensity = 0.55;
    toPinSphere.scale.setScalar(1.0);
    wireDrawStart = null;
    updateWireModeIndicator();
    saveUndoSnapshot();
}

/** Rebuild all placed-wire meshes (called after a component is moved) */
function rebuildAllPlacedWires() {
    placedWires.forEach(wire => {
        if (wire.mesh) { scene.remove(wire.mesh); wire.mesh.geometry?.dispose(); }
        const fromG = placedComponents.find(g => g.userData.instanceId === wire.fromCompId);
        const toG   = placedComponents.find(g => g.userData.instanceId === wire.toCompId);
        if (!fromG || !toG) { wire.mesh = null; return; }
        const fS = fromG.getObjectByName(`pin_${wire.fromPinIdx}`);
        const tS = toG.getObjectByName(`pin_${wire.toPinIdx}`);
        if (!fS || !tS) { wire.mesh = null; return; }
        const fp = new THREE.Vector3(), tp = new THREE.Vector3();
        fS.getWorldPosition(fp); tS.getWorldPosition(tp);
        wire.mesh = createWireTube(generateWirePath(fp, tp), wire.color);
        scene.add(wire.mesh);
    });
}

/** Delete all wires connected to a component (call before removing group) */
function removeWiresForComponent(instanceId) {
    const toRemove = placedWires.filter(w =>
        w.fromCompId === instanceId || w.toCompId === instanceId
    );
    toRemove.forEach(wire => {
        if (wire.mesh) { scene.remove(wire.mesh); wire.mesh.geometry?.dispose(); }
        placedWires.splice(placedWires.indexOf(wire), 1);
    });
}

/** Delete ALL placed wires (for undo/redo restore) */
function clearAllPlacedWires() {
    placedWires.forEach(w => {
        if (w.mesh) { scene.remove(w.mesh); w.mesh.geometry?.dispose(); }
    });
    placedWires = [];
}
```

---

### Task 6: Modify `createComponent` to Attach Pin Spheres

**Files:**
- Modify: `index.html:3128–3132` (inside `createComponent`)

**Step 1: Change this block:**

```javascript
// BEFORE:
group.userData = { instanceId, type, variant: variant || null, isFreePlaced: true };
scene.add(group);
placedComponents.push(group);
saveUndoSnapshot();
return group;
```

```javascript
// AFTER:
group.userData = { instanceId, type, variant: variant || null, isFreePlaced: true };
scene.add(group);
attachPinSpheres(group);
if (isWireMode) group.traverse(c => { if (c.userData.isPinSphere) c.visible = true; });
placedComponents.push(group);
saveUndoSnapshot();
return group;
```

---

### Task 7: Modify `deleteComponentById` to Remove Connected Wires

**Files:**
- Modify: `index.html:3276–3285` (inside `deleteComponentById`)

**Step 1: Change:**

```javascript
// BEFORE:
function deleteComponentById(instanceId) {
    const g = placedComponents.find(g => g.userData.instanceId === instanceId);
    if (!g) return;
    saveUndoSnapshot();
    if (g === selectedComponent) selectedComponent = null;
    scene.remove(g);
    placedComponents.splice(placedComponents.indexOf(g), 1);
    refreshPlacedList();
    updateUndoRedoUI();
}
```

```javascript
// AFTER:
function deleteComponentById(instanceId) {
    const g = placedComponents.find(g => g.userData.instanceId === instanceId);
    if (!g) return;
    saveUndoSnapshot();
    if (g === selectedComponent) selectedComponent = null;
    removeWiresForComponent(instanceId);
    scene.remove(g);
    placedComponents.splice(placedComponents.indexOf(g), 1);
    refreshPlacedList();
    updateUndoRedoUI();
}
```

---

### Task 8: Modify `deleteSelectedComponent` to Remove Wires

**Files:**
- Modify: `index.html:3264–3273` (inside `deleteSelectedComponent`)

**Step 1: Add `removeWiresForComponent` call:**

```javascript
function deleteSelectedComponent() {
    if (!selectedComponent) return;
    saveUndoSnapshot();
    removeWiresForComponent(selectedComponent.userData.instanceId);  // ADD
    scene.remove(selectedComponent);
    placedComponents.splice(placedComponents.indexOf(selectedComponent), 1);
    selectedComponent = null;
    refreshPlacedList();
    updateUndoRedoUI();
}
```

---

### Task 9: Modify `onCanvasPointerDown` for Wire Mode

**Files:**
- Modify: `index.html` (~line 3167)

**Step 1: Replace `onCanvasPointerDown`:**

```javascript
function onCanvasPointerDown(e) {
    if (e.button !== 0) return;

    // ── Wire Mode ──
    if (isWireMode && isFreeBuildMode) {
        closeCtxMenu();
        const pinSphere = raycastPinSpheres(e);
        if (pinSphere) {
            e.stopPropagation();
            if (!wireDrawStart) {
                startWireDraw(pinSphere);
            } else {
                finishWireDraw(pinSphere);
                clearPinHighlight();
            }
        } else if (wireDrawStart) {
            cancelWireDraw();
        }
        return;
    }

    // ── Normal drag/select ──
    if (!isFreeBuildMode) return;
    closeCtxMenu();
    const hit = raycastPlacedComponents(e);
    if (!hit) return;
    e.stopPropagation();
    renderer.domElement.setPointerCapture(e.pointerId);
    dragComponent  = hit;
    dragHasMoved   = false;
    pointerDownPos = { x: e.clientX, y: e.clientY };
    controls.enabled = false;
}
```

---

### Task 10: Modify `onCanvasPointerMove` for Wire Mode

**Files:**
- Modify: `index.html` (~line 3182)

**Step 1: Insert wire mode handling at the very top of `onCanvasPointerMove`:**

```javascript
function onCanvasPointerMove(e) {
    // ── Wire Mode ──
    if (isWireMode && isFreeBuildMode) {
        if (wireDrawStart) updateWirePreview(e);
        const pinSphere = raycastPinSpheres(e);
        if (pinSphere !== hoveredPinSphere) {
            clearPinHighlight();
            if (pinSphere) {
                hoveredPinSphere = pinSphere;
                pinSphere.material.emissiveIntensity = 1.2;
                pinSphere.scale.setScalar(1.4);
                const tt = document.getElementById('pin-tooltip');
                if (tt) {
                    tt.textContent  = pinSphere.userData.pinName;
                    tt.style.display = 'block';
                    tt.style.left    = (e.clientX + 14) + 'px';
                    tt.style.top     = (e.clientY  -  6) + 'px';
                }
            }
        } else if (hoveredPinSphere) {
            const tt = document.getElementById('pin-tooltip');
            if (tt) { tt.style.left = (e.clientX + 14) + 'px'; tt.style.top = (e.clientY - 6) + 'px'; }
        }
        renderer.domElement.style.cursor = pinSphere ? 'crosshair' : (wireDrawStart ? 'crosshair' : 'default');
        return;
    }

    // ── Original drag / hover code ──
    if (dragComponent) {
        // ... (existing drag code unchanged) ...
    }
    if (!isFreeBuildMode) return;
    renderer.domElement.style.cursor = raycastPlacedComponents(e) ? 'grab' : '';
}
```

---

### Task 11: Modify `onCanvasPointerUp` to Rebuild Wires After Move

**Files:**
- Modify: `index.html` (~line 3207 inside `onCanvasPointerUp`)

**Step 1: After the `saveUndoSnapshot()` call that follows a move (in the `dragHasMoved` branch), add:**

```javascript
if (dragHasMoved) {
    const s = snapToGrid(dragComponent.position.x, dragComponent.position.z);
    dragComponent.position.x = s.x;
    dragComponent.position.z = s.z;
    rebuildAllPlacedWires();   // ← ADD THIS
    saveUndoSnapshot();
    refreshPlacedList();
}
```

---

### Task 12: Modify `enterFreeBuildMode` & `enterPresetMode`

**Files:**
- Modify: `index.html` (~line 3347 and ~line 3361)

**Step 1: `enterFreeBuildMode` — show pins if wire mode active:**

```javascript
function enterFreeBuildMode() {
    isFreeBuildMode = true;
    Object.values(customMeshes).forEach(m => { if (m) m.visible = false; });
    activeWireMeshes.forEach(w => { w.visible = false; });
    placedComponents.forEach(g => { g.visible = true; });
    if (isWireMode) setPinSpheresVisible(true);   // ← ADD
    if (isSimulating) toggleSimulation();
    hideFreeBuildControlWrappers();
    document.getElementById("interactive-hardware-control")?.classList.add('hidden');
    glideCamera({ x: 0, y: 15, z: 8 }, { x: 0, y: 0, z: 0 });
    if (undoStack.length === 0) saveUndoSnapshot();
}
```

**Step 2: `enterPresetMode` — exit wire mode cleanly:**

```javascript
function enterPresetMode() {
    isFreeBuildMode = false;
    if (isWireMode) {
        isWireMode = false;
        document.getElementById('wire-tool-btn')?.classList.remove('active');
        cancelWireDraw();
        clearPinHighlight();
        document.getElementById('wire-mode-indicator')?.classList.remove('visible');
        controls.enabled = true;
    }
    setPinSpheresVisible(false);                   // ← ADD
    placedComponents.forEach(g => { g.visible = false; });
    deselectComponent();
    hideFreeBuildControlWrappers();
    if (!isSimulating) buildInteractiveControls();
    updateComponentVisibilities();
}
```

---

### Task 13: Keyboard Shortcut — W key for Wire Mode, Escape to cancel

**Files:**
- Modify: `index.html` (~line 1200–1230 in the `keydown` listener)

**Step 1: Add inside the existing keydown handler (after the Escape block):**

```javascript
if ((e.key === 'w' || e.key === 'W') && !isEditing && isFreeBuildMode) {
    e.preventDefault();
    toggleWireMode();
}
if (e.key === 'Escape' && isWireMode) {
    if (wireDrawStart) cancelWireDraw();
    else toggleWireMode();
}
```

---

### Task 14: AI Free-Build Circuit Generator

**Files:**
- Modify: `index.html` — add after `generateAICircuit` function (~line 1706)

**Step 1: Add `generateAIFreeBuildCircuit` and `applyAIFreeBuildCircuit` functions:**

```javascript
// ========================================================
// AI FREE-BUILD CIRCUIT GENERATOR
// ========================================================
async function generateAIFreeBuildCircuit(promptText) {
    showToast("AI is building your circuit...", true);

    const componentCatalog = Object.entries(COMPONENT_PINS).map(([type, pins]) => ({
        type, pins: pins.map(p => p.name)
    }));

    const systemPrompt = `You are an expert electronics engineer. Design a complete working circuit.

Available components with their exact pin names:
${JSON.stringify(componentCatalog, null, 2)}

Return ONLY valid JSON:
{
  "description": "one-line circuit description",
  "components": [
    { "type": "arduino", "variant": null, "x": -2.5, "z": 0 },
    { "type": "led",     "variant": "red","x":  2.0, "z": 0 }
  ],
  "connections": [
    { "fromComponent": 0, "fromPin": "D13", "toComponent": 1, "toPin": "anode(+)", "color": "#ef4444" }
  ],
  "code": "// Arduino C++ sketch",
  "explanation": "How this circuit works"
}

Layout rules:
- Arduino always at x:-2.5, z:0
- Space components ≥2 units apart (x or z)
- Use EXACT pin names from the catalog above
- Connect GND→GND pins, 5V→VCC pins
- Current-limiting resistors for LEDs (in series, use resistor type)
- Max 8 components for clarity`;

    try {
        if (!apiKey) throw new Error("no key");
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Build: "${promptText}"` }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: 'application/json' }
            })
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const result = JSON.parse(data.candidates[0].content.parts[0].text);
        await applyAIFreeBuildCircuit(result);
        showToast(`✨ ${result.description || 'AI circuit built!'}`, false);
    } catch(err) {
        console.error('AI free-build error:', err);
        showToast("AI circuit build failed — check API key or try again", false);
    }
}

async function applyAIFreeBuildCircuit(data) {
    // Wipe existing free-placed circuit
    clearAllPlacedWires();
    [...placedComponents].forEach(g => {
        scene.remove(g);
        g.traverse(c => { if (c.isMesh) { c.geometry?.dispose(); c.material?.dispose(); } });
    });
    placedComponents = [];
    componentCounters = {};

    // Place components
    const groups = (data.components || []).map(comp =>
        createComponent(comp.type, comp.variant || null, comp.x ?? 0, comp.z ?? 0)
    );

    // Yield to let Three.js update world matrices
    await new Promise(r => requestAnimationFrame(r));
    renderer.render(scene, camera);

    // Wire connections
    (data.connections || []).forEach(conn => {
        const fromG = groups[conn.fromComponent];
        const toG   = groups[conn.toComponent];
        if (!fromG || !toG) return;
        const fromDefs = getComponentPinDefs(fromG);
        const toDefs   = getComponentPinDefs(toG);
        const fIdx = fromDefs.findIndex(p => p.name === conn.fromPin);
        const tIdx = toDefs.findIndex(p => p.name === conn.toPin);
        if (fIdx === -1 || tIdx === -1) {
            console.warn(`Unknown pin: "${conn.fromPin}" or "${conn.toPin}"`);
            return;
        }
        const fS = fromG.getObjectByName(`pin_${fIdx}`);
        const tS = toG.getObjectByName(`pin_${tIdx}`);
        if (!fS || !tS) return;
        const fp = new THREE.Vector3(), tp = new THREE.Vector3();
        fS.getWorldPosition(fp); tS.getWorldPosition(tp);
        const mesh = createWireTube(generateWirePath(fp, tp), conn.color || '#ef4444');
        scene.add(mesh);
        placedWires.push({
            id: `wire_${++wireIdCounter}`,
            fromCompId: fromG.userData.instanceId, fromPinIdx: fIdx,
            toCompId:   toG.userData.instanceId,   toPinIdx:   tIdx,
            color: conn.color || '#ef4444', mesh
        });
    });

    // Set code
    if (data.code) {
        const ce = document.getElementById('code-content');
        if (ce) ce.value = data.code;
    }
    // Set explanation
    if (data.explanation) {
        const d = document.getElementById('step-desc');
        if (d) d.textContent = data.explanation;
        const t = document.getElementById('step-title');
        if (t) t.textContent = '🤖 AI-Generated Circuit';
    }

    refreshPlacedList();
    saveUndoSnapshot();
    glideCamera({ x: 0, y: 15, z: 8 }, { x: 0, y: 0, z: 0 });
}
```

**Step 2: Modify `generateAICircuit` to route to free-build when in Parts tab:**

At the top of `generateAICircuit`, after the promptText check, add:

```javascript
// Route to free-build generator when in Parts Library (free-build) mode
if (isFreeBuildMode) {
    await generateAIFreeBuildCircuit(promptText);
    return;
}
```

---

### Task 15: Commit

```bash
cd /Users/elnurmavlonov/Developer/Pilot
git add index.html docs/
git commit -m "✨ feat: add TinkerCAD-style wire tool and AI free-build circuit generator

- COMPONENT_PINS registry for 20+ component types with named pins
- Pin sphere indicators shown in wire mode (W key to toggle)
- Click-to-start / click-to-finish wire drawing with arc preview
- Wire color picker in toolbar
- Wires rebuild when components are moved
- AI free-build: Gemini places components + wires from natural language
- Keyboard: W toggles wire mode, Esc cancels mid-draw

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
