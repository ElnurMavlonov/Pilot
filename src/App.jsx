import { useEffect, useRef, useCallback } from 'react'
import { useUIStore } from './stores/uiStore'
import LeftPanel from './components/layout/LeftPanel'
import CenterCanvas from './components/layout/CenterCanvas'
import RightPanel from './components/layout/RightPanel'
import ResizeHandle from './components/layout/ResizeHandle'
import Toast from './components/ui/Toast'
import ContextMenu from './components/modals/ContextMenu'
import ShortcutsOverlay from './components/modals/ShortcutsOverlay'
import CommunityLibrary from './components/modals/CommunityLibrary'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'

export default function App() {
  const darkMode = useUIStore(s => s.darkMode)
  const sceneRef = useRef(null)

  useKeyboardShortcuts()

  const onSceneReady = useCallback((managerRef) => {
    sceneRef.current = managerRef.current
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden grid-bg">
      <LeftPanel sceneRef={sceneRef} />
      <ResizeHandle side="left" />
      <CenterCanvas sceneRef={sceneRef} onSceneReady={onSceneReady} />
      <ResizeHandle side="right" />
      <RightPanel sceneRef={sceneRef} />

      <Toast />
      <ContextMenu sceneRef={sceneRef} />
      <ShortcutsOverlay />
      <CommunityLibrary />
    </div>
  )
}
