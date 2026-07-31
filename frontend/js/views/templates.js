import { request as api } from '../api.js';
import { initEditor, cleanupEditor } from './editor/editor.js';
import { showToast } from '../components/toast.js';
import { t, tn } from '../i18n.js';
import { esc } from '../utils.js';

export async function render(container) {
  const hash = window.location.hash;
  if (hash.startsWith('#/templates/')) {
    const id = hash.split('#/templates/')[1];
    return openEditor(id);
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
  const grid = document.getElementById('templateGrid');
  if (!grid) return;

  try {
    const templates = await api('/templates');
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
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">${t.is_public ? 'Global' : 'Workspace'} • ${esc(t.category)}</div>
          <button class="btn btn-primary clone-btn" data-id="${t.id}" style="width: 100%; font-size: 13px;">Use this Template</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.clone-btn').forEach(btn => {
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
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; color: var(--danger);">${esc(err.message)}</div>`;
  }
}

// --- Template Editor Initialization ---
async function openEditor(id) {
  const container = document.getElementById('app-content');
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
