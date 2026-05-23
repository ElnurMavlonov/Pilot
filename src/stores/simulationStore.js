import { create } from 'zustand'

export const useSimulationStore = create((set, get) => ({
  isSimulating: false,
  simInterval: null,
  activeLdrLevel: 50,
  activeButtonState: false,
  serialLog: [],
  audioMuted: false,

  toggleSimulation: () => {
    const s = get()
    if (s.isSimulating) {
      if (s.simInterval) clearInterval(s.simInterval)
      set({ isSimulating: false, simInterval: null })
    } else {
      set({ isSimulating: true })
    }
  },

  stopSimulation: () => {
    const s = get()
    if (s.simInterval) clearInterval(s.simInterval)
    set({ isSimulating: false, simInterval: null })
  },

  setSimInterval: (id) => set({ simInterval: id }),

  setLdrLevel: (val) => set({ activeLdrLevel: parseInt(val) }),
  setButtonState: (pressed) => set({ activeButtonState: pressed }),

  appendSerial: (msg) => set(s => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    const entry = `[${time}] ${msg}`
    const log = [...s.serialLog, entry]
    return { serialLog: log.length > 200 ? log.slice(-200) : log }
  }),

  clearSerial: () => set({ serialLog: [] }),

  toggleMute: () => set(s => ({ audioMuted: !s.audioMuted })),
}))
