import { useState } from 'react';
import {
  undo, redo, toggleMuteAudio, toggleWireMode, resetCamera,
  toggleLeftPanel, toggleRightPanel, toggleSchematicPanel,
  setActiveWireColor, applyPreset, openCommunityLibrary,
  generateAICircuit, handleHardwareSlider, handleHardwareButton,
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

/* ── AI Tutor suggestion button ── */
function SuggestionBtn({ children }) {
  return (
    <button className="w-full flex items-center justify-between text-left text-[12px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors cursor-pointer group">
      <span>{children}</span>
      <i className="fa-solid fa-chevron-right text-[10px] opacity-50 group-hover:opacity-100 transition-opacity"></i>
    </button>
  );
}

export default function Workspace3D() {
  const [zoomPct] = useState(100);

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
        <ToolBtn id="btn-undo" icon="fa-solid fa-rotate-left" label="Undo (Ctrl+Z)" onClick={undo} disabled />
        <ToolBtn id="btn-redo" icon="fa-solid fa-rotate-right" label="Redo (Ctrl+Y)" onClick={redo} disabled />

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
          BOTTOM PANELS — Analysis & Steps | AI Tutor
      ══════════════════════════════════════════════════ */}
      <div className="h-[260px] border-t border-slate-200 flex shrink-0 min-h-0">

        {/* ── LEFT: Analysis & Steps ── */}
        <div className="flex-1 border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Panel header */}
          <div className="px-4 pt-3 pb-2 border-b border-slate-100 shrink-0">
            <h3 className="text-sm font-bold text-slate-900">Analysis &amp; Steps</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Process analysis and recommended steps
            </p>
          </div>

          {/* Step content — managed by JS via IDs */}
          <div id="step-box" className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Step badge + category */}
            <div className="flex items-center justify-between">
              <span
                id="step-index"
                className="text-[10px] font-bold px-2.5 py-1 bg-blue-600 text-white rounded-full tracking-wider uppercase"
              >
                Step 1 of 4
              </span>
              <span className="text-[10px] text-slate-400 font-semibold" id="step-comp-category">
                Active Lab
              </span>
            </div>

            {/* Title + description */}
            <div>
              <h4 id="step-title" className="text-sm font-bold text-slate-900 mb-1">
                Powering Your Workspace
              </h4>
              <p id="step-desc" className="text-xs text-slate-600 leading-relaxed">
                Let&apos;s start by looking at our development kit. We have a procedurally rendering microcontroller board and prototype workspace. Drag on the screen to observe the system pins.
              </p>
            </div>

            {/* Interactive hardware controls (shown/hidden by JS) */}
            <div
              id="interactive-hardware-control"
              className="hidden p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2.5"
            >
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Sandbox Inputs (Interactive)
              </span>

              <div id="interactive-slider-wrapper" className="hidden">
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span id="slider-label">Sensor Input Level</span>
                  <span id="slider-val" className="font-bold text-blue-700">50%</span>
                </div>
                <input
                  id="hw-slider"
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  onInput={(e) => handleHardwareSlider(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div id="interactive-btn-wrapper" className="hidden">
                <button
                  id="hw-trigger-btn"
                  onMouseDown={() => handleHardwareButton(true)}
                  onMouseUp={() => handleHardwareButton(false)}
                  onMouseLeave={() => handleHardwareButton(false)}
                  onTouchStart={() => handleHardwareButton(true)}
                  onTouchEnd={() => handleHardwareButton(false)}
                  className="w-full bg-white hover:bg-blue-50 active:bg-blue-600 active:text-white border border-blue-300 py-2 rounded-lg text-xs font-semibold text-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-hand-pointer"></i> Press &amp; Hold Component Button
                </button>
              </div>

              <div id="interactive-dht-wrapper" className="hidden space-y-2">
                <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-temperature-half"></i> DHT11 Climate
                </span>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>Temperature</span>
                    <span id="dht-temp-val" className="font-bold text-blue-700">25°C</span>
                  </div>
                  <input
                    id="hw-dht-temp"
                    type="range"
                    min="0"
                    max="50"
                    defaultValue="25"
                    onInput={(e) => handleDhtTemp(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>Humidity</span>
                    <span id="dht-hum-val" className="font-bold text-blue-700">50%</span>
                  </div>
                  <input
                    id="hw-dht-hum"
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    onInput={(e) => handleDhtHumidity(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              <div id="interactive-distance-wrapper" className="hidden space-y-2">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-ruler-horizontal"></i> HC-SR04 Distance
                </span>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Obstacle range</span>
                  <span id="distance-val" className="font-bold text-blue-700">100 cm</span>
                </div>
                <input
                  id="hw-distance"
                  type="range"
                  min="2"
                  max="400"
                  defaultValue="100"
                  onInput={(e) => handleDistanceSlider(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              <div id="interactive-pir-wrapper" className="hidden space-y-2">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-person-walking"></i> PIR Motion
                </span>
                <button
                  id="hw-pir-btn"
                  onMouseDown={() => handlePirMotion(true)}
                  onMouseUp={() => handlePirMotion(false)}
                  onMouseLeave={() => handlePirMotion(false)}
                  onTouchStart={() => handlePirMotion(true)}
                  onTouchEnd={() => handlePirMotion(false)}
                  className="w-full bg-white hover:bg-blue-50 active:bg-emerald-600 active:text-white border border-blue-300 py-2 rounded-lg text-xs font-semibold text-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-person-walking"></i> Simulate Motion (hold)
                </button>
              </div>

              <div id="interactive-servo-wrapper" className="hidden space-y-2">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-gear"></i> SG90 Servo
                </span>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Target angle</span>
                  <span id="servo-angle-val" className="font-bold text-blue-700">90°</span>
                </div>
                <input
                  id="hw-servo-angle"
                  type="range"
                  min="0"
                  max="180"
                  defaultValue="90"
                  onInput={(e) => handleServoAngle(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div id="interactive-motor-wrapper" className="hidden space-y-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-fan"></i> DC Motor
                </span>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Speed (FWD + / REV −)</span>
                  <span id="motor-speed-val" className="font-bold text-blue-700">0%</span>
                </div>
                <input
                  id="hw-motor-speed"
                  type="range"
                  min="-100"
                  max="100"
                  defaultValue="0"
                  onInput={(e) => handleMotorSpeed(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div id="interactive-relay-wrapper" className="hidden space-y-2">
                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-toggle-on"></i> Relay Module
                </span>
                <button
                  id="hw-relay-btn"
                  onMouseDown={() => handleRelayToggle(true)}
                  onMouseUp={() => handleRelayToggle(false)}
                  onMouseLeave={() => handleRelayToggle(false)}
                  onTouchStart={() => handleRelayToggle(true)}
                  onTouchEnd={() => handleRelayToggle(false)}
                  className="w-full bg-white hover:bg-blue-50 active:bg-violet-600 active:text-white border border-blue-300 py-2 rounded-lg text-xs font-semibold text-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-toggle-on"></i> Energize Relay (hold)
                </button>
              </div>
            </div>

            {/* Tip */}
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
              <i className="fa-solid fa-lightbulb text-amber-500 text-xs mt-0.5 shrink-0"></i>
              <p id="step-tip" className="text-[11px] text-amber-900 leading-relaxed">
                Hold left click to rotate. Scroll to zoom. Use the IDE panel to write custom firmware.
              </p>
            </div>

            {/* Step navigation */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <button
                id="btn-prev"
                onClick={() => moveStep(-1)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 disabled:opacity-30 transition-colors rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-chevron-left text-[10px]"></i> Back
              </button>
              <div className="flex gap-1" id="step-dot-container"></div>
              <button
                id="btn-next"
                onClick={() => moveStep(1)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                Next <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: AI Tutor ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Panel header */}
          <div className="px-4 pt-3 pb-2 border-b border-slate-100 shrink-0 flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles text-purple-500 text-sm"></i>
            <h3 className="text-sm font-bold text-slate-900">AI Tutor</h3>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {/* Greeting */}
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Hi Azizbek! 👋
              </p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                I&apos;m your AI Tutor. Ask me anything about your circuit or project.
              </p>
            </div>

            {/* Quick-start presets */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => applyPreset('blink')}
                className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 rounded-lg px-2.5 py-1 transition cursor-pointer font-medium"
              >
                <i className="fa-solid fa-lightbulb text-amber-400"></i> LED Blink
              </button>
              <button
                onClick={() => applyPreset('night')}
                className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 rounded-lg px-2.5 py-1 transition cursor-pointer font-medium"
              >
                <i className="fa-solid fa-moon text-slate-400"></i> Night Light
              </button>
              <button
                onClick={() => applyPreset('alarm')}
                className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 rounded-lg px-2.5 py-1 transition cursor-pointer font-medium"
              >
                <i className="fa-solid fa-bell text-red-400"></i> Siren Alarm
              </button>
              <button
                onClick={() => applyPreset('button')}
                className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 rounded-lg px-2.5 py-1 transition cursor-pointer font-medium"
              >
                <i className="fa-solid fa-hand-pointer text-blue-400"></i> Push Trigger
              </button>
              <button
                onClick={openCommunityLibrary}
                className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 rounded-lg px-2.5 py-1 transition cursor-pointer font-semibold"
              >
                <i className="fa-solid fa-users text-[9px]"></i> Community
              </button>
            </div>

            {/* Suggestion buttons */}
            <div className="space-y-0.5 -mx-1">
              <SuggestionBtn>Why is my LED not turning on?</SuggestionBtn>
              <SuggestionBtn>How does a resistor work?</SuggestionBtn>
              <SuggestionBtn>Explain this circuit step by step</SuggestionBtn>
              <SuggestionBtn>How can I improve this project?</SuggestionBtn>
            </div>

            {/* Spacer to push input to bottom */}
            <div className="flex-1" />

            {/* AI input */}
            <div className="relative">
              <input
                id="ai-input"
                type="text"
                placeholder="Ask anything..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
              <button
                id="btn-generate-ai"
                onClick={generateAICircuit}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition cursor-pointer"
                title="Build circuit with AI"
              >
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* end bottom panels */}

    </main>
  );
}
