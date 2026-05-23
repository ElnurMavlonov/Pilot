import { useCallback, useRef } from 'react'
import { useUIStore } from '../stores/uiStore'

export default function usePanelResize(side) {
  const startX = useRef(0)
  const startWidth = useRef(0)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    startX.current = e.clientX
    const state = useUIStore.getState()
    startWidth.current = side === 'left' ? state.leftPanelWidth : state.rightPanelWidth
    document.body.classList.add('is-dragging')

    const onMouseMove = (e) => {
      const delta = side === 'left'
        ? e.clientX - startX.current
        : startX.current - e.clientX
      const newWidth = startWidth.current + delta
      if (side === 'left') {
        useUIStore.getState().setLeftPanelWidth(newWidth)
      } else {
        useUIStore.getState().setRightPanelWidth(newWidth)
      }
    }

    const onMouseUp = () => {
      document.body.classList.remove('is-dragging')
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [side])

  const onDoubleClick = useCallback(() => {
    if (side === 'left') {
      useUIStore.getState().setLeftPanelWidth(480)
    } else {
      useUIStore.getState().setRightPanelWidth(300)
    }
  }, [side])

  return { onMouseDown, onDoubleClick }
}
