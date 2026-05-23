import { useEffect, useRef } from 'react'
import { useSimulationStore } from '../../stores/simulationStore'
import { useCircuitStore } from '../../stores/circuitStore'
import { useUIStore } from '../../stores/uiStore'
import useAudio from '../../hooks/useAudio'

export default function SimulationControls({ sceneRef }) {
  const isSimulating = useSimulationStore(s => s.isSimulating)
  const { startTone, stopTone } = useAudio()
  const tickerRef = useRef(false)

  useEffect(() => {
    if (!isSimulating) {
      stopTone()
      sceneRef.current?.resetOutputs()
      return
    }

    const interval = setInterval(() => {
      const preset = useCircuitStore.getState().activePreset
      const sim = useSimulationStore.getState()
      const manager = sceneRef.current
      if (!manager) return

      if (preset === 'blink') {
        tickerRef.current = !tickerRef.current
        manager.setLEDOutput(tickerRef.current)
        sim.appendSerial(tickerRef.current ? "LED: ON" : "LED: OFF")
      } else if (preset === 'night') {
        const on = sim.activeLdrLevel < 40
        manager.setLEDOutput(on)
        sim.appendSerial(`LDR: ${sim.activeLdrLevel}% → LED ${on ? 'ON' : 'OFF'}`)
      } else if (preset === 'button') {
        manager.setLEDOutput(sim.activeButtonState)
        sim.appendSerial(sim.activeButtonState ? "Button: PRESSED → LED ON" : "Button: released")
      } else if (preset === 'alarm') {
        tickerRef.current = !tickerRef.current
        const freq = tickerRef.current ? 880 : 440
        manager.setBuzzerOutput(tickerRef.current, freq)
        if (tickerRef.current) startTone(freq); else stopTone()
        sim.appendSerial(tickerRef.current ? "Buzzer: BEEP (880 Hz)" : "Buzzer: silence (440 Hz)")
      } else {
        sim.appendSerial("Simulation tick")
      }
    }, 500)

    useSimulationStore.getState().setSimInterval(interval)

    return () => {
      clearInterval(interval)
      stopTone()
    }
  }, [isSimulating, sceneRef, startTone, stopTone])

  const handleToggle = () => {
    const cs = useCircuitStore.getState()
    const data = cs.presets[cs.activePreset]
    if (data && cs.activeStep < data.steps.length - 1) {
      cs.setActiveStep(data.steps.length - 1)
    }
    useSimulationStore.getState().toggleSimulation()
  }

  return (
    <div className="px-5 pb-5">
      <div className="flex flex-col gap-2">
        <button
          onClick={handleToggle}
          className={`flex items-center justify-center gap-2 ${
            isSimulating
              ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/10'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/10'
          } text-white transition-all duration-300 px-4 py-3.5 rounded-2xl font-semibold text-sm shadow-xl cursor-pointer`}
        >
          <i className={`fa-solid ${isSimulating ? 'fa-pause' : 'fa-play'}`} />
          {isSimulating ? 'Halt Sandbox' : 'Run Sandbox'}
        </button>
        <button
          onClick={() => useUIStore.getState().toggleSchematicPanel()}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 transition-all px-4 py-2.5 rounded-xl font-semibold text-xs cursor-pointer"
        >
          <i className="fa-solid fa-diagram-project text-indigo-500" /> Diagram
        </button>
      </div>
    </div>
  )
}
