// sidebar.js - Generates the draggable sidebar tools
import { ElementTypes } from './model.js';

export function renderSidebar(containerId) {
  const sidebar = document.getElementById(containerId);
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #cbd5e1; font-weight: 600;">Add Elements</div>
    
    <div style="padding: 16px; display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Text Presets -->
      <div>
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 8px;">Text</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div class="drag-preset" draggable="true" data-type="${ElementTypes.TEXT}" data-subtype="h1" style="padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; cursor:grab; font-size:20px; font-weight:700;">Heading 1</div>
          <div class="drag-preset" draggable="true" data-type="${ElementTypes.TEXT}" data-subtype="h2" style="padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; cursor:grab; font-size:16px; font-weight:700;">Heading 2</div>
          <div class="drag-preset" draggable="true" data-type="${ElementTypes.TEXT}" data-subtype="sub" style="padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; cursor:grab; font-size:14px; font-weight:400; color:#475569;">Subheading</div>
          <div class="drag-preset" draggable="true" data-type="${ElementTypes.TEXT}" data-subtype="body" style="padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; cursor:grab; font-size:12px; font-weight:400;">Body text</div>
        </div>
      </div>

      <!-- Widgets Presets -->
      <div>
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 8px;">Widgets</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div class="drag-preset btn btn-outline" draggable="true" data-type="${ElementTypes.WIDGET}" data-subtype="time" style="justify-content: flex-start; cursor:grab; background:#f8fafc;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Time & Date
          </div>
          <div class="drag-preset btn btn-outline" draggable="true" data-type="${ElementTypes.WIDGET}" data-subtype="weather" style="justify-content: flex-start; cursor:grab; background:#f8fafc;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M17.5 19a5.5 5.5 0 0 0-4-9 4.5 4.5 0 0 0-8 2A4 4 0 0 0 5 19h12.5z"/></svg>
            Weather
          </div>
          <div class="drag-preset btn btn-outline" draggable="true" data-type="${ElementTypes.WIDGET}" data-subtype="ticker" style="justify-content: flex-start; cursor:grab; background:#f8fafc;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            Scrolling Text
          </div>
        </div>
      </div>

      <!-- Media & Shapes -->
      <div>
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 8px;">Media & Elements</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
          <div class="drag-preset" draggable="true" data-type="${ElementTypes.IMAGE}" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; cursor:grab; padding:12px; display:flex; flex-direction:column; align-items:center; gap:4px; font-size:11px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Image
          </div>
          <div class="drag-preset" draggable="true" data-type="${ElementTypes.VIDEO}" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; cursor:grab; padding:12px; display:flex; flex-direction:column; align-items:center; gap:4px; font-size:11px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
            Video
          </div>
          <div class="drag-preset" draggable="true" data-type="${ElementTypes.SHAPE}" data-subtype="rect" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; cursor:grab; padding:12px; display:flex; flex-direction:column; align-items:center; gap:4px; font-size:11px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
            Rectangle
          </div>
          <div class="drag-preset" draggable="true" data-type="${ElementTypes.SHAPE}" data-subtype="circle" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; cursor:grab; padding:12px; display:flex; flex-direction:column; align-items:center; gap:4px; font-size:11px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
            Circle
          </div>
          <div class="drag-preset" draggable="true" data-type="${ElementTypes.QR}" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; cursor:grab; padding:12px; display:flex; flex-direction:column; align-items:center; gap:4px; font-size:11px; grid-column: span 2;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
            QR Code
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach native drag events
  const presets = sidebar.querySelectorAll('.drag-preset');
  presets.forEach(p => {
    p.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('application/json', JSON.stringify({
        type: p.dataset.type,
        subtype: p.dataset.subtype || 'default'
      }));
      e.dataTransfer.effectAllowed = 'copy';
      // Style drag image slightly transparent
      e.target.style.opacity = '0.5';
    });
    p.addEventListener('dragend', (e) => {
      e.target.style.opacity = '1';
    });
  });
}
