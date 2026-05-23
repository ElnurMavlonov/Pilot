import { useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useCircuitStore } from '../../stores/circuitStore'
import TabBar from '../right-panel/TabBar'
import PartsLibrary from '../right-panel/PartsLibrary'
import FirmwareIDE from '../right-panel/FirmwareIDE'
import SerialMonitor from '../right-panel/SerialMonitor'

export default function RightPanel({ sceneRef }) {
  const open = useUIStore(s => s.rightPanelOpen)
  const width = useUIStore(s => s.rightPanelWidth)
  const activeTab = useUIStore(s => s.activeTab)

  useEffect(() => {
    if (activeTab === 'parts') {
      useCircuitStore.getState().enterFreeBuildMode()
    } else if (activeTab !== 'serial') {
      useCircuitStore.getState().enterPresetMode()
    }
  }, [activeTab])

  if (!open) return null

  const TAB_HEADERS = {
    parts: { icon: 'fa-boxes-stacked', title: 'Parts Library', subtitle: 'Drag to place' },
    ide: { icon: 'fa-code', title: 'Firmware IDE', subtitle: 'Arduino C++' },
    serial: { icon: 'fa-terminal', title: 'Serial Monitor', subtitle: '9600 baud' },
  }
  const header = TAB_HEADERS[activeTab]

  return (
    <aside
      id="right-panel"
      className="hidden md:flex flex-col bg-white border-l border-slate-200 overflow-hidden shrink-0"
      style={{ width: `${width}px` }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
            <i className={`fa-solid ${header.icon} text-sm`} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800">{header.title}</h2>
            <p className="text-[9px] text-slate-400">{header.subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => useUIStore.getState().toggleRightPanel()}
          className="panel-close-btn"
          title="Close Panel (Ctrl+J)"
        >
          <i className="fa-solid fa-chevron-right text-xs" />
        </button>
      </div>

      <TabBar />

      {activeTab === 'parts' && <PartsLibrary sceneRef={sceneRef} />}
      {activeTab === 'ide' && <FirmwareIDE />}
      {activeTab === 'serial' && <SerialMonitor />}
    </aside>
  )
}
