import { useState } from 'react';
import {
  toggleRightPanel, switchTab, filterParts,
  runCustomCode, copySketchCode, clearSerial, clearOscilloscope,
} from '../lib/iotify-app.js';

/* ── Accordion section for component library ── */
function AccordionSection({ sectionId, icon, label, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <i className={`${icon} text-slate-400 text-[11px]`}></i>
          {label}
        </span>
        <i
          className={`fa-solid text-slate-400 text-[10px] transition-transform ${
            open ? 'fa-chevron-down' : 'fa-chevron-right'
          }`}
        ></i>
      </button>

      {/* Always in DOM (hidden via class) so JS can appendChild */}
      <div className={`pb-3 px-3 ${open ? 'block' : 'hidden'}`}>
        <div id={sectionId} className="grid grid-cols-2 gap-2"></div>
      </div>
    </div>
  );
}

export default function RightPanel() {
  return (
    <aside
      id="right-panel"
      className="bg-white border-l border-slate-200 flex flex-col h-full z-10 shrink-0 overflow-hidden min-w-0"
    >
      {/* ── Tab Navigation ── */}
      <div className="flex items-center px-2 pt-2 border-b border-slate-100 shrink-0 bg-white gap-0.5">
        <button
          id="tab-parts"
          onClick={() => switchTab('parts')}
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-t-lg border-b-2 border-blue-600 text-blue-700 bg-blue-50 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-puzzle-piece text-[10px]"></i> Components
        </button>
        <button
          id="tab-ide"
          onClick={() => switchTab('ide')}
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-t-lg border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-code text-[10px]"></i> Code
        </button>
        <button
          id="tab-serial"
          onClick={() => switchTab('serial')}
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-t-lg border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-terminal text-[10px]"></i> Serial
        </button>
        <button
          id="tab-scope"
          onClick={() => switchTab('scope')}
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-t-lg border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-wave-square text-[10px]"></i> Scope
        </button>

        <div className="flex-1" />

        <button
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer mr-1"
          onClick={toggleRightPanel}
          title="Close Panel (⌘J)"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>

      {/* ── Panel title row (updated by JS for IDE/Serial/Scope tabs) ── */}
      <div className="px-4 py-2 border-b border-slate-100 shrink-0 flex items-center gap-2 bg-white min-h-[36px]">
        <div className="p-1 bg-blue-50 text-blue-600 rounded-md" id="right-panel-icon">
          <i className="fa-solid fa-puzzle-piece text-xs"></i>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-800 leading-none" id="right-panel-title">
            Components
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5" id="right-panel-subtitle">
            Drag to place
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          PARTS LIBRARY PANEL
      ══════════════════════════════════════════════════ */}
      <div id="panel-parts" className="flex flex-col flex-1 overflow-y-auto">

        {/* Search */}
        <div className="px-4 py-3 shrink-0 border-b border-slate-100">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
            <input
              id="parts-search"
              type="text"
              placeholder="Search components..."
              onInput={(e) => filterParts(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
            <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
              <i className="fa-solid fa-sliders text-xs"></i>
            </button>
          </div>
        </div>

        {/* Accordion component categories */}
        <div className="flex-1 overflow-y-auto">

          {/* Boards → cat-microcontrollers */}
          <AccordionSection
            sectionId="cat-microcontrollers"
            icon="fa-solid fa-microchip"
            label="Boards"
            defaultOpen
          />

          {/* Inputs → cat-sensors (input devices) */}
          <AccordionSection
            sectionId="cat-sensors"
            icon="fa-solid fa-satellite-dish"
            label="Inputs"
          />

          {/* Outputs → cat-actuators */}
          <AccordionSection
            sectionId="cat-actuators"
            icon="fa-solid fa-bolt"
            label="Outputs"
          />

          {/* Sensors → cat-prototyping (additional sensors) */}
          <AccordionSection
            sectionId="cat-prototyping"
            icon="fa-solid fa-temperature-half"
            label="Sensors"
          />

          {/* Power → cat-passive */}
          <AccordionSection
            sectionId="cat-passive"
            icon="fa-solid fa-wave-square"
            label="Power"
          />

          {/* Placed components section */}
          <div id="placed-list-section" className="hidden border-t border-slate-100">
            <div className="px-4 py-2.5 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <i className="fa-solid fa-layer-group text-blue-400"></i> Placed
              </p>
              <span id="placed-count" className="text-[10px] font-bold text-blue-600">0</span>
            </div>
            <div id="placed-list" className="px-3 pb-3 space-y-1.5"></div>
          </div>

          {/* Drag hint */}
          <div className="m-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <i className="fa-solid fa-hand-pointer text-blue-400 text-sm mt-0.5 shrink-0"></i>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Drag any part onto the 3D canvas to place it. Click to select, press{' '}
              <kbd className="kbd">Del</kbd> to remove.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          FIRMWARE IDE PANEL
      ══════════════════════════════════════════════════ */}
      <div id="panel-ide" className="hidden flex-col flex-1 overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] code-font font-semibold text-blue-600 bg-white border border-blue-100 px-2.5 py-1 rounded-t-md border-b-white -mb-[9px] relative">
              sketch.ino
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={runCustomCode}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <i className="fa-solid fa-play"></i> Run
            </button>
            <button
              onClick={copySketchCode}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
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
              width: '100%',
              height: '100%',
              resize: 'none',
              outline: 'none',
              border: 'none',
              padding: '16px',
              boxSizing: 'border-box',
              background: 'transparent',
            }}
          />
        </div>
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] text-slate-500 font-medium">Ready to upload</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SERIAL MONITOR PANEL
      ══════════════════════════════════════════════════ */}
      <div id="panel-serial" className="hidden flex-col flex-1 overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" id="serial-status-dot"></span>
            <span className="text-[10px] code-font font-semibold text-slate-600">
              Serial Monitor — 9600 baud
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={clearSerial}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <i className="fa-solid fa-trash-can"></i> Clear
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4" id="serial-log-container">
          <pre id="serial-log" className="code-font text-[11px] text-emerald-400 leading-5 whitespace-pre-wrap"></pre>
        </div>
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type to send..."
            className="flex-1 bg-slate-800 text-emerald-400 text-xs code-font px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
          />
          <button className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition cursor-pointer">
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          OSCILLOSCOPE PANEL
      ══════════════════════════════════════════════════ */}
      <div id="panel-scope" className="hidden flex-col flex-1 overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"
              id="scope-status-dot"
            ></span>
            <span className="text-[10px] code-font font-semibold text-slate-600">
              Oscilloscope
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select className="text-[10px] code-font font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400 cursor-pointer">
              <option>1s/div</option>
              <option>500ms/div</option>
              <option>100ms/div</option>
              <option>50ms/div</option>
            </select>
            <button
              onClick={clearOscilloscope}
              className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
        <div className="flex-1 bg-slate-950 relative overflow-hidden">
          <canvas id="osc-canvas" className="absolute inset-0 w-full h-full"></canvas>
          <div
            id="osc-idle"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
          >
            <i className="fa-solid fa-wave-square text-slate-700 text-2xl"></i>
            <p className="text-[11px] text-slate-600 font-medium code-font">
              Run a simulation to see waveform
            </p>
          </div>
        </div>
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-between">
          <span className="text-[10px] code-font text-slate-500" id="osc-signal-label">
            Signal: —
          </span>
          <span className="text-[10px] code-font text-slate-500" id="osc-freq-label">
            —
          </span>
        </div>
      </div>
    </aside>
  );
}
