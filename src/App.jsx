import { useEffect } from 'react';
import { initIotifyApp } from './lib/iotify-app.js';

import ContextMenu from './components/ContextMenu.jsx';
import Toast from './components/Toast.jsx';
import LeftPanel from './components/LeftPanel.jsx';
import { LeftResizeHandle, RightResizeHandle } from './components/ResizeHandles.jsx';
import Workspace3D from './components/Workspace3D.jsx';
import RightPanel from './components/RightPanel.jsx';
import ShortcutsOverlay from './components/ShortcutsOverlay.jsx';
import TourOverlay from './components/TourOverlay.jsx';
import CommunityLibrary from './components/CommunityLibrary.jsx';

export default function App() {
  useEffect(() => {
    // Kick the imperative IoTify module once all the DOM IDs it touches
    // (panels, canvas-view, parts categories, etc.) are mounted by React.
    initIotifyApp();
  }, []);

  return (
    <>
      <ContextMenu />
      <Toast />

      <LeftPanel />
      <LeftResizeHandle />
      <Workspace3D />
      <RightResizeHandle />
      <RightPanel />

      <ShortcutsOverlay />
      <TourOverlay />
      <CommunityLibrary />
    </>
  );
}
