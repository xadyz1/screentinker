// canvas.js - Handles rendering elements to DOM and Moveable interactions
import { esc } from '../../utils.js';
import { ElementTypes, Fonts } from './model.js';

let moveable = null;
let currentDoc = null;
let currentCanvasEl = null;
let onSelectCb = null;
let onUpdateCb = null;

// Renders the dynamic Google Fonts `<link>` tags
function renderFonts(doc) {
  if (!doc || !doc.elements) return;
  const usedFonts = new Set(doc.elements.filter(e => e.type === ElementTypes.TEXT && e.fontFamily).map(e => e.fontFamily));
  
  if (usedFonts.size > 0) {
    const familyStr = Array.from(usedFonts).map(f => f.replace(/ /g, '+') + ':wght@400;700').join('&family=');
    const href = `https://fonts.googleapis.com/css2?family=${familyStr}&display=swap`;
    let link = document.getElementById('template-fonts');
    if (!link) {
      link = document.createElement('link');
      link.id = 'template-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = href;
  }
}

export function renderCanvasDocument(doc, canvasEl) {
  currentDoc = doc;
  currentCanvasEl = canvasEl;
  
  renderFonts(doc);

  canvasEl.innerHTML = '';
  if (!doc || !doc.elements) return;

  doc.elements.forEach(el => {
    const node = document.createElement('div');
    node.id = el.id;
    node.style.position = 'absolute';
    node.style.left = el.x + 'px';
    node.style.top = el.y + 'px';
    node.style.width = el.width + 'px';
    node.style.height = el.height + 'px';
    node.style.zIndex = el.zIndex || 1;
    node.style.opacity = el.opacity !== undefined ? el.opacity : 1;
    node.style.display = el.visible === false ? 'none' : 'block';

    if (el.type === ElementTypes.TEXT) {
      node.style.fontFamily = `"${el.fontFamily || 'Inter'}", sans-serif`;
      node.style.fontSize = (el.fontSize || 36) + 'px';
      node.style.color = el.color || '#000000';
      node.style.textAlign = el.textAlign || 'left';
      node.style.fontWeight = el.fontWeight || '400';
      node.style.whiteSpace = 'pre-wrap';
      node.textContent = el.content || '';
    } 
    else if (el.type === ElementTypes.IMAGE) {
      const img = document.createElement('img');
      img.src = el.url;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = el.objectFit || 'cover';
      img.style.borderRadius = (el.borderRadius || 0) + 'px';
      img.style.display = 'block';
      img.style.pointerEvents = 'none'; // so Moveable can drag the container div
      node.appendChild(img);
    }
    else if (el.type === ElementTypes.VIDEO) {
      const vid = document.createElement('video');
      vid.src = el.url;
      vid.style.width = '100%';
      vid.style.height = '100%';
      vid.style.objectFit = 'cover';
      if (el.muted) vid.muted = true;
      if (el.loop) vid.loop = true;
      if (el.autoplay) vid.autoplay = true;
      vid.style.pointerEvents = 'none';
      node.appendChild(vid);
    }
    else if (el.type === ElementTypes.SHAPE) {
      if (el.shapeType === 'circle') {
        node.style.borderRadius = '50%';
      }
      node.style.backgroundColor = el.fill || '#ff6b00';
      if (el.strokeWidth > 0) {
        node.style.border = `${el.strokeWidth}px solid ${el.stroke || '#000'}`;
      }
    }
    else if (el.type === ElementTypes.QR) {
      // Use a placeholder img for now, in real signage we might render dynamically
      const img = document.createElement('img');
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(el.value || 'https://swiftdisplay.com')}&color=${(el.fgColor||'#000000').replace('#','')}&bgcolor=${(el.bgColor||'#ffffff').replace('#','')}`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.pointerEvents = 'none';
      node.appendChild(img);
    }
    else if (el.type === ElementTypes.WIDGET) {
      node.style.backgroundColor = 'rgba(0,0,0,0.05)';
      node.style.border = '2px dashed #cbd5e1';
      node.style.display = 'flex';
      node.style.alignItems = 'center';
      node.style.justifyContent = 'center';
      node.style.color = '#64748b';
      node.style.fontFamily = 'Inter, sans-serif';
      node.style.fontWeight = '600';
      node.textContent = `[ Widget: ${el.widgetType} ]`;
    }

    // Attach mousedown to select
    node.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // prevent canvas click
      if (onSelectCb) onSelectCb(el.id, node);
    });

    canvasEl.appendChild(node);
  });
}

export function initMoveable(container, onUpdate, onSelect) {
  onUpdateCb = onUpdate;
  onSelectCb = onSelect;

  if (moveable) moveable.destroy();
  moveable = new Moveable(container, {
    target: null,
    draggable: true,
    resizable: true,
    snappable: true,
    isDisplaySnapDigit: true,
    snapCenter: true,
    snapThreshold: 5,
    bounds: { left: 0, top: 0, right: 1920, bottom: 1080 } // these will be updated for portrait/landscape dynamically if needed
  });

  moveable.on('drag', ({ target, left, top }) => {
    target.style.left = `${left}px`;
    target.style.top = `${top}px`;
    onUpdateCb(target.id, { x: left, y: top });
  });

  moveable.on('resize', ({ target, width, height, drag }) => {
    target.style.width = `${width}px`;
    target.style.height = `${height}px`;
    target.style.left = `${drag.left}px`;
    target.style.top = `${drag.top}px`;
    onUpdateCb(target.id, { x: drag.left, y: drag.top, width, height });
  });

  return moveable;
}

export function getMoveable() {
  return moveable;
}

export function selectElementInCanvas(id, node) {
  if (moveable) {
    moveable.target = node;
  }
}

export function deselectElementInCanvas() {
  if (moveable) {
    moveable.target = null;
  }
}

export function destroyMoveable() {
  if (moveable) {
    moveable.destroy();
    moveable = null;
  }
}
