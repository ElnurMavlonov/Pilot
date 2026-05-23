import { useUIStore } from '../../stores/uiStore'
import usePanelResize from '../../hooks/usePanelResize'

export default function ResizeHandle({ side }) {
  const open = useUIStore(s => side === 'left' ? s.leftPanelOpen : s.rightPanelOpen)
  const { onMouseDown, onDoubleClick } = usePanelResize(side)

  if (!open) return null

  return (
    <div
      className="resize-handle-wrap hidden md:flex items-center justify-center w-[9px] cursor-col-resize shrink-0 select-none z-20"
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <div className="resize-handle-bar h-full" />
    </div>
  )
}
