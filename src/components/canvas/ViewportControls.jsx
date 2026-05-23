import { useSimulationStore } from '../../stores/simulationStore'

export default function ViewportControls({ sceneRef }) {
  const audioMuted = useSimulationStore(s => s.audioMuted)

  const handleResetView = () => {
    sceneRef.current?.glideCamera(
      { x: 0, y: 12, z: 12 },
      { x: 0, y: 0, z: 0 }
    )
  }

  return (
    <div className="absolute bottom-4 right-4 z-10 flex gap-1.5">
      <button
        onClick={() => useSimulationStore.getState().toggleMute()}
        className="w-9 h-9 bg-white/90 backdrop-blur border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition cursor-pointer shadow-sm"
        title="Toggle Audio"
      >
        <i className={`fa-solid ${audioMuted ? 'fa-volume-xmark text-slate-400' : 'fa-volume-high text-indigo-400'}`} />
      </button>
      <button
        onClick={handleResetView}
        className="w-9 h-9 bg-white/90 backdrop-blur border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition cursor-pointer shadow-sm"
        title="Reset Camera"
      >
        <i className="fa-solid fa-expand" />
      </button>
    </div>
  )
}
