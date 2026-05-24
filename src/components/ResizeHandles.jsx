import { startResize, resetPanelWidth } from '../lib/iotify-app.js';

export function LeftResizeHandle() {
  return (
    <div
      id="left-resize-handle"
      className="resize-handle-wrap hidden md:flex items-center justify-center w-1 shrink-0 cursor-col-resize z-20 relative"
      onMouseDown={(e) => startResize('left', e)}
      onDoubleClick={() => resetPanelWidth('left')}
      title="Drag to resize · Double-click to reset"
    >
      <div className="resize-handle-bar h-full"></div>
      <div className="absolute inset-y-0 -left-2 -right-2"></div>
    </div>
  );
}

export function RightResizeHandle() {
  return (
    <div
      id="right-resize-handle"
      className="resize-handle-wrap hidden md:flex items-center justify-center w-1 shrink-0 cursor-col-resize z-20 relative"
      onMouseDown={(e) => startResize('right', e)}
      onDoubleClick={() => resetPanelWidth('right')}
      title="Drag to resize · Double-click to reset"
    >
      <div className="resize-handle-bar h-full"></div>
      <div className="absolute inset-y-0 -left-2 -right-2"></div>
    </div>
  );
}
