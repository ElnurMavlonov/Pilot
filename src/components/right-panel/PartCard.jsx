export default function PartCard({ part, onDragStart }) {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'copy'
    onDragStart(part.type, part.variant || null)
    e.currentTarget.classList.add('dragging')
    setTimeout(() => e.currentTarget.classList.remove('dragging'), 0)
  }

  return (
    <div
      className="part-card group flex flex-col items-center justify-center gap-1.5 p-3 bg-white border border-slate-200 rounded-xl cursor-grab hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100 active:cursor-grabbing active:scale-95 transition-all duration-150 select-none"
      draggable
      onDragStart={handleDragStart}
    >
      <div className={`w-8 h-8 ${part.bg} ${part.color} rounded-lg flex items-center justify-center shrink-0`}>
        <i className={`fa-solid ${part.icon} text-sm`} />
      </div>
      <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">{part.label}</span>
    </div>
  )
}
