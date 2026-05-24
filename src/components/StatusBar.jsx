import { useEffect, useState } from 'react';
import { isAutoSaveEnabled } from '../lib/iotify-app.js';

export default function StatusBar() {
  const [autoSave, setAutoSave] = useState(isAutoSaveEnabled);

  useEffect(() => {
    const sync = (e) => setAutoSave(Boolean(e.detail?.enabled));
    window.addEventListener('pilot:auto-save', sync);
    return () => window.removeEventListener('pilot:auto-save', sync);
  }, []);

  return (
    <footer className="h-9 border-t border-slate-200 bg-white flex items-center px-4 gap-5 shrink-0 z-20">

      {/* ── Simulator status ── */}
      <div className="flex items-center gap-1.5">
        <span
          id="status-badge"
          className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600"
        >
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          Simulator: Ready
        </span>
      </div>

      <div className="w-px h-4 bg-slate-200" />

      <button className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
        <i className="fa-solid fa-microchip text-slate-400"></i>
        Arduino Uno (COM3)
        <i className="fa-solid fa-chevron-down text-[9px] text-slate-400"></i>
      </button>

      <div className="w-px h-4 bg-slate-200" />

      <div id="auto-save-label" className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <i className="fa-solid fa-cloud text-slate-400"></i>
        Auto Save: {autoSave ? 'ON' : 'OFF'}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span>IoTify AI Lab</span>
        <span>·</span>
        <span>v2.0</span>
      </div>
    </footer>
  );
}
