import { buildArduinoBoard } from './arduino'
import { buildESP32 } from './esp32'
import { buildBreadboard } from './breadboard'
import { buildLED } from './led'
import { buildResistor } from './resistor'
import { buildCapacitor } from './capacitor'
import { buildPotentiometer } from './potentiometer'
import { buildThermistor } from './thermistor'
import { buildTransistor } from './transistor'
import { buildPiezoBuzzer } from './buzzer'
import { buildButton } from './button'
import { buildLDR } from './ldr'

export const BUILDERS = {
  arduino: buildArduinoBoard,
  esp32: buildESP32,
  breadboard: buildBreadboard,
  led: buildLED,
  resistor: buildResistor,
  capacitor: buildCapacitor,
  potentiometer: buildPotentiometer,
  thermistor: buildThermistor,
  transistor: buildTransistor,
  buzzer: buildPiezoBuzzer,
  button: buildButton,
  ldr: buildLDR,
}

export {
  buildArduinoBoard,
  buildESP32,
  buildBreadboard,
  buildLED,
  buildResistor,
  buildCapacitor,
  buildPotentiometer,
  buildThermistor,
  buildTransistor,
  buildPiezoBuzzer,
  buildButton,
  buildLDR,
}
