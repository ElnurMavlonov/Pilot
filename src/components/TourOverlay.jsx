import { tourNext, tourSkip } from '../lib/iotify-app.js';

export default function TourOverlay() {
  return (
    <div id="tour-overlay">
      <div id="tour-dim" style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.78)', zIndex: 1050, pointerEvents: 'none' }}></div>
      <div id="tour-spotlight" className="tour-spotlight" style={{ display: 'none' }}></div>

      <div id="tour-card" className="tour-card pop">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100 shrink-0">
            <i id="tour-icon" className="fa-solid fa-hand-wave text-indigo-600 text-lg"></i>
          </div>
          <div className="min-w-0">
            <p className="tour-card-step text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5" id="tour-step-label">Step 1 of 5</p>
            <h3 className="tour-card-title text-sm font-bold text-slate-900 leading-snug" id="tour-title">Welcome!</h3>
          </div>
        </div>

        <p className="tour-card-desc text-xs text-slate-500 leading-relaxed mb-5" id="tour-desc">Description goes here.</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5" id="tour-dots"></div>
          <div className="flex items-center gap-2">
            <button id="tour-skip-btn" onClick={tourSkip}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer px-2 py-1.5 rounded-lg hover:bg-slate-50">
              Skip
            </button>
            <button id="tour-next-btn" onClick={tourNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm shadow-indigo-900/20">
              Next <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
