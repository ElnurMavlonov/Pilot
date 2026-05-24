// ─────────────────────────────────────────────────────────────────
// IoTify AI — Core application logic (extracted from legacy index.html)
// Imperative module. Exposes `initIotifyApp()` for React to call once
// the DOM is mounted, plus individual handlers used by React onClick.
//
// All DOM access happens via document.getElementById against IDs that
// the React component tree renders. THREE / THREE.OrbitControls are
// expected on window (loaded via CDN in index.html).
// ─────────────────────────────────────────────────────────────────

/* eslint-disable */
/* global THREE */


        // ─────────────────────────────────────────────────────────
        // PANEL SYSTEM — VS Code-style closable & resizable panels
        // ─────────────────────────────────────────────────────────

        const DEFAULT_LEFT_WIDTH  = 200;
        const DEFAULT_RIGHT_WIDTH = 320;
        const LEFT_MIN  = 160;
        const LEFT_MAX  = 320;
        const RIGHT_MIN = 240;
        const RIGHT_MAX = 520;

        let leftPanelOpen  = true;
        let rightPanelOpen = true;
        let leftPanelWidth  = DEFAULT_LEFT_WIDTH;
        let rightPanelWidth = DEFAULT_RIGHT_WIDTH;

        // Resize drag state
        let activeResize    = null;   // 'left' | 'right' | null
        let resizeStartX    = 0;
        let resizeStartWidth = 0;

        /** Initialize panel widths on desktop via inline styles */
        function initPanels() {
            if (window.innerWidth >= 768) {
                document.getElementById('left-panel').style.width  = leftPanelWidth  + 'px';
                document.getElementById('right-panel').style.width = rightPanelWidth + 'px';
            }
        }

        /** Toggle Left Panel open / closed */
        function toggleLeftPanel() {
            if (window.innerWidth < 768) return; // mobile: skip
            leftPanelOpen = !leftPanelOpen;

            const panel  = document.getElementById('left-panel');
            const tab    = document.getElementById('left-edge-tab');
            const handle = document.getElementById('left-resize-handle');

            if (leftPanelOpen) {
                panel.style.width = leftPanelWidth + 'px';
                tab.classList.add('hidden');
                handle.style.display = '';
            } else {
                panel.style.width = '0px';
                tab.classList.remove('hidden');
                handle.style.display = 'none';
            }
            setTimeout(triggerCanvasResize, 260);
        }

        /** Toggle Right Panel open / closed */
        function toggleRightPanel() {
            if (window.innerWidth < 768) return;
            rightPanelOpen = !rightPanelOpen;

            const panel  = document.getElementById('right-panel');
            const tab    = document.getElementById('right-edge-tab');
            const handle = document.getElementById('right-resize-handle');

            if (rightPanelOpen) {
                panel.style.width = rightPanelWidth + 'px';
                tab.classList.add('hidden');
                handle.style.display = '';
            } else {
                panel.style.width = '0px';
                tab.classList.remove('hidden');
                handle.style.display = 'none';
            }
            setTimeout(triggerCanvasResize, 260);
        }

        /** Begin panel resize drag */
        function startResize(side, e) {
            if (window.innerWidth < 768) return;
            e.preventDefault();
            activeResize    = side;
            resizeStartX    = e.clientX;
            resizeStartWidth = side === 'left' ? leftPanelWidth : rightPanelWidth;
            document.body.classList.add('is-dragging');
        }

        /** Track drag movement */
        document.addEventListener('mousemove', (e) => {
            if (!activeResize) return;
            const delta = e.clientX - resizeStartX;

            if (activeResize === 'left') {
                const w = Math.min(LEFT_MAX, Math.max(LEFT_MIN, resizeStartWidth + delta));
                leftPanelWidth = w;
                document.getElementById('left-panel').style.width = w + 'px';
            } else {
                const w = Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, resizeStartWidth - delta));
                rightPanelWidth = w;
                document.getElementById('right-panel').style.width = w + 'px';
            }
            triggerCanvasResize();
        });

        /** End drag */
        document.addEventListener('mouseup', () => {
            if (!activeResize) return;
            document.body.classList.remove('is-dragging');
            activeResize = null;
            triggerCanvasResize();
        });

        /** Double-click handle → reset to default width */
        function resetPanelWidth(side) {
            if (side === 'left') {
                leftPanelWidth = DEFAULT_LEFT_WIDTH;
                document.getElementById('left-panel').style.width = leftPanelWidth + 'px';
            } else {
                rightPanelWidth = DEFAULT_RIGHT_WIDTH;
                document.getElementById('right-panel').style.width = rightPanelWidth + 'px';
            }
            setTimeout(triggerCanvasResize, 260);
        }

        /** Notify Three.js that canvas size changed */
        function triggerCanvasResize() {
            const container = document.getElementById('canvas-view');
            if (camera && renderer && container && container.clientWidth > 0) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        }

        /** Keyboard shortcuts — ⌘B toggles left, ⌘J toggles right, ? for overlay */
        document.addEventListener('keydown', (e) => {
            const tag = document.activeElement.tagName;
            const isEditing = tag === 'INPUT' || tag === 'TEXTAREA';
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                toggleLeftPanel();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
                e.preventDefault();
                toggleRightPanel();
            }
            if (e.key === '?' && !isEditing) {
                toggleShortcutsOverlay();
            }
            if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey && !isEditing) shareCircuitLink();
            if ((e.key === 't' || e.key === 'T') && !e.metaKey && !e.ctrlKey && !isEditing) resetTour();
            if ((e.key === 'w' || e.key === 'W') && !e.metaKey && !e.ctrlKey && !isEditing) toggleWireMode();
            if (e.key === 'Escape') {
                const overlay = document.getElementById('shortcuts-overlay');
                if (overlay && overlay.classList.contains('open')) overlay.classList.remove('open');
                // Also close tour if active
                const tourOverlay = document.getElementById('tour-overlay');
                if (tourOverlay && tourOverlay.classList.contains('active')) tourSkip();
                // Cancel wire draw or exit wire mode
                if (isWireMode) {
                    if (wireDrawStart) cancelWireDraw();
                    else toggleWireMode();
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isEditing) {
                e.preventDefault(); undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && !isEditing) {
                e.preventDefault(); redo();
            }
        });

        // ─────────────────────────────────────────────────────────
        // APPLICATION CORE
        // ─────────────────────────────────────────────────────────

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

        // Procedural Circuit Presets
        const PRESETS = {
            blink: {
                title: "Classic LED Blink",
                topic: "General Education",
                steps: [
                    {
                        title: "1. Exploring the Workspace",
                        desc: "Welcome to your virtual lab! Let's build a classic blinking circuit. Locate the digital Header Pin 13 on the blue Arduino board and Row 10 on the breadboard.",
                        tip: "Hold left-click and drag the workspace to rotate. Scroll to zoom inside the setup.",
                        camera: { x: 0, y: 12, z: 12 },
                        lookAt: { x: 0, y: 0, z: 0 },
                        visible: ["board", "breadboard"]
                    },
                    {
                        title: "2. Setting up the LED",
                        desc: "Place the Red Light Emitting Diode (LED) on the breadboard. The bent longer pin is the Anode (+) and must go to row 10. The shorter straight pin is the Cathode (-) and goes to row 11.",
                        tip: "LEDs are polarized components—connecting them backward stops current flow.",
                        camera: { x: 2.2, y: 4, z: 3 },
                        lookAt: { x: 2.5, y: 0.2, z: -0.5 },
                        visible: ["board", "breadboard", "led"]
                    },
                    {
                        title: "3. Protecting with a Resistor",
                        desc: "Add a 220-Ohm Resistor (Red-Red-Brown stripes) spanning from row 11 (Cathode) over to the Blue Ground (-) power bus on the far right.",
                        tip: "Without a resistor, 5 Volts of energy will burn out your LED instantly.",
                        camera: { x: 2.6, y: 3.5, z: 2 },
                        lookAt: { x: 2.5, y: 0.2, z: -0.8 },
                        visible: ["board", "breadboard", "led", "resistor"]
                    },
                    {
                        title: "4. Closing the Circuit Paths",
                        desc: "Hook up the Black Ground wire from Arduino's GND socket to the Blue Ground bus. Hook up the Red jumper wire from Digital Pin 13 to row 10 (LED Anode).",
                        tip: "Our physical build is finished! Click 'Run Sandbox' to execute the code and see it blink.",
                        camera: { x: 1, y: 8, z: 8 },
                        lookAt: { x: 0.5, y: 0, z: 0 },
                        visible: ["board", "breadboard", "led", "resistor", "wire_gnd", "wire_sig"]
                    }
                ],
                wires: [
                    { type: "wire_gnd", color: "#020617", path: [[-0.7, 0.3, -0.8], [-1, 1.8, -0.2], [1.2, 1.2, -1.2], [4.0, 0.25, -2.5]] },
                    { type: "wire_sig", color: "#ef4444", path: [[-0.7, 0.3, 1.2], [-0.8, 2.2, 1.5], [2.5, 1.5, -0.3], [3.2, 0.25, -0.75]] }
                ],
                activeComponent: "led",
                interactiveType: "none",
                schematic: `
                    <rect x="30" y="50" width="100" height="200" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
                    <text x="80" y="42" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="middle">Arduino Uno</text>
                    <text x="80" y="75" fill="#e2e8f0" font-size="11" font-weight="bold" text-anchor="middle">Pins</text>
                    <text x="110" y="110" fill="#f8fafc" font-size="11" text-anchor="end">D13</text>
                    <circle cx="120" cy="106" r="4" fill="#ef4444"/>
                    <text x="110" y="190" fill="#f8fafc" font-size="11" text-anchor="end">GND</text>
                    <circle cx="120" cy="186" r="4" fill="#000000"/>
                    <path d="M 120 106 L 240 106" fill="none" stroke="#ef4444" stroke-width="2.5"/>
                    <g transform="translate(240, 106)">
                        <polygon points="0,-10 0,10 18,0" fill="none" stroke="#f43f5e" stroke-width="2"/>
                        <line x1="18" y1="-10" x2="18" y2="10" stroke="#f43f5e" stroke-width="2"/>
                        <text x="9" y="24" fill="#f43f5e" font-size="9" text-anchor="middle" font-weight="bold">LED</text>
                    </g>
                    <g transform="translate(258, 106)">
                        <path d="M 0 0 L 20 0 L 24 -6 L 32 6 L 40 -6 L 48 6 L 56 -6 L 64 6 L 68 0 L 88 0" fill="none" stroke="#fbbf24" stroke-width="2"/>
                        <text x="44" y="24" fill="#fbbf24" font-size="9" text-anchor="middle" font-weight="bold">220Ω</text>
                    </g>
                    <path d="M 346 106 L 360 106 L 360 186 L 120 186" fill="none" stroke="#000000" stroke-width="2.5"/>
                `,
                code: `// Dynamic Arduino LED Blink Sketch
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH); // Turn the LED on
  delay(1000);                 // Wait 1 second
  digitalWrite(LED_PIN, LOW);  // Turn the LED off
  delay(1000);                 // Wait 1 second
}`
            },
            night: {
                title: "Generative Night Light",
                topic: "General Education",
                steps: [
                    {
                        title: "1. The Photoresistor (LDR)",
                        desc: "Insert the LDR (Light Dependent Resistor) into the breadboard columns. An LDR changes its resistance dynamically based on ambient lighting.",
                        tip: "As darkness falls, resistance increases, letting us detect environmental light shifts.",
                        camera: { x: 3, y: 4, z: 3.5 },
                        lookAt: { x: 2.5, y: 0.2, z: 0 },
                        visible: ["board", "breadboard", "ldr"]
                    },
                    {
                        title: "2. The Output indicator",
                        desc: "Add our glowing Red LED back on the breadboard, linked through a safety 220-Ohm limiting resistor.",
                        tip: "We will program the Arduino to activate this LED when light drops below a threshold.",
                        camera: { x: 2.6, y: 3.5, z: 2.2 },
                        lookAt: { x: 2.5, y: 0.2, z: -0.8 },
                        visible: ["board", "breadboard", "ldr", "led", "resistor"]
                    },
                    {
                        title: "3. Setting up Analog Voltage Divider",
                        desc: "Connect a jumper wire from Arduino's Analog Pin A0 to the LDR. Then connect ground using the black jumper wires.",
                        tip: "This creates a voltage divider allowing the microcontroller's ADC pin to read actual values.",
                        camera: { x: 1, y: 8, z: 8 },
                        lookAt: { x: 0.5, y: 0, z: 0 },
                        visible: ["board", "breadboard", "ldr", "led", "resistor", "wire_gnd", "wire_sig"]
                    }
                ],
                wires: [
                    { type: "wire_gnd", color: "#020617", path: [[-0.7, 0.3, -0.8], [-1, 1.8, -0.2], [1.2, 1.2, -1.2], [4.0, 0.25, -2.5]] },
                    { type: "wire_sig", color: "#fbbf24", path: [[-0.7, 0.3, -1.4], [0, 2, -1.5], [2.2, 1, 0.5], [3.2, 0.25, 0.2]] }
                ],
                activeComponent: "ldr",
                interactiveType: "slider",
                schematic: `
                    <rect x="30" y="50" width="100" height="200" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
                    <text x="80" y="42" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="middle">Arduino Uno</text>
                    <text x="110" y="110" fill="#f8fafc" font-size="11" text-anchor="end">A0</text>
                    <circle cx="120" cy="106" r="4" fill="#fbbf24"/>
                    <text x="110" y="190" fill="#f8fafc" font-size="11" text-anchor="end">GND</text>
                    <circle cx="120" cy="186" r="4" fill="#000000"/>
                    <path d="M 120 106 L 240 106" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
                    <g transform="translate(240, 106)">
                        <circle cx="15" cy="0" r="15" fill="none" stroke="#6366f1" stroke-width="2"/>
                        <path d="M 0 0 L 10 -5 L 20 5 L 30 0" fill="none" stroke="#6366f1" stroke-width="2"/>
                        <text x="15" y="25" fill="#6366f1" font-size="9" text-anchor="middle" font-weight="bold">LDR</text>
                    </g>
                    <path d="M 270 106 L 360 106 L 360 186 L 120 186" fill="none" stroke="#000000" stroke-width="2.5"/>
                `,
                code: `// Intelligent LDR Night Light System
const int LDR_PIN = A0;
const int LED_PIN = 13;
const int THRESHOLD = 400; // Activation value

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9000);
}

void loop() {
  int lightLevel = analogRead(LDR_PIN);
  if(lightLevel < THRESHOLD) {
    digitalWrite(LED_PIN, HIGH); // Turn LED on in the dark
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(100);
}`
            },
            alarm: {
                title: "Piezo Acoustic Alarm",
                topic: "Public and Higher Education",
                steps: [
                    {
                        title: "1. The Piezo Element",
                        desc: "Insert the electronic Piezo Buzzer onto the prototyping zone. Inside is a crystal disc that vibrates and produces physical pressure sound waves when energized.",
                        tip: "Buzzers are polarized; they require designated signal triggers on the positive pin.",
                        camera: { x: 3, y: 5, z: 3.5 },
                        lookAt: { x: 2.5, y: 0.2, z: 0 },
                        visible: ["board", "breadboard", "buzzer"]
                    },
                    {
                        title: "2. Setting up Signals",
                        desc: "Run a dedicated jumper line from Arduino's Digital Pin 9 (PWM) directly to the positive buzzer pin.",
                        tip: "Pulse Width Modulation (PWM) allows the Arduino to change output signal frequency to produce unique musical pitches.",
                        camera: { x: 1.5, y: 7, z: 7 },
                        lookAt: { x: 1, y: 0, z: 0 },
                        visible: ["board", "breadboard", "buzzer", "wire_gnd", "wire_sig"]
                    }
                ],
                wires: [
                    { type: "wire_gnd", color: "#020617", path: [[-0.7, 0.3, -0.8], [-1, 1.8, -0.2], [1.2, 1.2, -1.2], [4.0, 0.25, -2.5]] },
                    { type: "wire_sig", color: "#6366f1", path: [[-0.7, 0.3, 0.6], [0, 2.3, 1.0], [2.1, 1.2, -0.2], [3.2, 0.25, -0.5]] }
                ],
                activeComponent: "buzzer",
                interactiveType: "none",
                schematic: `
                    <rect x="30" y="50" width="100" height="200" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
                    <text x="80" y="42" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="middle">Arduino Uno</text>
                    <text x="110" y="110" fill="#f8fafc" font-size="11" text-anchor="end">D9</text>
                    <circle cx="120" cy="106" r="4" fill="#6366f1"/>
                    <text x="110" y="190" fill="#f8fafc" font-size="11" text-anchor="end">GND</text>
                    <circle cx="120" cy="186" r="4" fill="#000000"/>
                    <path d="M 120 106 L 240 106" fill="none" stroke="#6366f1" stroke-width="2.5"/>
                    <g transform="translate(240, 106)">
                        <rect x="0" y="-15" width="25" height="30" fill="none" stroke="#a855f7" stroke-width="2"/>
                        <line x1="25" y1="-15" x2="35" y2="-25" stroke="#a855f7" stroke-width="2"/>
                        <line x1="25" y1="15" x2="35" y2="25" stroke="#a855f7" stroke-width="2"/>
                        <text x="12" y="4" fill="#a855f7" font-size="8" text-anchor="middle" font-weight="bold">BUZZER</text>
                    </g>
                    <path d="M 275 106 L 360 106 L 360 186 L 120 186" fill="none" stroke="#000000" stroke-width="2.5"/>
                `,
                code: `// Piezo PWM Sound Wave Alarm
const int BUZZER_PIN = 9;

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  // Play alert pitch frequency
  tone(BUZZER_PIN, 880); // 880 Hz
  delay(250);
  tone(BUZZER_PIN, 440); // 440 Hz
  delay(250);
}`
            },
            button: {
                title: "Manual Push Switch",
                topic: "Corporate Education",
                steps: [
                    {
                        title: "1. The Tactile Pushbutton",
                        desc: "Secure the momentary push button switch over the center divide of the breadboard. Clicking this establishes a solid path for electrons.",
                        tip: "Buttons are mechanical switches containing interior metal spring structures.",
                        camera: { x: 3, y: 4, z: 3.5 },
                        lookAt: { x: 2.5, y: 0.2, z: 0 },
                        visible: ["board", "breadboard", "button"]
                    },
                    {
                        title: "2. Led Feedback Assembly",
                        desc: "Insert the active system Led into row 10 to give visible indications when the user interacts.",
                        tip: "Our goal is simple: physical button holds will illuminate our status indicator.",
                        camera: { x: 2.4, y: 3.5, z: 2.5 },
                        lookAt: { x: 2.5, y: 0.2, z: -0.8 },
                        visible: ["board", "breadboard", "button", "led", "resistor"]
                    },
                    {
                        title: "3. Ground & Digital Pin Wiring",
                        desc: "Place signal cables between the button and Digital Pin 2. Run ground wires back to the main processor board.",
                        tip: "The internal pullup resistor in our code prevents signal errors when the switch sits open.",
                        camera: { x: 1.2, y: 7.5, z: 7.5 },
                        lookAt: { x: 0.5, y: 0, z: 0 },
                        visible: ["board", "breadboard", "button", "led", "resistor", "wire_gnd", "wire_sig"]
                    }
                ],
                wires: [
                    { type: "wire_gnd", color: "#020617", path: [[-0.7, 0.3, -0.8], [-1, 1.8, -0.2], [1.2, 1.2, -1.2], [4.0, 0.25, -2.5]] },
                    { type: "wire_sig", color: "#ec4899", path: [[-0.7, 0.3, 0.9], [0, 2.1, 1.2], [2.2, 1.1, -0.2], [3.2, 0.25, -0.2]] }
                ],
                activeComponent: "button",
                interactiveType: "button",
                schematic: `
                    <rect x="30" y="50" width="100" height="200" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
                    <text x="80" y="42" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="middle">Arduino Uno</text>
                    <text x="110" y="110" fill="#f8fafc" font-size="11" text-anchor="end">D2</text>
                    <circle cx="120" cy="106" r="4" fill="#ec4899"/>
                    <text x="110" y="190" fill="#f8fafc" font-size="11" text-anchor="end">GND</text>
                    <circle cx="120" cy="186" r="4" fill="#000000"/>
                    <path d="M 120 106 L 240 106" fill="none" stroke="#ec4899" stroke-width="2.5"/>
                    <g transform="translate(240, 106)">
                        <circle cx="0" cy="0" r="3" fill="#ec4899"/>
                        <circle cx="20" cy="0" r="3" fill="#ec4899"/>
                        <line x1="0" y1="-5" x2="15" y2="-12" stroke="#ec4899" stroke-width="2"/>
                        <text x="10" y="15" fill="#ec4899" font-size="9" text-anchor="middle" font-weight="bold">SWITCH</text>
                    </g>
                    <path d="M 260 106 L 360 106 L 360 186 L 120 186" fill="none" stroke="#000000" stroke-width="2.5"/>
                `,
                code: `// Manual Momentary Button Intercept
const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  // Turn on internal pullup resistor
  pinMode(BUTTON_PIN, INPUT_PULLUP);
}

void loop() {
  int val = digitalRead(BUTTON_PIN);
  if (val == LOW) { // Button Pressed
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}`
            }
        };

        // ─── Parts Library Registry ────────────────────────────────
        const PARTS_REGISTRY = [
            { id:'arduino_uno', label:'Arduino Uno',   icon:'fa-microchip',     color:'text-indigo-600', bg:'bg-indigo-50',   category:'microcontrollers', type:'arduino' },
            { id:'esp32',       label:'ESP32',         icon:'fa-wifi',          color:'text-blue-600',   bg:'bg-blue-50',     category:'microcontrollers', type:'esp32' },
            { id:'breadboard',  label:'Breadboard',    icon:'fa-table-cells',   color:'text-slate-600',  bg:'bg-slate-100',   category:'prototyping',      type:'breadboard' },
            { id:'led_red',     label:'LED (Red)',     icon:'fa-circle',        color:'text-red-500',    bg:'bg-red-50',      category:'actuators',        type:'led',      variant:'red' },
            { id:'led_green',   label:'LED (Green)',   icon:'fa-circle',        color:'text-green-500',  bg:'bg-green-50',    category:'actuators',        type:'led',      variant:'green' },
            { id:'led_blue',    label:'LED (Blue)',    icon:'fa-circle',        color:'text-blue-500',   bg:'bg-blue-50',     category:'actuators',        type:'led',      variant:'blue' },
            { id:'buzzer',      label:'Piezo Buzzer',  icon:'fa-volume-high',   color:'text-amber-600',  bg:'bg-amber-50',    category:'actuators',        type:'buzzer' },
            { id:'servo',       label:'Servo Motor (SG90)', icon:'fa-gear',     color:'text-orange-600', bg:'bg-orange-50',   category:'actuators',        type:'servo' },
            { id:'l298n',       label:'L298N Driver',  icon:'fa-microchip',     color:'text-red-700',    bg:'bg-red-50',      category:'actuators',        type:'l298n' },
            { id:'dc_motor',    label:'DC Motor',      icon:'fa-fan',           color:'text-slate-600',  bg:'bg-slate-100',   category:'actuators',        type:'dc_motor' },
            { id:'relay',       label:'Relay Module',  icon:'fa-toggle-on',     color:'text-violet-600', bg:'bg-violet-50',   category:'actuators',        type:'relay' },
            { id:'button',      label:'Push Button',   icon:'fa-hand-pointer',  color:'text-pink-600',   bg:'bg-pink-50',     category:'sensors',          type:'button' },
            { id:'ldr',         label:'LDR Sensor',    icon:'fa-sun',           color:'text-yellow-600', bg:'bg-yellow-50',   category:'sensors',          type:'ldr' },
            { id:'dht11',       label:'DHT11 Temp & Humidity', icon:'fa-temperature-half', color:'text-cyan-600', bg:'bg-cyan-50', category:'sensors', type:'dht11' },
            { id:'hcsr04',      label:'HC-SR04 Ultrasonic', icon:'fa-ruler-horizontal', color:'text-teal-600', bg:'bg-teal-50', category:'sensors', type:'hcsr04' },
            { id:'pir',         label:'PIR Motion Detector', icon:'fa-person-walking', color:'text-emerald-600', bg:'bg-emerald-50', category:'sensors', type:'pir' },
            { id:'res_220',     label:'Resistor 220Ω',       icon:'fa-wave-square',   color:'text-purple-600',  bg:'bg-purple-50',   category:'passive',  type:'resistor',    variant:'220' },
            { id:'res_1k',      label:'Resistor 1kΩ',        icon:'fa-wave-square',   color:'text-violet-600',  bg:'bg-violet-50',   category:'passive',  type:'resistor',    variant:'1k' },
            { id:'res_10k',     label:'Resistor 10kΩ',       icon:'fa-wave-square',   color:'text-fuchsia-600', bg:'bg-fuchsia-50',  category:'passive',  type:'resistor',    variant:'10k' },
            { id:'cap_elec',    label:'Capacitor (Elec)',     icon:'fa-battery-half',  color:'text-slate-600',   bg:'bg-slate-100',   category:'passive',  type:'capacitor',   variant:'electrolytic' },
            { id:'cap_cer',     label:'Capacitor (Ceramic)',  icon:'fa-circle-half-stroke', color:'text-yellow-700', bg:'bg-yellow-50', category:'passive', type:'capacitor',   variant:'ceramic' },
            { id:'pot',         label:'Potentiometer',        icon:'fa-sliders',       color:'text-sky-600',     bg:'bg-sky-50',      category:'passive',  type:'potentiometer' },
            { id:'thermistor',  label:'Thermistor (NTC)',     icon:'fa-temperature-half', color:'text-orange-600', bg:'bg-orange-50', category:'passive',  type:'thermistor' },
            { id:'transistor_npn', label:'Transistor (NPN)', icon:'fa-arrow-right-to-bracket', color:'text-emerald-700', bg:'bg-emerald-50', category:'passive', type:'transistor', variant:'NPN' },
            { id:'transistor_pnp', label:'Transistor (PNP)', icon:'fa-arrow-right-from-bracket', color:'text-teal-700', bg:'bg-teal-50', category:'passive', type:'transistor', variant:'PNP' },
        ];

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
          led:          [{ name:'anode(+)',    pos:[-0.1,0.12,0],   color:'#ef4444' },
                         { name:'cathode(-)',  pos:[ 0.1,0.12,0],   color:'#94a3b8' }],
          resistor:     [{ name:'pin1',        pos:[-0.38,0.12,0],  color:'#94a3b8' },
                         { name:'pin2',        pos:[ 0.38,0.12,0],  color:'#94a3b8' }],
          capacitor:    [{ name:'positive(+)', pos:[-0.05,0.12,0],  color:'#ef4444' },
                         { name:'negative(-)', pos:[ 0.05,0.12,0],  color:'#94a3b8' }],
          potentiometer:[{ name:'pinA',        pos:[-0.17,0.12,0],  color:'#94a3b8' },
                         { name:'wiper',       pos:[ 0,  0.12,0],  color:'#6366f1' },
                         { name:'pinB',        pos:[ 0.17,0.12,0],  color:'#94a3b8' }],
          thermistor:   [{ name:'pin1',        pos:[-0.06,0.12,0],  color:'#94a3b8' },
                         { name:'pin2',        pos:[ 0.06,0.12,0],  color:'#94a3b8' }],
          transistor:   [{ name:'base(B)',     pos:[-0.17,0.12,0],  color:'#fbbf24' },
                         { name:'collector(C)',pos:[ 0,  0.12,0],  color:'#6366f1' },
                         { name:'emitter(E)',  pos:[ 0.17,0.12,0],  color:'#ef4444' }],
          buzzer:       [{ name:'positive(+)', pos:[-0.29,0.12,0],  color:'#ef4444' },
                         { name:'negative(-)', pos:[ 0.29,0.12,0],  color:'#94a3b8' }],
          button:       [{ name:'pin1',        pos:[-0.59,0,-0.41],color:'#94a3b8' },
                         { name:'pin2',        pos:[ 0.59,0,-0.41],color:'#94a3b8' },
                         { name:'pin3',        pos:[-0.59,0, 0.41],color:'#94a3b8' },
                         { name:'pin4',        pos:[ 0.59,0, 0.41],color:'#94a3b8' }],
          ldr:          [{ name:'pin1',        pos:[-0.08,0.1,0],   color:'#94a3b8' },
                         { name:'pin2',        pos:[ 0.08,0.1,0],   color:'#94a3b8' }],
          dht11:        [{ name:'VCC',         pos:[-0.42,0.1,0],   color:'#ef4444' },
                         { name:'DATA',        pos:[-0.14,0.1,0],   color:'#6366f1' },
                         { name:'NC',          pos:[ 0.14,0.1,0],   color:'#94a3b8' },
                         { name:'GND',         pos:[ 0.42,0.1,0],   color:'#1e293b' }],
          hcsr04:       [{ name:'VCC',         pos:[-1.14,0.06,0],  color:'#ef4444' },
                         { name:'TRIG',        pos:[-0.38,0.06,0],  color:'#6366f1' },
                         { name:'ECHO',        pos:[ 0.38,0.06,0],  color:'#fbbf24' },
                         { name:'GND',         pos:[ 1.14,0.06,0],  color:'#1e293b' }],
          pir:          [{ name:'VCC',         pos:[-0.55,0.05,0],  color:'#ef4444' },
                         { name:'OUT',         pos:[ 0,  0.05,0],  color:'#6366f1' },
                         { name:'GND',         pos:[ 0.55,0.05,0],  color:'#1e293b' }],
          servo:        [{ name:'GND',         pos:[-0.35,0.04,0],  color:'#1e293b' },
                         { name:'5V',          pos:[ 0,  0.04,0],  color:'#ef4444' },
                         { name:'Signal',      pos:[ 0.35,0.04,0],  color:'#f97316' }],
          l298n:        [{ name:'ENA',         pos:[-1.38,0.05,-1.55], color:'#6366f1' },
                         { name:'IN1',         pos:[-0.69,0.05,-1.55], color:'#6366f1' },
                         { name:'IN2',         pos:[ 0,  0.05,-1.55], color:'#6366f1' },
                         { name:'IN3',         pos:[ 0.69,0.05,-1.55], color:'#6366f1' },
                         { name:'ENB',         pos:[ 1.38,0.05,-1.55], color:'#6366f1' },
                         { name:'OUT1',        pos:[-0.55,0.06, 1.55], color:'#ef4444' },
                         { name:'OUT2',        pos:[ 0.35,0.06, 1.55], color:'#94a3b8' }],
          dc_motor:     [{ name:'M+',          pos:[ 0.05,0.98,-0.78], color:'#ef4444' },
                         { name:'M-',          pos:[-0.05,0.98,-0.78], color:'#1e293b' }],
          relay:        [{ name:'VCC',         pos:[-0.65,0.02,-1.45], color:'#ef4444' },
                         { name:'GND',         pos:[ 0,  0.02,-1.45], color:'#1e293b' },
                         { name:'IN',          pos:[ 0.65,0.02,-1.45], color:'#6366f1' }],
          breadboard:   [{ name:'VCC+',        pos:[ 1.55,0.14,-3.0],color:'#ef4444' },
                         { name:'GND-',        pos:[ 1.65,0.14,-3.0],color:'#1e293b' },
                         { name:'VCC+2',       pos:[ 1.55,0.14, 3.0],color:'#ef4444' },
                         { name:'GND-2',       pos:[ 1.65,0.14, 3.0],color:'#1e293b' }],
        };

        let activePreset = "blink";
        let activeStep = 0;
        let isSimulating = false;
        let simInterval = null;

        // Three.js State variables
        let scene, camera, renderer, controls;
        let meshGroup;
        let activeLdrLevel = 50;
        let activeButtonState = false;
        const freeBuildState = {
            activeTempC: 25,
            activeHumidity: 50,
            activeDistanceCm: 100,
            activePirMotion: false,
            activeServoAngle: 90,
            activeMotorSpeed: 0,
            activeRelayOn: false
        };
        let lastRenderTime = performance.now();

        function resetFreeBuildState() {
            freeBuildState.activeTempC = 25;
            freeBuildState.activeHumidity = 50;
            freeBuildState.activeDistanceCm = 100;
            freeBuildState.activePirMotion = false;
            freeBuildState.activeServoAngle = 90;
            freeBuildState.activeMotorSpeed = 0;
            freeBuildState.activeRelayOn = false;
        }

        function syncFreeBuildControlUI() {
            const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
            set('dht-temp-val', `${freeBuildState.activeTempC}°C`);
            set('dht-hum-val', `${freeBuildState.activeHumidity}%`);
            set('distance-val', `${freeBuildState.activeDistanceCm} cm`);
            set('servo-angle-val', `${freeBuildState.activeServoAngle}°`);
            const ms = freeBuildState.activeMotorSpeed;
            if (ms === 0) set('motor-speed-val', '0% (STOP)');
            else set('motor-speed-val', `${ms >= 0 ? 'FWD' : 'REV'} ${Math.abs(ms)}%`);
            const sld = (id, val) => { const el = document.getElementById(id); if (el) el.value = String(val); };
            sld('hw-dht-temp', freeBuildState.activeTempC);
            sld('hw-dht-hum', freeBuildState.activeHumidity);
            sld('hw-distance', freeBuildState.activeDistanceCm);
            sld('hw-servo-angle', freeBuildState.activeServoAngle);
            sld('hw-motor-speed', freeBuildState.activeMotorSpeed);
        }

        // Custom meshes stored globally for access/anim
        let customMeshes = {};
        let activeWireMeshes = [];

        // Parts Library / Free Build state
        let placedComponents = [];
        let selectedComponent = null;
        let groundPlane = null;
        let draggedPartData = null;
        let componentCounters = {};
        let activeTab = 'copilot';
        let isFreeBuildMode = false;

        // Drag-to-move state (moving placed components in 3D)
        let dragComponent  = null;   // THREE.Group being dragged
        let dragHasMoved   = false;  // true once pointer moves past threshold
        let pointerDownPos = { x: 0, y: 0 };
        const DRAG_PX_THRESHOLD = 5; // pixels before a press becomes a drag

        // Undo / Redo stacks
        let undoStack = [];
        let redoStack = [];
        const UNDO_MAX = 50;
        let _inRestore = false; // guard: prevents saveUndoSnapshot() during restoreSnapshot()

        // Wire Tool State
        let isWireMode      = false;
        let wireDrawStart   = null;   // { group, pinIndex, pinName, worldPos }
        let wirePreviewMesh = null;
        let placedWires     = [];     // { id, fromCompId, fromPinIdx, toCompId, toPinIdx, color, mesh }
        let wireIdCounter   = 0;
        let activeWireColor = '#ef4444';
        let hoveredPinSphere = null;

        // AI Free-Build Steps (generated alongside circuit)
        let aiFreeBuildSteps      = [];
        let aiFreeBuildStepIndex  = 0;

        // AI Tutor Chat
        let tutorMsgCounter = 0;

        // ========================================================
        // GEMINI AI INTEGRATION (30 Points Technical Metric)
        // ========================================================
        /** Detect whether user typed a question (→ AI tutor) or a build request (→ circuit gen) */
        function isQuestion(text) {
            const lower = text.toLowerCase().trim();
            if (lower.endsWith('?')) return true;
            const starters = ['why ','how ','what ','explain ','help ','is ','does ','can ','should ','tell me','show me','describe ','define ','when ','where ','which ','who '];
            return starters.some(s => lower.startsWith(s));
        }

        async function generateAICircuit() {
            const inputField = document.getElementById("ai-input");
            const promptText = inputField.value.trim();
            if(!promptText) return;

            // Route to AI tutor chat for questions, circuit builder for build requests
            if (isQuestion(promptText)) {
                await askAITutor(promptText);
                return;
            }

            // Always use the component-library builder — auto-switch to free-build mode if needed
            if (!isFreeBuildMode) enterFreeBuildMode();
            inputField.value = '';
            await generateAIFreeBuildCircuit(promptText);
            return;

            // ── legacy preset-based generator (kept for reference, unreachable) ──
            showToast("AI is architecting your custom hardware setup...", true);

            const fetchWithRetry = async (url, options, retries = 5, delay = 1000) => {
                try {
                    const response = await fetch(url, options);
                    if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
                    return await response.json();
                } catch (error) {
                    if (retries <= 0) throw error;
                    await new Promise(res => setTimeout(res, delay));
                    return fetchWithRetry(url, options, retries - 1, delay * 2);
                }
            };

            const systemPrompt = `You are an advanced IoT hardware engineer. Based on the user's idea, design a step-by-step 3D electronic tutorial.
Return ONLY a valid JSON object matching this TypeScript structure:
{
  "title": "Short title describing the project",
  "topic": "General Education or Public and Higher Education",
  "steps": [
    {
      "title": "Step label",
      "desc": "Detailed instructional instructions guiding connections",
      "tip": "Safety/engineering advice",
      "camera": { "x": number, "y": number, "z": number },
      "lookAt": { "x": number, "y": number, "z": number },
      "visible": ["board", "breadboard", "led", "resistor", "ldr", "buzzer", "button", "wire_gnd", "wire_sig"]
    }
  ],
  "wires": [
    { "type": "wire_gnd" | "wire_sig", "color": "hex string", "path": [[number, number, number], [number, number, number]] }
  ],
  "activeComponent": "led" | "ldr" | "buzzer" | "button",
  "interactiveType": "none" | "slider" | "button",
  "schematic": "Valid HTML SVG string fitting within a 400x300 viewBox containing standard circuit representations",
  "code": "C++ code compatible with the Arduino Uno microcontroller for this simulation"
}`;

            try {
                if (!apiKey) throw new Error("Missing API Key");

                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                const payload = {
                    contents: [{ parts: [{ text: `User request: "${promptText}"` }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                title: { type: "STRING" },
                                topic: { type: "STRING" },
                                steps: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            title: { type: "STRING" },
                                            desc: { type: "STRING" },
                                            tip: { type: "STRING" },
                                            camera: { type: "OBJECT", properties: { x: { type: "NUMBER" }, y: { type: "NUMBER" }, z: { type: "NUMBER" } } },
                                            lookAt: { type: "OBJECT", properties: { x: { type: "NUMBER" }, y: { type: "NUMBER" }, z: { type: "NUMBER" } } },
                                            visible: { type: "ARRAY", items: { type: "STRING" } }
                                        }
                                    }
                                },
                                wires: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            type: { type: "STRING" },
                                            color: { type: "STRING" },
                                            path: { type: "ARRAY", items: { type: "ARRAY", items: { type: "NUMBER" } } }
                                        }
                                    }
                                },
                                activeComponent: { type: "STRING" },
                                interactiveType: { type: "STRING" },
                                schematic: { type: "STRING" },
                                code: { type: "STRING" }
                            },
                            required: ["title", "topic", "steps", "wires", "activeComponent", "interactiveType", "schematic", "code"]
                        }
                    }
                };

                const data = await fetchWithRetry(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const parsedResult = JSON.parse(data.candidates[0].content.parts[0].text);
                PRESETS["ai-generated"] = parsedResult;
                applyPreset("ai-generated");
                showToast("AI has generated your laboratory sandbox! Enjoy experimenting.", false);
            } catch (err) {
                let fallbackKey = "blink";
                if (promptText.toLowerCase().includes("light") || promptText.toLowerCase().includes("dark") || promptText.toLowerCase().includes("ldr")) {
                    fallbackKey = "night";
                } else if (promptText.toLowerCase().includes("siren") || promptText.toLowerCase().includes("sound") || promptText.toLowerCase().includes("buzz") || promptText.toLowerCase().includes("alarm")) {
                    fallbackKey = "alarm";
                } else if (promptText.toLowerCase().includes("button") || promptText.toLowerCase().includes("switch") || promptText.toLowerCase().includes("press")) {
                    fallbackKey = "button";
                }
                await new Promise(r => setTimeout(r, 1200));
                applyPreset(fallbackKey);
                showToast("Lab generated successfully using offline local patterns!", false);
            }
        }

        // ========================================================
        // AI FREE-BUILD CIRCUIT GENERATOR
        // ========================================================
        async function generateAIFreeBuildCircuit(promptText) {
            showToast("AI is building your circuit...", true);

            // Build a rich catalog from PARTS_REGISTRY + COMPONENT_PINS
            const componentCatalog = PARTS_REGISTRY
                .filter(p => COMPONENT_PINS[p.type])   // only types the 3D builder supports
                .map(p => ({
                    id:      p.id,
                    type:    p.type,
                    label:   p.label,
                    variant: p.variant || null,
                    pins:    COMPONENT_PINS[p.type].map(pin => pin.name)
                }));

            const systemPrompt = `You are an expert electronics engineer. Design a complete, working circuit that directly fulfils the user's request using any combination of the available components.

AVAILABLE COMPONENTS (use "id" in the output):
${JSON.stringify(componentCatalog, null, 2)}

Return ONLY valid JSON matching this schema exactly — no markdown, no extra keys:
{
  "description": "one-line circuit description",
  "components": [
    { "id": "arduino_uno", "type": "arduino",  "variant": null,  "x": -2.5, "z": 0   },
    { "id": "led_red",     "type": "led",      "variant": "red", "x":  2.0, "z": 0   },
    { "id": "res_220",     "type": "resistor", "variant": "220", "x":  0.5, "z": 0   }
  ],
  "connections": [
    { "fromComponent": 0, "fromPin": "D13",      "toComponent": 2, "toPin": "pin1",      "color": "#6366f1" },
    { "fromComponent": 2, "fromPin": "pin2",     "toComponent": 1, "toPin": "anode(+)",  "color": "#ef4444" },
    { "fromComponent": 0, "fromPin": "GND",      "toComponent": 1, "toPin": "cathode(-)", "color": "#1e293b" }
  ],
  "steps": [
    { "title": "1. Place the Microcontroller", "desc": "Begin by placing the Arduino Uno — it is the brain of the circuit. All other components connect back to it.", "tip": "Always start with the microcontroller so wiring stays organised." },
    { "title": "2. Add the Components", "desc": "Place the LED and 220Ω resistor on the workspace. The resistor limits current to protect the LED.", "tip": "LEDs have polarity — the longer leg (anode) connects to the positive signal." },
    { "title": "3. Wire the Circuit", "desc": "Connect the resistor to the LED anode, then from the Arduino pin to the resistor, and GND to the LED cathode.", "tip": "Follow the color convention: red = power, black = GND, blue/purple = signal." },
    { "title": "4. Run the Simulation", "desc": "Press Run Simulation to execute the uploaded firmware and observe the circuit behaviour in real time.", "tip": "Open the Serial Monitor tab to see debug output from Serial.println() calls." }
  ],
  "code": "// Arduino C++ sketch\nvoid setup() {}\nvoid loop() {}",
  "explanation": "Plain-English description of how the circuit works"
}

LAYOUT RULES:
- Arduino Uno: always at x: -2.5, z: 0
- ESP32 (if used instead): x: -2.5, z: 0
- Spread components: at least 2 units apart on x or z axis; use a grid pattern
- fromComponent / toComponent are 0-based indices into the "components" array
- Pin names must EXACTLY match the catalog (case-sensitive)
- Power connections: 5V/VCC→VCC/positive pins; GND→GND/negative pins
- Always add a 220Ω resistor in series for each LED (between digital pin and LED anode)
- PWM pins (D3~, D5~, D6~, D9~, D10~, D11~) for servo / PWM output
- Color convention: #ef4444 = power, #1e293b = ground, #6366f1 = signal, #fbbf24 = analog
- Use only components from the catalog above; select the most appropriate ones for the request
- Produce a fully connected, functional circuit — every placed component must be wired`;

            try {
                if (!apiKey) throw new Error("no key");
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                const resp = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Build this circuit: "${promptText}"` }] }],
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        generationConfig: {
                            responseMimeType: 'application/json',
                            responseSchema: {
                                type: "OBJECT",
                                properties: {
                                    description: { type: "STRING" },
                                    components: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                id:      { type: "STRING" },
                                                type:    { type: "STRING" },
                                                variant: { type: "STRING" },
                                                x:       { type: "NUMBER" },
                                                z:       { type: "NUMBER" }
                                            },
                                            required: ["type", "x", "z"]
                                        }
                                    },
                                    connections: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                fromComponent: { type: "INTEGER" },
                                                fromPin:       { type: "STRING" },
                                                toComponent:   { type: "INTEGER" },
                                                toPin:         { type: "STRING" },
                                                color:         { type: "STRING" }
                                            },
                                            required: ["fromComponent","fromPin","toComponent","toPin"]
                                        }
                                    },
                                    steps: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                title: { type: "STRING" },
                                                desc:  { type: "STRING" },
                                                tip:   { type: "STRING" }
                                            },
                                            required: ["title","desc","tip"]
                                        }
                                    },
                                    code:        { type: "STRING" },
                                    explanation: { type: "STRING" }
                                },
                                required: ["description","components","connections","steps","code","explanation"]
                            }
                        }
                    })
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data   = await resp.json();
                // Strip any accidental markdown fences before parsing
                let raw = data.candidates[0].content.parts[0].text;
                raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
                const result = JSON.parse(raw);
                await applyAIFreeBuildCircuit(result);
                showToast(`✨ ${result.description || 'AI circuit built!'}`, false);
            } catch(err) {
                console.error('AI free-build error:', err);
                showToast("AI circuit build failed — check API key or simplify your request", false);
            }
        }

        async function applyAIFreeBuildCircuit(data) {
            // Wipe existing free-placed circuit
            clearAllPlacedWires();
            [...placedComponents].forEach(g => {
                scene.remove(g);
                g.traverse(c => { if (c.isMesh) { c.geometry?.dispose(); if (c.material) { c.material.dispose(); } } });
            });
            placedComponents = [];
            componentCounters = {};

            // Place all components
            const groups = (data.components || []).map(comp =>
                createComponent(comp.type, comp.variant || null, comp.x ?? 0, comp.z ?? 0)
            );

            // Let Three.js process one frame so world matrices are correct
            await new Promise(r => requestAnimationFrame(r));
            renderer.render(scene, camera);

            // Create wire connections
            (data.connections || []).forEach(conn => {
                const fromG = groups[conn.fromComponent];
                const toG   = groups[conn.toComponent];
                if (!fromG || !toG) return;
                const fromDefs = getComponentPinDefs(fromG);
                const toDefs   = getComponentPinDefs(toG);
                const fIdx = fromDefs.findIndex(p => p.name === conn.fromPin);
                const tIdx = toDefs.findIndex(p => p.name === conn.toPin);
                if (fIdx === -1 || tIdx === -1) {
                    console.warn(`AI wire: pin not found — "${conn.fromPin}" or "${conn.toPin}"`);
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
                    id:         `wire_${++wireIdCounter}`,
                    fromCompId: fromG.userData.instanceId, fromPinIdx: fIdx,
                    toCompId:   toG.userData.instanceId,   toPinIdx:   tIdx,
                    color: conn.color || '#ef4444', mesh
                });
            });

            // Set firmware code
            if (data.code) {
                const ce = document.getElementById('code-content');
                if (ce) ce.value = data.code;
            }
            // Populate step-by-step instructions from AI response
            aiFreeBuildSteps = (data.steps && data.steps.length > 0)
                ? data.steps
                : [{ title: '🤖 AI-Generated Circuit', desc: data.explanation || 'Circuit built successfully!', tip: 'Use the Wire Tool (W) to inspect connections. Press Run to simulate.' }];
            aiFreeBuildStepIndex = 0;
            renderAIFreeBuildStep(0);

            refreshPlacedList();
            saveUndoSnapshot();
            glideCamera({ x: 0, y: 15, z: 8 }, { x: 0, y: 0, z: 0 });
        }

        // ========================================================
        // AI FREE-BUILD STEP RENDERER
        // ========================================================
        function renderAIFreeBuildStep(index) {
            const steps = aiFreeBuildSteps;
            if (!steps.length) return;
            const step = steps[Math.max(0, Math.min(index, steps.length - 1))];
            aiFreeBuildStepIndex = Math.max(0, Math.min(index, steps.length - 1));

            const si   = document.getElementById('step-index');
            const st   = document.getElementById('step-title');
            const sd   = document.getElementById('step-desc');
            const stip = document.getElementById('step-tip');
            const dots = document.getElementById('step-dot-container');
            const prev = document.getElementById('btn-prev');
            const next = document.getElementById('btn-next');

            if (si) si.textContent = `Step ${aiFreeBuildStepIndex + 1} of ${steps.length}`;
            if (st) st.textContent = step.title;
            if (sd) sd.textContent = step.desc;
            if (stip) stip.textContent = step.tip || '';

            if (dots) {
                dots.innerHTML = '';
                steps.forEach((_, idx) => {
                    const dot = document.createElement('div');
                    dot.className = `h-2 rounded-full transition-all duration-300 ${idx === aiFreeBuildStepIndex ? 'bg-indigo-600 w-5' : 'bg-slate-300 w-2'}`;
                    dots.appendChild(dot);
                });
            }
            if (prev) prev.disabled = aiFreeBuildStepIndex === 0;
            if (next) {
                const isLast = aiFreeBuildStepIndex === steps.length - 1;
                next.innerHTML = isLast
                    ? `Run Sim <i class="fa-solid fa-play ml-1"></i>`
                    : `Next <i class="fa-solid fa-chevron-right"></i>`;
                next.className = isLast
                    ? "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    : "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer";
            }
        }

        // ========================================================
        // AI TUTOR — Conversational Q&A
        // ========================================================

        /** Build a plain-English summary of the current circuit for context */
        function buildCircuitContext() {
            if (isFreeBuildMode && placedComponents.length > 0) {
                const compList = placedComponents
                    .map(g => g.userData.label || g.userData.type)
                    .join(', ');
                const wireCount = placedWires.length;
                const code = (document.getElementById('code-content')?.value || '').substring(0, 600);
                return `The student is in free-build mode with the following components: ${compList}. ${wireCount} wire(s) connected.\n\nFirmware code currently loaded:\n${code}`;
            }
            const preset = PRESETS[activePreset];
            const step   = preset?.steps[activeStep];
            return `The student is following the "${preset?.title || activePreset}" guided lab. Current step ${activeStep + 1}: "${step?.title}" — ${step?.desc}`;
        }

        /** Ask the AI tutor a question and stream the reply into the chat panel */
        async function askAITutor(question) {
            if (!question.trim()) return;
            const inputEl = document.getElementById('ai-input');
            if (inputEl) inputEl.value = '';

            appendTutorMessage('user', question);
            const loadingId = appendTutorMessage('ai', '●●●', true);

            try {
                if (!apiKey) throw new Error('no key');

                const context = buildCircuitContext();
                const systemPrompt = `You are an expert electronics and Arduino tutor helping a student learn through a 3D virtual circuit lab called Pilot.

Current lab context:
${context}

Answer the student's question in a friendly, clear, and concise way. Reference their specific components and connections when relevant. Keep answers to 2–3 sentences unless the question genuinely requires more detail. Use plain English — avoid excessive jargon.`;

                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                const resp = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: question }] }],
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        generationConfig: { maxOutputTokens: 512 }
                    })
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data   = await resp.json();
                const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure — could you rephrase that?";
                updateTutorMessage(loadingId, answer);
            } catch (err) {
                console.error('AI tutor error:', err);
                updateTutorMessage(loadingId, apiKey
                    ? "Sorry, I couldn't reach the AI right now. Please try again."
                    : "No API key found. Add VITE_GEMINI_API_KEY to your .env file.");
            }
        }

        /** Append a chat bubble to #tutor-chat; returns the message DOM id */
        function appendTutorMessage(role, text, isLoading = false) {
            // Collapse welcome section on first message
            const welcomeEl = document.getElementById('tutor-welcome');
            if (welcomeEl && welcomeEl.style.display !== 'none') {
                welcomeEl.style.transition = 'opacity 0.2s ease';
                welcomeEl.style.opacity = '0';
                setTimeout(() => { welcomeEl.style.display = 'none'; }, 200);
            }

            const chatEl = document.getElementById('tutor-chat');
            if (!chatEl) return null;
            const id  = `tm-${++tutorMsgCounter}`;
            const div = document.createElement('div');
            div.id = id;

            if (role === 'user') {
                div.className = 'flex justify-end';
                div.innerHTML = `<div class="max-w-[82%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] leading-relaxed font-medium shadow-sm">${escapeHtml(text)}</div>`;
            } else {
                div.className = 'flex justify-start items-start gap-2';
                const bubbleCls = isLoading
                    ? 'tutor-bubble max-w-[86%] bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2.5 text-[11px] text-slate-400 leading-relaxed shadow-sm animate-pulse'
                    : 'tutor-bubble max-w-[86%] bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2.5 text-[11px] text-slate-700 leading-relaxed shadow-sm';
                div.innerHTML = `
                    <div class="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <i class="fa-solid fa-wand-magic-sparkles text-white" style="font-size:7px"></i>
                    </div>
                    <div class="${bubbleCls}">${isLoading ? '<span style="letter-spacing:3px">●●●</span>' : escapeHtml(text)}</div>`;
            }
            chatEl.appendChild(div);
            chatEl.scrollTop = chatEl.scrollHeight;
            return id;
        }

        /** Replace loading indicator text with the actual AI response */
        function updateTutorMessage(id, text) {
            if (!id) return;
            const el = document.getElementById(id);
            if (!el) return;
            const bubble = el.querySelector('.tutor-bubble');
            if (bubble) {
                bubble.classList.remove('animate-pulse', 'text-slate-400');
                bubble.textContent = text;
            }
            const chatEl = document.getElementById('tutor-chat');
            if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
        }

        function showToast(message, isPersistent) {
            const toast = document.getElementById("toast");
            const toastMsg = document.getElementById("toast-message");
            toastMsg.textContent = message;
            toast.classList.remove("opacity-0", "translate-y-[-100px]");

            if(!isPersistent) {
                setTimeout(() => {
                    toast.classList.add("opacity-0", "translate-y-[-100px]");
                }, 3000);
            }
        }

        function applyPreset(key) {
            activePreset = key;
            activeStep = 0;
            undoStack = [];
            redoStack = [];
            updateUndoRedoUI();

            const data = PRESETS[key];
            document.getElementById("status-badge").innerHTML = `<span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> ${data.topic}`;

            if(isSimulating) toggleSimulation();

            renderCurrentStep();
            buildInteractiveControls();
            rebuildWiresIn3D(data.wires);
            updateComponentVisibilities();

            document.getElementById("svg-schematic").innerHTML = data.schematic;
            glideCamera(data.steps[0].camera, data.steps[0].lookAt);
        }

        function renderCurrentStep() {
            const data = PRESETS[activePreset];
            const step = data.steps[activeStep];

            document.getElementById("step-index").textContent = `Step ${activeStep + 1} of ${data.steps.length}`;
            document.getElementById("step-title").textContent = step.title;
            document.getElementById("step-desc").textContent = step.desc;
            document.getElementById("step-tip").textContent = step.tip;
            document.getElementById("code-content").value = data.code;

            const container = document.getElementById("step-dot-container");
            container.innerHTML = "";
            data.steps.forEach((_, idx) => {
                const dot = document.createElement("div");
                dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${idx === activeStep ? 'bg-indigo-600 w-5' : 'bg-slate-300'}`;
                container.appendChild(dot);
            });

            document.getElementById("btn-prev").disabled = activeStep === 0;
            const nextBtn = document.getElementById("btn-next");
            if(activeStep === data.steps.length - 1) {
                nextBtn.innerHTML = `Start Sim <i class="fa-solid fa-play ml-1"></i>`;
                nextBtn.className = "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer";
            } else {
                nextBtn.innerHTML = `Next <i class="fa-solid fa-chevron-right"></i>`;
                nextBtn.className = "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer";
            }
        }

        function moveStep(direction) {
            // In free-build mode, navigate AI-generated steps (no camera moves)
            if (isFreeBuildMode && aiFreeBuildSteps.length > 0) {
                const target = aiFreeBuildStepIndex + direction;
                if (target >= 0 && target < aiFreeBuildSteps.length) {
                    renderAIFreeBuildStep(target);
                }
                return;
            }
            const data = PRESETS[activePreset];
            const target = activeStep + direction;
            if(target >= 0 && target < data.steps.length) {
                activeStep = target;
                renderCurrentStep();
                const step = data.steps[activeStep];
                glideCamera(step.camera, step.lookAt);
                updateComponentVisibilities();
            } else if (target === data.steps.length) {
                toggleSimulation();
            }
        }

        const FREE_BUILD_INTERACTIVE_TYPES = ['dht11', 'hcsr04', 'pir', 'servo', 'l298n', 'dc_motor', 'relay'];

        function hideFreeBuildControlWrappers() {
            [
                'interactive-dht-wrapper', 'interactive-distance-wrapper', 'interactive-pir-wrapper',
                'interactive-servo-wrapper', 'interactive-motor-wrapper', 'interactive-relay-wrapper'
            ].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
        }

        function buildFreeBuildInteractiveControls() {
            hideFreeBuildControlWrappers();
            const container = document.getElementById("interactive-hardware-control");
            const sliderWrapper = document.getElementById("interactive-slider-wrapper");
            const btnWrapper = document.getElementById("interactive-btn-wrapper");
            if (sliderWrapper) sliderWrapper.classList.add('hidden');
            if (btnWrapper) btnWrapper.classList.add('hidden');

            const types = new Set(placedComponents.map(g => g.userData.type));
            const hasInteractive = FREE_BUILD_INTERACTIVE_TYPES.some(t => types.has(t));
            if (!hasInteractive || !container) {
                container?.classList.add('hidden');
                return;
            }
            container.classList.remove('hidden');
            if (types.has('dht11')) document.getElementById('interactive-dht-wrapper')?.classList.remove('hidden');
            if (types.has('hcsr04')) document.getElementById('interactive-distance-wrapper')?.classList.remove('hidden');
            if (types.has('pir')) document.getElementById('interactive-pir-wrapper')?.classList.remove('hidden');
            if (types.has('servo')) document.getElementById('interactive-servo-wrapper')?.classList.remove('hidden');
            if (types.has('dc_motor') || types.has('l298n')) document.getElementById('interactive-motor-wrapper')?.classList.remove('hidden');
            if (types.has('relay')) document.getElementById('interactive-relay-wrapper')?.classList.remove('hidden');
        }

        function buildInteractiveControls() {
            hideFreeBuildControlWrappers();
            const data = PRESETS[activePreset];
            const container = document.getElementById("interactive-hardware-control");
            const sliderWrapper = document.getElementById("interactive-slider-wrapper");
            const btnWrapper = document.getElementById("interactive-btn-wrapper");

            if(data.interactiveType === "none") {
                container.classList.add("hidden");
            } else {
                container.classList.remove("hidden");
                if(data.interactiveType === "slider") {
                    sliderWrapper.classList.remove("hidden");
                    btnWrapper.classList.add("hidden");
                } else if(data.interactiveType === "button") {
                    btnWrapper.classList.remove("hidden");
                    sliderWrapper.classList.add("hidden");
                }
            }
        }

        function updateComponentVisibilities() {
            const data = PRESETS[activePreset];
            const step = data.steps[activeStep];

            Object.keys(customMeshes).forEach(key => {
                customMeshes[key].visible = step.visible.includes(key);
            });

            activeWireMeshes.forEach(wire => {
                wire.visible = step.visible.includes(wire.name);
            });
        }

        function toggleIdeDrawer() {}

        function copySketchCode() {
            const el = document.getElementById("code-content");
            const code = el.value || el.textContent;
            navigator.clipboard.writeText(code).catch(() => {
                const tmp = document.createElement("textarea");
                tmp.value = code;
                document.body.appendChild(tmp);
                tmp.select();
                document.execCommand("copy");
                document.body.removeChild(tmp);
            });
            showToast("Firmware code copied to clipboard!", false);
        }

        function toggleSchematicPanel() {
            document.getElementById("schematic-panel").classList.toggle("hidden");
        }


        // ========================================================
        // WIRE TOOL SYSTEM — Pins, draw, preview, render
        // ========================================================

        function getComponentPinDefs(group) {
            return group.userData.pinDefs || COMPONENT_PINS[group.userData.type] || [];
        }

        /** Attach invisible pin-sphere children to a component group */
        function attachPinSpheres(group) {
            const defs = getComponentPinDefs(group);
            if (!defs.length) return;
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

        /** Show / hide all pin spheres across all placed components */
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
                ? `⚡ Wiring from "${wireDrawStart.pinName}" — click another pin  •  Esc to cancel`
                : '⚡ Wire Mode — click any glowing pin to start  •  W or Esc to exit';
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
                new THREE.Vector3(midX, Math.max(from.y, to.y) + h, midZ),
                new THREE.Vector3(to.x, to.y + h * 0.6, to.z),
                to.clone()
            ];
        }

        /** Build a CatmullRom tube mesh */
        function createWireTube(pathPoints, color, radius, opacity) {
            radius  = radius  !== undefined ? radius  : 0.05;
            opacity = opacity !== undefined ? opacity : 1.0;
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
            if (fromSph) fromSph.getWorldPosition(fromPos);
            else fromPos.copy(wireDrawStart.worldPos);
            toPinSphere.getWorldPosition(toPos);

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
            // Reset pin visuals
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
            showToast('Wire connected! ⚡', false);
        }

        /** Rebuild all placed-wire meshes (call after a component is moved) */
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

        /** Delete ALL placed wires (undo/redo restore) */
        function clearAllPlacedWires() {
            placedWires.forEach(w => {
                if (w.mesh) { scene.remove(w.mesh); w.mesh.geometry?.dispose(); }
            });
            placedWires = [];
        }

        // ========================================================
        // THREE.JS GRAPHICS RENDERING (30 Points Technical Metric)
        // ========================================================
        function initGraphics() {
            const container = document.getElementById("canvas-view");
            scene = new THREE.Scene();
            scene.background = new THREE.Color("#e8edf2");

            camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
            camera.position.set(0, 12, 12);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            container.appendChild(renderer.domElement);

            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.maxPolarAngle = Math.PI / 2 - 0.05;
            controls.minDistance = 3;
            controls.maxDistance = 20;

            const ambient = new THREE.AmbientLight("#ffffff", 0.75);
            scene.add(ambient);

            const spot = new THREE.DirectionalLight("#ffffff", 0.85);
            spot.position.set(5, 12, 5);
            spot.castShadow = true;
            spot.shadow.mapSize.width = 1024;
            spot.shadow.mapSize.height = 1024;
            scene.add(spot);

            const pointGlow = new THREE.PointLight("#e0e8ff", 0.2, 15);
            pointGlow.position.set(-3, 2, -3);
            scene.add(pointGlow);

            const grid = new THREE.GridHelper(30, 30, "#b8c4d0", "#cdd5df");
            grid.position.y = -0.05;
            scene.add(grid);

            meshGroup = new THREE.Group();
            scene.add(meshGroup);

            // Ground plane for raycasting (y=0, normal up)
            groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

            // Build preset components and register them
            const _board = buildArduinoBoard(-2.5, 0); meshGroup.add(_board); customMeshes["board"] = _board;
            const _bb    = buildBreadboard(2.5, 0);    meshGroup.add(_bb);    customMeshes["breadboard"] = _bb;
            const _led   = buildLED(2.5, -0.8, 'red'); meshGroup.add(_led);   customMeshes["led"] = _led;
            const _res   = buildResistor(3.4, -0.8, '220'); meshGroup.add(_res); customMeshes["resistor"] = _res;
            const _buz   = buildPiezoBuzzer(2.5, 0.8); meshGroup.add(_buz);   customMeshes["buzzer"] = _buz;
            const _btn   = buildButton(2.5, 1.8);      meshGroup.add(_btn);   customMeshes["button"] = _btn;
            const _ldr   = buildLDR(2.5, -1.8);        meshGroup.add(_ldr);   customMeshes["ldr"] = _ldr;
            const _capE  = buildCapacitor(3.4, 0.2, 'electrolytic'); meshGroup.add(_capE); customMeshes["capacitor_electro"] = _capE;
            const _capC  = buildCapacitor(3.4, 1.2, 'ceramic'); meshGroup.add(_capC); customMeshes["capacitor_ceramic"] = _capC;
            const _pot   = buildPotentiometer(3.4, -1.8); meshGroup.add(_pot); customMeshes["potentiometer"] = _pot;
            const _therm = buildThermistor(3.4, -2.8); meshGroup.add(_therm); customMeshes["thermistor"] = _therm;
            const _npn   = buildTransistor(4.5, 0, 'NPN'); meshGroup.add(_npn); customMeshes["npn"] = _npn;
            const _pnp   = buildTransistor(4.5, 1.0, 'PNP'); meshGroup.add(_pnp); customMeshes["pnp"] = _pnp;
            const _dht   = buildDHT11(4.5, -1.5); meshGroup.add(_dht); customMeshes["dht11"] = _dht;
            const _sonar = buildHCSR04(4.5, 0); meshGroup.add(_sonar); customMeshes["hcsr04"] = _sonar;
            const _pirM  = buildPIR(4.5, 1.5); meshGroup.add(_pirM); customMeshes["pir"] = _pirM;
            const _servo = buildServo(5.5, -1.5); meshGroup.add(_servo); customMeshes["servo"] = _servo;
            const _l298n = buildMotorL298n(5.5, 0); meshGroup.add(_l298n); customMeshes["l298n"] = _l298n;
            const _dcm = buildDcMotor(6.4, 0); meshGroup.add(_dcm); customMeshes["dc_motor"] = _dcm;
            const _relay = buildRelay(5.5, 1.5); meshGroup.add(_relay); customMeshes["relay"] = _relay;

            meshGroup.position.set(0, 0, 0);

            // Drag-and-drop: part cards → canvas
            container.addEventListener('dragover', e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                container.classList.add('drag-over');
            });
            container.addEventListener('dragleave', e => {
                if (!container.contains(e.relatedTarget)) {
                    container.classList.remove('drag-over');
                }
            });
            container.addEventListener('drop', e => {
                e.preventDefault();
                container.classList.remove('drag-over');
                if (!draggedPartData) return;
                const pos = getDropWorldPosition(e);
                if (!pos) return;
                const snapped = snapToGrid(pos.x, pos.z);
                const group = createComponent(draggedPartData.type, draggedPartData.variant, snapped.x, snapped.z);
                if (group) refreshPlacedList();
                draggedPartData = null;
            });

            // Drag-to-move + click-to-select on placed components
            renderer.domElement.addEventListener('pointerdown',  onCanvasPointerDown);
            renderer.domElement.addEventListener('pointermove',  onCanvasPointerMove);
            renderer.domElement.addEventListener('pointerup',    onCanvasPointerUp);

            // Right-click context menu on placed components
            renderer.domElement.addEventListener('contextmenu', onCanvasRightClick);

            // Delete key removes selected component
            window.addEventListener('keydown', e => {
                if (e.key === 'Escape') { closeCtxMenu(); return; }
                if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponent && isFreeBuildMode) {
                    // Don't fire if user is typing in an input
                    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
                    e.preventDefault();
                    deleteSelectedComponent();
                }
            });

            // Close context menu on any click outside it
            window.addEventListener('click', e => {
                const menu = document.getElementById('ctx-menu');
                if (menu && !menu.contains(e.target)) closeCtxMenu();
            }, true);

            // Use centralized resize handler
            window.addEventListener("resize", triggerCanvasResize);

            renderLoop();
        }

        function glideCamera(target, look) {
            const start = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
            const startTime = performance.now();
            const duration = 900;

            function animate(time) {
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                camera.position.set(
                    start.x + (target.x - start.x) * ease,
                    start.y + (target.y - start.y) * ease,
                    start.z + (target.z - start.z) * ease
                );

                controls.target.set(
                    look.x * ease + controls.target.x * (1 - ease),
                    look.y * ease + controls.target.y * (1 - ease),
                    look.z * ease + controls.target.z * (1 - ease)
                );

                if (progress < 1) requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
        }

        function resetCamera() {
            const data = PRESETS[activePreset];
            glideCamera(data.steps[activeStep].camera, data.steps[activeStep].lookAt);
        }

        // ========================================================
        // 3D MODEL BUILDERS (Procedural Geometry)
        // ========================================================
        function partMetalMat() {
            return new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.92, roughness: 0.12 });
        }

        function partPcbMat(color = "#1e3a5f") {
            return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.06 });
        }

        /** Real-world mm → scene units (13 mm per unit; Arduino width 4.2u ≈ 55 mm PCB). */
        function partU(mm) { return mm / 13; }

        const PART_DIM = {
            PIN_R: partU(0.4),
            PIN_LEN: partU(6),
            LED_R: partU(2.5),
            LED_H: partU(4.5),
            LED_PIN_SP: partU(2.54),
            RES_R: partU(1.75),
            RES_LEN: partU(12),
            RES_LEAD_X: partU(5),
            CAP_ELEC_R: partU(5),
            CAP_ELEC_H: partU(12),
            CAP_CER_R: partU(3.5),
            POT: partU(9),
            TO92_R: partU(2.25),
            TO92_H: partU(4.8),
            THERM_R: partU(1.5),
            BUZZER_R: partU(6),
            BUZZER_H: partU(7),
            BUZZER_PIN_SP: partU(7.6),
            BTN: partU(12),
            LDR_R: partU(2.5),
            DHT_W: partU(15.5),
            DHT_H: partU(12),
            DHT_D: partU(5.5),
            SONAR_W: partU(45),
            SONAR_D: partU(20),
            PIR_W: partU(24),
            PIR_D: partU(32),
            SERVO_W: partU(23),
            SERVO_D: partU(12),
            SERVO_H: partU(27),
            L298N_W: partU(43),
            L298N_D: partU(43),
            L298N_H: partU(3),
            MOTOR_R: partU(12),
            MOTOR_LEN: partU(25),
            RELAY_W: partU(50),
            RELAY_D: partU(39),
            BTN_LEG_STUB: partU(2.8)
        };

        function addThroughHolePins(group, xPositions, y = 0.1, len = PART_DIM.PIN_LEN, r = PART_DIM.PIN_R) {
            const geom = new THREE.CylinderGeometry(r, r, len, 8);
            const mat = partMetalMat();
            xPositions.forEach(px => {
                const pin = new THREE.Mesh(geom, mat);
                pin.position.set(px, y, 0);
                pin.castShadow = true;
                group.add(pin);
            });
        }

        function addSmdPad(group, x, y, z, w = 0.06, d = 0.04) {
            const pad = new THREE.Mesh(
                new THREE.BoxGeometry(w, 0.008, d),
                new THREE.MeshStandardMaterial({ color: "#94a3b8", metalness: 0.85, roughness: 0.2 })
            );
            pad.position.set(x, y, z);
            group.add(pad);
        }

        function buildArduinoBoard(x = -2.5, z = 0) {
            const board = new THREE.Group();
            board.position.set(x, 0, z);

            const pcbGeom = new THREE.BoxGeometry(4.2, 0.1, 5.8);
            const pcbMat = new THREE.MeshStandardMaterial({ color: "#1e3a5f", roughness: 0.5 });
            const pcb = new THREE.Mesh(pcbGeom, pcbMat);
            board.add(pcb);

            const usbGeom = new THREE.BoxGeometry(0.8, 0.5, 1.4);
            const silver = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.9, roughness: 0.1 });
            const usb = new THREE.Mesh(usbGeom, silver);
            usb.position.set(-1.4, 0.25, -2.4);
            board.add(usb);

            const jackGeom = new THREE.BoxGeometry(0.8, 0.6, 1.2);
            const darkMat = new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.8 });
            const jack = new THREE.Mesh(jackGeom, darkMat);
            jack.position.set(1.4, 0.3, -2.5);
            board.add(jack);

            const mcuGeom = new THREE.BoxGeometry(0.7, 0.12, 1.8);
            const mcu = new THREE.Mesh(mcuGeom, darkMat);
            mcu.position.set(0.6, 0.08, 0.6);
            board.add(mcu);

            const pinRailGeom = new THREE.BoxGeometry(0.25, 0.35, 3.2);
            const rail1 = new THREE.Mesh(pinRailGeom, darkMat);
            rail1.position.set(-1.8, 0.18, -0.6);
            const rail2 = new THREE.Mesh(pinRailGeom, darkMat);
            rail2.position.set(1.8, 0.18, -0.6);
            board.add(rail1, rail2);

            return board;
        }

        function buildESP32(x = 0, z = 0) {
            const board = new THREE.Group();
            board.position.set(x, 0, z);

            const pcbMat = new THREE.MeshStandardMaterial({ color: "#1a3a2a", roughness: 0.5 });
            const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 4.2), pcbMat);
            board.add(pcb);

            // Antenna stub (characteristic ESP32 protrusion)
            const ant = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 1.0), pcbMat);
            ant.position.set(0, 0, -2.6);
            board.add(ant);

            // Silver RF shield block
            const silver = new THREE.MeshStandardMaterial({ color: "#94a3b8", metalness: 0.9, roughness: 0.1 });
            const shield = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.6), silver);
            shield.position.set(0, 0.19, -0.5);
            board.add(shield);

            // Pin headers (both sides)
            const darkMat = new THREE.MeshStandardMaterial({ color: "#0f172a" });
            const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 3.4), darkMat);
            rail1.position.set(-1.3, 0.15, 0.2);
            const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 3.4), darkMat);
            rail2.position.set(1.3, 0.15, 0.2);
            board.add(rail1, rail2);

            return board;
        }

        function buildBreadboard(x = 2.5, z = 0) {
            const breadboard = new THREE.Group();
            breadboard.position.set(x, 0, z);

            const baseGeom = new THREE.BoxGeometry(3.6, 0.25, 8.5);
            const baseMat = new THREE.MeshStandardMaterial({ color: "#fafafa", roughness: 0.9 });
            const base = new THREE.Mesh(baseGeom, baseMat);
            breadboard.add(base);

            const holeGeom = new THREE.BoxGeometry(0.06, 0.02, 0.06);
            const holeMat = new THREE.MeshBasicMaterial({ color: "#475569" });

            const holes = new THREE.Group();
            for (let z = -3.8; z <= 3.8; z += 0.3) {
                for (let x = -1.2; x <= -0.4; x += 0.2) {
                    const h = new THREE.Mesh(holeGeom, holeMat);
                    h.position.set(x, 0.13, z);
                    holes.add(h);
                }
                for (let x = 0.4; x <= 1.2; x += 0.2) {
                    const h = new THREE.Mesh(holeGeom, holeMat);
                    h.position.set(x, 0.13, z);
                    holes.add(h);
                }
            }
            breadboard.add(holes);

            const railGeom = new THREE.BoxGeometry(0.04, 0.01, 7.6);
            const redMat = new THREE.MeshBasicMaterial({ color: "#ef4444" });
            const blueMat = new THREE.MeshBasicMaterial({ color: "#3b82f6" });

            const redRail = new THREE.Mesh(railGeom, redMat);
            redRail.position.set(1.5, 0.13, 0);
            const blueRail = new THREE.Mesh(railGeom, blueMat);
            blueRail.position.set(1.6, 0.13, 0);
            breadboard.add(redRail, blueRail);

            return breadboard;
        }

        function buildLED(x = 2.5, z = -0.8, variant = 'red') {
            const led = new THREE.Group();
            led.position.set(x, 0.12, z);
            led.userData.variant = variant;

            const colorMap = { red: "#ef4444", green: "#22c55e", blue: "#3b82f6" };
            const ledColor = colorMap[variant] || colorMap.red;
            const r = PART_DIM.LED_R;
            const epoxyH = PART_DIM.LED_H;
            const half = PART_DIM.LED_PIN_SP / 2;
            const pinLen = PART_DIM.PIN_LEN;

            const ledMat = new THREE.MeshStandardMaterial({
                color: ledColor,
                emissive: "#000000",
                transparent: true,
                opacity: 0.5,
                roughness: 0.1,
                metalness: 0,
                side: THREE.DoubleSide
            });

            const flangeH = partU(1.2);
            const baseY = pinLen;
            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(r * 1.08, r * 1.12, flangeH, 16),
                new THREE.MeshStandardMaterial({ color: "#f1f5f9", roughness: 0.35, metalness: 0.15 })
            );
            rim.name = "ledRim";
            rim.position.y = baseY + flangeH / 2;
            led.add(rim);

            const cylH = epoxyH * 0.62;
            const cylY = baseY + flangeH + cylH / 2;
            const dome = new THREE.Mesh(new THREE.CylinderGeometry(r, r, cylH, 20), ledMat);
            dome.name = "ledDome";
            dome.position.y = cylY;
            led.add(dome);

            const tipY = baseY + flangeH + cylH;
            const tip = new THREE.Mesh(
                new THREE.SphereGeometry(r, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                ledMat
            );
            tip.name = "ledTip";
            tip.position.y = tipY;
            led.add(tip);

            const innerMat = new THREE.MeshStandardMaterial({ color: "#0a0a0a", roughness: 0.95, metalness: 0.08 });
            const innerR = partU(0.35);
            const innerBot = baseY + flangeH * 0.4;
            const innerTop = tipY + r * 0.7;
            const innerH = innerTop - innerBot;
            [-half, half].forEach(px => {
                const post = new THREE.Mesh(
                    new THREE.CylinderGeometry(innerR, innerR * 0.88, innerH, 8),
                    innerMat
                );
                post.name = "ledInnerLead";
                post.position.set(px, innerBot + innerH / 2, 0);
                led.add(post);
            });

            const pinGeom = new THREE.CylinderGeometry(PART_DIM.PIN_R, PART_DIM.PIN_R, pinLen, 8);
            const metal = partMetalMat();
            const pin1 = new THREE.Mesh(pinGeom, metal);
            pin1.position.set(-half, pinLen / 2, 0);
            const pin2 = new THREE.Mesh(pinGeom, metal);
            pin2.position.set(half, pinLen / 2, 0);
            led.add(pin1, pin2);

            const glow = new THREE.PointLight(ledColor, 0, 2.5);
            glow.name = "ledGlow";
            glow.position.set(0, tipY + r * 0.35, 0);
            led.add(glow);

            return led;
        }

        function buildResistor(x = 3.4, z = -0.8, variant = '220') {
            const r = new THREE.Group();
            r.position.set(x, 0.12, z);

            const bodyGeom = new THREE.CylinderGeometry(PART_DIM.RES_R, PART_DIM.RES_R, PART_DIM.RES_LEN, 12);
            bodyGeom.rotateZ(Math.PI / 2);
            const body = new THREE.Mesh(bodyGeom, new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.6 }));
            r.add(body);

            const stripeGeom = new THREE.CylinderGeometry(PART_DIM.RES_R + 0.008, PART_DIM.RES_R + 0.008, 0.03, 12);
            stripeGeom.rotateZ(Math.PI / 2);
            const bandSchemes = {
                '220': ["#ef4444", "#ef4444", "#78350f"],
                '1k':  ["#78350f", "#000000", "#ef4444"],
                '10k': ["#78350f", "#000000", "#f97316"]
            };
            const bands = bandSchemes[variant] || bandSchemes['220'];
            [-0.09, 0, 0.09].forEach((px, i) => {
                const s = new THREE.Mesh(stripeGeom.clone(), new THREE.MeshBasicMaterial({ color: bands[i] }));
                s.position.x = px;
                r.add(s);
            });

            const leadGeom = new THREE.CylinderGeometry(PART_DIM.PIN_R, PART_DIM.PIN_R, PART_DIM.PIN_LEN, 8);
            const metal = partMetalMat();
            const l1 = new THREE.Mesh(leadGeom, metal);
            l1.position.set(-PART_DIM.RES_LEAD_X, PART_DIM.PIN_LEN / 2, 0);
            const l2 = new THREE.Mesh(leadGeom, metal);
            l2.position.set(PART_DIM.RES_LEAD_X, PART_DIM.PIN_LEN / 2, 0);
            r.add(l1, l2);

            return r;
        }

        function buildCapacitor(x = 3.4, z = -0.8, variant = 'electrolytic') {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);
            const metal = partMetalMat();
            const py = PART_DIM.PIN_LEN / 2;

            if (variant === 'electrolytic') {
                const r = PART_DIM.CAP_ELEC_R;
                const h = PART_DIM.CAP_ELEC_H;
                const body = new THREE.Mesh(
                    new THREE.CylinderGeometry(r, r, h, 16),
                    new THREE.MeshStandardMaterial({ color: "#1e3a5f", roughness: 0.5 })
                );
                body.position.y = h / 2 + PART_DIM.PIN_LEN;
                g.add(body);
                const stripe = new THREE.Mesh(
                    new THREE.CylinderGeometry(r + 0.003, r + 0.003, h * 0.12, 16),
                    new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.6 })
                );
                stripe.position.y = body.position.y + h * 0.38;
                g.add(stripe);
                const leadGeom = new THREE.CylinderGeometry(PART_DIM.PIN_R, PART_DIM.PIN_R, PART_DIM.PIN_LEN, 8);
                const l1 = new THREE.Mesh(leadGeom, metal); l1.position.set(-r * 0.55, py, 0);
                const l2 = new THREE.Mesh(leadGeom, metal); l2.position.set(r * 0.55, py, 0);
                g.add(l1, l2);
            } else {
                const r = PART_DIM.CAP_CER_R;
                const disc = new THREE.Mesh(
                    new THREE.CylinderGeometry(r, r, partU(2), 16),
                    new THREE.MeshStandardMaterial({ color: "#b45309", roughness: 0.7 })
                );
                disc.position.y = partU(2) / 2 + PART_DIM.PIN_LEN;
                g.add(disc);
                const leadGeom = new THREE.CylinderGeometry(PART_DIM.PIN_R, PART_DIM.PIN_R, PART_DIM.PIN_LEN, 8);
                const l1 = new THREE.Mesh(leadGeom, metal); l1.position.set(-r * 0.7, py, 0);
                const l2 = new THREE.Mesh(leadGeom, metal); l2.position.set(r * 0.7, py, 0);
                g.add(l1, l2);
            }
            return g;
        }

        function buildPotentiometer(x = 3.4, z = -0.8) {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);
            const metal = partMetalMat();
            const p = PART_DIM.POT;
            const h = partU(4);

            const body = new THREE.Mesh(
                new THREE.BoxGeometry(p, h, p),
                new THREE.MeshStandardMaterial({ color: "#1d4ed8", roughness: 0.6 })
            );
            body.position.y = h / 2 + PART_DIM.PIN_LEN;
            g.add(body);

            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(partU(1.8), partU(1.8), partU(3), 12),
                metal
            );
            shaft.position.y = body.position.y + h / 2 + partU(1.5);
            g.add(shaft);

            const knob = new THREE.Mesh(
                new THREE.CylinderGeometry(partU(3), partU(3), partU(1.5), 16),
                new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.4 })
            );
            knob.position.y = shaft.position.y + partU(2);
            g.add(knob);

            const spread = p * 0.42;
            addThroughHolePins(g, [-spread, 0, spread], PART_DIM.PIN_LEN / 2);
            return g;
        }

        function buildThermistor(x = 3.4, z = -0.8) {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);
            const r = PART_DIM.THERM_R;
            const bead = new THREE.Mesh(
                new THREE.SphereGeometry(r, 14, 14),
                new THREE.MeshStandardMaterial({ color: "#292524", roughness: 0.8 })
            );
            bead.position.y = r + PART_DIM.PIN_LEN + partU(0.5);
            g.add(bead);
            addThroughHolePins(g, [-r * 1.2, r * 1.2], PART_DIM.PIN_LEN / 2);
            return g;
        }

        function buildTransistor(x = 3.4, z = -0.8, variant = 'NPN') {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);
            const metal = partMetalMat();
            const tr = PART_DIM.TO92_R;
            const th = PART_DIM.TO92_H;
            const bodyColor = variant === 'PNP' ? '#1e3a5f' : '#0f172a';
            const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.7 });
            const by = PART_DIM.PIN_LEN + th / 2;

            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(tr, tr, th, 16, 1, false, 0, Math.PI),
                bodyMat
            );
            body.position.y = by;
            const flat = new THREE.Mesh(
                new THREE.CylinderGeometry(tr, tr, th, 16, 1, false, Math.PI, Math.PI),
                bodyMat
            );
            flat.position.y = by;
            g.add(body, flat);

            const band = new THREE.Mesh(
                new THREE.CylinderGeometry(tr + 0.004, tr + 0.004, partU(0.8), 16),
                new THREE.MeshBasicMaterial({ color: variant === 'PNP' ? '#22d3ee' : '#4ade80' })
            );
            band.position.y = by + th / 2 - partU(0.3);
            g.add(band);

            const spread = tr * 1.15;
            addThroughHolePins(g, [-spread, 0, spread], PART_DIM.PIN_LEN / 2);
            return g;
        }

        function buildPiezoBuzzer(x = 2.5, z = 0.8) {
            const buzzer = new THREE.Group();
            buzzer.position.set(x, 0.12, z);

            const br = PART_DIM.BUZZER_R;
            const h = PART_DIM.BUZZER_H;
            const half = PART_DIM.BUZZER_PIN_SP / 2;
            const bodyMat = new THREE.MeshStandardMaterial({ color: "#0c1222", roughness: 0.72, metalness: 0.05 });

            const body = new THREE.Mesh(new THREE.CylinderGeometry(br, br, h, 32), bodyMat);
            body.name = "buzzerBody";
            body.position.y = h / 2;
            body.castShadow = true;
            buzzer.add(body);

            const holeR = br * 0.52;
            const holeDepth = h * 0.42;
            const hole = new THREE.Mesh(
                new THREE.CylinderGeometry(holeR, holeR * 0.92, holeDepth, 24),
                new THREE.MeshStandardMaterial({ color: "#020617", roughness: 0.95 })
            );
            hole.name = "buzzerHole";
            hole.position.y = h - holeDepth / 2;
            buzzer.add(hole);

            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(br * 1.01, br, h * 0.1, 32),
                bodyMat
            );
            rim.position.y = h - h * 0.05;
            buzzer.add(rim);

            const pinMat = new THREE.MeshStandardMaterial({ color: "#0a0a0a", roughness: 0.9, metalness: 0.1 });
            const topCapH = partU(1.4);
            const topPinR = partU(0.35);
            const pinLen = PART_DIM.PIN_LEN;
            const pinGeom = new THREE.CylinderGeometry(PART_DIM.PIN_R, PART_DIM.PIN_R, pinLen, 8);
            const metal = partMetalMat();
            [-half, half].forEach(px => {
                const pin = new THREE.Mesh(pinGeom, metal);
                pin.position.set(px, pinLen / 2, 0);
                buzzer.add(pin);
                const cap = new THREE.Mesh(
                    new THREE.CylinderGeometry(topPinR, topPinR, topCapH, 6),
                    pinMat
                );
                cap.name = "buzzerTopPin";
                cap.position.set(px, h + topCapH / 2, 0);
                buzzer.add(cap);
            });

            return buzzer;
        }

        function addTactileLeg(group, px, pz, hx, hz) {
            const metal = partMetalMat();
            const r = PART_DIM.PIN_R;
            const vLen = PART_DIM.PIN_LEN;
            const stubLen = PART_DIM.BTN_LEG_STUB;
            const footY = -partU(0.35);

            const vert = new THREE.Mesh(new THREE.CylinderGeometry(r, r, vLen, 8), metal);
            vert.position.set(px, -vLen / 2, pz);
            group.add(vert);

            const stub = new THREE.Mesh(new THREE.CylinderGeometry(r, r, stubLen, 8), metal);
            if (hx !== 0) {
                stub.rotation.z = Math.PI / 2;
                stub.position.set(px + hx * stubLen / 2, 0, pz);
            } else {
                stub.rotation.x = Math.PI / 2;
                stub.position.set(px, 0, pz + hz * stubLen / 2);
            }
            group.add(stub);

            const footX = hx !== 0 ? px + hx * stubLen : px;
            const footZ = hz !== 0 ? pz + hz * stubLen : pz;
            const foot = new THREE.Mesh(
                new THREE.CylinderGeometry(r * 1.35, r * 1.35, partU(0.7), 8),
                metal
            );
            foot.position.set(footX, footY, footZ);
            group.add(foot);

            return [footX, footY, footZ];
        }

        function buildButtonPinDefs(s) {
            const pc = s * 0.44;
            const out = PART_DIM.BTN_LEG_STUB;
            return [
                { name:'pin1', pos:[-pc - out, 0, -pc], color:'#94a3b8' },
                { name:'pin2', pos:[ pc + out, 0, -pc], color:'#94a3b8' },
                { name:'pin3', pos:[-pc - out, 0,  pc], color:'#94a3b8' },
                { name:'pin4', pos:[ pc + out, 0,  pc], color:'#94a3b8' }
            ];
        }

        function buildButton(x = 2.5, z = 1.8) {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);

            const s = PART_DIM.BTN;
            const baseH = s * 0.34;
            const skirtH = s * 0.14;
            const capH = s * 0.18;

            const casing = new THREE.Mesh(
                new THREE.BoxGeometry(s, baseH, s),
                new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.75 })
            );
            casing.position.y = baseH / 2;
            casing.castShadow = true;
            g.add(casing);

            const skirt = new THREE.Mesh(
                new THREE.CylinderGeometry(s * 0.38, s * 0.42, skirtH, 16),
                new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.6 })
            );
            skirt.position.y = baseH + skirtH / 2;
            g.add(skirt);

            const capY = baseH + skirtH + capH / 2;
            const cap = new THREE.Mesh(
                new THREE.CylinderGeometry(s * 0.3, s * 0.32, capH, 16),
                new THREE.MeshStandardMaterial({ color: "#f43f5e", roughness: 0.25 })
            );
            cap.name = "buttonCap";
            cap.position.y = capY;
            cap.userData.restY = capY;
            g.add(cap);

            const pc = s * 0.44;
            addTactileLeg(g, -pc, -pc, -1, 0);
            addTactileLeg(g, pc, -pc, 1, 0);
            addTactileLeg(g, -pc, pc, -1, 0);
            addTactileLeg(g, pc, pc, 1, 0);

            g.userData.pinDefs = buildButtonPinDefs(s);

            return g;
        }

        function buildLDR(x = 2.5, z = -1.8) {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);

            const lr = PART_DIM.LDR_R;
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(lr, lr + 0.02, 0.045, 16),
                new THREE.MeshStandardMaterial({ color: "#f1f5f9", roughness: 0.7 })
            );
            base.position.y = 0.14;
            base.castShadow = true;
            g.add(base);

            const disc = new THREE.Mesh(
                new THREE.CylinderGeometry(lr - 0.02, lr - 0.02, 0.022, 20),
                new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.25, metalness: 0.1 })
            );
            disc.position.y = 0.2;
            g.add(disc);

            const traceMat = new THREE.MeshBasicMaterial({ color: "#f97316" });
            for (let i = -2; i <= 2; i++) {
                const seg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.006, 0.01), traceMat);
                seg.position.set(i * 0.02, 0.21, 0);
                g.add(seg);
            }

            addThroughHolePins(g, [-0.08, 0.08], 0.1);

            return g;
        }

        function buildDHT11(x = 4.5, z = -1.5) {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);

            const w = PART_DIM.DHT_W;
            const h = PART_DIM.DHT_H;
            const d = PART_DIM.DHT_D;
            const bodyMat = new THREE.MeshStandardMaterial({ color: "#0c4a8a", roughness: 0.45, emissive: 0x000000, emissiveIntensity: 0.12 });
            const shell = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
            shell.position.y = h / 2;
            shell.name = 'dhtBody';
            shell.castShadow = true;
            g.add(shell);

            const lip = new THREE.Mesh(
                new THREE.BoxGeometry(w + 0.02, 0.03, d + 0.02),
                new THREE.MeshStandardMaterial({ color: "#1d4ed8", roughness: 0.5 })
            );
            lip.position.y = h + 0.015;
            g.add(lip);

            const face = new THREE.Mesh(
                new THREE.BoxGeometry(w * 0.72, h * 0.5, 0.015),
                new THREE.MeshStandardMaterial({ color: "#1e40af", roughness: 0.55 })
            );
            face.position.set(0, h * 0.52, d / 2 + 0.008);
            g.add(face);

            const grillMat = new THREE.MeshBasicMaterial({ color: "#7dd3fc" });
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 3; col++) {
                    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.014, 0.012), grillMat);
                    slot.position.set(-0.075 + col * 0.075, 0.2 + row * 0.055, d / 2 + 0.01);
                    g.add(slot);
                }
            }

            addThroughHolePins(g, [-0.11, -0.04, 0.04, 0.11], 0.1);

            return g;
        }

        function buildSonarTransducer(parent, name, px) {
            const housing = new THREE.Mesh(
                new THREE.CylinderGeometry(0.115, 0.12, 0.075, 20),
                new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.55, roughness: 0.35, emissive: 0x000000, emissiveIntensity: 0.15 })
            );
            housing.name = name;
            housing.position.set(px, 0.26, 0);
            housing.castShadow = true;
            parent.add(housing);

            const mesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.09, 0.07, 0.04, 16),
                new THREE.MeshStandardMaterial({ color: "#64748b", metalness: 0.4, roughness: 0.5 })
            );
            mesh.position.set(px, 0.29, 0);
            parent.add(mesh);

            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.085, 0.01, 10, 20),
                new THREE.MeshStandardMaterial({ color: "#94a3b8", metalness: 0.7, roughness: 0.25 })
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.set(px, 0.275, 0);
            parent.add(ring);
        }

        function buildHCSR04(x = 4.5, z = 0) {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);

            const sw = PART_DIM.SONAR_W;
            const sd = PART_DIM.SONAR_D;
            const pcb = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.06, sd), partPcbMat("#14532d"));
            pcb.position.y = 0.14;
            pcb.castShadow = true;
            g.add(pcb);

            buildSonarTransducer(g, 'sonarEyeLeft', -sw * 0.25);
            buildSonarTransducer(g, 'sonarEyeRight', sw * 0.25);

            const ic = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.04, 0.1),
                new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.8 })
            );
            ic.position.set(0, 0.19, 0);
            g.add(ic);
            addSmdPad(g, -0.04, 0.17, 0.02);
            addSmdPad(g, 0.04, 0.17, -0.02);

            [-sw * 0.4, sw * 0.4].forEach(px => {
                const hole = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.016, 0.016, 0.065, 8),
                    new THREE.MeshBasicMaterial({ color: "#1e293b" })
                );
                hole.position.set(px, 0.14, sd * 0.38);
                g.add(hole);
            });

            addThroughHolePins(g, [-sw * 0.33, -sd * 0.2, sd * 0.2, sw * 0.33], 0.06);

            return g;
        }

        function buildPIR(x = 4.5, z = 1.5) {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);

            const pw = PART_DIM.PIR_W;
            const pd = PART_DIM.PIR_D;
            const pcb = new THREE.Mesh(new THREE.BoxGeometry(pw, 0.05, pd), partPcbMat("#166534"));
            pcb.position.y = 0.12;
            pcb.castShadow = true;
            g.add(pcb);

            const pot = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.05, 0.08),
                new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.6 })
            );
            pot.position.set(0.16, 0.2, -0.1);
            g.add(pot);

            const domeMat = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.85, emissive: 0x000000, emissiveIntensity: 0 });
            for (let i = 0; i < 4; i++) {
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(0.08 + i * 0.035, 0.008, 8, 24),
                    domeMat
                );
                ring.rotation.x = Math.PI / 2;
                ring.position.y = 0.26 + i * 0.012;
                ring.castShadow = i === 3;
                g.add(ring);
            }

            const lens = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
                domeMat
            );
            lens.name = 'pirDome';
            lens.position.y = 0.3;
            lens.castShadow = true;
            g.add(lens);

            addThroughHolePins(g, [-pw * 0.22, 0, pw * 0.22], 0.05);

            return g;
        }

        function buildServo(x = 5.5, z = -1.5) {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);

            const blue = new THREE.MeshStandardMaterial({ color: "#0044cc", roughness: 0.4 });
            const hornWhite = new THREE.MeshStandardMaterial({ color: "#e0e0e0", roughness: 0.55 });
            const metal = partMetalMat();
            const holeMat = new THREE.MeshBasicMaterial({ color: "#9ca3af" });

            const baseW = PART_DIM.SERVO_W;
            const baseH = PART_DIM.SERVO_H * 0.38;
            const baseD = PART_DIM.SERVO_D;
            const base = new THREE.Mesh(new THREE.BoxGeometry(baseW, baseH, baseD), blue);
            base.position.y = baseH / 2;
            base.castShadow = true;
            g.add(base);

            const tabY = baseH * 0.62;
            [-1, 1].forEach(sign => {
                const tabX = sign * (baseW / 2 + 0.05);
                const tab = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.034, 0.16), blue);
                tab.position.set(tabX, tabY, 0);
                tab.castShadow = true;
                g.add(tab);
                const tabHole = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.018, 0.018, 0.038, 12),
                    new THREE.MeshBasicMaterial({ color: "#0f172a" })
                );
                tabHole.position.set(tabX, tabY, 0);
                g.add(tabHole);
            });

            const mountScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 10), metal);
            mountScrew.rotation.x = Math.PI / 2;
            mountScrew.position.set(-(baseW / 2 + 0.05), tabY + 0.018, 0);
            g.add(mountScrew);
            const washer = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.004, 8, 16), metal);
            washer.rotation.x = Math.PI / 2;
            washer.position.set(-(baseW / 2 + 0.05), tabY + 0.012, 0);
            g.add(washer);

            const topH = PART_DIM.SERVO_H * 0.42;
            const top = new THREE.Mesh(new THREE.BoxGeometry(baseW * 0.92, topH, baseD * 0.92), blue);
            top.position.y = baseH + topH / 2;
            top.castShadow = true;
            g.add(top);

            const bossH = PART_DIM.SERVO_H * 0.12;
            const boss = new THREE.Mesh(new THREE.CylinderGeometry(baseW * 0.22, baseW * 0.24, bossH, 16), blue);
            boss.position.set(0, baseH + topH + bossH / 2, 0.02);
            boss.castShadow = true;
            g.add(boss);

            const labelZ = baseD / 2 + 0.003;
            const labelY = baseH * 0.82;
            const labelFrame = new THREE.Mesh(
                new THREE.BoxGeometry(baseW * 0.65, PART_DIM.SERVO_H * 0.1, 0.008),
                new THREE.MeshStandardMaterial({ color: "#c0c0c0", metalness: 0.65, roughness: 0.28 })
            );
            labelFrame.position.set(0, labelY, labelZ);
            g.add(labelFrame);
            const labelGold = new THREE.Mesh(
                new THREE.BoxGeometry(baseW * 0.55, PART_DIM.SERVO_H * 0.075, 0.006),
                new THREE.MeshStandardMaterial({ color: "#d4af37", roughness: 0.32, metalness: 0.25 })
            );
            labelGold.position.set(0, labelY, labelZ + 0.003);
            g.add(labelGold);
            const lineMat = new THREE.MeshBasicMaterial({ color: "#1e293b" });
            [0.032, 0, -0.032].forEach((dy, i) => {
                const line = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2 - i * 0.025, 0.011, 0.003),
                    lineMat
                );
                line.position.set(0, labelY + dy, labelZ + 0.006);
                g.add(line);
            });

            const hornY = baseH + topH + bossH + 0.008;
            const hornGroup = new THREE.Group();
            hornGroup.name = 'servoHorn';
            hornGroup.position.set(0, hornY, 0.02);

            const hub = new THREE.Mesh(new THREE.CylinderGeometry(baseW * 0.2, baseW * 0.22, partU(1), 16), hornWhite);
            hub.rotation.x = Math.PI / 2;
            hornGroup.add(hub);

            const hornScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.012, 10), metal);
            hornScrew.rotation.x = Math.PI / 2;
            hornScrew.position.y = 0.015;
            hornGroup.add(hornScrew);

            const addHornHole = (hx, hz) => {
                const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.024, 8), holeMat);
                hole.rotation.x = Math.PI / 2;
                hole.position.set(hx, 0.014, hz);
                hornGroup.add(hole);
            };

            const armW = partU(1.2);
            const armT = partU(0.5);
            const longArm = new THREE.Mesh(new THREE.BoxGeometry(armW, armT, baseW * 0.75), hornWhite);
            longArm.position.set(0, 0.012, baseW * 0.42);
            hornGroup.add(longArm);
            for (let i = 0; i < 6; i++) addHornHole(0, baseW * 0.12 + i * partU(2.2));

            const shortArm = new THREE.Mesh(new THREE.BoxGeometry(armW, armT, baseW * 0.2), hornWhite);
            shortArm.position.set(0, 0.012, -baseW * 0.17);
            hornGroup.add(shortArm);
            const shortTip = new THREE.Mesh(new THREE.CylinderGeometry(baseW * 0.14, baseW * 0.14, armT, 14), hornWhite);
            shortTip.rotation.x = Math.PI / 2;
            shortTip.position.set(0, 0.012, -baseW * 0.3);
            hornGroup.add(shortTip);

            [-1, 1].forEach(sx => {
                const midArm = new THREE.Mesh(new THREE.BoxGeometry(baseW * 0.45, armT, armW), hornWhite);
                midArm.position.set(sx * baseW * 0.26, 0.012, 0);
                hornGroup.add(midArm);
                addHornHole(sx * 0.05, 0);
                addHornHole(sx * 0.11, 0);
            });

            g.add(hornGroup);

            const header = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.07, 0.09),
                new THREE.MeshStandardMaterial({ color: "#f5f5f4", roughness: 0.75 })
            );
            header.position.set(0, baseH * 0.42, -(baseD / 2 + 0.045));
            g.add(header);

            addThroughHolePins(g, [-baseW * 0.2, 0, baseW * 0.2], 0.04);

            return g;
        }

        function addL298nTerminal(group, cx, cz, pinCount, yBase) {
            const blue = new THREE.MeshStandardMaterial({ color: "#1d4ed8", roughness: 0.42 });
            const metal = partMetalMat();
            const pitch = partU(3.5);
            const w = pinCount * pitch + 0.038;
            const block = new THREE.Group();
            block.position.set(cx, yBase, cz);

            const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.11, 0.13), blue);
            block.add(base);
            const chamfer = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, 0.028, 0.048), blue);
            chamfer.position.set(0, 0.048, 0.042);
            block.add(chamfer);

            for (let p = 0; p < pinCount; p++) {
                const px = -w / 2 + 0.048 + p * pitch;
                const wireHole = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.011, 0.011, 0.028, 8),
                    new THREE.MeshBasicMaterial({ color: "#0f172a" })
                );
                wireHole.rotation.x = Math.PI / 2;
                wireHole.position.set(px, 0, 0.066);
                block.add(wireHole);
                const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.018, 8), metal);
                screw.position.set(px, 0.056, 0);
                block.add(screw);
            }
            group.add(block);
        }

        function buildMotorL298n(x = 5.5, z = 0) {
            const g = new THREE.Group();
            g.position.set(x, 0.1, z);

            const pcbW = PART_DIM.L298N_W;
            const pcbH = PART_DIM.L298N_H;
            const pcbD = PART_DIM.L298N_D;
            const metal = partMetalMat();
            const yTop = pcbH;

            const driverMat = new THREE.MeshStandardMaterial({ color: "#991b1b", roughness: 0.48, emissive: 0x000000, emissiveIntensity: 0 });
            const pcb = new THREE.Mesh(new THREE.BoxGeometry(pcbW, pcbH, pcbD), driverMat);
            pcb.name = 'driverBoard';
            pcb.position.y = yTop / 2;
            pcb.castShadow = true;
            g.add(pcb);

            [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
                const hx = sx * (pcbW / 2 - 0.042);
                const hz = sz * (pcbD / 2 - 0.042);
                const ring = new THREE.Mesh(new THREE.TorusGeometry(0.021, 0.004, 8, 16), metal);
                ring.rotation.x = Math.PI / 2;
                ring.position.set(hx, yTop + 0.002, hz);
                g.add(ring);
                const hole = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.015, 0.015, yTop + 0.012, 8),
                    new THREE.MeshBasicMaterial({ color: "#1e293b" })
                );
                hole.position.set(hx, yTop / 2, hz);
                g.add(hole);
            });

            const hsMat = new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.62, metalness: 0.15 });
            const hsZ = -pcbD / 2 + 0.12;
            const hs = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.17, 0.13), hsMat);
            hs.position.set(0, yTop + 0.085, hsZ);
            hs.castShadow = true;
            g.add(hs);

            for (let i = 0; i < 8; i++) {
                const finTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.022, 0.016), hsMat);
                finTop.position.set(0, yTop + 0.19 + i * 0.007, hsZ - 0.01);
                g.add(finTop);
            }
            for (let i = 0; i < 6; i++) {
                const finBack = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.15, 0.11), hsMat);
                finBack.position.set(-0.15 + i * 0.06, yTop + 0.085, hsZ - 0.08);
                g.add(finBack);
            }

            const icMat = new THREE.MeshStandardMaterial({ color: "#111827", roughness: 0.78 });
            const ic = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.19, 0.032), icMat);
            ic.position.set(0, yTop + 0.1, hsZ + 0.1);
            g.add(ic);

            const tab = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.028, 0.018), metal);
            tab.position.set(0, yTop + 0.21, hsZ + 0.1);
            g.add(tab);
            const tabHole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.011, 0.011, 0.032, 8),
                new THREE.MeshBasicMaterial({ color: "#0f172a" })
            );
            tabHole.rotation.z = Math.PI / 2;
            tabHole.position.set(0, yTop + 0.21, hsZ + 0.11);
            g.add(tabHole);

            for (let i = 0; i < 15; i++) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.055, 4), metal);
                leg.position.set(-0.04 + i * 0.0055, yTop + 0.022, hsZ + 0.1);
                g.add(leg);
            }

            const termY = yTop + 0.055;
            addL298nTerminal(g, -0.3, pcbD / 2 - 0.055, 2, termY);
            addL298nTerminal(g, 0.08, pcbD / 2 - 0.045, 3, termY);
            addL298nTerminal(g, 0.34, -pcbD / 2 + 0.075, 2, termY);

            const capMat = new THREE.MeshStandardMaterial({ color: "#c0c0c0", metalness: 0.72, roughness: 0.22 });
            [[-0.13, 0.04], [0.13, 0.04]].forEach(([cx, cz]) => {
                const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.13, 14), capMat);
                cap.position.set(cx, yTop + 0.072, cz);
                g.add(cap);
            });

            const dioMat = new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.85 });
            for (let i = 0; i < 4; i++) {
                const dLeft = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.011, 0.018), dioMat);
                dLeft.position.set(-pcbW / 2 + 0.075, yTop + 0.007, -0.18 + i * 0.048);
                g.add(dLeft);
                const dBack = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.011, 0.018), dioMat);
                dBack.position.set(0.24, yTop + 0.007, -pcbD / 2 + 0.13 + i * 0.042);
                g.add(dBack);
            }

            for (let i = 0; i < 8; i++) {
                const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.095, 6), metal);
                pin.position.set(pcbW / 2 - 0.055, yTop + 0.052, -0.19 + i * 0.052);
                g.add(pin);
            }

            const reg = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.016, 0.052), dioMat);
            reg.position.set(0.22, yTop + 0.01, 0.06);
            g.add(reg);

            [[-0.04, 0.14], [0.1, -0.1], [-0.18, 0.02]].forEach(([cx, cz]) => addSmdPad(g, cx, yTop + 0.004, cz, 0.038, 0.024));

            addThroughHolePins(g, [-pcbW * 0.42, -pcbD * 0.28, 0, pcbD * 0.28, pcbW * 0.42], 0.05);

            return g;
        }

        function buildDcMotor(x = 6.4, z = 0) {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);

            const mr = PART_DIM.MOTOR_R;
            const ml = PART_DIM.MOTOR_LEN;
            const bodyMat = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.55 });
            const cy = mr + 0.06;

            const body = new THREE.Mesh(new THREE.CylinderGeometry(mr, mr, ml, 18), bodyMat);
            body.rotation.z = Math.PI / 2;
            body.position.set(0, cy, 0);
            body.castShadow = true;
            g.add(body);

            const band = new THREE.Mesh(
                new THREE.CylinderGeometry(mr + 0.005, mr + 0.005, mr * 0.28, 18),
                new THREE.MeshStandardMaterial({ color: "#475569", metalness: 0.55, roughness: 0.35 })
            );
            band.rotation.z = Math.PI / 2;
            band.position.set(0, cy, 0);
            g.add(band);

            const endCap = new THREE.Mesh(
                new THREE.CylinderGeometry(mr * 0.72, mr * 0.72, 0.035, 16),
                new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.6 })
            );
            endCap.rotation.z = Math.PI / 2;
            endCap.position.set(-ml / 2 - 0.02, cy, 0);
            g.add(endCap);

            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.034, 0.034, ml * 0.42, 12),
                new THREE.MeshStandardMaterial({ color: "#e2e8f0", metalness: 0.92, roughness: 0.08 })
            );
            shaft.name = 'motorShaft';
            shaft.rotation.z = Math.PI / 2;
            shaft.position.set(ml / 2 + 0.04, cy, 0);
            [[0.1, 0], [0, 0.1], [-0.1, 0], [0, -0.1]].forEach(([py, pz]) => {
                const blade = new THREE.Mesh(
                    new THREE.BoxGeometry(0.12, 0.015, 0.015),
                    new THREE.MeshBasicMaterial({ color: "#ffffff" })
                );
                blade.position.set(0, py, pz);
                shaft.add(blade);
            });
            g.add(shaft);

            const termMat = new THREE.MeshStandardMaterial({ color: "#b45309", roughness: 0.55 });
            const termPlus = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.08), termMat);
            termPlus.position.set(0.05, cy - mr * 0.5, -mr * 0.85);
            g.add(termPlus);
            const termMinus = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.08), termMat);
            termMinus.position.set(-0.05, cy - mr * 0.5, -mr * 0.85);
            g.add(termMinus);

            const mount = new THREE.Mesh(
                new THREE.BoxGeometry(mr * 0.9, 0.022, mr * 1.4),
                new THREE.MeshStandardMaterial({ color: "#64748b", metalness: 0.7, roughness: 0.35 })
            );
            mount.position.set(0, 0.06, 0);
            g.add(mount);

            addThroughHolePins(g, [-mr * 0.55, mr * 0.55], 0.06);

            return g;
        }

        function buildRelay(x = 5.5, z = 1.5) {
            const g = new THREE.Group();
            g.position.set(x, 0.12, z);

            const rw = PART_DIM.RELAY_W;
            const rd = PART_DIM.RELAY_D;
            const pcb = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.05, rd), partPcbMat("#1e3a5f"));
            pcb.position.y = 0.12;
            pcb.castShadow = true;
            g.add(pcb);

            const relayMat = new THREE.MeshStandardMaterial({ color: "#1d4ed8", roughness: 0.4 });
            const coil = new THREE.Mesh(new THREE.BoxGeometry(rw * 0.62, rw * 0.62, rd * 0.58), relayMat);
            coil.position.set(-0.03, 0.28, 0);
            coil.castShadow = true;
            g.add(coil);

            const cover = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.04, 0.44),
                new THREE.MeshStandardMaterial({ color: "#3b82f6", roughness: 0.35, transparent: true, opacity: 0.75 })
            );
            cover.position.set(-0.04, 0.52, 0);
            g.add(cover);

            const ledSocket = new THREE.Mesh(
                new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12),
                new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.8 })
            );
            ledSocket.rotation.x = Math.PI / 2;
            ledSocket.position.set(0.2, 0.2, 0.32);
            g.add(ledSocket);

            const led = new THREE.Mesh(
                new THREE.SphereGeometry(0.028, 10, 10),
                new THREE.MeshStandardMaterial({ color: "#7f1d1d", emissive: 0x000000, emissiveIntensity: 0 })
            );
            led.name = 'relayLed';
            led.position.set(0.2, 0.22, 0.34);
            g.add(led);

            const termMat = new THREE.MeshStandardMaterial({ color: "#94a3b8", metalness: 0.75, roughness: 0.3 });
            [-0.22, 0.22].forEach(px => {
                const term = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.08), termMat);
                term.position.set(px, 0.18, -0.38);
                g.add(term);
            });

            addThroughHolePins(g, [-rw * 0.32, 0, rw * 0.32], 0.02);

            return g;
        }

        function rebuildWiresIn3D(wiresData) {
            activeWireMeshes.forEach(wire => scene.remove(wire));
            activeWireMeshes = [];

            wiresData.forEach(wire => {
                const vectorList = wire.path.map(p => new THREE.Vector3(p[0], p[1], p[2]));
                const path = new THREE.CatmullRomCurve3(vectorList);
                const geom = new THREE.TubeGeometry(path, 32, 0.06, 8, false);
                const mat = new THREE.MeshStandardMaterial({
                    color: wire.color,
                    roughness: 0.6,
                    metalness: 0.1
                });
                const tube = new THREE.Mesh(geom, mat);
                tube.name = wire.type;
                scene.add(tube);
                activeWireMeshes.push(tube);
            });
        }


        // ========================================================
        // SIMULATION EXECUTION RUNTIME LOOP
        // ========================================================
        function toggleSimulation() {
            const finalIndex = PRESETS[activePreset].steps.length - 1;
            if(activeStep < finalIndex) {
                activeStep = finalIndex;
                renderCurrentStep();
                updateComponentVisibilities();
            }

            const btn = document.getElementById("btn-simulation");
            if(isSimulating) {
                isSimulating = false;
                btn.innerHTML = `<i class="fa-solid fa-play"></i> Run Sandbox`;
                btn.className = "flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 px-4 py-3.5 rounded-2xl font-semibold text-sm shadow-xl shadow-emerald-900/10 cursor-pointer";

                clearInterval(simInterval);
                stopOscilloscope();
                resetAllComponentOutputs();
                stopBuzzerTone();
                resetFreeBuildState();
                syncFreeBuildControlUI();
                resetPlacedSensorVisuals();
                if (isFreeBuildMode) {
                    hideFreeBuildControlWrappers();
                    document.getElementById("interactive-hardware-control")?.classList.add('hidden');
                } else {
                    buildInteractiveControls();
                }
            } else {
                isSimulating = true;
                btn.innerHTML = `<i class="fa-solid fa-pause"></i> Halt Sandbox`;
                btn.className = "flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white transition-all duration-300 px-4 py-3.5 rounded-2xl font-semibold text-sm shadow-xl shadow-amber-900/10 cursor-pointer";

                if (isFreeBuildMode) {
                    buildFreeBuildInteractiveControls();
                } else {
                    buildInteractiveControls();
                }
                updatePlacedSensorVisuals();
                runSimulationInterval();
                startOscilloscope();
            }
        }

        function runSimulationInterval() {
            let ticker = false;
            simInterval = setInterval(() => {
                if(!isSimulating) return;

                if (isFreeBuildMode) {
                    const types = new Set(placedComponents.map(g => g.userData.type));
                    if (types.has('dht11')) appendSerial(`DHT11 → Temp: ${freeBuildState.activeTempC}°C  Humidity: ${freeBuildState.activeHumidity}%`);
                    if (types.has('hcsr04')) appendSerial(`HC-SR04 → Distance: ${freeBuildState.activeDistanceCm} cm`);
                    if (types.has('pir')) appendSerial(`PIR → ${freeBuildState.activePirMotion ? 'MOTION detected' : 'No motion'}`);
                    if (types.has('servo')) appendSerial(`Servo → Angle: ${freeBuildState.activeServoAngle}°`);
                    if (types.has('dc_motor')) {
                        const dir = freeBuildState.activeMotorSpeed >= 0 ? 'FWD' : 'REV';
                        appendSerial(`DC Motor → ${dir} speed: ${Math.abs(freeBuildState.activeMotorSpeed)}%`);
                    }
                    if (types.has('l298n') && freeBuildState.activeMotorSpeed !== 0) {
                        const dir = freeBuildState.activeMotorSpeed >= 0 ? 'FWD' : 'REV';
                        appendSerial(`L298N → H-bridge ${dir} (${Math.abs(freeBuildState.activeMotorSpeed)}%)`);
                    }
                    if (types.has('relay')) appendSerial(`Relay → ${freeBuildState.activeRelayOn ? 'ON (energized)' : 'OFF'}`);
                    if (!FREE_BUILD_INTERACTIVE_TYPES.some(t => types.has(t))) {
                        appendSerial('Free build: place a sensor or actuator to see activity');
                    }
                    updatePlacedSensorVisuals();
                }
                else if(activePreset === "blink") {
                    ticker = !ticker;
                    setLEDOutput(ticker);
                    appendSerial(ticker ? "LED: ON" : "LED: OFF");
                }
                else if (activePreset === "night") {
                    const on = activeLdrLevel < 40;
                    setLEDOutput(on);
                    appendSerial(`LDR: ${activeLdrLevel}% → LED ${on ? 'ON' : 'OFF'}`);
                }
                else if (activePreset === "button") {
                    setLEDOutput(activeButtonState);
                    appendSerial(activeButtonState ? "Button: PRESSED → LED ON" : "Button: released");
                }
                else if (activePreset === "alarm") {
                    ticker = !ticker;
                    setBuzzerOutput(ticker, ticker ? 880 : 440);
                    appendSerial(ticker ? "Buzzer: BEEP (880 Hz)" : "Buzzer: silence (440 Hz)");
                }
                else {
                    appendSerial("Simulation tick");
                }

            }, 500);
        }

        function setLEDOutput(state) {
            const led = customMeshes["led"];
            if (!led) return;

            const emissiveMap = { red: 0xef4444, green: 0x22c55e, blue: 0x3b82f6 };
            const hex = state ? (emissiveMap[led.userData.variant] || emissiveMap.red) : 0x000000;
            led.traverse(ch => {
                if ((ch.name === "ledDome" || ch.name === "ledTip") && ch.material) {
                    ch.material.emissive.setHex(hex);
                }
            });
            const light = led.getObjectByName("ledGlow");
            if (light) light.intensity = state ? 1.8 : 0;
        }

        function setBuzzerOutput(state, freq) {
            const buzzer = customMeshes["buzzer"];
            if(!buzzer) return;
            if(state) {
                buzzer.position.y = 0.05;
                renderer.setClearColor(new THREE.Color("#fef3c7"), 1.0);
                startBuzzerTone(freq || 880);
            } else {
                buzzer.position.y = 0;
                renderer.setClearColor(new THREE.Color("#e8edf2"), 1.0);
                stopBuzzerTone();
            }
        }

        function resetAllComponentOutputs() {
            setLEDOutput(false);
            setBuzzerOutput(false);
            renderer.setClearColor(new THREE.Color("#e8edf2"), 1.0);
            resetPlacedSensorVisuals();
        }

        function resetSonarEyes(mesh) {
            if (!mesh || !mesh.material) return;
            mesh.scale.set(1, 1, 1);
            mesh.material.emissive.setHex(0x000000);
            mesh.material.emissiveIntensity = 0.2;
        }

        function resetPlacedSensorVisuals() {
            placedComponents.forEach(g => {
                g.traverse(child => {
                    if (child.name === 'dhtBody' && child.material) {
                        child.material.emissive.setHex(0x000000);
                        child.material.emissiveIntensity = 0.15;
                    }
                    if (child.name === 'sonarEye' || child.name === 'sonarEyeLeft' || child.name === 'sonarEyeRight') {
                        resetSonarEyes(child);
                    }
                    if (child.name === 'pirDome' && child.material) {
                        child.material.emissive.setHex(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                    if (child.name === 'servoHorn') {
                        child.rotation.y = 0;
                    }
                    if (child.name === 'driverBoard' && child.material) {
                        child.material.emissive.setHex(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                    if (child.name === 'motorShaft') {
                        child.rotation.x = 0;
                    }
                    if (child.name === 'relayLed' && child.material) {
                        child.material.emissive.setHex(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                });
            });
        }

        function updatePlacedSensorVisuals() {
            const tempT = freeBuildState.activeTempC / 50;
            const nearObstacle = freeBuildState.activeDistanceCm < 50;
            const pulsate = (Math.sin(Date.now() * 0.01) + 1) / 2;

            placedComponents.forEach(g => {
                if (g.userData.type === 'dht11') {
                    g.traverse(child => {
                        if (child.name === 'dhtBody' && child.material) {
                            child.material.emissive.setRGB(tempT * 0.5, 0, 0);
                            child.material.emissiveIntensity = 0.2 + tempT * 0.4;
                        }
                    });
                }
                if (g.userData.type === 'hcsr04') {
                    const applyEye = (eye) => {
                        if (!eye || !eye.material) return;
                        if (nearObstacle) {
                            eye.material.emissive.setRGB(0, pulsate * 0.4, pulsate * 0.4);
                            eye.material.emissiveIntensity = 0.5;
                            eye.scale.set(1, 1, 1.12);
                        } else {
                            eye.material.emissive.setHex(0x000000);
                            eye.material.emissiveIntensity = 0.2;
                            eye.scale.set(1, 1, 1);
                        }
                    };
                    applyEye(g.getObjectByName('sonarEyeLeft'));
                    applyEye(g.getObjectByName('sonarEyeRight'));
                    g.traverse(child => {
                        if (child.name === 'sonarEye') applyEye(child);
                    });
                }
                if (g.userData.type === 'pir') {
                    g.traverse(child => {
                        if (child.name === 'pirDome' && child.material) {
                            if (freeBuildState.activePirMotion) {
                                child.material.emissive.setHex(0xef4444);
                                child.material.emissiveIntensity = 0.6;
                            } else {
                                child.material.emissive.setHex(0x000000);
                                child.material.emissiveIntensity = 0;
                            }
                        }
                    });
                }
                if (g.userData.type === 'servo') {
                    const angleRad = (freeBuildState.activeServoAngle - 90) * Math.PI / 180;
                    g.traverse(child => {
                        if (child.name === 'servoHorn') {
                            child.rotation.y = angleRad;
                        }
                    });
                }
                if (g.userData.type === 'l298n') {
                    const running = freeBuildState.activeMotorSpeed !== 0;
                    g.traverse(child => {
                        if (child.name === 'driverBoard' && child.material) {
                            child.material.emissive.setRGB(0, running ? 0.2 : 0, 0);
                            child.material.emissiveIntensity = running ? 0.35 : 0;
                        }
                    });
                }
                if (g.userData.type === 'relay') {
                    g.traverse(child => {
                        if (child.name === 'relayLed' && child.material) {
                            if (freeBuildState.activeRelayOn) {
                                child.material.emissive.setHex(0x00ff00);
                                child.material.emissiveIntensity = 0.8;
                            } else {
                                child.material.emissive.setHex(0x000000);
                                child.material.emissiveIntensity = 0;
                            }
                        }
                    });
                }
            });
        }

        function handleDhtTemp(val) {
            freeBuildState.activeTempC = parseInt(val, 10);
            const el = document.getElementById('dht-temp-val');
            if (el) el.textContent = `${freeBuildState.activeTempC}°C`;
            updatePlacedSensorVisuals();
        }

        function handleDhtHumidity(val) {
            freeBuildState.activeHumidity = parseInt(val, 10);
            const el = document.getElementById('dht-hum-val');
            if (el) el.textContent = `${freeBuildState.activeHumidity}%`;
            updatePlacedSensorVisuals();
        }

        function handleDistanceSlider(val) {
            freeBuildState.activeDistanceCm = parseInt(val, 10);
            const el = document.getElementById('distance-val');
            if (el) el.textContent = `${freeBuildState.activeDistanceCm} cm`;
            updatePlacedSensorVisuals();
        }

        function handlePirMotion(isActive) {
            freeBuildState.activePirMotion = isActive;
            updatePlacedSensorVisuals();
        }

        function handleServoAngle(val) {
            freeBuildState.activeServoAngle = parseInt(val, 10);
            const el = document.getElementById('servo-angle-val');
            if (el) el.textContent = `${freeBuildState.activeServoAngle}°`;
            updatePlacedSensorVisuals();
        }

        function handleMotorSpeed(val) {
            freeBuildState.activeMotorSpeed = parseInt(val, 10);
            const el = document.getElementById('motor-speed-val');
            if (el) {
                const dir = freeBuildState.activeMotorSpeed >= 0 ? 'FWD' : 'REV';
                el.textContent = freeBuildState.activeMotorSpeed === 0 ? '0%' : `${dir} ${Math.abs(freeBuildState.activeMotorSpeed)}%`;
            }
            updatePlacedSensorVisuals();
        }

        function handleRelayToggle(isOn) {
            freeBuildState.activeRelayOn = isOn;
            updatePlacedSensorVisuals();
        }

        function handleHardwareSlider(val) {
            activeLdrLevel = parseInt(val);
            document.getElementById("slider-val").textContent = `${activeLdrLevel}%`;

            const ldr = customMeshes["ldr"];
            if(ldr) {
                ldr.rotation.y = (activeLdrLevel / 100) * Math.PI;
            }
        }

        function handleHardwareButton(isPressed) {
            activeButtonState = isPressed;
            const cap = customMeshes["button"]?.getObjectByName("buttonCap");
            if (cap) {
                const rest = cap.userData.restY ?? cap.position.y;
                cap.position.y = isPressed ? rest - partU(0.9) : rest;
            }
        }

        function renderLoop() {
            requestAnimationFrame(renderLoop);
            const now = performance.now();
            const dt = (now - lastRenderTime) / 1000;
            lastRenderTime = now;
            controls.update();

            if(customMeshes["board"]) {
                customMeshes["board"].position.y = Math.sin(now * 0.0015) * 0.05;
            }
            if(customMeshes["breadboard"]) {
                customMeshes["breadboard"].position.y = Math.sin(now * 0.0015) * 0.05;
            }

            if (isSimulating && freeBuildState.activeMotorSpeed !== 0) {
                placedComponents.forEach(g => {
                    if (g.userData.type !== 'dc_motor') return;
                    g.traverse(child => {
                        if (child.name === 'motorShaft') {
                            child.rotation.x += freeBuildState.activeMotorSpeed * 0.08 * dt;
                        }
                    });
                });
            }

            renderer.render(scene, camera);
        }

        // ========================================================
        // PARTS LIBRARY — Free Build Mode
        // ========================================================

        /** Utility: snap a world coordinate to the nearest grid step */
        function snapToGrid(x, z, g = 0.5) {
            return { x: Math.round(x / g) * g, z: Math.round(z / g) * g };
        }

        /** Convert a DOM drop/click event's pixel coords to 3D world position on y=0 plane */
        function getDropWorldPosition(e) {
            const rect = document.getElementById('canvas-view').getBoundingClientRect();
            const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            const ray = new THREE.Raycaster();
            ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
            const target = new THREE.Vector3();
            return ray.ray.intersectPlane(groundPlane, target) ? target : null;
        }

        /** Factory: instantiate any component by type, place it in the scene */
        function createComponent(type, variant, x, z) {
            const key = variant ? `${type}_${variant}` : type;
            componentCounters[key] = (componentCounters[key] || 0) + 1;
            const instanceId = `${key}_${componentCounters[key]}`;

            let group;
            switch (type) {
                case 'arduino':    group = buildArduinoBoard(x, z); break;
                case 'esp32':      group = buildESP32(x, z); break;
                case 'breadboard': group = buildBreadboard(x, z); break;
                case 'led':        group = buildLED(x, z, variant || 'red'); break;
                case 'buzzer':     group = buildPiezoBuzzer(x, z); break;
                case 'button':     group = buildButton(x, z); break;
                case 'ldr':          group = buildLDR(x, z); break;
                case 'dht11':        group = buildDHT11(x, z); break;
                case 'hcsr04':       group = buildHCSR04(x, z); break;
                case 'pir':          group = buildPIR(x, z); break;
                case 'servo':        group = buildServo(x, z); break;
                case 'l298n':        group = buildMotorL298n(x, z); break;
                case 'dc_motor':     group = buildDcMotor(x, z); break;
                case 'relay':        group = buildRelay(x, z); break;
                case 'resistor':     group = buildResistor(x, z, variant || '220'); break;
                case 'capacitor':    group = buildCapacitor(x, z, variant || 'electrolytic'); break;
                case 'potentiometer':group = buildPotentiometer(x, z); break;
                case 'thermistor':   group = buildThermistor(x, z); break;
                case 'transistor':   group = buildTransistor(x, z, variant || 'NPN'); break;
                default: return null;
            }

            group.userData = { instanceId, type, variant: variant || null, isFreePlaced: true };
            scene.add(group);
            attachPinSpheres(group);
            if (isWireMode) group.traverse(c => { if (c.userData.isPinSphere) c.visible = true; });
            placedComponents.push(group);
            saveUndoSnapshot();
            return group;
        }

        /** Fired on dragstart of a part card */
        function onPartDragStart(e) {
            const card = e.currentTarget;
            draggedPartData = {
                type: card.dataset.partType,
                variant: card.dataset.partVariant || null
            };
            e.dataTransfer.effectAllowed = 'copy';
            card.classList.add('dragging');
            setTimeout(() => card.classList.remove('dragging'), 0);
        }

        /** Click on canvas: select hit component, deselect if empty */
        /** Shared raycaster: find the free-placed group under a pointer event, or null */
        function raycastPlacedComponents(e) {
            if (!placedComponents.length) return null;
            const rect = renderer.domElement.getBoundingClientRect();
            const ray = new THREE.Raycaster();
            ray.setFromCamera(new THREE.Vector2(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -((e.clientY - rect.top) / rect.height) * 2 + 1
            ), camera);
            const allMeshes = [];
            placedComponents.forEach(g => g.traverse(c => { if (c.isMesh) allMeshes.push(c); }));
            const hits = ray.intersectObjects(allMeshes, false);
            if (!hits.length) return null;
            let obj = hits[0].object;
            while (obj.parent && !obj.userData.isFreePlaced) obj = obj.parent;
            return obj.userData.isFreePlaced ? obj : null;
        }

        /** pointerdown — grab a component to drag, or let OrbitControls handle it */
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

            // ── Normal drag / select ──
            if (!isFreeBuildMode) return;
            closeCtxMenu();
            const hit = raycastPlacedComponents(e);
            if (!hit) return;                       // nothing hit → OrbitControls takes over

            e.stopPropagation();                    // prevent OrbitControls from also starting
            renderer.domElement.setPointerCapture(e.pointerId);
            dragComponent  = hit;
            dragHasMoved   = false;
            pointerDownPos = { x: e.clientX, y: e.clientY };
            controls.enabled = false;               // disable orbit while dragging
        }

        /** pointermove — move the grabbed component, or update hover cursor */
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
                            tt.textContent   = pinSphere.userData.pinName;
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

            if (dragComponent) {
                const dx = e.clientX - pointerDownPos.x;
                const dz = e.clientY - pointerDownPos.y;
                if (!dragHasMoved && (dx * dx + dz * dz) > DRAG_PX_THRESHOLD * DRAG_PX_THRESHOLD) {
                    dragHasMoved = true;
                    selectComponent(dragComponent);
                    renderer.domElement.style.cursor = 'grabbing';
                }
                if (!dragHasMoved) return;

                const pos = getDropWorldPosition(e);
                if (pos) {
                    dragComponent.position.x = pos.x;
                    dragComponent.position.z = pos.z;
                }
                return;
            }

            // Hover cursor — grab hand when over a movable part
            if (!isFreeBuildMode) return;
            renderer.domElement.style.cursor = raycastPlacedComponents(e) ? 'grab' : '';
        }

        /** pointerup — finalise drag (snap to grid) or treat as a click (select/deselect) */
        function onCanvasPointerUp(e) {
            if (e.button !== 0) return;

            if (dragComponent) {
                controls.enabled = true;
                renderer.domElement.style.cursor = 'grab';

                if (dragHasMoved) {
                    // Snap to grid and update sidebar list
                    const s = snapToGrid(dragComponent.position.x, dragComponent.position.z);
                    dragComponent.position.x = s.x;
                    dragComponent.position.z = s.z;
                    rebuildAllPlacedWires();   // keep wires attached after move
                    saveUndoSnapshot();
                    refreshPlacedList();
                } else {
                    // Didn't actually move — treat as a plain click
                    const already = selectedComponent === dragComponent;
                    already ? deselectComponent() : selectComponent(dragComponent);
                }

                dragComponent = null;
                dragHasMoved  = false;
            } else if (isFreeBuildMode) {
                // Clicked on empty canvas → deselect
                const hit = raycastPlacedComponents(e);
                hit ? selectComponent(hit) : deselectComponent();
            }
        }

        /** Highlight a free-placed component */
        function selectComponent(group) {
            deselectComponent();
            selectedComponent = group;
            group.traverse(c => {
                if (c.isMesh && c.material && c.material.emissive) {
                    c.userData._origEmissive = c.material.emissive.getHex();
                    c.userData._origEmissiveIntensity = c.material.emissiveIntensity || 0;
                    c.material.emissive.setHex(0x334155);
                    c.material.emissiveIntensity = 0.45;
                }
            });
            refreshPlacedList();
        }

        /** Remove highlight from currently selected component */
        function deselectComponent() {
            if (!selectedComponent) return;
            selectedComponent.traverse(c => {
                if (c.isMesh && c.material && c.userData._origEmissive !== undefined) {
                    c.material.emissive.setHex(c.userData._origEmissive);
                    c.material.emissiveIntensity = c.userData._origEmissiveIntensity;
                }
            });
            selectedComponent = null;
            refreshPlacedList();
        }

        /** Remove the currently selected free-placed component */
        function deleteSelectedComponent() {
            if (!selectedComponent) return;
            saveUndoSnapshot();
            removeWiresForComponent(selectedComponent.userData.instanceId);
            scene.remove(selectedComponent);
            placedComponents.splice(placedComponents.indexOf(selectedComponent), 1);
            selectedComponent = null;
            refreshPlacedList();
            updateUndoRedoUI();
        }

        /** Remove a free-placed component by its unique instanceId */
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

        /** Switch between Parts Library, Firmware IDE, and Serial Monitor tabs (right panel) */
        function switchTab(tabName) {
            activeTab = tabName;

            const panels = { parts: 'panel-parts', ide: 'panel-ide', serial: 'panel-serial', scope: 'panel-scope' };
            Object.entries(panels).forEach(([key, id]) => {
                const el = document.getElementById(id);
                if (!el) return;
                const show = key === tabName;
                el.classList.toggle('hidden', !show);
                el.classList.toggle('flex', show);
            });

            // Update header label
            const iconEl     = document.getElementById('right-panel-icon');
            const titleEl    = document.getElementById('right-panel-title');
            const subtitleEl = document.getElementById('right-panel-subtitle');
            if (tabName === 'parts') {
                iconEl.innerHTML       = '<i class="fa-solid fa-boxes-stacked text-sm"></i>';
                titleEl.textContent    = 'Parts Library';
                subtitleEl.textContent = 'Drag to place';
            } else if (tabName === 'ide') {
                iconEl.innerHTML       = '<i class="fa-solid fa-code text-sm"></i>';
                titleEl.textContent    = 'Firmware IDE';
                subtitleEl.textContent = 'Arduino C++';
            } else if (tabName === 'scope') {
                iconEl.innerHTML       = '<i class="fa-solid fa-wave-square text-sm"></i>';
                titleEl.textContent    = 'Oscilloscope';
                subtitleEl.textContent = '100 ms/div';
            } else {
                iconEl.innerHTML       = '<i class="fa-solid fa-terminal text-sm"></i>';
                titleEl.textContent    = 'Serial Monitor';
                subtitleEl.textContent = '9600 baud';
            }

            // Update tab button styles
            ['parts', 'ide', 'serial', 'scope'].forEach(t => {
                const btn = document.getElementById(`tab-${t}`);
                if (!btn) return;
                const active = t === tabName;
                btn.classList.toggle('border-blue-600', active);
                btn.classList.toggle('text-blue-700', active);
                btn.classList.toggle('bg-blue-50', active);
                btn.classList.toggle('border-transparent', !active);
                btn.classList.toggle('text-slate-500', !active);
            });

            if (tabName === 'parts') {
                enterFreeBuildMode();
            } else if (tabName !== 'serial' && tabName !== 'scope') {
                enterPresetMode();
            }

            // If switching to Scope while simulation is running, hook up the oscilloscope
            if (tabName === 'scope' && isSimulating) {
                startOscilloscope();
            }
        }

        /** Activate free-build sandbox: hide preset components, show placed ones */
        function enterFreeBuildMode() {
            isFreeBuildMode = true;
            Object.values(customMeshes).forEach(m => { if (m) m.visible = false; });
            activeWireMeshes.forEach(w => { w.visible = false; });
            placedComponents.forEach(g => { g.visible = true; });
            if (isWireMode) setPinSpheresVisible(true);
            if (isSimulating) toggleSimulation();
            hideFreeBuildControlWrappers();
            document.getElementById("interactive-hardware-control")?.classList.add('hidden');
            glideCamera({ x: 0, y: 15, z: 8 }, { x: 0, y: 0, z: 0 });
            // Baseline snapshot so first undo returns to empty canvas
            if (undoStack.length === 0) saveUndoSnapshot();
        }

        /** Return to guided preset mode: hide free-placed, restore preset visibility */
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
            setPinSpheresVisible(false);
            placedComponents.forEach(g => { g.visible = false; });
            deselectComponent();
            hideFreeBuildControlWrappers();
            if (!isSimulating) buildInteractiveControls();
            updateComponentVisibilities();
        }

        /** Build part card UI — called once on load */
        function buildPartsLibraryUI() {
            PARTS_REGISTRY.forEach(part => {
                const container = document.getElementById(`cat-${part.category}`);
                if (!container) return;

                const card = document.createElement('div');
                card.className = [
                    'part-card', 'group', 'flex', 'flex-col', 'items-center', 'justify-center',
                    'gap-1.5', 'p-3', 'bg-white', 'border', 'border-slate-200', 'rounded-xl',
                    'cursor-grab', 'hover:border-indigo-300', 'hover:shadow-md',
                    'hover:shadow-indigo-100', 'active:cursor-grabbing', 'active:scale-95',
                    'transition-all', 'duration-150', 'select-none'
                ].join(' ');

                card.draggable = true;
                card.dataset.partType = part.type;
                card.dataset.partVariant = part.variant || '';

                card.innerHTML = `
                    <div class="w-8 h-8 ${part.bg} ${part.color} rounded-lg flex items-center justify-center shrink-0">
                        <i class="fa-solid ${part.icon} text-sm"></i>
                    </div>
                    <span class="text-[10px] font-semibold text-slate-600 text-center leading-tight">${part.label}</span>
                `;
                card.addEventListener('dragstart', onPartDragStart);
                container.appendChild(card);
            });
        }

        /** Filter part cards by search query */
        function filterParts(query) {
            const q = query.toLowerCase();
            document.querySelectorAll('.part-card').forEach(card => {
                const label = card.querySelector('span');
                card.style.display = (label && label.textContent.toLowerCase().includes(q)) ? '' : 'none';
            });
        }

        /** Re-render the Placed Components list in the sidebar */
        function refreshPlacedList() {
            const list = document.getElementById('placed-list');
            const section = document.getElementById('placed-list-section');
            const countEl = document.getElementById('placed-count');
            if (!list || !section || !countEl) return;

            countEl.textContent = placedComponents.length;
            list.innerHTML = '';
            section.classList.toggle('hidden', placedComponents.length === 0);

            placedComponents.forEach(g => {
                const row = document.createElement('div');
                const sel = g === selectedComponent;
                row.className = [
                    'flex', 'items-center', 'justify-between', 'px-2.5', 'py-1.5',
                    'rounded-lg', 'text-xs', 'cursor-pointer', 'transition-all',
                    sel ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                        : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'
                ].join(' ');

                const label = g.userData.variant
                    ? `${g.userData.type} (${g.userData.variant})`
                    : g.userData.type;

                const iid = g.userData.instanceId;
                row.innerHTML = `
                    <span class="font-medium truncate capitalize">${label}</span>
                    <button onclick="event.stopPropagation();deleteComponentById('${iid}')"
                        class="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 transition shrink-0">
                        <i class="fa-solid fa-trash-can text-[10px]"></i>
                    </button>
                `;
                row.addEventListener('click', () => selectComponent(g));
                list.appendChild(row);
            });
        }

        // ========================================================
        // RIGHT-CLICK CONTEXT MENU
        // ========================================================

        let ctxTarget = null; // the THREE.Group that was right-clicked

        /** Raycast on right-click; show context menu if a free-placed component is hit */
        function onCanvasRightClick(e) {
            e.preventDefault();
            closeCtxMenu();
            if (!isFreeBuildMode) return;
            const hit = raycastPlacedComponents(e);
            if (!hit) return;
            ctxTarget = hit;
            selectComponent(hit);
            openCtxMenu(e.clientX, e.clientY, hit);
        }

        /** Position and populate the context menu */
        function openCtxMenu(x, y, group) {
            const menu = document.getElementById('ctx-menu');
            const ud = group.userData;

            // Header
            const label = ud.variant ? `${ud.type} (${ud.variant})` : ud.type;
            document.getElementById('ctx-type').textContent = label;
            document.getElementById('ctx-id').textContent   = ud.instanceId;

            // Info fields
            document.getElementById('ci-type').textContent     = ud.type;
            document.getElementById('ci-variant').textContent  = ud.variant || '—';
            document.getElementById('ci-x').textContent        = group.position.x.toFixed(2);
            document.getElementById('ci-z').textContent        = group.position.z.toFixed(2);
            document.getElementById('ci-instance').textContent = ud.instanceId;

            // Reset info toggle
            document.getElementById('ctx-info-block').classList.remove('open');
            document.getElementById('ctx-info-label').textContent = 'Show Info';

            // Place menu — keep it inside viewport
            const menuW = 190, menuH = 230;
            const vw = window.innerWidth, vh = window.innerHeight;
            menu.style.left = (x + menuW > vw ? x - menuW : x) + 'px';
            menu.style.top  = (y + menuH > vh ? y - menuH : y) + 'px';
            menu.classList.add('visible');
        }

        function closeCtxMenu() {
            document.getElementById('ctx-menu').classList.remove('visible');
            ctxTarget = null;
        }

        /** Toggle the info sub-panel inside the context menu */
        function toggleCtxInfo() {
            const block = document.getElementById('ctx-info-block');
            const lbl   = document.getElementById('ctx-info-label');
            const open  = block.classList.toggle('open');
            lbl.textContent = open ? 'Hide Info' : 'Show Info';
        }

        /** Select the right-clicked component (already done on open, but makes it explicit) */
        function ctxSelect() {
            if (ctxTarget) selectComponent(ctxTarget);
            closeCtxMenu();
        }

        /** Delete the right-clicked component */
        function ctxDelete() {
            if (!ctxTarget) return;
            saveUndoSnapshot();
            scene.remove(ctxTarget);
            placedComponents.splice(placedComponents.indexOf(ctxTarget), 1);
            if (selectedComponent === ctxTarget) selectedComponent = null;
            ctxTarget = null;
            closeCtxMenu();
            refreshPlacedList();
            updateUndoRedoUI();
        }

        // ========================================================
        // UNDO / REDO
        // ========================================================
        function currentSnapshot() {
            return {
                components: placedComponents.map(g => ({
                    type: g.userData.type,
                    variant: g.userData.variant || null,
                    x: parseFloat(g.position.x.toFixed(3)),
                    z: parseFloat(g.position.z.toFixed(3)),
                    instanceId: g.userData.instanceId
                })),
                counters: { ...componentCounters },
                selectedId: selectedComponent ? selectedComponent.userData.instanceId : null
            };
        }

        function saveUndoSnapshot() {
            if (_inRestore) return;
            undoStack.push(currentSnapshot());
            if (undoStack.length > UNDO_MAX) undoStack.shift();
            redoStack = [];
            updateUndoRedoUI();
        }

        function restoreSnapshot(snap) {
            _inRestore = true;
            placedComponents.forEach(g => scene.remove(g));
            placedComponents = [];
            selectedComponent = null;
            componentCounters = { ...snap.counters };
            snap.components.forEach(c => {
                const g = createComponent(c.type, c.variant, c.x, c.z);
                if (g) g.userData.instanceId = c.instanceId;
            });
            if (snap.selectedId) {
                const target = placedComponents.find(g => g.userData.instanceId === snap.selectedId);
                if (target) selectComponent(target);
            }
            _inRestore = false;
            refreshPlacedList();
            updateUndoRedoUI();
        }

        function undo() {
            if (!undoStack.length) return;
            redoStack.push(currentSnapshot());
            restoreSnapshot(undoStack.pop());
            showToast("Undo", false);
        }

        function redo() {
            if (!redoStack.length) return;
            undoStack.push(currentSnapshot());
            restoreSnapshot(redoStack.pop());
            showToast("Redo", false);
        }

        function updateUndoRedoUI() {
            const uBtn = document.getElementById('btn-undo');
            const rBtn = document.getElementById('btn-redo');
            if (uBtn) uBtn.disabled = undoStack.length === 0;
            if (rBtn) rBtn.disabled = redoStack.length === 0;
        }

        // ========================================================
        // DARK MODE
        // ========================================================
        function toggleDarkMode() {
            const isDark = document.body.classList.toggle('dark');
            localStorage.setItem('iotify-theme', isDark ? 'dark' : 'light');
            const icon = document.querySelector('#dark-toggle-btn i');
            if (icon) icon.className = isDark ? 'fa-solid fa-sun text-xs' : 'fa-solid fa-moon text-xs';
        }

        function initTheme() {
            const saved = localStorage.getItem('iotify-theme');
            if (saved === 'dark') {
                document.body.classList.add('dark');
                const icon = document.querySelector('#dark-toggle-btn i');
                if (icon) icon.className = 'fa-solid fa-sun text-xs';
            }
        }

        // ========================================================
        // KEYBOARD SHORTCUTS OVERLAY
        // ========================================================
        function toggleShortcutsOverlay() {
            document.getElementById('shortcuts-overlay').classList.toggle('open');
        }

        // ========================================================
        // COMMUNITY PRESET LIBRARY
        // ========================================================

        // Initialize community circuits storage
        function initCommunityLibrary() {
            if (!localStorage.getItem('communityCircuits')) {
                // Add some sample community circuits
                const sampleCircuits = [
                    {
                        id: 'comm_001',
                        title: 'Smart Plant Watering System',
                        description: 'Automatically waters plants based on soil moisture levels using a sensor and relay-controlled pump.',
                        author: 'GreenThumb_Dev',
                        category: 'automation',
                        tags: ['arduino', 'sensors', 'automation', 'plants'],
                        rating: 4.5,
                        downloads: 342,
                        publishedDate: '2026-05-15',
                        circuit: null // Would contain actual circuit data
                    },
                    {
                        id: 'comm_002',
                        title: 'RGB Mood Lamp',
                        description: 'Color-changing LED lamp controlled by buttons. Cycles through rainbow colors with smooth transitions.',
                        author: 'LightMaster',
                        category: 'education',
                        tags: ['led', 'rgb', 'beginner', 'lighting'],
                        rating: 4.8,
                        downloads: 567,
                        publishedDate: '2026-05-18',
                        circuit: null
                    },
                    {
                        id: 'comm_003',
                        title: 'Door Security Alarm',
                        description: 'Triggers a buzzer alarm when a door is opened using a magnetic reed switch sensor.',
                        author: 'SecureHome',
                        category: 'iot',
                        tags: ['security', 'buzzer', 'sensor', 'alarm'],
                        rating: 4.3,
                        downloads: 289,
                        publishedDate: '2026-05-10',
                        circuit: null
                    },
                    {
                        id: 'comm_004',
                        title: 'Temperature Monitor with Display',
                        description: 'Displays real-time temperature readings on an LCD screen using a DHT11 sensor.',
                        author: 'TempTracker',
                        category: 'sensors',
                        tags: ['temperature', 'lcd', 'dht11', 'monitoring'],
                        rating: 4.6,
                        downloads: 421,
                        publishedDate: '2026-05-12',
                        circuit: null
                    },
                    {
                        id: 'comm_005',
                        title: 'Line Following Robot',
                        description: 'Simple robot that follows a black line using IR sensors and DC motors.',
                        author: 'RoboBuilder',
                        category: 'robotics',
                        tags: ['robot', 'motors', 'sensors', 'autonomous'],
                        rating: 4.7,
                        downloads: 634,
                        publishedDate: '2026-05-08',
                        circuit: null
                    },
                    {
                        id: 'comm_006',
                        title: 'Traffic Light Simulator',
                        description: 'Educational project simulating a 3-way traffic light system with proper timing sequences.',
                        author: 'EduTech',
                        category: 'education',
                        tags: ['led', 'education', 'beginner', 'timing'],
                        rating: 4.4,
                        downloads: 512,
                        publishedDate: '2026-05-20',
                        circuit: null
                    }
                ];
                localStorage.setItem('communityCircuits', JSON.stringify(sampleCircuits));
            }
        }

        // Open community library modal
        function openCommunityLibrary() {
            initCommunityLibrary();
            document.getElementById('community-library-modal').classList.add('open');
            switchCommunityTab('browse');
        }

        // Close community library modal
        function closeCommunityLibrary() {
            document.getElementById('community-library-modal').classList.remove('open');
        }

        // Switch between tabs
        function switchCommunityTab(tabName) {
            // Update tab buttons
            document.querySelectorAll('.community-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(`tab-${tabName}`).classList.add('active');

            // Update content
            document.querySelectorAll('.community-tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`${tabName}-tab-content`).classList.remove('hidden');

            // Load content based on tab
            if (tabName === 'browse') {
                loadCommunityCircuits();
            } else if (tabName === 'my-circuits') {
                loadMyCircuits();
            }
        }

        // Load and display community circuits
        function loadCommunityCircuits() {
            const circuits = JSON.parse(localStorage.getItem('communityCircuits') || '[]');
            const grid = document.getElementById('community-circuits-grid');

            if (circuits.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fa-solid fa-box-open text-slate-300 text-5xl mb-4"></i>
                        <p class="text-slate-500 text-sm">No community circuits available yet</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = circuits.map(circuit => createCircuitCard(circuit)).join('');
        }

        // Create circuit card HTML
        function createCircuitCard(circuit) {
            const stars = generateStarRating(circuit.rating);
            const categoryColors = {
                education: 'bg-blue-100 text-blue-700',
                sensors: 'bg-green-100 text-green-700',
                automation: 'bg-purple-100 text-purple-700',
                iot: 'bg-orange-100 text-orange-700',
                robotics: 'bg-red-100 text-red-700'
            };
            const categoryClass = categoryColors[circuit.category] || 'bg-slate-100 text-slate-700';

            return `
                <div class="circuit-card" onclick="viewCircuitDetails('${circuit.id}')">
                    <div class="card-header">
                        <div class="flex-1">
                            <h3 class="card-title">${circuit.title}</h3>
                            <p class="card-author">by ${circuit.author}</p>
                        </div>
                        <span class="card-category ${categoryClass}">${circuit.category}</span>
                    </div>
                    <p class="card-description">${circuit.description}</p>
                    <div class="card-footer">
                        <div class="card-stats">
                            <span><i class="fa-solid fa-download"></i> ${circuit.downloads}</span>
                            <span class="star-rating">${stars}</span>
                        </div>
                        <button onclick="event.stopPropagation(); loadCommunityCircuit('${circuit.id}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition">
                            Load
                        </button>
                    </div>
                </div>
            `;
        }

        // Generate star rating HTML
        function generateStarRating(rating) {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            let stars = '';

            for (let i = 0; i < fullStars; i++) {
                stars += '<i class="fa-solid fa-star"></i>';
            }
            if (hasHalfStar) {
                stars += '<i class="fa-solid fa-star-half-alt"></i>';
            }
            const emptyStars = 5 - Math.ceil(rating);
            for (let i = 0; i < emptyStars; i++) {
                stars += '<i class="fa-solid fa-star empty"></i>';
            }

            return stars;
        }

        // Filter community circuits
        function filterCommunityCircuits() {
            const category = document.getElementById('filter-category').value;
            const sortBy = document.getElementById('filter-sort').value;
            const searchTerm = document.getElementById('search-circuits').value.toLowerCase();

            let circuits = JSON.parse(localStorage.getItem('communityCircuits') || '[]');

            // Filter by category
            if (category !== 'all') {
                circuits = circuits.filter(c => c.category === category);
            }

            // Filter by search term
            if (searchTerm) {
                circuits = circuits.filter(c =>
                    c.title.toLowerCase().includes(searchTerm) ||
                    c.description.toLowerCase().includes(searchTerm) ||
                    c.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                );
            }

            // Sort circuits
            if (sortBy === 'popular') {
                circuits.sort((a, b) => b.downloads - a.downloads);
            } else if (sortBy === 'rating') {
                circuits.sort((a, b) => b.rating - a.rating);
            } else {
                circuits.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
            }

            // Display filtered circuits
            const grid = document.getElementById('community-circuits-grid');
            if (circuits.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fa-solid fa-search text-slate-300 text-5xl mb-4"></i>
                        <p class="text-slate-500 text-sm">No circuits found matching your criteria</p>
                    </div>
                `;
            } else {
                grid.innerHTML = circuits.map(circuit => createCircuitCard(circuit)).join('');
            }
        }

        // View circuit details (could open a detailed modal)
        function viewCircuitDetails(circuitId) {
            const circuits = JSON.parse(localStorage.getItem('communityCircuits') || '[]');
            const circuit = circuits.find(c => c.id === circuitId);
            if (circuit) {
                alert(`Circuit: ${circuit.title}\n\nDescription: ${circuit.description}\n\nAuthor: ${circuit.author}\nRating: ${circuit.rating}/5\nDownloads: ${circuit.downloads}\n\nTags: ${circuit.tags.join(', ')}`);
            }
        }

        // Load a community circuit into the workspace
        function loadCommunityCircuit(circuitId) {
            const circuits = JSON.parse(localStorage.getItem('communityCircuits') || '[]');
            const circuit = circuits.find(c => c.id === circuitId);

            if (circuit) {
                // Increment download count
                circuit.downloads++;
                localStorage.setItem('communityCircuits', JSON.stringify(circuits));

                // Show success message
                alert(`Loading "${circuit.title}" by ${circuit.author}\n\nNote: This is a demo. In a full implementation, the circuit configuration would be loaded into the workspace.`);

                // In a real implementation, you would load the circuit data here
                // For now, we'll just close the modal
                closeCommunityLibrary();
            }
        }

        // Publish current circuit to community
        function publishCircuit(event) {
            event.preventDefault();

            const title = document.getElementById('publish-title').value;
            const description = document.getElementById('publish-description').value;
            const category = document.getElementById('publish-category').value;
            const tags = document.getElementById('publish-tags').value.split(',').map(t => t.trim()).filter(t => t);
            const author = document.getElementById('publish-author').value;

            // Create new circuit object
            const newCircuit = {
                id: 'comm_' + Date.now(),
                title,
                description,
                author,
                category,
                tags,
                rating: 0,
                downloads: 0,
                publishedDate: new Date().toISOString().split('T')[0],
                circuit: getCurrentCircuitData() // Would capture current workspace state
            };

            // Add to community circuits
            const circuits = JSON.parse(localStorage.getItem('communityCircuits') || '[]');
            circuits.unshift(newCircuit);
            localStorage.setItem('communityCircuits', JSON.stringify(circuits));

            // Add to user's circuits
            const myCircuits = JSON.parse(localStorage.getItem('myCircuits') || '[]');
            myCircuits.unshift(newCircuit);
            localStorage.setItem('myCircuits', JSON.stringify(myCircuits));

            // Reset form
            document.getElementById('publish-form').reset();

            // Show success message
            alert(`Success! Your circuit "${title}" has been published to the community library.`);

            // Switch to browse tab to see the new circuit
            switchCommunityTab('browse');
        }

        // Get current circuit data (placeholder)
        function getCurrentCircuitData() {
            // In a real implementation, this would capture:
            // - All placed components
            // - Wire connections
            // - Current firmware code
            // - Circuit configuration
            return {
                components: [],
                wires: [],
                code: document.getElementById('code-editor')?.value || '',
                timestamp: Date.now()
            };
        }

        // Load user's published circuits
        function loadMyCircuits() {
            const myCircuits = JSON.parse(localStorage.getItem('myCircuits') || '[]');
            const grid = document.getElementById('my-circuits-grid');
            const emptyState = document.getElementById('my-circuits-empty');

            if (myCircuits.length === 0) {
                grid.classList.add('hidden');
                emptyState.classList.remove('hidden');
            } else {
                grid.classList.remove('hidden');
                emptyState.classList.add('hidden');
                grid.innerHTML = myCircuits.map(circuit => createMyCircuitCard(circuit)).join('');
            }
        }

        // Create user's circuit card with edit/delete options
        function createMyCircuitCard(circuit) {
            const stars = generateStarRating(circuit.rating);
            const categoryColors = {
                education: 'bg-blue-100 text-blue-700',
                sensors: 'bg-green-100 text-green-700',
                automation: 'bg-purple-100 text-purple-700',
                iot: 'bg-orange-100 text-orange-700',
                robotics: 'bg-red-100 text-red-700'
            };
            const categoryClass = categoryColors[circuit.category] || 'bg-slate-100 text-slate-700';

            return `
                <div class="circuit-card">
                    <div class="card-header">
                        <div class="flex-1">
                            <h3 class="card-title">${circuit.title}</h3>
                            <p class="card-author">by ${circuit.author}</p>
                        </div>
                        <span class="card-category ${categoryClass}">${circuit.category}</span>
                    </div>
                    <p class="card-description">${circuit.description}</p>
                    <div class="card-footer">
                        <div class="card-stats">
                            <span><i class="fa-solid fa-download"></i> ${circuit.downloads}</span>
                            <span class="star-rating">${stars}</span>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="deleteMyCircuit('${circuit.id}')" class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition" title="Delete">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                            <button onclick="loadCommunityCircuit('${circuit.id}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition">
                                Load
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // Delete user's circuit
        function deleteMyCircuit(circuitId) {
            if (!confirm('Are you sure you want to delete this circuit?')) return;

            // Remove from my circuits
            let myCircuits = JSON.parse(localStorage.getItem('myCircuits') || '[]');
            myCircuits = myCircuits.filter(c => c.id !== circuitId);
            localStorage.setItem('myCircuits', JSON.stringify(myCircuits));

            // Remove from community circuits
            let communityCircuits = JSON.parse(localStorage.getItem('communityCircuits') || '[]');
            communityCircuits = communityCircuits.filter(c => c.id !== circuitId);
            localStorage.setItem('communityCircuits', JSON.stringify(communityCircuits));

            // Reload the view
            loadMyCircuits();
        }

        // ========================================================
        // BUZZER AUDIO (Web Audio API)
        // ========================================================
        let audioCtx = null;
        let buzzerOsc = null;
        let buzzerGain = null;
        let audioMuted = false;
        let currentBuzzerFreq = 0;

        function ensureAudioCtx() {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        function startBuzzerTone(freq) {
            if (audioMuted) return;
            ensureAudioCtx();
            if (buzzerOsc && currentBuzzerFreq === freq) return;
            stopBuzzerTone();
            buzzerGain = audioCtx.createGain();
            buzzerGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            buzzerGain.connect(audioCtx.destination);
            buzzerOsc = audioCtx.createOscillator();
            buzzerOsc.type = 'square';
            buzzerOsc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            buzzerOsc.connect(buzzerGain);
            buzzerOsc.start();
            currentBuzzerFreq = freq;
        }

        function stopBuzzerTone() {
            if (buzzerOsc) {
                try {
                    buzzerGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
                    buzzerOsc.stop(audioCtx.currentTime + 0.1);
                } catch(e) {}
                buzzerOsc = null;
                buzzerGain = null;
                currentBuzzerFreq = 0;
            }
        }

        function toggleMuteAudio() {
            audioMuted = !audioMuted;
            const icon = document.getElementById('mute-icon');
            if (audioMuted) {
                stopBuzzerTone();
                if (icon) icon.className = 'fa-solid fa-volume-xmark text-slate-400';
            } else {
                if (icon) icon.className = 'fa-solid fa-volume-high text-indigo-400';
            }
        }

        // ========================================================
        // SERIAL MONITOR
        // ========================================================
        let serialLineCount = 0;
        const SERIAL_MAX_LINES = 200;

        function appendSerial(msg) {
            const log = document.getElementById('serial-log');
            if (!log) return;
            serialLineCount++;
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            log.textContent += `[${time}] ${msg}\n`;
            if (serialLineCount > SERIAL_MAX_LINES) {
                const lines = log.textContent.split('\n');
                log.textContent = lines.slice(lines.length - SERIAL_MAX_LINES).join('\n');
                serialLineCount = SERIAL_MAX_LINES;
            }
            const container = document.getElementById('serial-log-container');
            if (container) container.scrollTop = container.scrollHeight;
        }

        function clearSerial() {
            const log = document.getElementById('serial-log');
            if (log) log.textContent = '';
            serialLineCount = 0;
        }

        // ========================================================
        // OSCILLOSCOPE ENGINE
        // ========================================================
        const OSC_BUFFER_SIZE = 300;
        const OSC_SAMPLE_MS   = 100;
        let oscBuffer         = [];
        let oscAnimFrame      = null;
        let oscSampleTimer    = null;
        let oscRunning        = false;

        function getOscVoltage() {
            if (!isSimulating) return null;
            switch (activePreset) {
                case 'blink': {
                    const led = customMeshes["led"];
                    const glow = led && led.getObjectByName("ledGlow");
                    const on = glow && glow.intensity > 0;
                    return on ? 5 : 0;
                }
                case 'night':
                    return (activeLdrLevel / 100) * 5;
                case 'button':
                    return activeButtonState ? 5 : 0;
                case 'alarm': {
                    const bz = customMeshes["buzzer"];
                    const on = bz && Math.abs(bz.position.y) > 0.01;
                    return on ? 5 : 0;
                }
                default:
                    return 2.5 + Math.sin(Date.now() * 0.002) * 0.3;
            }
        }

        function oscSampleTick() {
            const v = getOscVoltage();
            if (v === null) return;
            oscBuffer.push({ v, t: Date.now() });
            if (oscBuffer.length > OSC_BUFFER_SIZE) oscBuffer.shift();
        }

        function startOscilloscope() {
            if (oscRunning) return;
            oscRunning = true;
            const idle = document.getElementById('osc-idle');
            if (idle) idle.style.display = 'none';
            oscSampleTimer = setInterval(oscSampleTick, OSC_SAMPLE_MS);
            oscDrawLoop();
        }

        function stopOscilloscope() {
            oscRunning = false;
            clearInterval(oscSampleTimer);
            oscSampleTimer = null;
            if (oscAnimFrame) { cancelAnimationFrame(oscAnimFrame); oscAnimFrame = null; }
            const idle = document.getElementById('osc-idle');
            if (idle) idle.style.display = '';
            oscDraw();
        }

        function clearOscilloscope() {
            oscBuffer = [];
            const sl = document.getElementById('osc-signal-label');
            const fl = document.getElementById('osc-freq-label');
            if (sl) sl.textContent = 'Signal: —';
            if (fl) fl.textContent = '—';
            oscDraw();
        }

        function oscDraw() {
            const canvas = document.getElementById('osc-canvas');
            if (!canvas) return;
            const W = canvas.offsetWidth  || 300;
            const H = canvas.offsetHeight || 200;
            if (canvas.width !== W || canvas.height !== H) {
                canvas.width  = W;
                canvas.height = H;
            }
            const ctx = canvas.getContext('2d');
            const PAD_L = 36, PAD_R = 12, PAD_T = 14, PAD_B = 20;
            const plotW = W - PAD_L - PAD_R;
            const plotH = H - PAD_T - PAD_B;

            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, W, H);

            // Grid
            ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
            ctx.lineWidth = 1;
            for (let r = 0; r <= 5; r++) {
                const y = PAD_T + (r / 5) * plotH;
                ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(PAD_L + plotW, y); ctx.stroke();
            }
            for (let c = 0; c <= 10; c++) {
                const x = PAD_L + (c / 10) * plotW;
                ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, PAD_T + plotH); ctx.stroke();
            }

            // Y-axis labels
            ctx.fillStyle = '#475569';
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.textAlign = 'right';
            for (let r = 0; r <= 5; r++) {
                const v = 5 - (r / 5) * 5;
                const y = PAD_T + (r / 5) * plotH;
                ctx.fillText(v.toFixed(0) + 'V', PAD_L - 4, y + 3);
            }

            if (oscBuffer.length < 2) return;

            const samples = oscBuffer.slice(-Math.min(oscBuffer.length, 150));
            const vToY    = v => PAD_T + plotH - (v / 5) * plotH;
            const xStep   = plotW / (samples.length - 1 || 1);

            // Glow pass
            ctx.shadowBlur  = 10;
            ctx.shadowColor = '#4ade80';
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
            ctx.lineWidth   = 5;
            ctx.beginPath();
            samples.forEach((s, i) => {
                const x = PAD_L + i * xStep, y = vToY(s.v);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Sharp trace
            ctx.shadowBlur  = 4;
            ctx.shadowColor = '#86efac';
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth   = 1.5;
            ctx.beginPath();
            samples.forEach((s, i) => {
                const x = PAD_L + i * xStep, y = vToY(s.v);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Live readout
            const last = samples[samples.length - 1];
            const sigNames = { blink: 'D13 (LED)', night: 'A0 (LDR)', button: 'D2 (Button)', alarm: 'D8 (Buzzer)' };
            const slEl = document.getElementById('osc-signal-label');
            if (slEl) slEl.textContent = `${sigNames[activePreset] || 'Signal'}  ${last.v.toFixed(2)} V`;

            let crossings = 0;
            for (let i = 1; i < samples.length; i++) {
                if ((samples[i - 1].v < 2.5) !== (samples[i].v < 2.5)) crossings++;
            }
            const duration = (samples[samples.length - 1].t - samples[0].t) / 1000;
            const flEl = document.getElementById('osc-freq-label');
            if (flEl) {
                if (duration > 0 && crossings > 1) {
                    const hz = (crossings / 2) / duration;
                    flEl.textContent = hz >= 1 ? `${hz.toFixed(1)} Hz` : `${(hz * 1000).toFixed(0)} mHz`;
                } else {
                    flEl.textContent = crossings <= 1 ? 'DC' : '—';
                }
            }
        }

        function oscDrawLoop() {
            oscDraw();
            if (oscRunning) oscAnimFrame = requestAnimationFrame(oscDrawLoop);
        }

        // ========================================================
        // EDITABLE FIRMWARE IDE — Run Custom Code
        // ========================================================
        function runCustomCode() {
            if (!isSimulating) {
                toggleSimulation();
            }
            showToast("Custom firmware applied — simulation running!", false);
        }

        // ========================================================
        // SAVE / LOAD PROJECTS
        // ========================================================
        function saveProject() {
            const codeEl = document.getElementById('code-content');
            const data = {
                version: '1.0',
                preset: activePreset,
                step: activeStep,
                customCode: codeEl ? codeEl.value : '',
                placedComponents: placedComponents.map(g => ({
                    type: g.userData.type,
                    variant: g.userData.variant || null,
                    x: parseFloat(g.position.x.toFixed(3)),
                    z: parseFloat(g.position.z.toFixed(3))
                }))
            };
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `circuit-${data.preset}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast("Project saved!", false);
        }

        function loadProject(inputEl) {
            const file = inputEl.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data.preset || !PRESETS[data.preset]) {
                        showToast("Invalid project file.", false); return;
                    }
                    applyPreset(data.preset);
                    if (typeof data.step === 'number') {
                        activeStep = data.step;
                        renderCurrentStep();
                    }
                    if (data.customCode) {
                        const codeEl = document.getElementById('code-content');
                        if (codeEl) codeEl.value = data.customCode;
                    }
                    if (Array.isArray(data.placedComponents)) {
                        data.placedComponents.forEach(c => {
                            createComponent(c.type, c.variant, c.x, c.z);
                        });
                    }
                    showToast("Project loaded!", false);
                } catch(err) {
                    showToast("Failed to load project.", false);
                }
                inputEl.value = '';
            };
            reader.readAsText(file);
        }

        // ========================================================
        // SHARE CIRCUIT LINK
        // ========================================================
        function shareCircuitLink() {
            const codeEl = document.getElementById('code-content');
            const state = {
                version: '1.0',
                preset: activePreset,
                step: activeStep,
                customCode: codeEl ? codeEl.value : '',
                placedComponents: placedComponents.map(g => ({
                    type: g.userData.type,
                    variant: g.userData.variant || null,
                    x: parseFloat(g.position.x.toFixed(3)),
                    z: parseFloat(g.position.z.toFixed(3))
                }))
            };

            let encoded;
            try {
                encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
            } catch(e) {
                showToast("Failed to encode circuit.", false);
                return;
            }

            const url = `${location.origin}${location.pathname}?c=${encoded}`;

            navigator.clipboard.writeText(url).then(() => {
                showToast("Share link copied to clipboard! 🔗", false);
            }).catch(() => {
                window.prompt("Copy this link:", url);
            });
        }

        // ========================================================
        // EXPORT AS PDF
        // ========================================================
        function exportAsPDF() {
            const data = PRESETS[activePreset];
            if (!data) { showToast("No circuit loaded.", false); return; }

            const codeEl = document.getElementById('code-content');
            const code = (codeEl ? codeEl.value : data.code) || data.code || '';

            // Build step HTML
            const stepsHTML = data.steps.map((step, i) => `
                <div class="step">
                    <div class="step-header">
                        <span class="step-num">${i + 1}</span>
                        <span class="step-title">${escapeHtml(step.title)}</span>
                    </div>
                    <p class="step-desc">${escapeHtml(step.desc)}</p>
                    ${step.tip ? `<div class="tip"><span class="tip-label">💡 Tip:</span> ${escapeHtml(step.tip)}</div>` : ''}
                </div>`).join('');

            // Build schematic SVG
            const schematicSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" style="width:100%;max-height:240px;">${data.schematic || ''}</svg>`;

            // Escape code for HTML
            const codeHTML = escapeHtml(code);

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(data.title)} — IoTify AI Lab</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #0f172a;
    background: #fff;
    padding: 40px 48px;
    font-size: 13px;
    line-height: 1.6;
  }
  /* Header */
  .doc-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 18px;
    border-bottom: 2px solid #e2e8f0;
    margin-bottom: 28px;
  }
  .doc-logo {
    font-size: 11px;
    font-weight: 700;
    color: #6366f1;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .doc-title { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .doc-meta { font-size: 11px; color: #64748b; }
  .doc-badge {
    background: #eef2ff;
    color: #4338ca;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    margin-top: 4px;
  }
  /* Two-column layout */
  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 28px; }
  /* Section labels */
  .section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6366f1;
    margin-bottom: 10px;
  }
  /* Schematic */
  .schematic-box {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    background: #f8fafc;
  }
  /* Steps */
  .step {
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    margin-bottom: 10px;
    background: #fff;
    page-break-inside: avoid;
  }
  .step-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  .step-num {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: #6366f1;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .step-title { font-size: 12px; font-weight: 600; color: #1e293b; }
  .step-desc { font-size: 12px; color: #475569; margin-bottom: 6px; }
  .tip {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 11px;
    color: #92400e;
  }
  .tip-label { font-weight: 600; }
  /* Code block */
  .code-section { margin-bottom: 24px; page-break-inside: avoid; }
  pre {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    line-height: 1.7;
    background: #0f172a;
    color: #a5f3fc;
    padding: 20px;
    border-radius: 12px;
    white-space: pre;
    overflow: hidden;
  }
  /* Footer */
  .doc-footer {
    border-top: 1px solid #e2e8f0;
    padding-top: 14px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #94a3b8;
    margin-top: 8px;
  }
  @media print {
    body { padding: 24px 32px; }
    .step { page-break-inside: avoid; }
    .code-section { page-break-inside: avoid; }
  }
</style>
</head>
<body>

<div class="doc-header">
  <div>
    <div class="doc-logo">IoTify AI Lab</div>
    <div class="doc-title">${escapeHtml(data.title)}</div>
    <div class="doc-meta">Topic: ${escapeHtml(data.topic || 'General Education')} &nbsp;·&nbsp; ${data.steps.length} Steps &nbsp;·&nbsp; Generated ${dateStr}</div>
  </div>
  <div class="doc-badge">Arduino C++</div>
</div>

<div class="layout">
  <div>
    <div class="section-label">Circuit Schematic</div>
    <div class="schematic-box">${schematicSVG}</div>
  </div>
  <div>
    <div class="section-label">Step-by-Step Instructions</div>
    ${stepsHTML}
  </div>
</div>

<div class="code-section">
  <div class="section-label">Arduino Firmware</div>
  <pre>${codeHTML}</pre>
</div>

<div class="doc-footer">
  <span>IoTify AI Lab — Generative 3D IoT Sandbox</span>
  <span>${escapeHtml(data.title)} · iotify.app</span>
</div>

<script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

            const win = window.open('', '_blank', 'width=900,height=700');
            if (!win) {
                showToast("Pop-up blocked — please allow pop-ups and retry.", false);
                return;
            }
            win.document.write(html);
            win.document.close();
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        // ========================================================
        // ONBOARDING TOUR
        // ========================================================
        const TOUR_STEPS = [
            {
                title: "Welcome to IoTify AI Lab!",
                desc: "Let's do a quick 30-second tour of the main areas. You can skip anytime or restart it later with the T key.",
                icon: "fa-solid fa-hand-wave",
                target: null,
                position: 'center'
            },
            {
                title: "AI Circuit Architect",
                desc: "Describe any IoT project in plain English — Gemini AI will wire the components, write the firmware, and build a step-by-step tutorial for you.",
                icon: "fa-solid fa-wand-magic-sparkles",
                target: '#left-panel',
                position: 'right'
            },
            {
                title: "3D Hardware Sandbox",
                desc: "Your circuit lives here in 3D. Left-drag to rotate, scroll to zoom, right-drag to pan. Right-click any component to inspect or delete it.",
                icon: "fa-solid fa-cube",
                target: '#canvas-view',
                position: 'bottom'
            },
            {
                title: "Run Simulation",
                desc: "Hit Run to power your circuit in real time — with LED blinks, buzzer tones, and live serial output. No hardware required!",
                icon: "fa-solid fa-play",
                target: '#btn-simulation',
                position: 'top'
            },
            {
                title: "Parts Library & IDE",
                desc: "Drag components from the Parts Library onto the canvas. Switch to IDE to edit Arduino firmware, or Serial Monitor to see live debug output.",
                icon: "fa-solid fa-microchip",
                target: '#right-panel',
                position: 'left'
            }
        ];

        let _tourStep = 0;

        function initTour() {
            if (localStorage.getItem('iotify-tour-done')) return;
            // Wait for full render before showing
            setTimeout(startTour, 900);
        }

        function startTour() {
            _tourStep = 0;
            const overlay = document.getElementById('tour-overlay');
            overlay.style.opacity = '1';
            overlay.classList.add('active');
            _renderTourStep(false);
        }

        function _renderTourStep(animate) {
            const step = TOUR_STEPS[_tourStep];
            const spotlight = document.getElementById('tour-spotlight');
            const card = document.getElementById('tour-card');

            // Content
            document.getElementById('tour-icon').className = step.icon + ' text-indigo-600 text-lg';
            document.getElementById('tour-title').textContent = step.title;
            document.getElementById('tour-desc').textContent = step.desc;
            document.getElementById('tour-step-label').textContent =
                'Step ' + (_tourStep + 1) + ' of ' + TOUR_STEPS.length;

            const isLast = _tourStep === TOUR_STEPS.length - 1;
            const nextBtn = document.getElementById('tour-next-btn');
            nextBtn.innerHTML = isLast
                ? '<i class="fa-solid fa-check text-[10px]"></i> Done'
                : 'Next <i class="fa-solid fa-arrow-right text-[10px]"></i>';
            document.getElementById('tour-skip-btn').style.display = isLast ? 'none' : '';

            // Dots
            document.getElementById('tour-dots').innerHTML = TOUR_STEPS.map((_, i) =>
                `<div class="tour-dot${i === _tourStep ? ' active' : ''}"></div>`
            ).join('');

            // Re-pop animation
            card.classList.remove('pop');
            void card.offsetWidth; // force reflow
            card.classList.add('pop');

            // Position spotlight + card
            const dimEl = document.getElementById('tour-dim');
            if (step.target) {
                const target = document.querySelector(step.target);
                if (target) {
                    const rect = target.getBoundingClientRect();
                    const pad = 6;
                    dimEl.style.display = 'none';
                    Object.assign(spotlight.style, {
                        display: 'block',
                        left:   (rect.left  - pad) + 'px',
                        top:    (rect.top   - pad) + 'px',
                        width:  (rect.width  + pad * 2) + 'px',
                        height: (rect.height + pad * 2) + 'px'
                    });
                    _positionCard(card, rect, step.position);
                }
            } else {
                // No target: use the full-screen dim div, hide spotlight
                spotlight.style.display = 'none';
                dimEl.style.display     = 'block';
                card.style.left         = '50%';
                card.style.top          = '50%';
                card.style.transform    = 'translate(-50%, -50%)';
            }
        }

        function _positionCard(card, rect, position) {
            const GAP   = 22;
            const CARD_W = 300;
            const CARD_H = 195; // approximate
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const pad = 14;
            let left, top;
            card.style.transform = '';

            if (position === 'right') {
                left = rect.right + GAP;
                top  = rect.top + rect.height / 2 - CARD_H / 2;
                // If it'd go off-screen right, flip to left
                if (left + CARD_W > vw - pad) left = rect.left - CARD_W - GAP;
            } else if (position === 'left') {
                left = rect.left - CARD_W - GAP;
                top  = rect.top + rect.height / 2 - CARD_H / 2;
                if (left < pad) left = rect.right + GAP;
            } else if (position === 'bottom') {
                top  = rect.bottom + GAP;
                left = rect.left + rect.width / 2 - CARD_W / 2;
                if (top + CARD_H > vh - pad) top = rect.top - CARD_H - GAP;
            } else { // top
                top  = rect.top - CARD_H - GAP;
                left = rect.left + rect.width / 2 - CARD_W / 2;
                if (top < pad) top = rect.bottom + GAP;
            }

            // Clamp
            left = Math.max(pad, Math.min(left, vw - CARD_W - pad));
            top  = Math.max(pad, Math.min(top,  vh - CARD_H - pad));
            card.style.left = left + 'px';
            card.style.top  = top  + 'px';
        }

        function tourNext() {
            if (_tourStep < TOUR_STEPS.length - 1) {
                _tourStep++;
                _renderTourStep(true);
            } else {
                _tourDone();
            }
        }

        function tourSkip() {
            _tourDone();
        }

        function _tourDone() {
            localStorage.setItem('iotify-tour-done', '1');
            const overlay = document.getElementById('tour-overlay');
            overlay.style.transition = 'opacity 0.3s ease';
            overlay.style.opacity    = '0';
            setTimeout(() => {
                overlay.classList.remove('active');
                overlay.style.transition = '';
                overlay.style.opacity    = '';
            }, 320);
        }

        /** Re-launch the tour (T key shortcut) */
        function resetTour() {
            localStorage.removeItem('iotify-tour-done');
            startTour();
        }


// ─────────────────────────────────────────────────────────────────
// React bootstrap — replaces the original `window.onload = () => {...}`
// ─────────────────────────────────────────────────────────────────

let __iotifyInited = false;

export function initIotifyApp() {
    // Guard against React 18 StrictMode double-invoke in dev
    if (__iotifyInited) return;
    __iotifyInited = true;

    initPanels();
    initTheme();
    initGraphics();
    buildPartsLibraryUI();
    initTour();

    // Restore shared circuit from URL param
    const params = new URLSearchParams(location.search);
    const encoded = params.get('c');
    if (encoded) {
        try {
            const state = JSON.parse(decodeURIComponent(escape(atob(encoded))));
            if (state.preset && PRESETS[state.preset]) {
                applyPreset(state.preset);
                if (typeof state.step === 'number') {
                    activeStep = state.step;
                    renderCurrentStep();
                }
                if (state.customCode) {
                    const codeEl = document.getElementById('code-content');
                    if (codeEl) codeEl.value = state.customCode;
                }
                if (Array.isArray(state.placedComponents)) {
                    state.placedComponents.forEach(c => {
                        createComponent(c.type, c.variant, c.x, c.z);
                    });
                }
                showToast("Circuit loaded from shared link! 🎉", false);
            } else {
                applyPreset("blink");
                showToast("Shared link has an unknown preset — loaded default.", false);
            }
        } catch (e) {
            applyPreset("blink");
        }
    } else {
        applyPreset("blink");
    }
}

// ─────────────────────────────────────────────────────────────────
// Exports for React onClick / onInput handlers
// ─────────────────────────────────────────────────────────────────

export {
    // panel layout
    toggleLeftPanel, toggleRightPanel, startResize, resetPanelWidth,
    // presets / steps
    applyPreset, moveStep,
    // sim / scene / tools
    toggleSimulation, toggleSchematicPanel, resetCamera, toggleMuteAudio,
    toggleWireMode, glideCamera,
    // undo / redo
    undo, redo,
    // tabs / theme / shortcuts
    switchTab, toggleDarkMode, toggleShortcutsOverlay,
    // AI
    generateAICircuit, askAITutor,
    // parts library
    filterParts,
    // free-build interactive controls
    handleHardwareSlider, handleHardwareButton, handleDhtTemp, handleDhtHumidity,
    handleDistanceSlider, handlePirMotion, handleServoAngle, handleMotorSpeed,
    handleRelayToggle,
    // serial / oscilloscope
    clearSerial, clearOscilloscope,
    // ide
    runCustomCode, copySketchCode,
    // project save / load / share / pdf
    saveProject, loadProject, exportAsPDF, shareCircuitLink,
    // context menu
    toggleCtxInfo, ctxSelect, ctxDelete,
    // community library
    openCommunityLibrary, closeCommunityLibrary, switchCommunityTab,
    filterCommunityCircuits, publishCircuit,
    // tour
    tourNext, tourSkip,
};

// Setter for the one inline variable assignment from the legacy HTML
// (`oninput="activeWireColor=this.value"`).
export function setActiveWireColor(color) {
    activeWireColor = color;
}
