import { useUIStore } from '../../stores/uiStore'
import BrandHeader from '../left-panel/BrandHeader'
import AIPromptBox from '../left-panel/AIPromptBox'
import StepNavigator from '../left-panel/StepNavigator'
import InteractiveControls from '../left-panel/InteractiveControls'
import SimulationControls from '../left-panel/SimulationControls'

export default function LeftPanel({ sceneRef }) {
  const open = useUIStore(s => s.leftPanelOpen)
  const width = useUIStore(s => s.leftPanelWidth)

  if (!open) return null

  return (
    <aside
      id="left-panel"
      className="hidden md:flex flex-col bg-white border-r border-slate-200 overflow-y-auto overflow-x-hidden shrink-0"
      style={{ width: `${width}px` }}
    >
      <BrandHeader />
      <AIPromptBox />
      <StepNavigator />
      <InteractiveControls />
      <SimulationControls sceneRef={sceneRef} />
    </aside>
  )
}
