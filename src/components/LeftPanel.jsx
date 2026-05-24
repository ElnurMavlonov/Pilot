import { useEffect, useState } from 'react';
import { openCommunityLibrary, openSettings, openSupport } from '../lib/iotify-app.js';

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      <i className={`${icon} text-sm ${active ? 'text-blue-600' : 'text-slate-400'}`}></i>
      {label}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mt-5 mb-1 first:mt-0">
      {children}
    </p>
  );
}

export default function LeftPanel() {
  const [communityOpen, setCommunityOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    const onCommunity = (e) => setCommunityOpen(Boolean(e.detail?.open));
    const onSettings = (e) => setSettingsOpen(Boolean(e.detail?.open));
    const onSupport = (e) => setSupportOpen(Boolean(e.detail?.open));
    window.addEventListener('pilot:community-library', onCommunity);
    window.addEventListener('pilot:settings', onSettings);
    window.addEventListener('pilot:support', onSupport);
    return () => {
      window.removeEventListener('pilot:community-library', onCommunity);
      window.removeEventListener('pilot:settings', onSettings);
      window.removeEventListener('pilot:support', onSupport);
    };
  }, []);

  return (
    <aside
      id="left-panel"
      className="bg-white border-r border-slate-200 flex flex-col h-full z-10 shrink-0 overflow-hidden min-w-0"
    >
      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">

        <SectionLabel>Main</SectionLabel>
        <NavItem icon="fa-solid fa-table-cells-large" label="Dashboard" />
        <NavItem icon="fa-solid fa-folder-open" label="Projects" />
        <NavItem icon="fa-solid fa-flask" label="Virtual Lab" active={!communityOpen && !settingsOpen && !supportOpen} />

        <SectionLabel>Learning</SectionLabel>
        <NavItem icon="fa-solid fa-wand-magic-sparkles" label="AI Tutor" />
        <NavItem icon="fa-solid fa-book-open" label="Learn" />

        <SectionLabel>Community</SectionLabel>
        <NavItem
          icon="fa-solid fa-users"
          label="Community"
          active={communityOpen}
          onClick={openCommunityLibrary}
        />
        <NavItem icon="fa-solid fa-trophy" label="Achievements" />
      </nav>

      {/* ── Bottom items ── */}
      <div className="px-2 pb-3 pt-2 border-t border-slate-100 space-y-0.5">
        <NavItem icon="fa-solid fa-gear" label="Settings" active={settingsOpen} onClick={openSettings} />
        <NavItem icon="fa-solid fa-circle-question" label="Support" active={supportOpen} onClick={openSupport} />
      </div>
    </aside>
  );
}
