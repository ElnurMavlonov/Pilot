import { createPortal } from 'react-dom';
import {
  closeSupport, toggleShortcutsOverlay, resetTour, openCommunityLibrary,
} from '../lib/iotify-app.js';

const FAQ = [
  {
    q: 'How do I run a simulation?',
    a: 'Click Run Simulation in the top bar, or press the Run button after wiring your circuit and uploading code.',
  },
  {
    q: 'How do I share my circuit?',
    a: 'Use the Share button in the top bar or press S to copy a link with your circuit encoded in the URL.',
  },
  {
    q: 'Where are keyboard shortcuts listed?',
    a: 'Press ? anywhere in the app to open the shortcuts overlay, or open Settings → Keyboard Shortcuts.',
  },
];

function FaqItem({ q, a }) {
  return (
    <details className="group border border-slate-200 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-800 cursor-pointer hover:bg-slate-50 transition-colors list-none">
        {q}
        <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform group-open:rotate-180"></i>
      </summary>
      <p className="px-4 pb-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{a}</p>
    </details>
  );
}

function LinkCard({ icon, title, description, onClick, href }) {
  const cls = 'flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer text-left w-full';
  const inner = (
    <>
      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
        <i className={`${icon} text-blue-600 text-sm`}></i>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export default function SupportModal() {
  const handleBg = (e) => { if (e.target === e.currentTarget) closeSupport(); };

  const handleShortcuts = () => {
    closeSupport();
    toggleShortcutsOverlay();
  };

  const handleTour = () => {
    closeSupport();
    resetTour();
  };

  const handleCommunity = () => {
    closeSupport();
    openCommunityLibrary();
  };

  const modal = (
    <div id="support-modal" onClick={handleBg}>
      <div className="app-modal-shell">
        <div
          className="app-modal-card bg-white rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fa-solid fa-circle-question text-white text-lg"></i>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900 truncate">Help &amp; Support</h2>
                <p className="text-xs text-slate-500">Get help, browse resources, or contact us</p>
              </div>
            </div>
            <button
              onClick={closeSupport}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 min-h-0 space-y-6">
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Quick Links</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <LinkCard
                  icon="fa-solid fa-keyboard"
                  title="Keyboard Shortcuts"
                  description="Press ? to view all hotkeys"
                  onClick={handleShortcuts}
                />
                <LinkCard
                  icon="fa-solid fa-route"
                  title="Onboarding Tour"
                  description="Replay the guided walkthrough"
                  onClick={handleTour}
                />
                <LinkCard
                  icon="fa-solid fa-users"
                  title="Community Library"
                  description="Browse shared circuits"
                  onClick={handleCommunity}
                />
                <LinkCard
                  icon="fa-solid fa-envelope"
                  title="Email Support"
                  description="support@pilot.dev"
                  href="mailto:support@pilot.dev"
                />
              </div>
            </section>

            <section>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">FAQ</p>
              <div className="space-y-2">
                {FAQ.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
