import { useState } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useCircuitStore } from '../../stores/circuitStore'

export default function ContextMenu({ sceneRef }) {
  const { visible, x, y, targetId } = useUIStore(s => s.contextMenu)
  const closeMenu = useUIStore(s => s.closeContextMenu)
  const [showInfo, setShowInfo] = useState(false)

  if (!visible || !targetId) return null

  const placed = useCircuitStore.getState().placedComponents
  const comp = placed.find(c => c.instanceId === targetId)
  const threeGroup = sceneRef.current?.placedComponents.find(g => g.userData.instanceId === targetId)

  const label = comp ? (comp.variant ? `${comp.type} (${comp.variant})` : comp.type) : targetId

  const menuW = 190, menuH = 230
  const vw = window.innerWidth, vh = window.innerHeight
  const left = (x + menuW > vw ? x - menuW : x)
  const top = (y + menuH > vh ? y - menuH : y)

  const handleSelect = () => {
    useCircuitStore.getState().selectComponent(targetId)
    closeMenu()
  }

  const handleDelete = () => {
    sceneRef.current?.removeComponent(targetId)
    useCircuitStore.getState().removePlacedComponent(targetId)
    closeMenu()
  }

  return (
    <div
      id="ctx-menu"
      className="visible"
      style={{ left: `${left}px`, top: `${top}px` }}
      role="menu"
    >
      <div className="ctx-header">
        <div className="ctx-type">{label}</div>
        <div className="ctx-id">{targetId}</div>
      </div>

      <button className="ctx-row" onClick={handleSelect}>
        <i className="fa-solid fa-arrow-pointer text-xs" /> Select
      </button>

      <button className="ctx-row" onClick={() => setShowInfo(!showInfo)}>
        <i className="fa-solid fa-circle-info text-xs" /> {showInfo ? 'Hide' : 'Show'} Info
      </button>

      {showInfo && threeGroup && (
        <div className="ctx-info-block open">
          <div className="ctx-info-row"><span className="lbl">Type</span><span className="val">{comp?.type}</span></div>
          <div className="ctx-info-row"><span className="lbl">Variant</span><span className="val">{comp?.variant || '—'}</span></div>
          <div className="ctx-info-row"><span className="lbl">X</span><span className="val">{threeGroup.position.x.toFixed(2)}</span></div>
          <div className="ctx-info-row"><span className="lbl">Z</span><span className="val">{threeGroup.position.z.toFixed(2)}</span></div>
          <div className="ctx-info-row"><span className="lbl">Instance</span><span className="val">{targetId}</span></div>
        </div>
      )}

      <div className="ctx-divider" />

      <button className="ctx-row danger" onClick={handleDelete}>
        <i className="fa-solid fa-trash-can text-xs" /> Delete
      </button>
    </div>
  )
}
