import { useRef } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useCircuitStore } from '../../stores/circuitStore'
import { saveProject } from '../../services/storage'
import { loadProjectFile } from '../../services/storage'
import { buildShareUrl } from '../../services/sharing'

export default function BrandHeader() {
  const fileInputRef = useRef(null)
  const darkMode = useUIStore(s => s.darkMode)
  const presetData = useCircuitStore(s => s.presets[s.activePreset])

  const handleSave = () => {
    const cs = useCircuitStore.getState()
    saveProject({
      version: '1.0',
      preset: cs.activePreset,
      step: cs.activeStep,
      customCode: cs.customCode,
      placedComponents: cs.placedComponents,
    })
    useUIStore.getState().showToast("Project saved!")
  }

  const handleLoad = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const data = await loadProjectFile(file)
      const cs = useCircuitStore.getState()
      if (!data.preset || !cs.presets[data.preset]) {
        useUIStore.getState().showToast("Invalid project file.")
        return
      }
      cs.applyPreset(data.preset)
      if (typeof data.step === 'number') cs.setActiveStep(data.step)
      if (data.customCode) cs.setCustomCode(data.customCode)
      useUIStore.getState().showToast("Project loaded!")
    } catch {
      useUIStore.getState().showToast("Failed to load project.")
    }
    e.target.value = ''
  }

  const handleShare = () => {
    const cs = useCircuitStore.getState()
    const state = {
      version: '1.0',
      preset: cs.activePreset,
      step: cs.activeStep,
      customCode: cs.customCode,
      placedComponents: cs.placedComponents,
    }
    try {
      const url = buildShareUrl(state)
      navigator.clipboard.writeText(url).then(() => {
        useUIStore.getState().showToast("Share link copied to clipboard!")
      }).catch(() => {
        window.prompt("Copy this link:", url)
      })
    } catch {
      useUIStore.getState().showToast("Failed to encode circuit.")
    }
  }

  return (
    <div className="p-5 border-b border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <i className="fa-solid fa-microchip text-white text-sm" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">IoTify AI Lab</h1>
            <div id="status-badge" className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mt-0.5 font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> {presetData?.topic || 'Ready'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleSave} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition cursor-pointer" title="Save Project">
            <i className="fa-solid fa-floppy-disk text-xs" />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition cursor-pointer" title="Load Project">
            <i className="fa-solid fa-folder-open text-xs" />
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleLoad} />
          <button onClick={handleShare} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition cursor-pointer" title="Share Circuit (S)">
            <i className="fa-solid fa-share-nodes text-xs" />
          </button>
          <button onClick={() => useUIStore.getState().toggleDarkMode()} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition cursor-pointer" title="Toggle Dark Mode">
            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'} text-xs`} />
          </button>
          <button onClick={() => useUIStore.getState().toggleShortcutsOverlay()} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition cursor-pointer" title="Keyboard Shortcuts (?)">
            <i className="fa-solid fa-keyboard text-xs" />
          </button>
          <button onClick={() => useUIStore.getState().toggleLeftPanel()} className="panel-close-btn" title="Close Panel (Ctrl+B)">
            <i className="fa-solid fa-chevron-left text-xs" />
          </button>
        </div>
      </div>
    </div>
  )
}
