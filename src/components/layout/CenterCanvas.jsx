import { useUIStore } from '../../stores/uiStore'
import ThreeCanvas from '../canvas/ThreeCanvas'
import SchematicOverlay from '../canvas/SchematicOverlay'
import ViewportControls from '../canvas/ViewportControls'

export default function CenterCanvas({ sceneRef, onSceneReady }) {
  const leftPanelOpen = useUIStore(s => s.leftPanelOpen)
  const rightPanelOpen = useUIStore(s => s.rightPanelOpen)

  return (
    <main className="flex-1 relative overflow-hidden bg-slate-100">
      <ThreeCanvas onSceneReady={onSceneReady} />
      <SchematicOverlay />
      <ViewportControls sceneRef={sceneRef} />

      {!leftPanelOpen && (
        <div id="left-edge-tab" className="panel-edge-tab hidden md:block">
          <button onClick={() => useUIStore.getState().toggleLeftPanel()}>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <span className="edge-label">Copilot</span>
          </button>
        </div>
      )}

      {!rightPanelOpen && (
        <div id="right-edge-tab" className="panel-edge-tab hidden md:block">
          <button onClick={() => useUIStore.getState().toggleRightPanel()}>
            <i className="fa-solid fa-chevron-left text-[10px]" />
            <span className="edge-label">Parts</span>
          </button>
        </div>
      )}
    </main>
  )
}
