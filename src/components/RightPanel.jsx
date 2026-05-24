import {
  toggleRightPanel, switchTab, filterParts,
  runCustomCode, copySketchCode, clearSerial, clearOscilloscope,
} from '../lib/iotify-app.js';

export default function RightPanel() {
  return (
    <aside
      id="right-panel"
      className="bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col h-auto md:h-screen z-10 shrink-0 overflow-hidden min-w-0"
    >
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100" id="right-panel-icon">
            <i className="fa-solid fa-boxes-stacked text-sm"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800" id="right-panel-title">Parts Library</p>
            <p className="text-[10px] text-slate-400" id="right-panel-subtitle">Drag to place</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <button className="panel-close-btn ml-1" onClick={toggleRightPanel} title="Close Panel (⌘J)">
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      </div>

      {/* Tab Navigation: Parts | Firmware IDE | Serial | Scope */}
      <div className="flex items-center gap-1 px-3 pt-2.5 border-b border-slate-100 shrink-0 bg-white">
        <button id="tab-parts" onClick={() => switchTab('parts')}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-t-xl border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50 transition-all">
          <i className="fa-solid fa-boxes-stacked"></i> Parts
        </button>
        <button id="tab-ide" onClick={() => switchTab('ide')}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-t-xl border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all">
          <i className="fa-solid fa-code"></i> Firmware IDE
        </button>
        <button id="tab-serial" onClick={() => switchTab('serial')}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-t-xl border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all">
          <i className="fa-solid fa-terminal"></i> Serial
        </button>
        <button id="tab-scope" onClick={() => switchTab('scope')}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-t-xl border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all">
          <i className="fa-solid fa-wave-square"></i> Scope
        </button>
      </div>

      {/* ── Parts Library Panel ── */}
      <div id="panel-parts" className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4">
        <div className="relative shrink-0">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
          <input id="parts-search" type="text" placeholder="Search components..."
            onInput={(e) => filterParts(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400" />
        </div>

        <div className="parts-category shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-microchip text-indigo-400"></i> Microcontrollers
          </p>
          <div className="grid grid-cols-2 gap-2" id="cat-microcontrollers"></div>
        </div>

        <div className="parts-category shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-table-cells text-slate-400"></i> Prototyping
          </p>
          <div className="grid grid-cols-2 gap-2" id="cat-prototyping"></div>
        </div>

        <div className="parts-category shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-bolt text-amber-400"></i> Actuators
          </p>
          <div className="grid grid-cols-2 gap-2" id="cat-actuators"></div>
        </div>

        <div className="parts-category shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-satellite-dish text-emerald-400"></i> Sensors
          </p>
          <div className="grid grid-cols-2 gap-2" id="cat-sensors"></div>
        </div>

        <div className="parts-category shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-wave-square text-purple-400"></i> Passive
          </p>
          <div className="grid grid-cols-2 gap-2" id="cat-passive"></div>
        </div>

        <div id="placed-list-section" className="hidden border-t border-slate-100 pt-4 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-layer-group text-indigo-400"></i> Placed
            <span id="placed-count" className="ml-auto font-bold text-indigo-600">0</span>
          </p>
          <div id="placed-list" className="space-y-1.5"></div>
        </div>

        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-2.5 shrink-0">
          <i className="fa-solid fa-hand-pointer text-indigo-400 text-sm mt-0.5 shrink-0"></i>
          <p className="text-[11px] text-indigo-700 leading-relaxed">
            Drag any part onto the 3D canvas to place it. Click to select, press <kbd className="kbd">Del</kbd> to remove.
          </p>
        </div>
      </div>

      {/* ── Firmware IDE Panel ── */}
      <div id="panel-ide" className="hidden flex-col flex-1 overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] code-font font-semibold text-indigo-600 bg-white border border-indigo-100 px-2.5 py-1 rounded-t-md rounded-b-none border-b-white -mb-[9px] relative">sketch.ino</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={runCustomCode} className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer">
              <i className="fa-solid fa-play"></i> Run
            </button>
            <button onClick={copySketchCode} className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer">
              <i className="fa-solid fa-copy"></i> Copy
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-white">
          <textarea
            id="code-content"
            spellCheck="false"
            className="code-font text-[11.5px] text-slate-700 leading-6 whitespace-pre"
            style={{
              width: '100%', height: '100%', resize: 'none', outline: 'none',
              border: 'none', padding: '16px', boxSizing: 'border-box', background: 'transparent',
            }}
          />
        </div>
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] text-slate-500 font-medium">Ready to upload</span>
        </div>
      </div>

      {/* ── Serial Monitor Panel ── */}
      <div id="panel-serial" className="hidden flex-col flex-1 overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" id="serial-status-dot"></span>
            <span className="text-[10px] code-font font-semibold text-slate-600">Serial Monitor — 9600 baud</span>
          </div>
          <button onClick={clearSerial} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer">
            <i className="fa-solid fa-trash-can"></i> Clear
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4" id="serial-log-container">
          <pre id="serial-log" className="code-font text-[11px] text-emerald-400 leading-5 whitespace-pre-wrap"></pre>
        </div>
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 shrink-0">
          <p className="text-[10px] text-slate-400 font-medium">Run a simulation to see output</p>
        </div>
      </div>

      {/* ── Oscilloscope Panel ── */}
      <div id="panel-scope" className="hidden flex-col flex-1 overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" id="scope-status-dot"></span>
            <span className="text-[10px] code-font font-semibold text-slate-600">Oscilloscope — 100 ms/div</span>
          </div>
          <button onClick={clearOscilloscope} className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer">
            <i className="fa-solid fa-trash-can"></i> Clear
          </button>
        </div>
        <div className="flex-1 bg-slate-950 relative overflow-hidden">
          <canvas id="osc-canvas" className="absolute inset-0 w-full h-full"></canvas>
          <div id="osc-idle" className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <i className="fa-solid fa-wave-square text-slate-700 text-2xl"></i>
            <p className="text-[11px] text-slate-600 font-medium code-font">Run a simulation to see waveform</p>
          </div>
        </div>
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between">
          <span className="text-[10px] code-font text-slate-500" id="osc-signal-label">Signal: —</span>
          <span className="text-[10px] code-font text-slate-500" id="osc-freq-label">—</span>
        </div>
      </div>
    </aside>
  );
}
