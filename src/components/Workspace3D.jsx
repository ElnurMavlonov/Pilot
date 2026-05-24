import {
  undo, redo, toggleMuteAudio, toggleWireMode, resetCamera,
  toggleLeftPanel, toggleRightPanel, toggleSchematicPanel,
  setActiveWireColor,
} from '../lib/iotify-app.js';

export default function Workspace3D() {
  return (
    <main className="flex-1 relative h-[50vh] md:h-screen w-full min-w-0 overflow-hidden">
      <div id="canvas-view" className="w-full h-full cursor-grab active:cursor-grabbing"></div>

      {/* 3D Camera Controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 z-10">
        <button id="btn-undo" onClick={undo} disabled title="Undo (Ctrl+Z)" className="p-3 bg-white/95 border border-slate-200 text-slate-400 rounded-xl shadow-lg hover:bg-white transition text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
          <i className="fa-solid fa-rotate-left"></i>
        </button>
        <button id="btn-redo" onClick={redo} disabled title="Redo (Ctrl+Y)" className="p-3 bg-white/95 border border-slate-200 text-slate-400 rounded-xl shadow-lg hover:bg-white transition text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
          <i className="fa-solid fa-rotate-right"></i>
        </button>
        <button id="mute-btn" onClick={toggleMuteAudio} className="p-3 bg-white/95 border border-slate-200 text-slate-700 rounded-xl shadow-lg hover:bg-white transition flex items-center gap-2 text-xs font-semibold cursor-pointer" title="Mute/Unmute Buzzer">
          <i id="mute-icon" className="fa-solid fa-volume-high text-indigo-400"></i>
        </button>
        <button onClick={resetCamera} className="p-3 bg-white/95 border border-slate-200 text-slate-700 rounded-xl shadow-lg hover:bg-white transition flex items-center gap-2 text-xs font-semibold cursor-pointer" title="Default Perspective">
          <i className="fa-solid fa-camera-rotate text-indigo-400"></i> Reset View
        </button>
        <input
          type="color"
          id="wire-color-input"
          defaultValue="#ef4444"
          title="Wire color"
          onInput={(e) => setActiveWireColor(e.target.value)}
          className="p-1 bg-white/95 border border-slate-200 rounded-xl shadow-lg h-10 w-10 cursor-pointer"
        />
        <button id="wire-tool-btn" onClick={toggleWireMode} title="Wire Tool (W)" className="p-3 bg-white/95 border border-slate-200 text-slate-700 rounded-xl shadow-lg hover:bg-white transition flex items-center gap-2 text-xs font-semibold cursor-pointer">
          <i className="fa-solid fa-bezier-curve text-indigo-400"></i> Wire
        </button>
      </div>

      <div id="wire-mode-indicator">⚡ Wire Mode — click a pin to start</div>
      <div id="pin-tooltip"></div>

      {/* Floating SVG Schematic Overlay */}
      <div id="schematic-panel" className="absolute inset-4 md:inset-8 bg-white border border-slate-200 rounded-3xl p-6 hidden flex-col z-20 shadow-2xl max-w-xl overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-diagram-project text-indigo-500 text-lg"></i>
            <h3 className="font-bold text-slate-900">Circuit Schematic</h3>
          </div>
          <button onClick={toggleSchematicPanel} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition rounded-xl cursor-pointer">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center min-h-[220px]">
          <svg id="svg-schematic" viewBox="0 0 400 300" className="w-full max-h-[260px]"></svg>
        </div>
        <p id="schematic-description" className="text-xs text-slate-600 mt-4 leading-relaxed">
          Visual connection schematic showing real-time voltage source flows. Current moves out of digital input/output pins, through safety limiters, directly driving the physical components back to the core ground line.
        </p>
      </div>

      {/* Edge tabs (shown when panels are closed) */}
      <div id="left-edge-tab" className="panel-edge-tab hidden">
        <button onClick={toggleLeftPanel} title="Open AI Copilot (⌘B)" aria-label="Open AI Lab panel">
          <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }}></i>
          <span className="edge-label">AI Lab</span>
        </button>
      </div>

      <div id="right-edge-tab" className="panel-edge-tab hidden">
        <button onClick={toggleRightPanel} title="Open Firmware IDE (⌘J)" aria-label="Open Firmware IDE panel">
          <i className="fa-solid fa-chevron-left" style={{ fontSize: '10px' }}></i>
          <span className="edge-label">IDE</span>
        </button>
      </div>
    </main>
  );
}
