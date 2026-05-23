import { useUIStore } from '../../stores/uiStore'

const TABS = [
  { key: 'parts', icon: 'fa-boxes-stacked', label: 'Parts' },
  { key: 'ide', icon: 'fa-code', label: 'IDE' },
  { key: 'serial', icon: 'fa-terminal', label: 'Serial' },
]

export default function TabBar() {
  const activeTab = useUIStore(s => s.activeTab)
  const setActiveTab = useUIStore(s => s.setActiveTab)

  return (
    <div className="flex border-b border-slate-200">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
            activeTab === tab.key
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <i className={`fa-solid ${tab.icon}`} />
          {tab.label}
        </button>
      ))}
    </div>
  )
}
