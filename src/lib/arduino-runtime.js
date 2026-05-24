// ─────────────────────────────────────────────────────────────────
// Arduino Runtime — Transpiler + Execution Engine
//
// Converts Arduino C++ sketches into executable JavaScript and
// runs them with cooperative scheduling. Pin state changes are
// dispatched via callbacks so the caller can drive 3D visuals.
// ─────────────────────────────────────────────────────────────────

/* eslint-disable */

// ── Constants ──────────────────────────────────────────────────
const HIGH = 1;
const LOW  = 0;
const OUTPUT = 'OUTPUT';
const INPUT  = 'INPUT';
const INPUT_PULLUP = 'INPUT_PULLUP';

// Max delay cap to prevent infinite hangs (ms)
const MAX_DELAY_MS = 2000;
// How often loop() yields to the browser (ms)
const LOOP_YIELD_MS = 16;

// ── Pin name → numeric pin mapping ────────────────────────────
const PIN_NAME_MAP = {
  // Digital pins
  'D2': 2, 'D3': 3, 'D3~': 3, 'D4': 4, 'D5': 5, 'D5~': 5,
  'D6': 6, 'D6~': 6, 'D7': 7, 'D8': 8, 'D9': 9, 'D9~': 9,
  'D10': 10, 'D10~': 10, 'D11': 11, 'D11~': 11, 'D12': 12, 'D13': 13,
  // Analog pins
  'A0': 14, 'A1': 15, 'A2': 16, 'A3': 17, 'A4': 18, 'A5': 19,
  // Power pins (not real signal pins, but useful for mapping)
  '5V': -1, '3.3V': -2, 'GND': -3, 'GND2': -3, 'VIN': -4,
  // ESP32 pins
  'D14': 14, 'D18': 18, 'D19': 19, 'D21': 21, 'D22': 22,
  'D25': 25, 'D26': 26, 'D27': 27, 'D32': 32,
};

// Reverse: numeric → name (for debug)
const PIN_NUM_TO_NAME = {};
Object.entries(PIN_NAME_MAP).forEach(([name, num]) => {
  if (num >= 0 && !PIN_NUM_TO_NAME[num]) PIN_NUM_TO_NAME[num] = name;
});

// ── Transpiler ─────────────────────────────────────────────────

/**
 * Transpile Arduino C++ source to executable JavaScript.
 * The returned code expects certain globals to be injected at runtime
 * (__rt object with all Arduino API shims).
 */
export function transpileArduinoToJS(source) {
  let code = source;

  // 1. Strip #include directives
  code = code.replace(/^\s*#include\s*[<"].*?[>"]\s*$/gm, '');

  // 2. Handle #define NAME VALUE → const NAME = VALUE
  code = code.replace(/^\s*#define\s+(\w+)\s+(.+)$/gm, 'const $1 = $2;');

  // 3. Remove common Arduino type qualifiers
  //    Replace "void setup()" / "void loop()" first (special)
  code = code.replace(/\bvoid\s+setup\s*\(\s*\)/g, 'async function __setup()');
  code = code.replace(/\bvoid\s+loop\s*\(\s*\)/g,  'async function __loop()');

  // General void functions
  code = code.replace(/\bvoid\s+(\w+)\s*\(/g, 'async function $1(');

  // 4. Replace typed variable declarations → let
  //    Handle: int, long, float, double, bool, boolean, char, byte, unsigned int, unsigned long, uint8_t, uint16_t, uint32_t, String
  code = code.replace(/\b(?:unsigned\s+)?(?:int|long|short|float|double|bool|boolean|char|byte|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t)\s+(?!function\b)/g, 'let ');
  code = code.replace(/\bString\s+/g, 'let ');

  // 5. const int/float → const  (must come after general replacement)
  code = code.replace(/\bconst\s+let\s+/g, 'const ');

  // 6. Replace Arduino API calls with runtime shim calls
  code = code.replace(/\bpinMode\s*\(/g,       '__rt.pinMode(');
  code = code.replace(/\bdigitalWrite\s*\(/g,   '__rt.digitalWrite(');
  code = code.replace(/\bdigitalRead\s*\(/g,    '__rt.digitalRead(');
  code = code.replace(/\banalogWrite\s*\(/g,    '__rt.analogWrite(');
  code = code.replace(/\banalogRead\s*\(/g,     '__rt.analogRead(');
  code = code.replace(/\bdelay\s*\(/g,          'await __rt.delay(');
  code = code.replace(/\bdelayMicroseconds\s*\(/g, 'await __rt.delay(0); void(');
  code = code.replace(/\bmillis\s*\(/g,         '__rt.millis(');
  code = code.replace(/\bmicros\s*\(/g,         '(__rt.millis()*1000');
  code = code.replace(/\btone\s*\(/g,           '__rt.tone(');
  code = code.replace(/\bnoTone\s*\(/g,         '__rt.noTone(');
  code = code.replace(/\bmap\s*\(/g,            '__rt.map(');
  code = code.replace(/\bconstrain\s*\(/g,      '__rt.constrain(');
  code = code.replace(/\brandom\s*\(/g,         '__rt.random(');
  code = code.replace(/\brandomSeed\s*\(/g,     '__rt.randomSeed(');
  code = code.replace(/\babs\s*\(/g,            'Math.abs(');
  code = code.replace(/\bmin\s*\(/g,            'Math.min(');
  code = code.replace(/\bmax\s*\(/g,            'Math.max(');
  code = code.replace(/\bsqrt\s*\(/g,           'Math.sqrt(');
  code = code.replace(/\bpow\s*\(/g,            'Math.pow(');
  code = code.replace(/\bround\s*\(/g,          'Math.round(');

  // Serial
  code = code.replace(/\bSerial\.begin\s*\(/g,    '__rt.Serial.begin(');
  code = code.replace(/\bSerial\.println\s*\(/g,   '__rt.Serial.println(');
  code = code.replace(/\bSerial\.print\s*\(/g,     '__rt.Serial.print(');
  code = code.replace(/\bSerial\.write\s*\(/g,     '__rt.Serial.write(');
  code = code.replace(/\bSerial\.available\s*\(/g,  '__rt.Serial.available(');
  code = code.replace(/\bSerial\.read\s*\(/g,       '__rt.Serial.read(');
  code = code.replace(/\bSerial\.readString\s*\(/g,  '__rt.Serial.readString(');

  // Servo library
  code = code.replace(/\bServo\s+(\w+)\s*;/g, 'let $1 = __rt.createServo();');
  code = code.replace(/\b(\w+)\.attach\s*\(/g, (match, name) => {
    // Only transform if it looks like a servo variable
    return `${name}.attach(`;
  });
  code = code.replace(/\b(\w+)\.write\s*\(/g, (match, name) => {
    // Keep as-is — the Servo shim object has .write()
    return `${name}.write(`;
  });
  code = code.replace(/\b(\w+)\.read\s*\(/g, (match, name) => {
    return `${name}.read(`;
  });

  // DHT library
  code = code.replace(/\bDHT\s+(\w+)\s*\(\s*(\w+)\s*,\s*\w+\s*\)\s*;/g,
    'let $1 = __rt.createDHT($2);');
  code = code.replace(/\b(\w+)\.begin\s*\(\s*\)/g, (match, name) => {
    return `${name}.begin ? ${name}.begin() : void 0`;
  });
  code = code.replace(/\b(\w+)\.readTemperature\s*\(/g, (match, name) => {
    return `${name}.readTemperature(`;
  });
  code = code.replace(/\b(\w+)\.readHumidity\s*\(/g, (match, name) => {
    return `${name}.readHumidity(`;
  });

  // pulseIn for HC-SR04
  code = code.replace(/\bpulseIn\s*\(/g, '__rt.pulseIn(');

  // 7. Replace HIGH/LOW constants
  code = code.replace(/\bHIGH\b/g, '1');
  code = code.replace(/\bLOW\b/g,  '0');
  code = code.replace(/\bOUTPUT\b/g, '"OUTPUT"');
  code = code.replace(/\bINPUT\b/g,  '"INPUT"');
  code = code.replace(/\bINPUT_PULLUP\b/g, '"INPUT_PULLUP"');

  // 8. Handle C++ true/false (already valid JS, but ensure lowercase)
  code = code.replace(/\bTRUE\b/g, 'true');
  code = code.replace(/\bFALSE\b/g, 'false');

  // 9. Remove any remaining type casts like (int), (float), (char)
  code = code.replace(/\((?:int|float|double|long|char|byte|unsigned)\)\s*/g, '');

  // 10. Replace String() constructor
  code = code.replace(/\bString\s*\(/g, 'String(');

  // 11. Fix common C++ patterns that aren't valid JS
  //     - Remove semicolons after function closing braces (common in C++)
  //     These are harmless in JS but let's clean up anyway.

  return code;
}


// ── Runtime Class ──────────────────────────────────────────────

export class ArduinoRuntime {
  /**
   * @param {object} options
   * @param {function(pin, value)} options.onDigitalWrite  - Called on digitalWrite
   * @param {function(pin, value)} options.onAnalogWrite   - Called on analogWrite (0-255)
   * @param {function(pin, freq)}  options.onTone          - Called on tone()
   * @param {function(pin)}        options.onNoTone        - Called on noTone()
   * @param {function(msg)}        options.onSerialPrint   - Called on Serial.print/println
   * @param {function(pin, angle)} options.onServoWrite    - Called on servo.write()
   * @param {function()}           options.onLoopTick      - Called each loop iteration (for visuals)
   * @param {object}               options.sensorState     - Reference to freeBuildState for sensor reads
   */
  constructor(options = {}) {
    this.options = options;
    this._running = false;
    this._abortController = null;
    this._startTime = 0;
    this._pinModes = {};    // pin# → 'OUTPUT' | 'INPUT' | 'INPUT_PULLUP'
    this._pinState = {};    // pin# → 0 or 1 (digital) or 0-255 (analog)
    this._toneState = {};   // pin# → frequency
    this._serialBuffer = '';
    this._serialPrintPartial = ''; // for Serial.print() without newline
    this._loopCount = 0;

    // ── Servo instances tracked by pin ──
    this._servos = {};      // pin# → { angle }

    // ── DHT instances tracked by pin ──
    this._dhts = {};

    // ── Pin-to-component map (set by caller) ──
    this.pinMap = {};       // pin# → { componentType, componentId, componentGroup }

    // Build the runtime API object (__rt) exposed to transpiled code
    this._rt = this._buildRuntimeAPI();
  }

  /** Expose the pin name → number mapping for building pin maps */
  static get PIN_NAME_MAP() { return PIN_NAME_MAP; }

  /** Set the pin-to-component map */
  setPinMap(map) {
    this.pinMap = map;
  }

  /** Check if the runtime is currently executing */
  get isRunning() { return this._running; }

  /** Stop the runtime */
  stop() {
    this._running = false;
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
  }

  /**
   * Transpile and execute Arduino code.
   * @param {string} arduinoSource - Raw Arduino C++ source
   * @returns {Promise<void>}
   */
  async execute(arduinoSource) {
    this.stop();
    this._running = true;
    this._startTime = performance.now();
    this._pinModes = {};
    this._pinState = {};
    this._toneState = {};
    this._serialBuffer = '';
    this._serialPrintPartial = '';
    this._loopCount = 0;
    this._abortController = new AbortController();

    const jsCode = transpileArduinoToJS(arduinoSource);

    // Wrap in an async function that receives __rt
    const wrappedCode = `
      return (async function(__rt) {
        // ── Transpiled Arduino sketch ──
        ${jsCode}

        // ── Execute setup + loop ──
        if (typeof __setup === 'function') await __setup();
        while (__rt.__running()) {
          if (typeof __loop === 'function') await __loop();
          await __rt.__yield();
        }
      });
    `;

    try {
      const factory = new Function(wrappedCode);
      const runner = factory();
      await runner(this._rt);
    } catch (err) {
      if (err.name === 'AbortError' || err.message === '__ARDUINO_STOP__') {
        // Normal stop
        return;
      }
      // Report error to serial monitor
      const msg = `⚠ Runtime Error: ${err.message}`;
      if (this.options.onSerialPrint) this.options.onSerialPrint(msg);
      console.error('Arduino runtime error:', err);
      console.error('Transpiled code:', jsCode);
    } finally {
      this._running = false;
    }
  }

  // ── Build the __rt API object ────────────────────────────────
  _buildRuntimeAPI() {
    const rt = this;

    return {
      // ── Check if runtime should keep running ──
      __running: () => rt._running,

      // ── Yield control back to browser ──
      __yield: () => {
        if (!rt._running) throw new Error('__ARDUINO_STOP__');
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!rt._running) {
              reject(new Error('__ARDUINO_STOP__'));
            } else {
              rt._loopCount++;
              if (rt.options.onLoopTick) rt.options.onLoopTick();
              resolve();
            }
          }, LOOP_YIELD_MS);
        });
      },

      // ── Pin I/O ──
      pinMode: (pin, mode) => {
        rt._pinModes[pin] = mode;
      },

      digitalWrite: (pin, value) => {
        const v = value ? 1 : 0;
        rt._pinState[pin] = v;
        if (rt.options.onDigitalWrite) rt.options.onDigitalWrite(pin, v);
      },

      digitalRead: (pin) => {
        // If this pin is connected to a button or sensor, return the sensor state
        const comp = rt.pinMap[pin];
        if (comp) {
          if (comp.componentType === 'button') return 0; // default: not pressed
          if (comp.componentType === 'pir') {
            return rt.options.sensorState?.activePirMotion ? 1 : 0;
          }
          if (comp.componentType === 'ldr') return 1;
        }
        return rt._pinState[pin] || 0;
      },

      analogWrite: (pin, value) => {
        const v = Math.max(0, Math.min(255, Math.round(value)));
        rt._pinState[pin] = v;
        if (rt.options.onAnalogWrite) rt.options.onAnalogWrite(pin, v);
      },

      analogRead: (pin) => {
        const comp = rt.pinMap[pin];
        if (comp) {
          if (comp.componentType === 'ldr') return 512;
          if (comp.componentType === 'potentiometer') return 512;
          if (comp.componentType === 'thermistor') {
            const temp = rt.options.sensorState?.activeTempC ?? 25;
            return Math.round((temp / 50) * 1023);
          }
        }
        return 0;
      },

      // ── Timing ──
      delay: (ms) => {
        if (!rt._running) throw new Error('__ARDUINO_STOP__');
        const capped = Math.min(Math.max(0, ms), MAX_DELAY_MS);
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            if (!rt._running) reject(new Error('__ARDUINO_STOP__'));
            else resolve();
          }, capped);
          // If stopped during delay, clean up
          if (rt._abortController) {
            rt._abortController.signal.addEventListener('abort', () => {
              clearTimeout(timer);
              reject(new Error('__ARDUINO_STOP__'));
            }, { once: true });
          }
        });
      },

      millis: () => {
        return Math.floor(performance.now() - rt._startTime);
      },

      // ── Tone ──
      tone: (pin, freq, duration) => {
        rt._toneState[pin] = freq;
        if (rt.options.onTone) rt.options.onTone(pin, freq);
        // If duration specified, auto-stop after duration
        if (duration && duration > 0) {
          setTimeout(() => {
            rt._rt.noTone(pin);
          }, Math.min(duration, MAX_DELAY_MS));
        }
      },

      noTone: (pin) => {
        delete rt._toneState[pin];
        if (rt.options.onNoTone) rt.options.onNoTone(pin);
      },

      // ── Math helpers ──
      map: (value, inMin, inMax, outMin, outMax) => {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
      },
      constrain: (value, low, high) => Math.max(low, Math.min(high, value)),
      random: (minOrMax, max) => {
        if (max === undefined) return Math.floor(Math.random() * minOrMax);
        return Math.floor(Math.random() * (max - minOrMax)) + minOrMax;
      },
      randomSeed: (_seed) => { /* no-op in browser */ },

      // ── Serial ──
      Serial: {
        begin: (_baud) => { /* no-op — always ready */ },
        println: (...args) => {
          const msg = rt._serialPrintPartial + args.map(a => String(a)).join(' ');
          rt._serialPrintPartial = '';
          if (rt.options.onSerialPrint) rt.options.onSerialPrint(msg);
        },
        print: (...args) => {
          rt._serialPrintPartial += args.map(a => String(a)).join(' ');
        },
        write: (val) => {
          if (rt.options.onSerialPrint) rt.options.onSerialPrint(String.fromCharCode(val));
        },
        available: () => 0,
        read: () => -1,
        readString: () => '',
      },

      // ── Servo factory ──
      createServo: () => {
        const servo = {
          _pin: -1,
          _angle: 90,
          attach: (pin) => {
            servo._pin = pin;
            rt._servos[pin] = servo;
          },
          write: (angle) => {
            const a = Math.max(0, Math.min(180, Math.round(angle)));
            servo._angle = a;
            if (rt.options.onServoWrite && servo._pin >= 0) {
              rt.options.onServoWrite(servo._pin, a);
            }
          },
          read: () => servo._angle,
          writeMicroseconds: (us) => {
            // Convert microseconds (500-2400) → degrees (0-180)
            const deg = Math.round((us - 500) * 180 / 1900);
            servo.write(deg);
          },
          detach: () => {
            delete rt._servos[servo._pin];
            servo._pin = -1;
          },
        };
        return servo;
      },

      // ── DHT factory ──
      createDHT: (pin) => {
        const dht = {
          _pin: pin,
          begin: () => {},
          readTemperature: (isFahrenheit) => {
            const tempC = rt.options.sensorState?.activeTempC ?? 25;
            return isFahrenheit ? (tempC * 9 / 5) + 32 : tempC;
          },
          readHumidity: () => {
            return rt.options.sensorState?.activeHumidity ?? 50;
          },
        };
        rt._dhts[pin] = dht;
        return dht;
      },

      // ── pulseIn (for HC-SR04 ultrasonic) ──
      pulseIn: (pin, _value, _timeout) => {
        const distCm = rt.options.sensorState?.activeDistanceCm ?? 100;
        // HC-SR04: duration = distance * 2 / speed_of_sound ≈ distance * 58.2 microseconds
        return Math.round(distCm * 58.2);
      },
    };
  }
}
