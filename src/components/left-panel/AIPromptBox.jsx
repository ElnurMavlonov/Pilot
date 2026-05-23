import { useState } from 'react'
import { useCircuitStore } from '../../stores/circuitStore'
import { useUIStore } from '../../stores/uiStore'
import { generateAICircuit, getFallbackPresetKey } from '../../services/ai'

const QUICK_PRESETS = [
  { key: 'blink', label: 'LED Blink', icon: 'fa-lightbulb', color: 'text-red-500', bg: 'bg-red-50' },
  { key: 'night', label: 'Night Light', icon: 'fa-moon', color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'alarm', label: 'Siren', icon: 'fa-bell', color: 'text-purple-500', bg: 'bg-purple-50' },
  { key: 'button', label: 'Push Button', icon: 'fa-hand-pointer', color: 'text-pink-500', bg: 'bg-pink-50' },
]

export default function AIPromptBox() {
  const [input, setInput] = useState('')
  const applyPreset = useCircuitStore(s => s.applyPreset)

  const handleGenerate = async () => {
    if (!input.trim()) return
    useUIStore.getState().showToast("AI is architecting your custom hardware setup...", true)

    try {
      const preset = await generateAICircuit(input.trim())
      useCircuitStore.getState().addAIPreset(preset)
      useCircuitStore.getState().applyPreset('ai-generated')
      useUIStore.getState().showToast("AI has generated your laboratory sandbox!")
    } catch {
      const fallbackKey = getFallbackPresetKey(input.trim())
      await new Promise(r => setTimeout(r, 1200))
      applyPreset(fallbackKey)
      useUIStore.getState().showToast("Lab generated using offline local patterns!")
    }
  }

  return (
    <div className="p-5 border-b border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
          <i className="fa-solid fa-wand-magic-sparkles text-white text-[10px]" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-slate-800">AI Circuit Architect</h2>
          <p className="text-[9px] text-slate-400">Describe your circuit idea</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {QUICK_PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => applyPreset(p.key)}
            className={`flex flex-col items-center gap-1 ${p.bg} hover:brightness-95 rounded-xl px-2 py-2.5 transition cursor-pointer`}
          >
            <i className={`fa-solid ${p.icon} ${p.color} text-sm`} />
            <span className="text-[8px] font-bold text-slate-600">{p.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => useUIStore.getState().openCommunityModal()}
        className="w-full flex items-center justify-center gap-2 py-2 mb-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 hover:border-purple-300 rounded-xl text-xs font-semibold text-purple-700 transition cursor-pointer"
      >
        <i className="fa-solid fa-users text-[10px]" /> Community Library
      </button>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          placeholder="e.g. Build a temperature alarm..."
          className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          onClick={handleGenerate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-bolt text-[10px]" /> Generate
        </button>
      </div>
    </div>
  )
}
