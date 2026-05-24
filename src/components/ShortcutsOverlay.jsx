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

function Section({ title, children }) {
  return (
    <section className="shortcut-section">
      <p className="shortcut-section-title">{title}</p>
      {children}
    </section>
  );
}

export default function ShortcutsOverlay() {
  const handleBg = (e) => { if (e.target === e.currentTarget) toggleShortcutsOverlay(); };

  return (
    <div id="shortcuts-overlay" onClick={handleBg}>
      <div
        className="overlay-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="overlay-card-header">
          <div className="flex items-center gap-2 min-w-0">
            <i className="fa-solid fa-keyboard text-indigo-500 text-lg shrink-0"></i>
            <h2 id="shortcuts-title" className="text-base font-bold text-slate-900 truncate">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={toggleShortcutsOverlay}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
            aria-label="Close shortcuts"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="overlay-card-body">
          <Section title="Navigation">
            <Row label="Toggle Sidebar" keys={['Ctrl', 'B']} />
            <Row label="Toggle IDE Panel" keys={['Ctrl', 'J']} />
            <Row label="Show Shortcuts" keys={['?']} />
            <Row label="Close Overlay" keys={['Esc']} />
            <Row label="Undo" keys={['Ctrl', 'Z']} />
            <Row label="Redo" keys={['Ctrl', 'Y']} />
          </Section>

          <Section title="3D Viewport">
            <Row label="Rotate Camera" keys={['Left Drag']} />
            <Row label="Zoom" keys={['Scroll']} />
            <Row label="Pan" keys={['Right Drag']} />
          </Section>

          <Section title="Components & Wiring">
            <Row label="Delete Selected" keys={['Del']} />
            <Row label="Context Menu" keys={['Right Click']} />
            <Row label="Toggle Wire Tool" keys={['W']} />
            <Row label="Cancel Wire / Exit Mode" keys={['Esc']} />
          </Section>

          <Section title="Sharing">
            <Row label="Copy share link" keys={['S']} />
            <Row label="Restart Tour" keys={['T']} />
          </Section>

          <Section title="Firmware IDE">
            <Row label="Copy Code" keys={['Ctrl', 'C']} />
            <div className="shortcut-row">
              <span className="sh-label">Run Custom Code</span>
              <span className="sh-keys"><kbd className="sh-key">Run</kbd> button</span>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
