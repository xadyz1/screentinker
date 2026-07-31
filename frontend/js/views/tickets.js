import { api } from '../api.js';

export async function render(root) {
  root.innerHTML = `
    <div class="content-header">
      <div>
        <h2 class="title" style="margin-bottom:4px">Senhas (Ticket Queue)</h2>
        <div class="subtitle">Faça a gestão dos balcões e controle a chamada de senhas.</div>
      </div>
      <button class="btn btn-primary" id="btnNewCounter">+ Novo Balcão</button>
    </div>
    
    <div class="card" style="padding:24px; margin-bottom:24px;">
      <h3 style="margin-top:0; margin-bottom:20px;">Balcões Ativos</h3>
      <div id="countersGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:20px;">
        <div style="color:var(--text-muted)">A carregar balcões...</div>
      </div>
    </div>
    
    <!-- Modal para criar/editar Balcão -->
    <div class="modal-overlay" id="counterModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:9999; display:none; align-items:center; justify-content:center;">
      <div class="modal-content" style="background:var(--bg-card); width:100%; max-width:500px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.5); border:1px solid var(--border);">
        <div class="modal-header" style="padding:20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0" id="counterModalTitle">Novo Balcão</h3>
          <button class="btn-icon" onclick="document.getElementById('counterModal').style.display='none'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <form id="counterForm">
            <input type="hidden" id="cId">
            <div class="form-group" style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600">Nome do Balcão</label>
              <input type="text" id="cName" class="input" style="width:100%" placeholder="ex: Balcão 1, Peixaria, Geral" required>
            </div>
            <div class="form-group" style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600">Descrição Opcional</label>
              <input type="text" id="cDesc" class="input" style="width:100%" placeholder="ex: Atendimento Geral">
            </div>
            <div class="form-group" style="margin-bottom:16px; display:flex; gap:16px;">
              <div style="flex:1">
                <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600">Cor de Destaque</label>
                <input type="color" id="cColor" class="input" value="#e53935" style="width:100%;height:40px;padding:2px;">
              </div>
              <div style="flex:2">
                <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600">Logótipo (URL)</label>
                <input type="url" id="cLogo" class="input" style="width:100%" placeholder="https://...">
              </div>
            </div>
            <div class="form-group" style="margin-bottom:16px;">
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;cursor:pointer;">
                <input type="checkbox" id="cActive" checked> Balcão Ativo
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer" style="padding:20px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:12px;">
          <button class="btn btn-secondary" onclick="document.getElementById('counterModal').style.display='none'">Cancelar</button>
          <button class="btn btn-primary" id="btnSaveCounter">Guardar</button>
        </div>
      </div>
    </div>
  `;

  async function loadCounters() {
    try {
      const counters = await api.getTickets();
      const grid = document.getElementById('countersGrid');
      
      if (!counters.length) {
        grid.innerHTML = '<div style="color:var(--text-muted); grid-column:1/-1;">Não existem balcões configurados. Crie um novo balcão para começar.</div>';
        return;
      }
      
      let html = '';
      counters.forEach(c => {
        const lastCalled = c.last_called_json ? JSON.parse(c.last_called_json) : [];
        const isMuted = !c.is_active;
        
        html += `
          <div class="content-item" style="border:1px solid var(--border); border-radius:12px; background:var(--bg-panel); overflow:hidden; opacity:${isMuted ? '0.6' : '1'}">
            <div style="height:6px; background:${escAttr(c.color || '#e53935')}; width:100%;"></div>
            <div style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                <div style="display:flex; gap:12px; align-items:center;">
                  ${c.logo_url ? `<img src="${escAttr(c.logo_url)}" style="width:40px;height:40px;object-fit:contain;border-radius:6px;background:var(--bg-input);">` : ''}
                  <div>
                    <h4 style="margin:0; font-size:16px;">${esc(c.name)}</h4>
                    <div style="font-size:12px; color:var(--text-muted);">${esc(c.description || 'Sem descrição')}</div>
                  </div>
                </div>
                <div>
                  <button class="btn-icon btn-edit" data-id="${c.id}" title="Editar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                  <button class="btn-icon btn-del" data-id="${c.id}" title="Apagar" style="color:var(--danger)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
              </div>
              
              <div style="background:var(--bg-input); padding:16px; border-radius:8px; display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
                <div>
                  <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); margin-bottom:4px;">Senha Atual</div>
                  <div style="font-size:32px; font-weight:800; line-height:1; color:${escAttr(c.color || 'var(--text)')}">${esc(c.current_ticket || '000')}</div>
                </div>
                <button class="btn btn-primary btn-call" data-id="${c.id}" style="padding:12px 24px; font-size:15px; font-weight:700;">
                  Chamar Próxima
                </button>
              </div>
              
              <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted);">
                <span>Senhas emitidas: <strong>${c.issue_ticket || 0}</strong></span>
                <span>Últimas: ${lastCalled.map(t => t.ticket).join(', ') || '-'}</span>
              </div>
            </div>
          </div>
        `;
      });
      grid.innerHTML = html;
      
      grid.querySelectorAll('.btn-edit').forEach(btn => btn.onclick = () => openModal(counters.find(c => c.id === btn.dataset.id)));
      grid.querySelectorAll('.btn-del').forEach(btn => btn.onclick = () => deleteCounter(btn.dataset.id));
      grid.querySelectorAll('.btn-call').forEach(btn => btn.onclick = () => callNext(btn.dataset.id));
      
    } catch (err) {
      document.getElementById('countersGrid').innerHTML = `<div style="color:var(--danger)">Erro: ${esc(err.message)}</div>`;
    }
  }

  function openModal(counter = null) {
    document.getElementById('counterModalTitle').innerText = counter ? 'Editar Balcão' : 'Novo Balcão';
    document.getElementById('cId').value = counter ? counter.id : '';
    document.getElementById('cName').value = counter ? counter.name : '';
    document.getElementById('cDesc').value = counter ? counter.description : '';
    document.getElementById('cColor').value = counter ? counter.color : '#e53935';
    document.getElementById('cLogo').value = counter ? counter.logo_url : '';
    document.getElementById('cActive').checked = counter ? counter.is_active === 1 : true;
    document.getElementById('counterModal').style.display = 'flex';
  }

  document.getElementById('btnNewCounter').onclick = () => openModal();

  document.getElementById('btnSaveCounter').onclick = async () => {
    const id = document.getElementById('cId').value;
    const body = {
      name: document.getElementById('cName').value,
      description: document.getElementById('cDesc').value,
      color: document.getElementById('cColor').value,
      logo_url: document.getElementById('cLogo').value,
      is_active: document.getElementById('cActive').checked ? 1 : 0
    };
    if (!body.name) return alert('O nome é obrigatório');
    
    try {
      if (id) {
        await api.updateTicketCounter(id, body);
      } else {
        await api.createTicketCounter(body);
      }
      document.getElementById('counterModal').style.display = 'none';
      loadCounters();
    } catch (e) { alert(e.message); }
  };
  
  async function deleteCounter(id) {
    if (!confirm('Tem a certeza que deseja apagar este balcão?')) return;
    try {
      await api.deleteTicketCounter(id);
      loadCounters();
    } catch (e) { alert(e.message); }
  }
  
  async function callNext(id) {
    try {
      await api.callTicket(id);
      loadCounters();
    } catch (e) { alert(e.message); }
  }

  loadCounters();
}

function esc(str) { return String(str).replace(/[&<>'"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[m])); }
function escAttr(str) { return esc(str); }
