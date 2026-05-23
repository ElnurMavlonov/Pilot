import { useRef, useEffect } from 'react'
import useThreeScene from '../../hooks/useThreeScene'

export default function ThreeCanvas({ onSceneReady }) {
  const containerRef = useRef(null)
  const sceneRef = useThreeScene(containerRef)

  useEffect(() => {
    if (sceneRef.current && onSceneReady) {
      onSceneReady(sceneRef)
    }
  }, [sceneRef.current, onSceneReady])

  return (
    <div
      ref={containerRef}
      id="canvas-view"
      className="w-full h-full cursor-grab active:cursor-grabbing"
    />
  )
}
