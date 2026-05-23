import { create } from 'zustand'
import { PRESETS } from '../data/presets'

export const useCircuitStore = create((set, get) => ({
  presets: { ...PRESETS },
  activePreset: 'blink',
  activeStep: 0,
  placedComponents: [],
  componentCounters: {},
  selectedComponentId: null,
  isFreeBuildMode: false,
  customCode: '',

  getActivePresetData: () => {
    const s = get()
    return s.presets[s.activePreset]
  },

  getActiveStep: () => {
    const s = get()
    const data = s.presets[s.activePreset]
    return data ? data.steps[s.activeStep] : null
  },

  applyPreset: (key) => {
    const data = get().presets[key]
    if (!data) return
    set({
      activePreset: key,
      activeStep: 0,
      customCode: data.code,
    })
  },

  setActiveStep: (step) => set({ activeStep: step }),

  moveStep: (direction) => {
    const s = get()
    const data = s.presets[s.activePreset]
    if (!data) return
    const target = s.activeStep + direction
    if (target >= 0 && target < data.steps.length) {
      set({ activeStep: target })
    }
    return target
  },

  addAIPreset: (preset) => {
    set(s => ({
      presets: { ...s.presets, 'ai-generated': preset }
    }))
  },

  addPlacedComponent: (comp) => set(s => ({
    placedComponents: [...s.placedComponents, comp]
  })),

  removePlacedComponent: (instanceId) => set(s => ({
    placedComponents: s.placedComponents.filter(c => c.instanceId !== instanceId),
    selectedComponentId: s.selectedComponentId === instanceId ? null : s.selectedComponentId
  })),

  selectComponent: (instanceId) => set({ selectedComponentId: instanceId }),
  deselectComponent: () => set({ selectedComponentId: null }),

  setCustomCode: (code) => set({ customCode: code }),

  setComponentCounters: (counters) => set({ componentCounters: counters }),
  incrementCounter: (key) => set(s => ({
    componentCounters: {
      ...s.componentCounters,
      [key]: (s.componentCounters[key] || 0) + 1
    }
  })),

  enterFreeBuildMode: () => set({ isFreeBuildMode: true }),
  enterPresetMode: () => set({ isFreeBuildMode: false, selectedComponentId: null }),

  setPlacedComponents: (components) => set({ placedComponents: components }),

  restoreState: (state) => set({
    activePreset: state.preset,
    activeStep: state.step || 0,
    customCode: state.customCode || '',
  }),
}))
