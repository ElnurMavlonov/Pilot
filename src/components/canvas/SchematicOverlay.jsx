import { useUIStore } from '../../stores/uiStore'
import { useCircuitStore } from '../../stores/circuitStore'

export default function SchematicOverlay() {
  const open = useUIStore(s => s.schematicPanelOpen)
  const activePreset = useCircuitStore(s => s.activePreset)
  const presets = useCircuitStore(s => s.presets)

  if (!open) return null

  const data = presets[activePreset]

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Circuit Schematic</span>
        <button
          onClick={() => useUIStore.getState().toggleSchematicPanel()}
          className="text-slate-400 hover:text-white transition cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-xs" />
        </button>
      </div>
      <svg viewBox="0 0 400 300" className="w-[320px] h-auto" dangerouslySetInnerHTML={{ __html: data?.schematic || '' }} />
    </div>
  )
}
