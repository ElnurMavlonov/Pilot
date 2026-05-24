import { createPortal } from 'react-dom';
import { closeProfile, openSettings } from '../lib/iotify-app.js';

const USER = { name: 'Azizbek', role: 'Student', initial: 'A' };

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center">
      <i className={`${icon} text-blue-600 text-lg mb-2`}></i>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default function ProfileModal() {
  const handleBg = (e) => { if (e.target === e.currentTarget) closeProfile(); };

  const publishedCount = (() => {
    try {
      return JSON.parse(localStorage.getItem('myCircuits') || '[]').length;
    } catch {
      return 0;
    }
  })();

  const modal = (
    <div id="profile-modal" onClick={handleBg}>
      <div className="app-modal-shell">
        <div
          className="app-modal-card bg-white rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shrink-0 text-white font-bold">
                {USER.initial}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900 truncate">{USER.name}</h2>
                <p className="text-xs text-slate-500">{USER.role} · Pilot PRO</p>
              </div>
            </div>
            <button
              onClick={closeProfile}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 min-h-0 space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="fa-solid fa-flask" label="Labs" value="3" />
              <StatCard icon="fa-solid fa-folder-open" label="Projects" value="1" />
              <StatCard icon="fa-solid fa-cloud-upload-alt" label="Published" value={publishedCount} />
            </div>

            <section>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Achievements</p>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                <i className="fa-solid fa-trophy text-slate-300 text-2xl"></i>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-700">No badges yet</p>
                  <p className="text-xs text-slate-500">Complete labs to earn achievements</p>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={() => { closeProfile(); openSettings(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-gear text-xs"></i>
              Account Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
