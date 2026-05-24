export default function Toast() {
  return (
    <div
      id="toast"
      className="fixed top-6 right-6 bg-white border border-indigo-200 text-indigo-700 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-300 transform translate-y-[-100px] opacity-0 z-50"
    >
      <i className="fa-solid fa-wand-magic-sparkles text-lg animate-pulse"></i>
      <span id="toast-message" className="text-sm font-medium">
        AI is generating your custom laboratory setup...
      </span>
    </div>
  );
}
