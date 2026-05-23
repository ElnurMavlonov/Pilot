import { useState, useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'
import {
  initCommunityLibrary, getCommunityCircuits, saveCommunityCircuits,
  getMyCircuits, saveMyCircuits
} from '../../services/storage'

const CATEGORY_COLORS = {
  education: 'bg-blue-100 text-blue-700',
  sensors: 'bg-green-100 text-green-700',
  automation: 'bg-purple-100 text-purple-700',
  iot: 'bg-orange-100 text-orange-700',
  robotics: 'bg-red-100 text-red-700',
}

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - Math.ceil(rating)
  return (
    <span className="star-rating">
      {Array.from({ length: full }, (_, i) => <i key={`f${i}`} className="fa-solid fa-star" />)}
      {half && <i className="fa-solid fa-star-half-alt" />}
      {Array.from({ length: empty }, (_, i) => <i key={`e${i}`} className="fa-solid fa-star empty" />)}
    </span>
  )
}

function CircuitCard({ circuit, onLoad, onDelete, showDelete }) {
  const catClass = CATEGORY_COLORS[circuit.category] || 'bg-slate-100 text-slate-700'
  return (
    <div className="circuit-card">
      <div className="card-header">
        <div className="flex-1">
          <h3 className="card-title">{circuit.title}</h3>
          <p className="card-author">by {circuit.author}</p>
        </div>
        <span className={`card-category ${catClass}`}>{circuit.category}</span>
      </div>
      <p className="card-description">{circuit.description}</p>
      <div className="card-footer">
        <div className="card-stats">
          <span><i className="fa-solid fa-download" /> {circuit.downloads}</span>
          <StarRating rating={circuit.rating} />
        </div>
        <div className="flex gap-2">
          {showDelete && (
            <button onClick={() => onDelete(circuit.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition cursor-pointer">
              <i className="fa-solid fa-trash" />
            </button>
          )}
          <button onClick={() => onLoad(circuit.id)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer">
            Load
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CommunityLibrary() {
  const open = useUIStore(s => s.communityModalOpen)
  const activeTab = useUIStore(s => s.communityTab)
  const setTab = useUIStore(s => s.setCommunityTab)
  const close = useUIStore(s => s.closeCommunityModal)

  const [circuits, setCircuits] = useState([])
  const [myCircuits, setMyCircuits] = useState([])
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterSort, setFilterSort] = useState('recent')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (open) {
      initCommunityLibrary()
      setCircuits(getCommunityCircuits())
      setMyCircuits(getMyCircuits())
    }
  }, [open, activeTab])

  if (!open) return null

  let filtered = [...circuits]
  if (filterCategory !== 'all') filtered = filtered.filter(c => c.category === filterCategory)
  if (searchTerm) {
    const q = searchTerm.toLowerCase()
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  if (filterSort === 'popular') filtered.sort((a, b) => b.downloads - a.downloads)
  else if (filterSort === 'rating') filtered.sort((a, b) => b.rating - a.rating)
  else filtered.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))

  const handleLoad = (id) => {
    const circuit = circuits.find(c => c.id === id)
    if (circuit) {
      circuit.downloads++
      saveCommunityCircuits(circuits)
      alert(`Loading "${circuit.title}" by ${circuit.author}\n\nNote: This is a demo. In a full implementation, the circuit configuration would be loaded into the workspace.`)
      close()
    }
  }

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this circuit?')) return
    const newMy = myCircuits.filter(c => c.id !== id)
    const newComm = circuits.filter(c => c.id !== id)
    saveMyCircuits(newMy)
    saveCommunityCircuits(newComm)
    setMyCircuits(newMy)
    setCircuits(newComm)
  }

  const handlePublish = (e) => {
    e.preventDefault()
    const form = e.target
    const newCircuit = {
      id: 'comm_' + Date.now(),
      title: form.title.value,
      description: form.description.value,
      author: form.author.value,
      category: form.category.value,
      tags: form.tags.value.split(',').map(t => t.trim()).filter(Boolean),
      rating: 0,
      downloads: 0,
      publishedDate: new Date().toISOString().split('T')[0],
      circuit: null,
    }
    const newComm = [newCircuit, ...circuits]
    const newMy = [newCircuit, ...myCircuits]
    saveCommunityCircuits(newComm)
    saveMyCircuits(newMy)
    setCircuits(newComm)
    setMyCircuits(newMy)
    form.reset()
    alert(`Success! Your circuit "${newCircuit.title}" has been published.`)
    setTab('browse')
  }

  const TABS = [
    { key: 'browse', icon: 'fa-compass', label: 'Browse' },
    { key: 'publish', icon: 'fa-upload', label: 'Publish' },
    { key: 'my-circuits', icon: 'fa-user', label: 'My Circuits' },
  ]

  return (
    <div
      id="community-library-modal"
      className="fixed inset-0 z-[100] bg-slate-900/75 backdrop-blur-sm open"
      onClick={e => { if (e.target === e.currentTarget) close() }}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-users text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Community Preset Library</h2>
                <p className="text-xs text-slate-500">Browse and share circuits with the community</p>
              </div>
            </div>
            <button onClick={close} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer">
              <i className="fa-solid fa-xmark text-xl" />
            </button>
          </div>

          <div className="flex border-b border-slate-200 px-6">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`community-tab px-4 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === tab.key ? 'active text-indigo-600 border-indigo-600' : 'text-slate-500 hover:text-slate-700 border-transparent'
                }`}
              >
                <i className={`fa-solid ${tab.icon} mr-2`} />{tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'browse' && (
              <div className="community-tab-content">
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search circuits..."
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300"
                  />
                  <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none cursor-pointer">
                    <option value="all">All Categories</option>
                    <option value="education">Education</option>
                    <option value="sensors">Sensors</option>
                    <option value="automation">Automation</option>
                    <option value="iot">IoT</option>
                    <option value="robotics">Robotics</option>
                  </select>
                  <select value={filterSort} onChange={e => setFilterSort(e.target.value)} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none cursor-pointer">
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.length > 0 ? (
                    filtered.map(c => <CircuitCard key={c.id} circuit={c} onLoad={handleLoad} showDelete={false} />)
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <i className="fa-solid fa-search text-slate-300 text-5xl mb-4 block" />
                      <p className="text-slate-500 text-sm">No circuits found matching your criteria</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'publish' && (
              <div className="community-tab-content max-w-xl mx-auto">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Share Your Circuit</h3>
                <p className="text-sm text-slate-500 mb-6">Publish your circuit design for others to learn from and use.</p>
                <form onSubmit={handlePublish} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Circuit Title</label>
                    <input name="title" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300" placeholder="e.g., Smart Plant Watering System" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Description</label>
                    <textarea name="description" required rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300 resize-none" placeholder="Describe what your circuit does..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">Category</label>
                      <select name="category" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none cursor-pointer">
                        <option value="education">Education</option>
                        <option value="sensors">Sensors</option>
                        <option value="automation">Automation</option>
                        <option value="iot">IoT</option>
                        <option value="robotics">Robotics</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">Author Name</label>
                      <input name="author" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300" placeholder="Your name" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Tags (comma-separated)</label>
                    <input name="tags" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300" placeholder="arduino, sensors, beginner" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition cursor-pointer">
                    <i className="fa-solid fa-upload mr-2" />Publish Circuit
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'my-circuits' && (
              <div className="community-tab-content">
                {myCircuits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myCircuits.map(c => <CircuitCard key={c.id} circuit={c} onLoad={handleLoad} onDelete={handleDelete} showDelete />)}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <i className="fa-solid fa-box-open text-slate-300 text-6xl mb-4 block" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">No circuits published yet</h3>
                    <p className="text-sm text-slate-500 mb-4">Create and publish your first circuit to share with the community.</p>
                    <button onClick={() => setTab('publish')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition cursor-pointer">
                      <i className="fa-solid fa-plus mr-2" />Create Circuit
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
