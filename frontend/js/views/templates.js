import { request as api } from '../api.js';
import { initEditor, cleanupEditor } from './editor/editor.js';
import { showToast } from '../components/toast.js';
import { t, tn } from '../i18n.js';
import { esc } from '../utils.js';

export async function render(container) {
  const hash = window.location.hash;
  if (hash.startsWith('#/templates/')) {
    const id = hash.split('#/templates/')[1];
    return openEditor(id, container);
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
    
    <div style="margin-top: 24px; margin-bottom: 12px;">
      <h2>My Designs</h2>
      <div class="subtitle">Editable template instances in your workspace.</div>
    </div>
    <div class="content-grid" id="myDesignsGrid">
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p>Loading...</p>
      </div>
    </div>

    <div style="margin-top: 48px; margin-bottom: 12px;">
      <h2>Global Templates</h2>
      <div class="subtitle">Base templates you can use to start a new design.</div>
    </div>
    <div class="content-grid" id="globalTemplatesGrid">
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p>Loading...</p>
      </div>
    </div>
  `;

  document.getElementById('newTemplateBtn').onclick = async () => {
    const name = prompt('Template name:');
    if (!name) return;
    try {
      const template = await api('/templates', { 
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
  const myGrid = document.getElementById('myDesignsGrid');
  const globalGrid = document.getElementById('globalTemplatesGrid');
  if (!myGrid || !globalGrid) return;

  try {
    const templates = await api('/templates');
    
    const myDesigns = templates.filter(t => !t.is_public);
    const globalTemplates = templates.filter(t => t.is_public);

    if (myDesigns.length === 0) {
      myGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>No designs found in your workspace. Create one or use a Global Template.</p>
        </div>
      `;
    } else {
      myGrid.innerHTML = myDesigns.map(t => `
        <div class="card item-card" style="cursor: pointer;" onclick="window.location.hash='#/templates/${t.id}'">
          <div class="card-preview" style="background: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 140px; border-radius: 6px 6px 0 0;">
            ${t.thumbnail_url 
              ? `<img src="${esc(t.thumbnail_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:6px 6px 0 0">` 
              : `<span style="color:var(--text-secondary);font-size:12px;">No Preview</span>`}
          </div>
          <div style="padding: 12px;">
            <div style="font-weight: 500; margin-bottom: 4px;">${esc(t.name)}</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">Workspace • ${esc(t.category)}</div>
            <button class="btn btn-secondary" style="width: 100%; font-size: 13px;" onclick="event.stopPropagation(); window.location.hash='#/templates/${t.id}'">Edit Design</button>
          </div>
        </div>
      `).join('');
    }

    if (globalTemplates.length === 0) {
      globalGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>No global templates available.</p>
        </div>
      `;
    } else {
      globalGrid.innerHTML = globalTemplates.map(t => `
        <div class="card item-card" style="cursor: pointer;" onclick="window.location.hash='#/templates/${t.id}'">
          <div class="card-preview" style="background: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 140px; border-radius: 6px 6px 0 0;">
            ${t.thumbnail_url 
              ? `<img src="${esc(t.thumbnail_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:6px 6px 0 0">` 
              : `<span style="color:var(--text-secondary);font-size:12px;">No Preview</span>`}
          </div>
          <div style="padding: 12px;">
            <div style="font-weight: 500; margin-bottom: 4px;">${esc(t.name)}</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">Global • ${esc(t.category)}</div>
            <button class="btn btn-primary clone-btn" data-id="${t.id}" style="width: 100%; font-size: 13px;">Use this Template</button>
          </div>
        </div>
      `).join('');
    }

    globalGrid.querySelectorAll('.clone-btn').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        try {
          const originalText = btn.textContent;
          btn.textContent = 'Creating...';
          btn.disabled = true;
          const cloned = await api(`/templates/${btn.dataset.id}/clone`, { method: 'POST' });
          window.location.hash = `#/templates/${cloned.id}`;
        } catch (err) {
          showToast(err.message, 'error');
          btn.textContent = 'Use this Template';
          btn.disabled = false;
        }
      };
    });
  } catch (err) {
    const errorHtml = `<div class="empty-state" style="grid-column: 1 / -1; color: var(--danger);">${esc(err.message)}</div>`;
    myGrid.innerHTML = errorHtml;
    globalGrid.innerHTML = errorHtml;
  }
}

// --- Template Editor Initialization ---
async function openEditor(id, container) {
  if (!container) return;

  try {
    const template = await api(`/templates/${id}`);
    
    // Defer to the new refactored editor orchestrator
    initEditor(container, template);
    
  } catch (err) {
    container.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
}

// ----------------------------------------------------------------------------
// api / Export
// ----------------------------------------------------------------------------
export function cleanup() {
  cleanupEditor();
}
