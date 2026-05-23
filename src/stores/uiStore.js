import { create } from 'zustand'

export const useUIStore = create((set, get) => ({
  leftPanelOpen: true,
  rightPanelOpen: true,
  leftPanelWidth: 480,
  rightPanelWidth: 300,
  activeTab: 'parts',
  darkMode: localStorage.getItem('iotify-theme') === 'dark',
  shortcutsOverlayOpen: false,
  schematicPanelOpen: false,
  communityModalOpen: false,
  communityTab: 'browse',
  contextMenu: { visible: false, x: 0, y: 0, targetId: null },
  toast: { message: '', visible: false, timerId: null },

  toggleLeftPanel: () => set(s => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set(s => ({ rightPanelOpen: !s.rightPanelOpen })),
  setLeftPanelWidth: (w) => set({ leftPanelWidth: Math.max(280, Math.min(w, 700)) }),
  setRightPanelWidth: (w) => set({ rightPanelWidth: Math.max(220, Math.min(w, 600)) }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleDarkMode: () => {
    const next = !get().darkMode
    localStorage.setItem('iotify-theme', next ? 'dark' : 'light')
    set({ darkMode: next })
  },

  toggleShortcutsOverlay: () => set(s => ({ shortcutsOverlayOpen: !s.shortcutsOverlayOpen })),
  closeShortcutsOverlay: () => set({ shortcutsOverlayOpen: false }),
  toggleSchematicPanel: () => set(s => ({ schematicPanelOpen: !s.schematicPanelOpen })),

  openCommunityModal: () => set({ communityModalOpen: true, communityTab: 'browse' }),
  closeCommunityModal: () => set({ communityModalOpen: false }),
  setCommunityTab: (tab) => set({ communityTab: tab }),

  openContextMenu: (x, y, targetId) => set({ contextMenu: { visible: true, x, y, targetId } }),
  closeContextMenu: () => set({ contextMenu: { visible: false, x: 0, y: 0, targetId: null } }),

  showToast: (message, persistent = false) => {
    const prev = get().toast.timerId
    if (prev) clearTimeout(prev)
    const timerId = persistent ? null : setTimeout(() => {
      set({ toast: { message: '', visible: false, timerId: null } })
    }, 3000)
    set({ toast: { message, visible: true, timerId } })
  },
  hideToast: () => {
    const prev = get().toast.timerId
    if (prev) clearTimeout(prev)
    set({ toast: { message: '', visible: false, timerId: null } })
  },
}))
