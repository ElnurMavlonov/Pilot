import { toggleShortcutsOverlay } from '../lib/iotify-app.js';

function Row({ label, keys }) {
  return (
    <div className="shortcut-row">
      <span className="sh-label">{label}</span>
      <span className="sh-keys">
        {keys.map((k, i) => <kbd key={i} className="sh-key">{k}</kbd>)}
      </span>
    </div>
  );
}

export default function ShortcutsOverlay() {
  const handleBg = (e) => { if (e.target === e.currentTarget) toggleShortcutsOverlay(); };
  return (
    <div id="shortcuts-overlay" onClick={handleBg}>
      <div className="overlay-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-keyboard text-indigo-500 text-lg"></i>
            <h2 className="text-base font-bold text-slate-900">Keyboard Shortcuts</h2>
          </div>
          <button onClick={toggleShortcutsOverlay} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Navigation</p>
        <Row label="Toggle Sidebar" keys={['Ctrl', 'B']} />
        <Row label="Toggle IDE Panel" keys={['Ctrl', 'J']} />
        <Row label="Show Shortcuts" keys={['?']} />
        <Row label="Close Overlay" keys={['Esc']} />
        <Row label="Undo" keys={['Ctrl', 'Z']} />
        <Row label="Redo" keys={['Ctrl', 'Y']} />

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-3">3D Viewport</p>
        <Row label="Rotate Camera" keys={['Left Drag']} />
        <Row label="Zoom" keys={['Scroll']} />
        <Row label="Pan" keys={['Right Drag']} />

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-3">Components &amp; Wiring</p>
        <Row label="Delete Selected" keys={['Del']} />
        <Row label="Context Menu" keys={['Right Click']} />
        <Row label="Toggle Wire Tool" keys={['W']} />
        <Row label="Cancel Wire / Exit Mode" keys={['Esc']} />

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-3">Sharing</p>
        <Row label="Copy share link" keys={['S']} />
        <Row label="Restart Tour" keys={['T']} />

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-3">Firmware IDE</p>
        <Row label="Copy Code" keys={['Ctrl', 'C']} />
        <div className="shortcut-row">
          <span className="sh-label">Run Custom Code</span>
          <span className="sh-keys"><kbd className="sh-key">Run</kbd> button</span>
        </div>
      </div>
    </div>
  );
}
