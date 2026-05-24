import { useEffect, useRef, useState } from 'react';
import {
  saveProject, loadProject, exportAsPDF, shareCircuitLink,
  toggleDarkMode, toggleSimulation, toggleShortcutsOverlay,
  openSettings, openSupport, openProfile, signOut,
} from '../lib/iotify-app.js';

const COLLABORATORS = [
  { initials: 'AZ', bg: 'from-blue-400 to-blue-600' },
  { initials: 'MK', bg: 'from-violet-400 to-violet-600' },
  { initials: 'RS', bg: 'from-emerald-400 to-emerald-600' },
];

const USER = { name: 'Azizbek', role: 'Student', initial: 'A' };

function ProfileMenuItem({ icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer text-left ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <i className={`${icon} text-xs w-4 text-center ${danger ? 'text-red-400' : 'text-slate-400'}`}></i>
      {label}
    </button>
  );
}

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onToggle = (e) => setMenuOpen(Boolean(e.detail?.open));
    window.addEventListener('pilot:profile-menu', onToggle);
    return () => window.removeEventListener('pilot:profile-menu', onToggle);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        window.dispatchEvent(new CustomEvent('pilot:profile-menu', { detail: { open: false } }));
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    window.dispatchEvent(new CustomEvent('pilot:profile-menu', { detail: { open: next } }));
  };

  const closeMenu = () => {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent('pilot:profile-menu', { detail: { open: false } }));
  };

  const run = (fn) => () => { closeMenu(); fn(); };

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 gap-3 shrink-0 z-20">

      {/* ── Logo ── */}
      <div className="flex items-center gap-2 mr-1 shrink-0">
        <svg viewBox="0 0 100 100" className="w-8 h-8 text-blue-600" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M 15 25 h 50 a 10 10 0 0 1 10 10 v 10 a 10 10 0 0 0 -10 10 h -20 a 10 10 0 0 1 -10 10 v 10 a 10 10 0 0 0 10 10 h 30 a 15 15 0 0 0 15 -15 v -45 a 15 15 0 0 0 -15 -15 h -60 a 15 15 0 0 0 -15 15 v 0 a 15 15 0 0 0 15 15 z" />
          <path d="M 15 25 h 45 c 10 0 15 5 15 15 c 0 10 -5 15 -15 15 h -10 c -10 0 -15 5 -15 15 c 0 10 5 15 15 15 h 35 c 10 0 15 -5 15 -15 v -50 c 0 -10 -5 -15 -15 -15 h -70 c -10 0 -15 5 -15 15 c 0 10 5 15 15 15 z" />
        </svg>
        <span className="font-bold text-slate-900 text-xl tracking-tight">Pilot</span>
        <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full tracking-wider">
          PRO
        </span>
      </div>

      <div className="w-px h-6 bg-slate-200 shrink-0" />

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

      <div className="flex-1" />

      <button
        id="btn-simulation"
        onClick={toggleSimulation}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm cursor-pointer shrink-0"
      >
        <i className="fa-solid fa-play text-xs"></i>
        Run Simulation
      </button>

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

      <div className="w-px h-6 bg-slate-200 shrink-0" />

      {/* ── User profile dropdown ── */}
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          id="profile-trigger"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-haspopup="true"
          className="flex items-center gap-2 cursor-pointer group rounded-lg px-1 py-1 hover:bg-slate-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
            {USER.initial}
          </div>
          <div className="leading-none text-left">
            <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              {USER.name}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{USER.role}</div>
          </div>
          <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {menuOpen && (
          <div
            id="profile-menu"
            className="profile-dropdown absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50"
          >
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-xs font-semibold text-slate-800">{USER.name}</p>
              <p className="text-[10px] text-slate-400">{USER.role} · Pilot PRO</p>
            </div>
            <div className="px-1.5">
              <ProfileMenuItem icon="fa-solid fa-user" label="My Profile" onClick={run(openProfile)} />
              <ProfileMenuItem icon="fa-solid fa-gear" label="Settings" onClick={run(openSettings)} />
              <ProfileMenuItem icon="fa-solid fa-circle-question" label="Help & Support" onClick={run(openSupport)} />
            </div>
            <div className="border-t border-slate-100 mt-1 pt-1 px-1.5">
              <ProfileMenuItem icon="fa-solid fa-right-from-bracket" label="Sign Out" onClick={run(signOut)} danger />
            </div>
          </div>
        )}
      </div>

      <input
        id="load-file-input"
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => loadProject(e.target)}
      />
      <button id="export-pdf-trigger" onClick={exportAsPDF} className="hidden" />
    </header>
  );
}
