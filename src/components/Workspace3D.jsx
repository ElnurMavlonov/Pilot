import { useEffect, useState } from 'react';
import {
  undo, redo, toggleMuteAudio, toggleWireMode, resetCamera,
  toggleLeftPanel, toggleRightPanel, toggleSchematicPanel,
  setActiveWireColor, openCommunityLibrary,
  generateAICircuit, askAITutor,
  handleDhtTemp, handleDhtHumidity, handleDistanceSlider,
  handlePirMotion, handleServoAngle, handleMotorSpeed, handleRelayToggle,
  moveStep,
} from '../lib/iotify-app.js';

/* ── tiny toolbar separator ── */
function Sep() {
  return <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />;
}

/* ── canvas toolbar icon button ── */
function ToolBtn({ id, icon, label, onClick, active = false, disabled = false }) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-2 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
      }`}
    >
      <i className={icon}></i>
    </button>
  );
}

/* ── AI Tutor question chip ── */
function QuestionChip({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 rounded-full px-2.5 py-1 transition-all duration-150 cursor-pointer font-medium leading-tight"
    >
      <i className="fa-solid fa-sparkles text-purple-400" style={{ fontSize: '7px' }}></i>
      {children}
    </button>
  );
}

export default function Workspace3D() {
  const [zoomPct] = useState(100);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const sync = (e) => {
      setCanUndo(Boolean(e.detail?.canUndo));
      setCanRedo(Boolean(e.detail?.canRedo));
    };
    window.addEventListener('pilot:undo-redo', sync);
    return () => window.removeEventListener('pilot:undo-redo', sync);
  }, []);

  return (
    <main className="flex-1 flex flex-col min-h-0 min-w-0 relative overflow-hidden bg-white">

      {/* ══════════════════════════════════════════════════
          CANVAS TOOLBAR
      ══════════════════════════════════════════════════ */}
      <div className="h-10 border-b border-slate-200 bg-white flex items-center px-3 gap-1 shrink-0 z-10">

        {/* Select / Pan tools */}
        <ToolBtn icon="fa-solid fa-arrow-pointer" label="Select (Esc)" active />
        <ToolBtn icon="fa-solid fa-hand" label="Pan" />

        <Sep />

        {/* Zoom controls */}
        <button
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <i className="fa-solid fa-minus"></i>
        </button>
        <span className="text-xs text-slate-600 font-medium px-1 min-w-[42px] text-center tabular-nums">
          {zoomPct}%
        </span>
        <button
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs transition-colors cursor-pointer"
          title="Zoom In"
        >
          <i className="fa-solid fa-plus"></i>
        </button>

        <Sep />

        {/* Fit to screen */}
        <ToolBtn icon="fa-solid fa-maximize" label="Fit to Screen" onClick={resetCamera} />

        <Sep />

        {/* Functional tools */}
        <ToolBtn id="btn-undo" icon="fa-solid fa-rotate-left" label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo} />
        <ToolBtn id="btn-redo" icon="fa-solid fa-rotate-right" label="Redo (Ctrl+Y)" onClick={redo} disabled={!canRedo} />

        <Sep />

        {/* Mute — needs inner icon ID for JS class-swapping */}
        <button
          id="mute-btn"
          onClick={toggleMuteAudio}
          title="Mute Buzzer"
          className="p-2 rounded-lg text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <i id="mute-icon" className="fa-solid fa-volume-high"></i>
        </button>
        <button
          id="wire-tool-btn"
          onClick={toggleWireMode}
          title="Wire Tool (W)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-bezier-curve text-blue-500"></i>
          Wire
        </button>
        <input
          type="color"
          id="wire-color-input"
          defaultValue="#ef4444"
          title="Wire colour"
          onInput={(e) => setActiveWireColor(e.target.value)}
          className="h-7 w-7 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
        />

        <Sep />

        <ToolBtn
          icon="fa-solid fa-diagram-project"
          label="Circuit Schematic"
          onClick={toggleSchematicPanel}
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Panel toggles */}
        <ToolBtn icon="fa-solid fa-sidebar" label="Toggle Left Panel (⌘B)" onClick={toggleLeftPanel} />
        <ToolBtn icon="fa-solid fa-table-columns" label="Toggle Right Panel (⌘J)" onClick={toggleRightPanel} />
      </div>

      {/* ══════════════════════════════════════════════════
          3-D CANVAS VIEW (flex-1)
      ══════════════════════════════════════════════════ */}
      <div className="flex-1 relative min-h-0">
        <div
          id="canvas-view"
          className="w-full h-full cursor-grab active:cursor-grabbing grid-bg"
        />

        {/* Wire mode indicator */}
        <div id="wire-mode-indicator">⚡ Wire Mode — click a pin to start</div>
        {/* Pin tooltip */}
        <div id="pin-tooltip"></div>

        {/* Floating Schematic Overlay */}
        <div
          id="schematic-panel"
          className="absolute inset-4 md:inset-8 bg-white border border-slate-200 rounded-3xl p-6 hidden flex-col z-20 shadow-2xl max-w-xl overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-diagram-project text-blue-500 text-lg"></i>
              <h3 className="font-bold text-slate-900">Circuit Schematic</h3>
            </div>
            <button
              onClick={toggleSchematicPanel}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition rounded-xl cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center min-h-[220px]">
            <svg id="svg-schematic" viewBox="0 0 400 300" className="w-full max-h-[260px]"></svg>
          </div>
          <p
            id="schematic-description"
            className="text-xs text-slate-600 mt-4 leading-relaxed"
          >
            Visual connection schematic showing real-time voltage source flows.
          </p>
        </div>

        {/* Edge tabs (shown when panels are closed) */}
        <div id="left-edge-tab" className="panel-edge-tab hidden">
          <button onClick={toggleLeftPanel} title="Open Navigation (⌘B)" aria-label="Open left panel">
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }}></i>
            <span className="edge-label">Nav</span>
          </button>
        </div>
        <div id="right-edge-tab" className="panel-edge-tab hidden">
          <button onClick={toggleRightPanel} title="Open IDE (⌘J)" aria-label="Open right panel">
            <i className="fa-solid fa-chevron-left" style={{ fontSize: '10px' }}></i>
            <span className="edge-label">IDE</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          BOTTOM PANEL — AI Tutor
      ══════════════════════════════════════════════════ */}
      <div className="h-[260px] border-t border-slate-200 flex shrink-0 min-h-0">

        {/* ── AI Tutor (full width) ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">

          {/* Interactive hardware controls (shown/hidden by JS when simulation runs) */}
          <div
            id="interactive-hardware-control"
            className="hidden shrink-0 px-3 py-2 bg-blue-50 border-b border-blue-200 overflow-x-auto"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Sandbox Inputs
              </span>

              <div id="interactive-dht-wrapper" className="hidden flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-cyan-600 shrink-0"><i className="fa-solid fa-temperature-half mr-1"></i>DHT11</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">Temp</span>
                  <input id="hw-dht-temp" type="range" min="0" max="50" defaultValue="25" onInput={(e) => handleDhtTemp(e.target.value)} className="w-20 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600" />
                  <span id="dht-temp-val" className="text-[10px] font-bold text-blue-700 w-8">25°C</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">Hum</span>
                  <input id="hw-dht-hum" type="range" min="0" max="100" defaultValue="50" onInput={(e) => handleDhtHumidity(e.target.value)} className="w-20 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600" />
                  <span id="dht-hum-val" className="text-[10px] font-bold text-blue-700 w-8">50%</span>
                </div>
              </div>

              <div id="interactive-distance-wrapper" className="hidden flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-teal-600 shrink-0"><i className="fa-solid fa-ruler-horizontal mr-1"></i>HC-SR04</span>
                <input id="hw-distance" type="range" min="2" max="400" defaultValue="100" onInput={(e) => handleDistanceSlider(e.target.value)} className="w-24 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-teal-600" />
                <span id="distance-val" className="text-[10px] font-bold text-blue-700 w-12">100 cm</span>
              </div>

              <div id="interactive-pir-wrapper" className="hidden flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-emerald-600 shrink-0"><i className="fa-solid fa-person-walking mr-1"></i>PIR</span>
                <button id="hw-pir-btn" onMouseDown={() => handlePirMotion(true)} onMouseUp={() => handlePirMotion(false)} onMouseLeave={() => handlePirMotion(false)} onTouchStart={() => handlePirMotion(true)} onTouchEnd={() => handlePirMotion(false)}
                  className="bg-white hover:bg-blue-50 active:bg-emerald-600 active:text-white border border-blue-300 px-3 py-1 rounded-lg text-xs font-semibold text-blue-700 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                  Motion (hold)
                </button>
              </div>

              <div id="interactive-servo-wrapper" className="hidden flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-orange-600 shrink-0"><i className="fa-solid fa-gear mr-1"></i>Servo</span>
                <input id="hw-servo-angle" type="range" min="0" max="180" defaultValue="90" onInput={(e) => handleServoAngle(e.target.value)} className="w-24 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-orange-600" />
                <span id="servo-angle-val" className="text-[10px] font-bold text-blue-700 w-8">90°</span>
              </div>

              <div id="interactive-motor-wrapper" className="hidden flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-600 shrink-0"><i className="fa-solid fa-fan mr-1"></i>Motor</span>
                <input id="hw-motor-speed" type="range" min="-100" max="100" defaultValue="0" onInput={(e) => handleMotorSpeed(e.target.value)} className="w-24 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600" />
                <span id="motor-speed-val" className="text-[10px] font-bold text-blue-700 w-8">0%</span>
              </div>

              <div id="interactive-relay-wrapper" className="hidden flex items-center gap-2">
                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider shrink-0">
                  <i className="fa-solid fa-toggle-on mr-1"></i>Relay
                </span>
                <button
                  id="hw-relay-btn"
                  onMouseDown={() => handleRelayToggle(true)}
                  onMouseUp={() => handleRelayToggle(false)}
                  onMouseLeave={() => handleRelayToggle(false)}
                  onTouchStart={() => handleRelayToggle(true)}
                  onTouchEnd={() => handleRelayToggle(false)}
                  className="bg-white hover:bg-blue-50 active:bg-violet-600 active:text-white border border-blue-300 px-3 py-1 rounded-lg text-xs font-semibold text-blue-700 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  Energize (hold)
                </button>
              </div>
            </div>
          </div>

          {/* ── Zone 1: Header (always visible, fixed) ── */}
          <div className="px-3 pt-2.5 pb-2 border-b border-slate-100 shrink-0 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-wand-magic-sparkles text-white" style={{ fontSize: '9px' }}></i>
            </div>
            <h3 className="text-xs font-bold text-slate-900">AI Tutor</h3>
            <div className="ml-auto flex items-center gap-1">
              <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-semibold tracking-wide">ASK</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-semibold tracking-wide">BUILD</span>
            </div>
          </div>

          {/* ── Zone 2: Welcome (collapsed after first message) ── */}
          <div id="tutor-welcome" className="shrink-0 px-3 pt-2.5 pb-2.5 border-b border-slate-50 bg-slate-50/50">
            <div className="flex flex-wrap gap-1 mb-2">
              <button onClick={openCommunityLibrary}
                className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 rounded-lg px-2 py-1 transition-all duration-150 cursor-pointer font-semibold shadow-sm">
                <i className="fa-solid fa-users" style={{ fontSize: '8px' }}></i> Community
              </button>
            </div>

            {/* Question chips (compact pills, wrap naturally) */}
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Ask me</p>
            <div className="flex flex-wrap gap-1">
              <QuestionChip onClick={() => askAITutor('Why is my LED not turning on?')}>LED not on?</QuestionChip>
              <QuestionChip onClick={() => askAITutor('How does a resistor work?')}>How resistors work?</QuestionChip>
              <QuestionChip onClick={() => askAITutor('Explain this circuit step by step')}>Explain circuit</QuestionChip>
              <QuestionChip onClick={() => askAITutor('How can I improve this project?')}>Improve project?</QuestionChip>
              <QuestionChip onClick={() => askAITutor('What does GND mean?')}>What is GND?</QuestionChip>
              <QuestionChip onClick={() => askAITutor('Why do I need a resistor with an LED?')}>Why a resistor?</QuestionChip>
            </div>
          </div>

          {/* ── Zone 3: Chat history (flex-1 — ONLY this scrolls) ── */}
          <div
            id="tutor-chat"
            className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 min-h-0"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
          />

          {/* ── Zone 4: Input (always pinned to bottom) ── */}
          <div className="shrink-0 border-t border-slate-100 px-3 py-2.5 bg-white">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-blue-400 focus-within:bg-white transition-colors">
              <input
                id="ai-input"
                type="text"
                placeholder="Ask anything or describe a circuit…"
                onKeyDown={(e) => { if (e.key === 'Enter') generateAICircuit(); }}
                className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
              />
              <button
                id="btn-generate-ai"
                onClick={generateAICircuit}
                title="Send (Enter)"
                className="shrink-0 w-6 h-6 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer"
              >
                <i className="fa-solid fa-arrow-right" style={{ fontSize: '9px' }}></i>
              </button>
            </div>
            <p className="text-[9px] text-slate-400 text-center mt-1.5">
              Type a question to ask · Describe a circuit to build it
            </p>
          </div>
        </div>
      </div>
      {/* end bottom panels */}

    </main>
  );
}
