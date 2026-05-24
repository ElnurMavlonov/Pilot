import {
  saveProject, loadProject, exportAsPDF, shareCircuitLink,
  toggleDarkMode, toggleSimulation, toggleShortcutsOverlay,
} from '../lib/iotify-app.js';

const COLLABORATORS = [
  { initials: 'AZ', bg: 'from-blue-400 to-blue-600' },
  { initials: 'MK', bg: 'from-violet-400 to-violet-600' },
  { initials: 'RS', bg: 'from-emerald-400 to-emerald-600' },
];

export default function TopBar() {
  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 gap-3 shrink-0 z-20">

      {/* ── Logo ── */}
      <div className="flex items-center gap-2 mr-1 shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <i className="fa-solid fa-puzzle-piece text-white text-sm"></i>
        </div>
        <span className="font-bold text-slate-900 text-base tracking-tight">Pilot</span>
        <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-md tracking-wider">
          PRO
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="w-px h-6 bg-slate-200 shrink-0" />

      {/* ── Project name + saved status ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm hover:text-slate-900 transition-colors">
          Smart LED Blinker
          <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
        </button>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          Saved
        </span>
      </div>

      {/* ── Collaborator avatars ── */}
      <div className="flex items-center shrink-0 ml-1">
        <div className="flex -space-x-2">
          {COLLABORATORS.map((c) => (
            <div
              key={c.initials}
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${c.bg} border-2 border-white flex items-center justify-center text-white text-[9px] font-bold`}
            >
              {c.initials}
            </div>
          ))}
        </div>
        <span className="text-[11px] text-slate-500 font-medium ml-2">+3</span>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Run Simulation (primary CTA) ── */}
      <button
        id="btn-simulation"
        onClick={toggleSimulation}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm cursor-pointer shrink-0"
      >
        <i className="fa-solid fa-play text-xs"></i>
        Run Simulation
      </button>

      {/* ── Secondary actions ── */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={saveProject}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors font-medium cursor-pointer"
          title="Save Project (Ctrl+S)"
        >
          <i className="fa-solid fa-floppy-disk text-xs"></i>
          Save
        </button>
        <button
          onClick={shareCircuitLink}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors font-medium cursor-pointer"
          title="Share Circuit Link"
        >
          <i className="fa-solid fa-share-nodes text-xs"></i>
          Share
        </button>

        {/* ── Icon-only buttons ── */}
        <button
          id="dark-toggle-btn"
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Toggle Dark Mode"
        >
          <i className="fa-solid fa-sun text-sm"></i>
        </button>
        <button
          onClick={toggleShortcutsOverlay}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Keyboard Shortcuts (?)"
        >
          <i className="fa-solid fa-bell text-sm"></i>
        </button>
        <button
          onClick={() => document.getElementById('export-pdf-trigger').click()}
          className="hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Export as PDF"
        >
          <i className="fa-solid fa-file-pdf text-sm"></i>
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="w-px h-6 bg-slate-200 shrink-0" />

      {/* ── User profile ── */}
      <div className="flex items-center gap-2 shrink-0 cursor-pointer group">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
          A
        </div>
        <div className="leading-none">
          <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
            Azizbek
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Student</div>
        </div>
        <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
      </div>

      {/* ── Hidden inputs used by JS ── */}
      <input
        id="load-file-input"
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => loadProject(e.target)}
      />
      {/* PDF export trigger (called via button above if needed) */}
      <button id="export-pdf-trigger" onClick={exportAsPDF} className="hidden" />
    </header>
  );
}
