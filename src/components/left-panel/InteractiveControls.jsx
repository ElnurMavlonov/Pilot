import { useCircuitStore } from '../../stores/circuitStore'
import { useSimulationStore } from '../../stores/simulationStore'

export default function InteractiveControls() {
  const activePreset = useCircuitStore(s => s.activePreset)
  const presets = useCircuitStore(s => s.presets)
  const activeLdrLevel = useSimulationStore(s => s.activeLdrLevel)
  const setLdrLevel = useSimulationStore(s => s.setLdrLevel)
  const setButtonState = useSimulationStore(s => s.setButtonState)

  const data = presets[activePreset]
  if (!data || data.interactiveType === 'none') return null

  return (
    <div className="px-5 pb-4">
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Interactive Hardware Controls
        </p>

        {data.interactiveType === 'slider' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">
                <i className="fa-solid fa-sun text-amber-500 mr-1.5" /> Ambient Light Level
              </span>
              <span className="text-xs font-bold text-indigo-600">{activeLdrLevel}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={activeLdrLevel}
              onChange={e => setLdrLevel(e.target.value)}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-slate-400">Dark</span>
              <span className="text-[9px] text-slate-400">Bright</span>
            </div>
          </div>
        )}

        {data.interactiveType === 'button' && (
          <div className="flex items-center gap-3">
            <button
              onMouseDown={() => setButtonState(true)}
              onMouseUp={() => setButtonState(false)}
              onMouseLeave={() => setButtonState(false)}
              className="w-14 h-14 bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 active:from-rose-700 active:to-rose-800 rounded-2xl shadow-lg shadow-rose-200 active:shadow-none active:translate-y-0.5 transition-all text-white text-xl cursor-pointer"
            >
              <i className="fa-solid fa-hand-pointer" />
            </button>
            <div>
              <p className="text-xs font-semibold text-slate-700">Push Button</p>
              <p className="text-[10px] text-slate-400">Hold to press, release to open</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
