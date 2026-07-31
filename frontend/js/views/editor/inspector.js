// inspector.js - Generates context-aware property panels for selected elements
import { esc } from '../../utils.js';
import { ElementTypes, Fonts } from './model.js';

export function renderInspector(el, containerId, onUpdate) {
  const inspector = document.getElementById(containerId);
  if (!inspector) return;

  if (!el) {
    inspector.innerHTML = '<div style="color:#64748b; font-size:14px; text-align:center; margin-top:20px;">Select an element on the canvas to edit its properties.</div>';
    return;
  }

  let html = `<div style="display:flex; flex-direction:column; gap:16px;">`;
  
  // Generic Properties (Position, Size, Opacity, Z-Index)
  html += `
    <div style="padding-bottom: 12px; border-bottom: 1px solid #cbd5e1;">
      <div style="font-size:12px; font-weight:600; text-transform:uppercase; color:#64748b; margin-bottom:8px;">Layout</div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
        <div><label style="font-size:12px; color:#475569;">X</label><input type="number" class="form-control" id="propX" value="${Math.round(el.x)}"></div>
        <div><label style="font-size:12px; color:#475569;">Y</label><input type="number" class="form-control" id="propY" value="${Math.round(el.y)}"></div>
        <div><label style="font-size:12px; color:#475569;">Width</label><input type="number" class="form-control" id="propW" value="${Math.round(el.width)}"></div>
        <div><label style="font-size:12px; color:#475569;">Height</label><input type="number" class="form-control" id="propH" value="${Math.round(el.height)}"></div>
        <div><label style="font-size:12px; color:#475569;">Opacity</label><input type="number" step="0.1" min="0" max="1" class="form-control" id="propOpacity" value="${el.opacity !== undefined ? el.opacity : 1}"></div>
        <div><label style="font-size:12px; color:#475569;">Z-Index</label><input type="number" class="form-control" id="propZ" value="${el.zIndex || 1}"></div>
      </div>
    </div>
  `;

  // Specific Properties based on Type
  if (el.type === ElementTypes.TEXT) {
    html += `
      <div style="padding-bottom: 12px; border-bottom: 1px solid #cbd5e1;">
        <div style="font-size:12px; font-weight:600; text-transform:uppercase; color:#64748b; margin-bottom:8px;">Text</div>
        <div style="margin-bottom:8px;">
          <label style="font-size:12px; color:#475569;">Content</label>
          <textarea class="form-control" id="propText" rows="4" style="resize:vertical;">${esc(el.content || '')}</textarea>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
          <div>
            <label style="font-size:12px; color:#475569;">Font Family</label>
            <select class="form-control" id="propFontFamily">
              ${Fonts.map(f => `<option value="${f}" ${el.fontFamily===f?'selected':''}>${f}</option>`).join('')}
            </select>
          </div>
          <div><label style="font-size:12px; color:#475569;">Size</label><input type="number" class="form-control" id="propFontSize" value="${el.fontSize || 36}"></div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
          <div><label style="font-size:12px; color:#475569;">Color</label><input type="color" class="form-control" id="propColor" value="${el.color || '#000000'}"></div>
          <div>
            <label style="font-size:12px; color:#475569;">Weight</label>
            <select class="form-control" id="propFontWeight">
              <option value="300" ${el.fontWeight==='300'?'selected':''}>Light (300)</option>
              <option value="400" ${el.fontWeight==='400'?'selected':''}>Normal (400)</option>
              <option value="600" ${el.fontWeight==='600'?'selected':''}>Semi Bold (600)</option>
              <option value="700" ${el.fontWeight==='700'?'selected':''}>Bold (700)</option>
            </select>
          </div>
        </div>
        <div style="margin-top:8px;">
          <label style="font-size:12px; color:#475569;">Alignment</label>
          <select class="form-control" id="propTextAlign">
            <option value="left" ${el.textAlign==='left'?'selected':''}>Left</option>
            <option value="center" ${el.textAlign==='center'?'selected':''}>Center</option>
            <option value="right" ${el.textAlign==='right'?'selected':''}>Right</option>
            <option value="justify" ${el.textAlign==='justify'?'selected':''}>Justify</option>
          </select>
        </div>
      </div>
    `;
  } else if (el.type === ElementTypes.IMAGE || el.type === ElementTypes.VIDEO) {
    html += `
      <div style="padding-bottom: 12px; border-bottom: 1px solid #cbd5e1;">
        <div style="font-size:12px; font-weight:600; text-transform:uppercase; color:#64748b; margin-bottom:8px;">Media</div>
        <div style="margin-bottom:8px;">
          <label style="font-size:12px; color:#475569;">URL</label>
          <input type="text" class="form-control" id="propUrl" value="${esc(el.url || '')}">
        </div>
        ${el.type === ElementTypes.IMAGE ? `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
          <div>
            <label style="font-size:12px; color:#475569;">Fit</label>
            <select class="form-control" id="propObjectFit">
              <option value="cover" ${el.objectFit==='cover'?'selected':''}>Cover</option>
              <option value="contain" ${el.objectFit==='contain'?'selected':''}>Contain</option>
              <option value="fill" ${el.objectFit==='fill'?'selected':''}>Fill</option>
            </select>
          </div>
          <div><label style="font-size:12px; color:#475569;">Radius</label><input type="number" class="form-control" id="propBorderRadius" value="${el.borderRadius || 0}"></div>
        </div>` : `
        <div style="display:flex; flex-direction:column; gap:8px;">
           <label style="display:flex; align-items:center; gap:8px; font-size:14px;"><input type="checkbox" id="propAutoplay" ${el.autoplay?'checked':''}> Autoplay</label>
           <label style="display:flex; align-items:center; gap:8px; font-size:14px;"><input type="checkbox" id="propMuted" ${el.muted?'checked':''}> Muted</label>
           <label style="display:flex; align-items:center; gap:8px; font-size:14px;"><input type="checkbox" id="propLoop" ${el.loop?'checked':''}> Loop</label>
        </div>`}
      </div>
    `;
  } else if (el.type === ElementTypes.SHAPE) {
    html += `
      <div style="padding-bottom: 12px; border-bottom: 1px solid #cbd5e1;">
        <div style="font-size:12px; font-weight:600; text-transform:uppercase; color:#64748b; margin-bottom:8px;">Shape</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
          <div><label style="font-size:12px; color:#475569;">Fill Color</label><input type="color" class="form-control" id="propFill" value="${el.fill || '#000000'}"></div>
          <div><label style="font-size:12px; color:#475569;">Stroke Color</label><input type="color" class="form-control" id="propStroke" value="${el.stroke || '#000000'}"></div>
        </div>
        <div><label style="font-size:12px; color:#475569;">Stroke Width</label><input type="number" class="form-control" id="propStrokeWidth" value="${el.strokeWidth || 0}"></div>
      </div>
    `;
  } else if (el.type === ElementTypes.QR) {
    html += `
      <div style="padding-bottom: 12px; border-bottom: 1px solid #cbd5e1;">
        <div style="font-size:12px; font-weight:600; text-transform:uppercase; color:#64748b; margin-bottom:8px;">QR Code</div>
        <div style="margin-bottom:8px;">
          <label style="font-size:12px; color:#475569;">Data / URL</label>
          <input type="text" class="form-control" id="propValue" value="${esc(el.value || '')}">
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
          <div><label style="font-size:12px; color:#475569;">Foreground</label><input type="color" class="form-control" id="propFgColor" value="${el.fgColor || '#000000'}"></div>
          <div><label style="font-size:12px; color:#475569;">Background</label><input type="color" class="form-control" id="propBgColor" value="${el.bgColor || '#ffffff'}"></div>
        </div>
      </div>
    `;
  } else if (el.type === ElementTypes.WIDGET) {
    html += `
      <div style="padding-bottom: 12px; border-bottom: 1px solid #cbd5e1;">
        <div style="font-size:12px; font-weight:600; text-transform:uppercase; color:#64748b; margin-bottom:8px;">Widget Configuration</div>
        <div style="margin-bottom:8px;">
          <label style="font-size:12px; color:#475569;">Widget Type</label>
          <select class="form-control" id="propWidgetType">
            <option value="time" ${el.widgetType==='time'?'selected':''}>Time & Date</option>
            <option value="weather" ${el.widgetType==='weather'?'selected':''}>Weather</option>
            <option value="ticker" ${el.widgetType==='ticker'?'selected':''}>Scrolling Text</option>
          </select>
        </div>
      </div>
    `;
  }

  html += `
    <button class="btn btn-outline" id="deleteElBtn" style="color: #ef4444; border-color: #fca5a5;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      Delete Element
    </button>
  </div>`;

  inspector.innerHTML = html;

  // Bind events
  const bindNum = (id, key) => {
    const input = document.getElementById(id);
    if (input) input.onchange = (e) => onUpdate({ [key]: parseFloat(e.target.value) });
  };
  const bindStr = (id, key) => {
    const input = document.getElementById(id);
    if (input) input.onchange = (e) => onUpdate({ [key]: e.target.value });
  };
  const bindInput = (id, key) => { // for realtime like textareas
    const input = document.getElementById(id);
    if (input) input.oninput = (e) => onUpdate({ [key]: e.target.value });
  };
  const bindBool = (id, key) => {
    const input = document.getElementById(id);
    if (input) input.onchange = (e) => onUpdate({ [key]: e.target.checked });
  };

  bindNum('propX', 'x');
  bindNum('propY', 'y');
  bindNum('propW', 'width');
  bindNum('propH', 'height');
  bindNum('propOpacity', 'opacity');
  bindNum('propZ', 'zIndex');

  if (el.type === ElementTypes.TEXT) {
    bindInput('propText', 'content');
    bindNum('propFontSize', 'fontSize');
    bindStr('propColor', 'color');
    bindStr('propFontFamily', 'fontFamily');
    bindStr('propFontWeight', 'fontWeight');
    bindStr('propTextAlign', 'textAlign');
  } else if (el.type === ElementTypes.IMAGE) {
    bindStr('propUrl', 'url');
    bindStr('propObjectFit', 'objectFit');
    bindNum('propBorderRadius', 'borderRadius');
  } else if (el.type === ElementTypes.VIDEO) {
    bindStr('propUrl', 'url');
    bindBool('propAutoplay', 'autoplay');
    bindBool('propMuted', 'muted');
    bindBool('propLoop', 'loop');
  } else if (el.type === ElementTypes.SHAPE) {
    bindStr('propFill', 'fill');
    bindStr('propStroke', 'stroke');
    bindNum('propStrokeWidth', 'strokeWidth');
  } else if (el.type === ElementTypes.QR) {
    bindStr('propValue', 'value');
    bindStr('propFgColor', 'fgColor');
    bindStr('propBgColor', 'bgColor');
  } else if (el.type === ElementTypes.WIDGET) {
    bindStr('propWidgetType', 'widgetType');
  }

  document.getElementById('deleteElBtn').onclick = () => {
    onUpdate('DELETE_ACTION');
  };
}
