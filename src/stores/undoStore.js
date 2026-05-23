import { create } from 'zustand'

const UNDO_MAX = 50

export const useUndoStore = create((set, get) => ({
  undoStack: [],
  redoStack: [],
  _inRestore: false,

  saveSnapshot: (snapshot) => {
    if (get()._inRestore) return
    set(s => {
      const stack = [...s.undoStack, snapshot]
      if (stack.length > UNDO_MAX) stack.shift()
      return { undoStack: stack, redoStack: [] }
    })
  },

  undo: (currentSnapshot) => {
    const s = get()
    if (!s.undoStack.length) return null
    const stack = [...s.undoStack]
    const snapshot = stack.pop()
    set({
      undoStack: stack,
      redoStack: [...s.redoStack, currentSnapshot],
    })
    return snapshot
  },

  redo: (currentSnapshot) => {
    const s = get()
    if (!s.redoStack.length) return null
    const stack = [...s.redoStack]
    const snapshot = stack.pop()
    set({
      redoStack: stack,
      undoStack: [...s.undoStack, currentSnapshot],
    })
    return snapshot
  },

  setInRestore: (val) => set({ _inRestore: val }),
  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,

  reset: () => set({ undoStack: [], redoStack: [] }),
}))
