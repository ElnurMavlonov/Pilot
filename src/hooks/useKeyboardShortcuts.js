import { useEffect } from 'react'
import { useUIStore } from '../stores/uiStore'
import { useCircuitStore } from '../stores/circuitStore'
import { useUndoStore } from '../stores/undoStore'
import { buildShareUrl } from '../services/sharing'

export default function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e) => {
      const active = document.activeElement
      const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')

      if (e.key === 'Escape') {
        useUIStore.getState().closeContextMenu()
        useUIStore.getState().closeShortcutsOverlay()
        return
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
        const cs = useCircuitStore.getState()
        if (cs.selectedComponentId && cs.isFreeBuildMode) {
          e.preventDefault()
        }
        return
      }

      if (isTyping) return

      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        useUIStore.getState().toggleLeftPanel()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault()
        useUIStore.getState().toggleRightPanel()
      } else if (e.key === '?') {
        useUIStore.getState().toggleShortcutsOverlay()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
      } else if (e.key === 's' || e.key === 'S') {
        const cs = useCircuitStore.getState()
        const state = {
          version: '1.0',
          preset: cs.activePreset,
          step: cs.activeStep,
          customCode: cs.customCode,
          placedComponents: cs.placedComponents,
        }
        const url = buildShareUrl(state)
        navigator.clipboard.writeText(url).then(() => {
          useUIStore.getState().showToast("Share link copied to clipboard!")
        }).catch(() => {
          window.prompt("Copy this link:", url)
        })
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
