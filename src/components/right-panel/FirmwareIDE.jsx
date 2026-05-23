import { useCircuitStore } from '../../stores/circuitStore'
import { useSimulationStore } from '../../stores/simulationStore'
import { useUIStore } from '../../stores/uiStore'

export default function FirmwareIDE() {
  const customCode = useCircuitStore(s => s.customCode)
  const setCustomCode = useCircuitStore(s => s.setCustomCode)

  const handleCopy = () => {
    navigator.clipboard.writeText(customCode).catch(() => {
      const tmp = document.createElement("textarea")
      tmp.value = customCode
      document.body.appendChild(tmp)
      tmp.select()
      document.execCommand("copy")
      document.body.removeChild(tmp)
    })
    useUIStore.getState().showToast("Firmware code copied to clipboard!")
  }

  const handleRun = () => {
    if (!useSimulationStore.getState().isSimulating) {
      useSimulationStore.getState().toggleSimulation()
    }
    useUIStore.getState().showToast("Custom firmware applied — simulation running!")
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-slate-400 font-mono">sketch.ino</span>
        </div>
        <div className="flex gap-1">
          <button onClick={handleRun} className="px-2 py-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition cursor-pointer">
            <i className="fa-solid fa-play mr-1" />Run
          </button>
          <button onClick={handleCopy} className="px-2 py-1 text-[10px] bg-slate-600 hover:bg-slate-500 text-white rounded font-semibold transition cursor-pointer">
            <i className="fa-solid fa-copy mr-1" />Copy
          </button>
        </div>
      </div>
      <textarea
        id="code-content"
        value={customCode}
        onChange={e => setCustomCode(e.target.value)}
        className="flex-1 p-4 bg-slate-900 text-cyan-300 font-mono text-xs leading-relaxed resize-none focus:outline-none"
        spellCheck={false}
      />
      <div className="px-3 py-1.5 bg-slate-800 border-t border-slate-700 text-[9px] text-slate-500 flex justify-between">
        <span>Arduino C++ | UTF-8</span>
        <span>Board: Arduino Uno</span>
      </div>
    </div>
  )
}
