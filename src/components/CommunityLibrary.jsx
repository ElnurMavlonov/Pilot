import { createPortal } from 'react-dom';
import {
  closeCommunityLibrary, switchCommunityTab,
  filterCommunityCircuits, publishCircuit,
} from '../lib/iotify-app.js';

export default function CommunityLibrary() {
  const handleBg = (e) => { if (e.target === e.currentTarget) closeCommunityLibrary(); };

  const modal = (
    <div
      id="community-library-modal"
      onClick={handleBg}
    >
      <div className="community-modal-shell">
        <div
          className="community-modal-card bg-white rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fa-solid fa-users text-white text-lg"></i>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900 truncate">Community Preset Library</h2>
                <p className="text-xs text-slate-500">Browse and share circuits with the community</p>
              </div>
            </div>
            <button onClick={closeCommunityLibrary} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 px-6 shrink-0 overflow-x-auto">
            <button onClick={() => switchCommunityTab('browse')} id="tab-browse" className="community-tab active px-4 py-3 text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 transition cursor-pointer whitespace-nowrap">
              <i className="fa-solid fa-compass mr-2"></i>Browse
            </button>
            <button onClick={() => switchCommunityTab('publish')} id="tab-publish" className="community-tab px-4 py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 border-b-2 border-transparent transition cursor-pointer whitespace-nowrap">
              <i className="fa-solid fa-upload mr-2"></i>Publish
            </button>
            <button onClick={() => switchCommunityTab('my-circuits')} id="tab-my-circuits" className="community-tab px-4 py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 border-b-2 border-transparent transition cursor-pointer whitespace-nowrap">
              <i className="fa-solid fa-user mr-2"></i>My Circuits
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {/* Browse Tab */}
            <div id="browse-tab-content" className="community-tab-content">
              <div className="flex flex-wrap gap-3 mb-6">
                <select id="filter-category" onChange={filterCommunityCircuits} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer">
                  <option value="all">All Categories</option>
                  <option value="education">Education</option>
                  <option value="sensors">Sensors</option>
                  <option value="automation">Automation</option>
                  <option value="iot">IoT Projects</option>
                  <option value="robotics">Robotics</option>
                </select>
                <select id="filter-sort" onChange={filterCommunityCircuits} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer">
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <input id="search-circuits" type="text" placeholder="Search circuits..." onInput={filterCommunityCircuits} className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500" />
              </div>
              <div id="community-circuits-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"></div>
            </div>

            {/* Publish Tab */}
            <div id="publish-tab-content" className="community-tab-content hidden">
              <div className="max-w-2xl mx-auto">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <i className="fa-solid fa-info-circle text-indigo-600 text-lg mt-0.5"></i>
                    <div>
                      <h3 className="text-sm font-semibold text-indigo-900 mb-1">Share Your Circuit</h3>
                      <p className="text-xs text-indigo-700 leading-relaxed">Publish your current circuit configuration to the community library. Other users will be able to browse, learn from, and use your design.</p>
                    </div>
                  </div>
                </div>

                <form id="publish-form" onSubmit={publishCircuit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Circuit Title *</label>
                    <input type="text" id="publish-title" required className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500" placeholder="e.g., Temperature-Controlled Fan System" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                    <textarea id="publish-description" required rows="4" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 resize-none" placeholder="Describe what your circuit does and how it works..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                    <select id="publish-category" required className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer">
                      <option value="">Select a category</option>
                      <option value="education">Education</option>
                      <option value="sensors">Sensors</option>
                      <option value="automation">Automation</option>
                      <option value="iot">IoT Projects</option>
                      <option value="robotics">Robotics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tags (comma-separated)</label>
                    <input type="text" id="publish-tags" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500" placeholder="e.g., arduino, led, beginner" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Author Name *</label>
                    <input type="text" id="publish-author" required className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500" placeholder="Your name or username" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="publish-terms" required className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" />
                    <label htmlFor="publish-terms" className="text-xs text-slate-600">I agree to share this circuit under the MIT License and confirm it&apos;s my original work</label>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer">
                    <i className="fa-solid fa-cloud-upload-alt mr-2"></i>Publish to Community
                  </button>
                </form>
              </div>
            </div>

            {/* My Circuits Tab */}
            <div id="my-circuits-tab-content" className="community-tab-content hidden">
              <div id="my-circuits-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"></div>
              <div id="my-circuits-empty" className="hidden text-center py-12">
                <i className="fa-solid fa-folder-open text-slate-300 text-5xl mb-4"></i>
                <p className="text-slate-500 text-sm">You haven&apos;t published any circuits yet</p>
                <button onClick={() => switchCommunityTab('publish')} className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
                  Publish Your First Circuit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
