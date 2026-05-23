import { useState } from 'react'
import { PARTS_REGISTRY } from '../../data/partsRegistry'
import { useCircuitStore } from '../../stores/circuitStore'
import PartCard from './PartCard'

const CATEGORIES = [
  { key: 'microcontrollers', label: 'Microcontrollers', icon: 'fa-microchip', color: 'text-indigo-600' },
  { key: 'prototyping', label: 'Prototyping', icon: 'fa-table-cells', color: 'text-slate-600' },
  { key: 'actuators', label: 'Actuators', icon: 'fa-bolt', color: 'text-amber-600' },
  { key: 'sensors', label: 'Sensors', icon: 'fa-rss', color: 'text-cyan-600' },
  { key: 'passive', label: 'Passive', icon: 'fa-wave-square', color: 'text-purple-600' },
]

export default function PartsLibrary({ sceneRef }) {
  const [search, setSearch] = useState('')
  const placedComponents = useCircuitStore(s => s.placedComponents)
  const selectedComponentId = useCircuitStore(s => s.selectedComponentId)

  const filteredParts = search
    ? PARTS_REGISTRY.filter(p => p.label.toLowerCase().includes(search.toLowerCase()))
    : PARTS_REGISTRY

  const handleDragStart = (type, variant) => {
    if (sceneRef.current) {
      sceneRef.current.draggedPartData = { type, variant }
    }
  }

  const handleDeleteComponent = (instanceId) => {
    sceneRef.current?.removeComponent(instanceId)
    useCircuitStore.getState().removePlacedComponent(instanceId)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search components..."
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-300 mb-3"
      />

      <p className="text-[10px] text-slate-400 mb-3">
        <i className="fa-solid fa-hand mr-1" /> Drag parts onto the 3D canvas to place them
      </p>

      {CATEGORIES.map(cat => {
        const parts = filteredParts.filter(p => p.category === cat.key)
        if (!parts.length) return null
        return (
          <div key={cat.key} className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <i className={`fa-solid ${cat.icon} ${cat.color} text-[10px]`} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat.label}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {parts.map(part => (
                <PartCard key={part.id} part={part} onDragStart={handleDragStart} />
              ))}
            </div>
          </div>
        )
      })}

      {placedComponents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Placed ({placedComponents.length})
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {placedComponents.map(c => (
              <div
                key={c.instanceId}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                  c.instanceId === selectedComponentId
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                    : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'
                }`}
                onClick={() => useCircuitStore.getState().selectComponent(c.instanceId)}
              >
                <span className="font-medium truncate capitalize">
                  {c.variant ? `${c.type} (${c.variant})` : c.type}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteComponent(c.instanceId) }}
                  className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 transition shrink-0"
                >
                  <i className="fa-solid fa-trash-can text-[10px]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
