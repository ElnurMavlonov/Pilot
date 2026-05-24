import {
  saveProject, loadProject, exportAsPDF, shareCircuitLink,
  toggleDarkMode, toggleShortcutsOverlay, toggleLeftPanel,
  applyPreset, openCommunityLibrary, generateAICircuit,
  handleHardwareSlider, handleHardwareButton,
  handleDhtTemp, handleDhtHumidity, handleDistanceSlider,
  handlePirMotion, handleServoAngle, handleMotorSpeed, handleRelayToggle,
  moveStep, toggleSimulation, toggleSchematicPanel,
} from '../lib/iotify-app.js';

export default function LeftPanel() {
  return (
    <aside
      id="left-panel"
      className="bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-[50vh] md:h-screen z-10 shrink-0 overflow-hidden min-w-0"
    >
      {/* Brand Header */}
      <header className="p-5 border-b border-slate-100 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <i className="fa-solid fa-cube text-xl animate-spin-slow"></i>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              IoTify <span className="text-xs bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">AI Lab</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Generative 3D Hardware Sandbox</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span id="status-badge" className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live IDE
          </span>
          <button onClick={saveProject} title="Save Project" className="panel-close-btn" style={{ display: 'flex' }}>
            <i className="fa-solid fa-floppy-disk text-xs"></i>
          </button>
          <button onClick={() => document.getElementById('load-file-input').click()} title="Load Project" className="panel-close-btn" style={{ display: 'flex' }}>
            <i className="fa-solid fa-folder-open text-xs"></i>
          </button>
          <input id="load-file-input" type="file" accept=".json" className="hidden" onChange={(e) => loadProject(e.target)} />
          <button onClick={exportAsPDF} title="Export as PDF" className="panel-close-btn" style={{ display: 'flex' }}>
            <i className="fa-solid fa-file-pdf text-xs"></i>
          </button>
          <button onClick={shareCircuitLink} title="Share Circuit Link" className="panel-close-btn" style={{ display: 'flex' }}>
            <i className="fa-solid fa-share-nodes text-xs"></i>
          </button>
          <button id="dark-toggle-btn" onClick={toggleDarkMode} title="Toggle Dark Mode" className="panel-close-btn" style={{ display: 'flex' }}>
            <i className="fa-solid fa-moon text-xs"></i>
          </button>
          <button onClick={toggleShortcutsOverlay} title="Keyboard Shortcuts (?)" className="panel-close-btn" style={{ display: 'flex' }}>
            <i className="fa-solid fa-keyboard text-xs"></i>
          </button>
          <button className="panel-close-btn" onClick={toggleLeftPanel} title="Close Panel (⌘B)">
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
        </div>
      </header>

      {/* Dynamic Control Interface */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* AI Prompter Block */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <i className="fa-solid fa-wand-magic-sparkles text-indigo-400"></i>
            <span>AI Circuit Architect</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Describe any IoT idea. Gemini will program the controller, fetch standard hardware, wire them, and setup an interactive tutorial.
          </p>

          {/* Quick Prompts / Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button onClick={() => applyPreset('blink')} className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 rounded-lg px-2.5 py-1 transition cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              LED Blink
            </button>
            <button onClick={() => applyPreset('night')} className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 rounded-lg px-2.5 py-1 transition cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              Night Light (LDR)
            </button>
            <button onClick={() => applyPreset('alarm')} className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 rounded-lg px-2.5 py-1 transition cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2 2 4"/><path d="m20 2 2 2"/></svg>
              Siren Alarm
            </button>
            <button onClick={() => applyPreset('button')} className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 rounded-lg px-2.5 py-1 transition cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M12 22V12"/><path d="m15 7-3-3-3 3"/><path d="M4 12h16"/></svg>
              Push Trigger
            </button>
            <button onClick={openCommunityLibrary} className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 rounded-lg px-2.5 py-1 transition cursor-pointer font-semibold">
              <i className="fa-solid fa-users"></i>
              Community Library
            </button>
          </div>

          <div className="relative mt-2">
            <input id="ai-input" type="text" placeholder="e.g. motion-activated alarm with PIR sensor and buzzer..." className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:border-indigo-500 transition-colors pr-10" />
            <button id="btn-generate-ai" onClick={generateAICircuit} className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition cursor-pointer" title="Build custom circuit with AI">
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* Dynamic Learning Stage / Walkthrough Steps */}
        <div id="step-box" className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span id="step-index" className="text-[11px] font-bold px-2.5 py-1 bg-indigo-600 text-white rounded-full tracking-wider uppercase">
              Step 1 of 4
            </span>
            <span className="text-xs text-slate-500 font-semibold" id="step-comp-category">Active Lab</span>
          </div>

          <div>
            <h3 id="step-title" className="text-base font-bold text-slate-900 mb-2">Powering Your Workspace</h3>
            <p id="step-desc" className="text-xs text-slate-600 leading-relaxed">
              Let's start by looking at our development kit. We have a procedurally rendering microcontroller board and prototype workspace. Drag on the screen to observe the system pins.
            </p>
          </div>

          {/* Simulation Interactive Component Overlays */}
          <div id="interactive-hardware-control" className="hidden p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2.5">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span> Sandbox Inputs (Interactive)
            </span>
            <div id="interactive-slider-wrapper" className="hidden">
              <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                <span id="slider-label">Sensor Input Level</span>
                <span id="slider-val" className="font-bold text-indigo-700">50%</span>
              </div>
              <input id="hw-slider" type="range" min="0" max="100" defaultValue="50" onInput={(e) => handleHardwareSlider(e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
            <div id="interactive-btn-wrapper" className="hidden">
              <button
                id="hw-trigger-btn"
                onMouseDown={() => handleHardwareButton(true)}
                onMouseUp={() => handleHardwareButton(false)}
                onMouseLeave={() => handleHardwareButton(false)}
                onTouchStart={() => handleHardwareButton(true)}
                onTouchEnd={() => handleHardwareButton(false)}
                className="w-full bg-white hover:bg-indigo-50 active:bg-indigo-600 active:text-white border border-indigo-300 py-2.5 rounded-lg text-xs font-semibold text-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                  <span id="dht-temp-val" className="font-bold text-indigo-700">25°C</span>
                </div>
                <input id="hw-dht-temp" type="range" min="0" max="50" defaultValue="25" onInput={(e) => handleDhtTemp(e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Humidity</span>
                  <span id="dht-hum-val" className="font-bold text-indigo-700">50%</span>
                </div>
                <input id="hw-dht-hum" type="range" min="0" max="100" defaultValue="50" onInput={(e) => handleDhtHumidity(e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
            </div>
            <div id="interactive-distance-wrapper" className="hidden space-y-2">
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-ruler-horizontal"></i> HC-SR04 Distance
              </span>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                <span>Obstacle range</span>
                <span id="distance-val" className="font-bold text-indigo-700">100 cm</span>
              </div>
              <input id="hw-distance" type="range" min="2" max="400" defaultValue="100" onInput={(e) => handleDistanceSlider(e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
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
                className="w-full bg-white hover:bg-indigo-50 active:bg-emerald-600 active:text-white border border-indigo-300 py-2.5 rounded-lg text-xs font-semibold text-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                <span id="servo-angle-val" className="font-bold text-indigo-700">90°</span>
              </div>
              <input id="hw-servo-angle" type="range" min="0" max="180" defaultValue="90" onInput={(e) => handleServoAngle(e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
            <div id="interactive-motor-wrapper" className="hidden space-y-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-fan"></i> DC Motor
              </span>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                <span>Speed (FWD + / REV −)</span>
                <span id="motor-speed-val" className="font-bold text-indigo-700">0%</span>
              </div>
              <input id="hw-motor-speed" type="range" min="-100" max="100" defaultValue="0" onInput={(e) => handleMotorSpeed(e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
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
                className="w-full bg-white hover:bg-indigo-50 active:bg-violet-600 active:text-white border border-indigo-300 py-2.5 rounded-lg text-xs font-semibold text-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-toggle-on"></i> Energize Relay (hold)
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <i className="fa-solid fa-lightbulb text-amber-600 text-sm mt-0.5"></i>
            <p id="step-tip" className="text-[11px] text-amber-900 leading-relaxed">
              Hold left click to rotate. Scroll to zoom. Use the IDE panel at the bottom to write custom firmware.
            </p>
          </div>

          {/* Step Navigator Controls */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <button id="btn-prev" onClick={() => moveStep(-1)} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 transition-colors rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <i className="fa-solid fa-chevron-left"></i> Back
            </button>

            <div className="flex gap-1" id="step-dot-container"></div>

            <button id="btn-next" onClick={() => moveStep(1)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              Next <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Simulation Controller & Action Block */}
        <div className="grid grid-cols-2 gap-3">
          <button id="btn-simulation" onClick={toggleSimulation} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 px-4 py-3.5 rounded-2xl font-semibold text-sm shadow-xl shadow-emerald-900/10 cursor-pointer">
            <i className="fa-solid fa-play"></i> Run Sandbox
          </button>
          <button onClick={toggleSchematicPanel} className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all px-4 py-3.5 rounded-2xl font-semibold text-sm cursor-pointer">
            <i className="fa-solid fa-diagram-project"></i> Diagram
          </button>
        </div>
      </div>
    </aside>
  );
}
