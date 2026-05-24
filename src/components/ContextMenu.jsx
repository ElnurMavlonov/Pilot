import { toggleCtxInfo, ctxSelect, ctxDelete } from '../lib/iotify-app.js';

export default function ContextMenu() {
  return (
    <div id="ctx-menu" role="menu">
      <div className="ctx-header">
        <div className="ctx-type" id="ctx-type">Component</div>
        <div className="ctx-id" id="ctx-id">id</div>
      </div>

      <button className="ctx-row" onClick={toggleCtxInfo}>
        <i className="fa-solid fa-circle-info text-indigo-400 w-3.5 text-center"></i>
        <span id="ctx-info-label">Show Info</span>
      </button>

      <div className="ctx-info-block" id="ctx-info-block">
        <div className="ctx-info-row"><span className="lbl">Type</span><span className="val" id="ci-type">—</span></div>
        <div className="ctx-info-row"><span className="lbl">Variant</span><span className="val" id="ci-variant">—</span></div>
        <div className="ctx-info-row"><span className="lbl">Position X</span><span className="val" id="ci-x">—</span></div>
        <div className="ctx-info-row"><span className="lbl">Position Z</span><span className="val" id="ci-z">—</span></div>
        <div className="ctx-info-row"><span className="lbl">Instance</span><span className="val" id="ci-instance">—</span></div>
      </div>

      <div className="ctx-divider"></div>

      <button className="ctx-row" onClick={ctxSelect}>
        <i className="fa-solid fa-arrow-pointer text-slate-400 w-3.5 text-center"></i> Select
      </button>

      <button className="ctx-row danger" onClick={ctxDelete}>
        <i className="fa-solid fa-trash-can w-3.5 text-center"></i> Delete
      </button>
    </div>
  );
}
