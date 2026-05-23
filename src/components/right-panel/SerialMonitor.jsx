import { useEffect, useRef } from 'react'
import { useSimulationStore } from '../../stores/simulationStore'

export default function SerialMonitor() {
  const serialLog = useSimulationStore(s => s.serialLog)
  const clearSerial = useSimulationStore(s => s.clearSerial)
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [serialLog])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-terminal text-emerald-500 text-[10px]" />
          <span className="text-[10px] text-slate-400 font-mono">9600 baud</span>
        </div>
        <button
          onClick={clearSerial}
          className="px-2 py-1 text-[10px] bg-slate-600 hover:bg-slate-500 text-white rounded font-semibold transition cursor-pointer"
        >
          <i className="fa-solid fa-eraser mr-1" />Clear
        </button>
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-slate-950 p-3">
        <pre id="serial-log" className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
          {serialLog.join('\n')}
        </pre>
      </div>
    </div>
  )
}
