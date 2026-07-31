import { api } from '../api.js';
import { showToast } from '../components/toast.js';
import { t, tn } from '../i18n.js';
import { esc } from '../utils.js';

let moveable = null;
let selectedElementId = null;

// Reusable API wrapper for templates
const API = async (url, opts = {}) => {
  const wsId = localStorage.getItem('active_workspace_id');
  const res = await fetch('/api' + url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      ...(wsId ? { 'X-Workspace-Id': wsId } : {}),
      ...opts.headers
    },
    ...opts
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
};

export async function render(container) {
  const hash = window.location.hash;
  if (hash.startsWith('#/templates/')) {
    const id = hash.split('#/templates/')[1];
    return renderEditor(container, id);
  }
  return renderGallery(container);
}

// ----------------------------------------------------------------------------
// GALLERY VIEW
// ----------------------------------------------------------------------------
async function renderGallery(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Templates <span class="help-tip" data-tip="Manage your visual templates here.">?</span></h1>
        <div class="subtitle">Design beautiful screens and use them across your displays.</div>
      </div>
      <button class="btn btn-primary" id="newTemplateBtn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Template
      </button>
    </div>
    
    <div class="content-grid" id="templateGrid">
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4" style="margin: 0 auto 16px; display: block; opacity: 0.5;">
           <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
        <p>Loading templates...</p>
      </div>
    </div>
  `;

  document.getElementById('newTemplateBtn').onclick = async () => {
    const name = prompt('Template name:');
    if (!name) return;
    try {
      const template = await API('/templates', { 
        method: 'POST', 
        body: JSON.stringify({ 
          name, 
          document: { elements: [] } 
        }) 
      });
      window.location.hash = `#/templates/${template.id}`;
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  await loadTemplates();
}

async function loadTemplates() {
  const grid = document.getElementById('templateGrid');
  if (!grid) return;

  try {
    const templates = await API('/templates');
    if (templates.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>No templates found. Create one to get started.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = templates.map(t => `
      <div class="card item-card" style="cursor: pointer;" onclick="window.location.hash='#/templates/${t.id}'">
        <div class="card-preview" style="background: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 140px; border-radius: 6px 6px 0 0;">
          ${t.thumbnail_url 
            ? `<img src="${esc(t.thumbnail_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:6px 6px 0 0">` 
            : `<span style="color:var(--text-secondary);font-size:12px;">No Preview</span>`}
        </div>
        <div style="padding: 12px;">
          <div style="font-weight: 500; margin-bottom: 4px;">${esc(t.name)}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">${t.is_public ? 'Global' : 'Workspace'} • ${esc(t.category)}</div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; color: var(--danger);">${esc(err.message)}</div>`;
  }
}

// ----------------------------------------------------------------------------
// EDITOR VIEW (JSON ENGINE FOUNDATION)
// ----------------------------------------------------------------------------
async function renderEditor(container, id) {
  // We hide standard layout elements to give full screen to the editor
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.style.display = 'none';
  const appEl = document.getElementById('app');
  if (appEl) {
    appEl.style.marginLeft = '0';
    appEl.style.padding = '0';
  }
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.display = 'none';

  container.innerHTML = `
    <div class="template-editor" style="display: flex; flex-direction: column; height: 100vh; background: #e2e8f0;">
      
      <!-- Top Toolbar -->
      <div class="editor-toolbar" style="height: 56px; background: white; border-bottom: 1px solid #cbd5e1; display: flex; align-items: center; padding: 0 20px; justify-content: space-between; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <button class="btn btn-icon" onclick="window.location.hash='#/templates'" title="Back to Gallery">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style="font-weight: 600;" id="editorTemplateName">Loading...</div>
        </div>
        <div>
          <button class="btn btn-primary" id="saveTemplateBtn">Save</button>
        </div>
      </div>

      <div style="display: flex; flex: 1; overflow: hidden;">
        
        <!-- Left Sidebar (Tools) -->
        <div class="editor-sidebar" style="width: 260px; background: white; border-right: 1px solid #cbd5e1; display: flex; flex-direction: column; overflow-y: auto;">
          <div style="padding: 16px; border-bottom: 1px solid #cbd5e1; font-weight: 600;">Add Elements</div>
          <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
            <button class="btn btn-outline" id="addTextBtn" style="justify-content: flex-start;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
              Add Text
            </button>
            <button class="btn btn-outline" id="addImageBtn" style="justify-content: flex-start;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Add Image Placeholder
            </button>
          </div>
        </div>

        <!-- Canvas Area -->
        <div class="editor-canvas-container" style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 40px;">
          <!-- The 1920x1080 logical canvas, scaled via CSS transform -->
          <div id="editorCanvas" style="width: 1920px; height: 1080px; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); position: relative; overflow: hidden; transform-origin: center center;">
          </div>
        </div>
        
        <!-- Right Inspector (Properties) -->
        <div class="editor-inspector" style="width: 300px; background: white; border-left: 1px solid #cbd5e1; display: flex; flex-direction: column; overflow-y: auto;">
          <div style="padding: 16px; border-bottom: 1px solid #cbd5e1; font-weight: 600;">Properties</div>
          <div id="inspectorContent" style="padding: 16px; color: var(--text-secondary); font-size: 14px;">
            Select an element on the canvas to edit its properties.
          </div>
        </div>

      </div>
    </div>
  `;

  // Scale canvas to fit container
  const containerEl = document.querySelector('.editor-canvas-container');
  const canvasEl = document.getElementById('editorCanvas');
  
  function resizeCanvas() {
    const containerWidth = containerEl.clientWidth - 80; // 40px padding each side
    const containerHeight = containerEl.clientHeight - 80;
    const scaleX = containerWidth / 1920;
    const scaleY = containerHeight / 1080;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
    
    canvasEl.style.transform = `scale(${scale})`;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Load template data
  let template;
  try {
    template = await API(`/templates/${id}`);
    document.getElementById('editorTemplateName').textContent = template.name;
    renderCanvasDocument(template.document, canvasEl);
  } catch (err) {
    showToast(err.message, 'error');
    return;
  }

  // --- JSON Engine Foundation ---
  
  // Handlers for adding elements
  document.getElementById('addTextBtn').onclick = () => {
    if (!template.document.elements) template.document.elements = [];
    template.document.elements.push({
      id: 'el_' + Date.now(),
      type: 'text',
      content: 'Hello World',
      x: 100,
      y: 100,
      width: 400,
      height: 100,
      fontSize: 48,
      fontFamily: 'Inter',
      color: '#000000'
    });
    renderCanvasDocument(template.document, canvasEl);
  };
  
  document.getElementById('addImageBtn').onclick = () => {
    if (!template.document.elements) template.document.elements = [];
    template.document.elements.push({
      id: 'el_' + Date.now(),
      type: 'image',
      url: 'https://via.placeholder.com/400x300?text=Image',
      x: 200,
      y: 200,
      width: 400,
      height: 300
    });
    renderCanvasDocument(template.document, canvasEl);
  };

  document.getElementById('saveTemplateBtn').onclick = async () => {
    try {
      await API(`/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ document: template.document })
      });
      showToast('Template saved');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  // --- Phase 2: Moveable & Inspector ---
  selectedElementId = null;

  function initMoveable() {
    if (moveable) moveable.destroy();
    
    moveable = new window.Moveable(canvasEl, {
      target: null,
      draggable: true,
      resizable: true,
      rotatable: false,
      snappable: true,
      bounds: { left: 0, top: 0, right: 1920, bottom: 1080 },
      keepRatio: false,
      throttleDrag: 1,
      throttleResize: 1,
      edge: true
    });

    moveable.on('drag', ({ target, left, top }) => {
      target.style.left = `${left}px`;
      target.style.top = `${top}px`;
      updateElementData(target.id, { x: left, y: top });
    });

    moveable.on('resize', ({ target, width, height, drag }) => {
      target.style.width = `${width}px`;
      target.style.height = `${height}px`;
      target.style.left = `${drag.left}px`;
      target.style.top = `${drag.top}px`;
      updateElementData(target.id, { 
        width: width, 
        height: height,
        x: drag.left,
        y: drag.top
      });
    });
  }
  
  initMoveable();

  function selectElement(elId, targetNode) {
    selectedElementId = elId;
    moveable.target = targetNode;
    renderInspector();
  }

  function deselectElement() {
    selectedElementId = null;
    moveable.target = null;
    renderInspector();
  }

  // Click outside to deselect
  canvasEl.addEventListener('mousedown', (e) => {
    if (e.target === canvasEl) {
      deselectElement();
    }
  });

  function updateElementData(id, changes) {
    const el = template.document.elements.find(e => e.id === id);
    if (el) {
      Object.assign(el, changes);
      renderInspector(); // Refresh inspector if needed
    }
  }

  function renderInspector() {
    const inspector = document.getElementById('inspectorContent');
    if (!selectedElementId) {
      inspector.innerHTML = 'Select an element on the canvas to edit its properties.';
      return;
    }
    
    const el = template.document.elements.find(e => e.id === selectedElementId);
    if (!el) return;

    let html = `<div style="display:flex; flex-direction:column; gap:16px;">`;
    
    // Position & Size
    html += `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
        <div><label style="font-size:12px;">X</label><input type="number" class="form-control" id="propX" value="${Math.round(el.x)}"></div>
        <div><label style="font-size:12px;">Y</label><input type="number" class="form-control" id="propY" value="${Math.round(el.y)}"></div>
        <div><label style="font-size:12px;">Width</label><input type="number" class="form-control" id="propW" value="${Math.round(el.width)}"></div>
        <div><label style="font-size:12px;">Height</label><input type="number" class="form-control" id="propH" value="${Math.round(el.height)}"></div>
      </div>
    `;

    if (el.type === 'text') {
      html += `
        <div>
          <label style="font-size:12px;">Text Content</label>
          <textarea class="form-control" id="propText" rows="3">${esc(el.content)}</textarea>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
          <div><label style="font-size:12px;">Font Size</label><input type="number" class="form-control" id="propFontSize" value="${el.fontSize}"></div>
          <div><label style="font-size:12px;">Color</label><input type="color" class="form-control" id="propColor" value="${el.color}"></div>
        </div>
        <div>
          <label style="font-size:12px;">Font Family</label>
          <select class="form-control" id="propFontFamily">
            <option value="Inter" ${el.fontFamily==='Inter'?'selected':''}>Inter</option>
            <option value="Roboto" ${el.fontFamily==='Roboto'?'selected':''}>Roboto</option>
            <option value="Montserrat" ${el.fontFamily==='Montserrat'?'selected':''}>Montserrat</option>
            <option value="Oswald" ${el.fontFamily==='Oswald'?'selected':''}>Oswald</option>
            <option value="Goldman" ${el.fontFamily==='Goldman'?'selected':''}>Goldman</option>
          </select>
        </div>
      `;
    } else if (el.type === 'image') {
      html += `
        <div>
          <label style="font-size:12px;">Image URL</label>
          <input type="text" class="form-control" id="propUrl" value="${esc(el.url)}">
        </div>
      `;
    }

    html += `
      <button class="btn btn-danger" id="deleteElBtn" style="margin-top:16px;">Delete Element</button>
    </div>`;

    inspector.innerHTML = html;

    // Attach listeners
    const bindNum = (id, key) => {
      const input = document.getElementById(id);
      if (input) input.onchange = (e) => {
        updateElementData(selectedElementId, { [key]: parseFloat(e.target.value) });
        renderCanvasDocument(template.document, canvasEl);
        // re-select to attach moveable to new dom node
        const node = document.getElementById(selectedElementId);
        if (node) selectElement(selectedElementId, node);
      };
    };
    const bindStr = (id, key) => {
      const input = document.getElementById(id);
      if (input) input.onchange = (e) => {
        updateElementData(selectedElementId, { [key]: e.target.value });
        renderCanvasDocument(template.document, canvasEl);
        const node = document.getElementById(selectedElementId);
        if (node) selectElement(selectedElementId, node);
      };
    };

    bindNum('propX', 'x');
    bindNum('propY', 'y');
    bindNum('propW', 'width');
    bindNum('propH', 'height');
    
    if (el.type === 'text') {
      const ta = document.getElementById('propText');
      if (ta) ta.oninput = (e) => {
        updateElementData(selectedElementId, { content: e.target.value });
        const node = document.getElementById(selectedElementId);
        if (node) node.textContent = e.target.value;
      };
      bindNum('propFontSize', 'fontSize');
      bindStr('propColor', 'color');
      bindStr('propFontFamily', 'fontFamily');
    } else if (el.type === 'image') {
      bindStr('propUrl', 'url');
    }

    document.getElementById('deleteElBtn').onclick = () => {
      template.document.elements = template.document.elements.filter(e => e.id !== selectedElementId);
      deselectElement();
      renderCanvasDocument(template.document, canvasEl);
    };
  }
  
  // Re-render when elements are added
  const _origAddText = document.getElementById('addTextBtn').onclick;
  document.getElementById('addTextBtn').onclick = () => {
    _origAddText();
    // Select the new element
    const lastEl = template.document.elements[template.document.elements.length - 1];
    const node = document.getElementById(lastEl.id);
    if (node) selectElement(lastEl.id, node);
  };
  
  const _origAddImg = document.getElementById('addImageBtn').onclick;
  document.getElementById('addImageBtn').onclick = () => {
    _origAddImg();
    const lastEl = template.document.elements[template.document.elements.length - 1];
    const node = document.getElementById(lastEl.id);
    if (node) selectElement(lastEl.id, node);
  };
  
}

// Map JSON to absolute DOM nodes
function renderCanvasDocument(doc, canvasEl) {
  canvasEl.innerHTML = '';
  if (!doc || !doc.elements) return;
  doc.elements.forEach(el => {
    const node = document.createElement('div');
    node.id = el.id;
    node.style.position = 'absolute';
    node.style.left = `${el.x}px`;
    node.style.top = `${el.y}px`;
    node.style.width = `${el.width}px`;
    node.style.height = `${el.height}px`;
    
    if (el.type === 'text') {
      node.textContent = el.content;
      node.style.fontSize = `${el.fontSize}px`;
      node.style.fontFamily = el.fontFamily;
      node.style.color = el.color;
      node.style.display = 'flex';
      node.style.alignItems = 'center'; // Vertical align
      
      // Inject Google Font
      const fontId = 'font-' + el.fontFamily.replace(/\s+/g, '-');
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${el.fontFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
        document.head.appendChild(link);
      }
    } 
    else if (el.type === 'image') {
      const img = document.createElement('img');
      img.src = el.url;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      node.appendChild(img);
    }
    
    node.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      selectElement(el.id, node);
    });
    
    canvasEl.appendChild(node);
  });
}


export function cleanup() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.style.display = '';
  const appEl = document.getElementById('app');
  if (appEl) {
    appEl.style.marginLeft = '';
    appEl.style.padding = '';
  }
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.display = '';
  if (moveable) {
    moveable.destroy();
    moveable = null;
  }
}
