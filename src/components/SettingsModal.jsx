import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import {
  closeSettings, toggleDarkMode, toggleAutoSave, isAutoSaveEnabled,
  toggleShortcutsOverlay, resetTour,
} from '../lib/iotify-app.js';

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-blue-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

function ActionRow({ icon, label, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 text-left rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <i className={`${icon} text-slate-500 text-sm`}></i>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 shrink-0"></i>
    </button>
  );
}

export default function SettingsModal() {
  const [darkMode, setDarkMode] = useState(() =>
    document.body.classList.contains('dark')
  );
  const [autoSave, setAutoSave] = useState(isAutoSaveEnabled);

  useEffect(() => {
    const sync = () => {
      setDarkMode(document.body.classList.contains('dark'));
      setAutoSave(isAutoSaveEnabled());
    };
    window.addEventListener('pilot:theme', sync);
    window.addEventListener('pilot:auto-save', sync);
    return () => {
      window.removeEventListener('pilot:theme', sync);
      window.removeEventListener('pilot:auto-save', sync);
    };
  }, []);

  const handleBg = (e) => { if (e.target === e.currentTarget) closeSettings(); };

  const handleDarkMode = () => {
    toggleDarkMode();
    setDarkMode(document.body.classList.contains('dark'));
  };

  const handleAutoSave = () => {
    toggleAutoSave();
    setAutoSave(isAutoSaveEnabled());
  };

  const handleShortcuts = () => {
    closeSettings();
    toggleShortcutsOverlay();
  };

  const handleRestartTour = () => {
    closeSettings();
    resetTour();
  };

  const modal = (
    <div id="settings-modal" onClick={handleBg}>
      <div className="app-modal-shell">
        <div
          className="app-modal-card bg-white rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center shrink-0">
                <i className="fa-solid fa-gear text-white text-lg"></i>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900 truncate">Settings</h2>
                <p className="text-xs text-slate-500">Customize your workspace preferences</p>
              </div>
            </div>
            <button
              onClick={closeSettings}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 min-h-0 space-y-6">
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Appearance</p>
              <ToggleRow
                label="Dark Mode"
                description="Switch between light and dark themes"
                checked={darkMode}
                onChange={handleDarkMode}
              />
            </section>

            <section className="border-t border-slate-100 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Editor</p>
              <ToggleRow
                label="Auto Save"
                description="Automatically save project changes"
                checked={autoSave}
                onChange={handleAutoSave}
              />
            </section>

            <section className="border-t border-slate-100 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Help</p>
              <ActionRow
                icon="fa-solid fa-keyboard"
                label="Keyboard Shortcuts"
                description="View all hotkeys and gestures"
                onClick={handleShortcuts}
              />
              <ActionRow
                icon="fa-solid fa-route"
                label="Restart Onboarding Tour"
                description="Replay the guided walkthrough"
                onClick={handleRestartTour}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
