import { useCircuitStore } from '../../stores/circuitStore'
import { useSimulationStore } from '../../stores/simulationStore'

export default function StepNavigator() {
  const activePreset = useCircuitStore(s => s.activePreset)
  const activeStep = useCircuitStore(s => s.activeStep)
  const presets = useCircuitStore(s => s.presets)
  const moveStep = useCircuitStore(s => s.moveStep)

  const data = presets[activePreset]
  if (!data) return null
  const step = data.steps[activeStep]
  const isLast = activeStep === data.steps.length - 1

  const handleNext = () => {
    if (isLast) {
      useSimulationStore.getState().toggleSimulation()
    } else {
      moveStep(1)
    }
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Dynamic Learning Stage
        </span>
        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          Step {activeStep + 1} of {data.steps.length}
        </span>
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-1">{step.title}</h3>
      <p className="text-xs text-slate-600 leading-relaxed mb-3">{step.desc}</p>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
        <i className="fa-solid fa-lightbulb text-amber-500 text-xs mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-800 leading-relaxed">{step.tip}</p>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => moveStep(-1)}
          disabled={activeStep === 0}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i className="fa-solid fa-chevron-left" /> Back
        </button>

        <div className="flex items-center gap-1.5">
          {data.steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeStep ? 'bg-indigo-600 w-5' : 'bg-slate-300 w-2'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className={`px-4 py-2 ${
            isLast
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-indigo-600 hover:bg-indigo-500'
          } text-white transition-colors rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer`}
        >
          {isLast ? (
            <>Start Sim <i className="fa-solid fa-play ml-1" /></>
          ) : (
            <>Next <i className="fa-solid fa-chevron-right" /></>
          )}
        </button>
      </div>
    </div>
  )
}
