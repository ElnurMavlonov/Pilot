import { useEffect, useRef } from 'react'
import { SceneManager } from '../three/SceneManager'
import { useCircuitStore } from '../stores/circuitStore'
import { useSimulationStore } from '../stores/simulationStore'
import { useUndoStore } from '../stores/undoStore'
import { useUIStore } from '../stores/uiStore'

export default function useThreeScene(containerRef) {
  const sceneRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const manager = new SceneManager(containerRef.current)
    manager.init()
    sceneRef.current = manager

    manager.onComponentPlaced = (type, variant, x, z) => {
      const circuitState = useCircuitStore.getState()
      const key = variant ? `${type}_${variant}` : type
      circuitState.incrementCounter(key)
      const count = useCircuitStore.getState().componentCounters[key]
      const instanceId = `${key}_${count}`
      manager.createComponent(type, variant, x, z, instanceId)
      circuitState.addPlacedComponent({ instanceId, type, variant, x, z })

      const undoState = useUndoStore.getState()
      undoState.saveSnapshot({
        components: manager.getPlacedComponentsSnapshot(),
        counters: { ...useCircuitStore.getState().componentCounters },
        selectedId: null,
      })
    }

    manager.onComponentSelected = (instanceId, wasDragged) => {
      useCircuitStore.getState().selectComponent(instanceId)
      if (wasDragged) {
        useUndoStore.getState().saveSnapshot({
          components: manager.getPlacedComponentsSnapshot(),
          counters: { ...useCircuitStore.getState().componentCounters },
          selectedId: instanceId,
        })
      }
    }

    manager.onComponentDeselected = () => {
      useCircuitStore.getState().deselectComponent()
    }

    manager.onContextMenu = (x, y, userData) => {
      useUIStore.getState().openContextMenu(x, y, userData.instanceId)
    }

    // Apply initial preset
    const initialState = useCircuitStore.getState()
    const presetData = initialState.presets[initialState.activePreset]
    if (presetData) {
      manager.rebuildWires(presetData.wires)
      manager.updateVisibilities(presetData.steps[0].visible)
      manager.glideCamera(presetData.steps[0].camera, presetData.steps[0].lookAt)
    }

    // Subscribe to preset/step changes
    const unsubPreset = useCircuitStore.subscribe(
      (state) => ({ preset: state.activePreset, step: state.activeStep }),
      ({ preset, step }) => {
        const data = useCircuitStore.getState().presets[preset]
        if (!data) return
        const stepData = data.steps[step]
        if (!stepData) return
        manager.updateVisibilities(stepData.visible)
        manager.glideCamera(stepData.camera, stepData.lookAt)
      },
      { equalityFn: (a, b) => a.preset === b.preset && a.step === b.step }
    )

    // Subscribe to free build mode
    const unsubMode = useCircuitStore.subscribe(
      (state) => state.isFreeBuildMode,
      (isFree) => {
        if (isFree) {
          manager.enterFreeBuildMode()
        } else {
          manager.enterPresetMode()
          const cs = useCircuitStore.getState()
          const data = cs.presets[cs.activePreset]
          if (data) manager.updateVisibilities(data.steps[cs.activeStep].visible)
        }
      }
    )

    // Subscribe to simulation effects
    const unsubSim = useSimulationStore.subscribe(
      (state) => state.activeLdrLevel,
      (level) => manager.setLDRRotation(level)
    )
    const unsubBtn = useSimulationStore.subscribe(
      (state) => state.activeButtonState,
      (pressed) => manager.setButtonPress(pressed)
    )

    return () => {
      unsubPreset()
      unsubMode()
      unsubSim()
      unsubBtn()
      manager.dispose()
      sceneRef.current = null
    }
  }, [containerRef])

  return sceneRef
}
