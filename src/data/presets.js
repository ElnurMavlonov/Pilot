export const PRESETS = {
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
}
