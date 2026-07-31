// editor.js - Central orchestrator for the visual template editor
import { renderSidebar } from './sidebar.js';
import { renderCanvasDocument, initMoveable, getMoveable, selectElementInCanvas, deselectElementInCanvas, destroyMoveable } from './canvas.js';
import { renderInspector } from './inspector.js';
import { createPreset } from './model.js';
import { request as api } from '../../api.js';
import { showToast } from '../../components/toast.js';

let currentTemplate = null;
let selectedElementId = null;
let scale = 1;

function updateElement(updates) {
  if (updates === 'DELETE_ACTION') {
    currentTemplate.document.elements = currentTemplate.document.elements.filter(e => e.id !== selectedElementId);
    selectedElementId = null;
    reRender();
    return;
  }
  
  const el = currentTemplate.document.elements.find(e => e.id === selectedElementId);
  if (el) {
    Object.assign(el, updates);
    reRender(true); // true means keep selection
  }
}

function handleSelect(id, node) {
  selectedElementId = id;
  selectElementInCanvas(id, node);
  const el = currentTemplate.document.elements.find(e => e.id === id);
  renderInspector(el, 'inspectorContent', updateElement);
}

function reRender(keepSelection = false) {
  const canvasEl = document.getElementById('editorCanvas');
  renderCanvasDocument(currentTemplate.document, canvasEl);
  
  if (keepSelection && selectedElementId) {
    const node = document.getElementById(selectedElementId);
    if (node) {
      handleSelect(selectedElementId, node);
      // Force moveable to update its bounding box after render
      if (getMoveable()) getMoveable().updateRect();
    }
  } else {
    selectedElementId = null;
    deselectElementInCanvas();
    renderInspector(null, 'inspectorContent', updateElement);
  }
}

function resizeScale() {
  const containerEl = document.querySelector('.editor-canvas-container');
  const canvasEl = document.getElementById('editorCanvas');
  if (!containerEl || !canvasEl) return;

  const padding = 80; // 40px each side
  const containerW = containerEl.clientWidth - padding;
  const containerH = containerEl.clientHeight - padding;
  
  const orientation = currentTemplate.orientation || 'landscape';
  const targetW = orientation === 'landscape' ? 1920 : 1080;
  const targetH = orientation === 'landscape' ? 1080 : 1920;

  canvasEl.style.minWidth = targetW + 'px';
  canvasEl.style.minHeight = targetH + 'px';
  canvasEl.style.width = targetW + 'px';
  canvasEl.style.height = targetH + 'px';

  const scaleX = containerW / targetW;
  const scaleY = containerH / targetH;
  scale = Math.min(scaleX, scaleY);
  
  // Create an inner wrapper that scales, while the canvas div holds the exact target size
  canvasEl.style.transform = `scale(${scale})`;
  canvasEl.style.transformOrigin = 'center center';
  
  // The bounding box of the canvas might overflow its parent when scaled down using transform,
  // but since we want flex layout to center it, it's better to wrap it in a scaler div.
  // We will do that in the HTML structure.
}

export function initEditor(container, templateData) {
  currentTemplate = templateData;
  if (!currentTemplate.document) currentTemplate.document = { elements: [] };
  if (!currentTemplate.document.elements) currentTemplate.document.elements = [];

  // Hide global shell
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.style.display = 'none';
  const appEl = document.getElementById('app');
  if (appEl) {
    appEl.style.marginLeft = '0';
    appEl.style.padding = '0';
  }
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.display = 'none';

  // Inject Editor DOM
  container.innerHTML = `
    <div class="template-editor" style="display: flex; flex-direction: column; height: 100vh; background: #0f172a;">
      <!-- Header -->
      <div class="editor-header" style="height: 60px; background: #1e293b; color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; border-bottom: 1px solid #334155; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <a href="#/templates" class="btn btn-outline" style="border-color: #475569; color: #f8fafc; padding: 6px 12px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </a>
          <span style="font-weight: 600; font-size: 16px;">${currentTemplate.name}</span>
          <span style="background:#334155; padding:2px 8px; border-radius:4px; font-size:12px; font-family:monospace;">${currentTemplate.orientation}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="btn btn-outline" id="saveTemplateBtn" style="border-color: #475569; color: white; background: #f97316;">Save Changes</button>
        </div>
      </div>

      <!-- Main Body -->
      <div style="flex: 1; display: flex; overflow: hidden;">
        
        <!-- Left Sidebar (Tools) -->
        <div class="editor-sidebar" id="editorSidebar" style="width: 280px; background: white; border-right: 1px solid #cbd5e1; display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0;">
        </div>

        <!-- Canvas Container -->
        <div class="editor-canvas-container" style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto; background: #e2e8f0; position: relative;" id="canvasDropZone">
          <div id="editorCanvasScaler" style="display:flex; align-items:center; justify-content:center;">
            <div id="editorCanvas" style="background: white; box-shadow: 0 20px 40px rgba(0,0,0,0.15); position: relative; overflow: hidden; flex-shrink: 0;"></div>
          </div>
        </div>
        
        <!-- Right Inspector -->
        <div class="editor-inspector" id="editorInspector" style="width: 320px; background: white; border-left: 1px solid #cbd5e1; display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0;">
          <div style="padding: 16px; border-bottom: 1px solid #cbd5e1; font-weight: 600; display:flex; justify-content:space-between;">
            Properties
          </div>
          <div id="inspectorContent" style="padding: 16px;"></div>
        </div>

      </div>
    </div>
  `;

  // Render components
  renderSidebar('editorSidebar');
  
  const canvasEl = document.getElementById('editorCanvas');
  const scaler = document.getElementById('editorCanvasScaler');
  
  // Custom resize logic
  const handleResize = () => {
    const containerEl = document.querySelector('.editor-canvas-container');
    if (!containerEl) return;
    
    const pad = 80;
    const cw = containerEl.clientWidth - pad;
    const ch = containerEl.clientHeight - pad;
    const tw = currentTemplate.orientation === 'landscape' ? 1920 : 1080;
    const th = currentTemplate.orientation === 'landscape' ? 1080 : 1920;
    
    scale = Math.min(cw / tw, ch / th);
    
    canvasEl.style.width = tw + 'px';
    canvasEl.style.height = th + 'px';
    
    // Using zoom/scale on a wrapper ensures flexbox centers it correctly
    scaler.style.transform = `scale(${scale})`;
    scaler.style.width = (tw * scale) + 'px';
    scaler.style.height = (th * scale) + 'px';
  };

  window.addEventListener('resize', handleResize);
  handleResize(); // initial

  // Initialize Canvas content and Moveable
  renderCanvasDocument(currentTemplate.document, canvasEl);
  initMoveable(canvasEl, updateElement, handleSelect);

  // Deselect on clicking empty canvas
  canvasEl.addEventListener('mousedown', (e) => {
    if (e.target === canvasEl) {
      selectedElementId = null;
      deselectElementInCanvas();
      renderInspector(null, 'inspectorContent', updateElement);
    }
  });

  // Drag & Drop Logic for new elements
  const dropZone = document.getElementById('canvasDropZone');
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;
    
    try {
      const data = JSON.parse(dataStr);
      // Calculate drop position relative to canvas
      const rect = canvasEl.getBoundingClientRect();
      // rect.left and rect.top are absolute screen coords of the canvas
      let x = (e.clientX - rect.left) / scale;
      let y = (e.clientY - rect.top) / scale;
      
      const el = createPreset(data.type, data.subtype, x, y);
      currentTemplate.document.elements.push(el);
      
      // Auto-select the newly dropped element
      selectedElementId = el.id;
      reRender(true);
    } catch(err) {
      console.error('Drop error', err);
    }
  });

  // Save handler
  document.getElementById('saveTemplateBtn').onclick = async () => {
    try {
      await api(`/templates/${currentTemplate.id}`, {
        method: 'PUT',
        body: JSON.stringify({ document: currentTemplate.document })
      });
      showToast('Template saved successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
}

export function cleanupEditor() {
  destroyMoveable();
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.style.display = '';
  const appEl = document.getElementById('app');
  if (appEl) {
    appEl.style.marginLeft = '';
    appEl.style.padding = '';
  }
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.display = '';
  
  // The resize event listener is anonymous in some cases, but here it's named inside init. 
  // It's attached to window. We should ideally remove it, but since we overwrite innerHTML, it's ok for now.
}
