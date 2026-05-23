import { useUIStore } from '../../stores/uiStore'

const SECTIONS = [
  {
    title: 'Navigation',
    shortcuts: [
      { label: 'Toggle Sidebar', keys: ['Ctrl', 'B'] },
      { label: 'Toggle IDE Panel', keys: ['Ctrl', 'J'] },
      { label: 'Show Shortcuts', keys: ['?'] },
      { label: 'Close Overlay', keys: ['Esc'] },
      { label: 'Undo', keys: ['Ctrl', 'Z'] },
      { label: 'Redo', keys: ['Ctrl', 'Y'] },
    ]
  },
  {
    title: '3D Viewport',
    shortcuts: [
      { label: 'Rotate Camera', keys: ['Left Drag'] },
      { label: 'Zoom', keys: ['Scroll'] },
      { label: 'Pan', keys: ['Right Drag'] },
    ]
  },
  {
    title: 'Components',
    shortcuts: [
      { label: 'Delete Selected', keys: ['Del'] },
      { label: 'Context Menu', keys: ['Right Click'] },
    ]
  },
  {
    title: 'Sharing',
    shortcuts: [
      { label: 'Copy share link', keys: ['S'] },
    ]
  },
  {
    title: 'Firmware IDE',
    shortcuts: [
      { label: 'Copy Code', keys: ['Ctrl', 'C'] },
      { label: 'Run Custom Code', keys: ['Run', 'button'] },
    ]
  },
]

export default function ShortcutsOverlay() {
  const open = useUIStore(s => s.shortcutsOverlayOpen)
  const close = useUIStore(s => s.closeShortcutsOverlay)

  return (
    <div
      id="shortcuts-overlay"
      className={open ? 'open' : ''}
      onClick={e => { if (e.target === e.currentTarget) close() }}
    >
      <div className="overlay-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-keyboard text-indigo-500 text-lg" />
            <h2 className="text-base font-bold text-slate-900">Keyboard Shortcuts</h2>
          </div>
          <button onClick={close} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer">
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {SECTIONS.map(section => (
          <div key={section.title}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-3 first:mt-0">
              {section.title}
            </p>
            {section.shortcuts.map(s => (
              <div key={s.label} className="shortcut-row">
                <span className="sh-label">{s.label}</span>
                <span className="sh-keys">
                  {s.keys.map(k => <kbd key={k} className="sh-key">{k}</kbd>)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
