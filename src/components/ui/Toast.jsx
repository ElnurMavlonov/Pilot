import { useUIStore } from '../../stores/uiStore'

export default function Toast() {
  const { message, visible } = useUIStore(s => s.toast)

  return (
    <div
      id="toast"
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-white border border-indigo-200 rounded-2xl shadow-xl text-sm font-semibold text-indigo-700 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-[100px]'
      }`}
    >
      <span>{message}</span>
    </div>
  )
}
