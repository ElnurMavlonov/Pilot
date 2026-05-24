import { useEffect } from 'react';
import { initIotifyApp } from './lib/iotify-app.js';

import ContextMenu from './components/ContextMenu.jsx';
import Toast from './components/Toast.jsx';
import TopBar from './components/TopBar.jsx';
import StatusBar from './components/StatusBar.jsx';
import LeftPanel from './components/LeftPanel.jsx';
import { LeftResizeHandle, RightResizeHandle } from './components/ResizeHandles.jsx';
import Workspace3D from './components/Workspace3D.jsx';
import RightPanel from './components/RightPanel.jsx';
import ShortcutsOverlay from './components/ShortcutsOverlay.jsx';
import TourOverlay from './components/TourOverlay.jsx';
import CommunityLibrary from './components/CommunityLibrary.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import SupportModal from './components/SupportModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';

export default function App() {
  useEffect(() => {
    initIotifyApp();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-slate-900">
      {/* ── Top bar (full width) ── */}
      <TopBar />

      {/* ── Main content row ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <LeftPanel />
        <LeftResizeHandle />
        <Workspace3D />
        <RightResizeHandle />
        <RightPanel />
      </div>

      {/* ── Status bar (full width) ── */}
      <StatusBar />

      {/* ── Global overlays ── */}
      <ContextMenu />
      <Toast />
      <ShortcutsOverlay />
      <TourOverlay />
      <CommunityLibrary />
      <SettingsModal />
      <SupportModal />
      <ProfileModal />
    </div>
  );
}
