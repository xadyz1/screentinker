const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /public/q/:id - Render mobile-first public queue page
router.get('/:id', (req, res) => {
  const widget = db.prepare('SELECT * FROM widgets WHERE id = ?').get(req.params.id);
  if (!widget || widget.widget_type !== 'ticket-queue') {
    return res.status(404).send('Ticket Queue not found or invalid widget type.');
  }

  let config = {};
  try { config = JSON.parse(widget.config || '{}'); } catch (e) {}

  const establishmentName = config.establishment_name || 'Bem-vindo';
  const counters = Array.isArray(config.counters) ? config.counters : [];
  const color = config.color || '#e53935';

  const html = `<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${establishmentName} - Senhas</title>
  <style>
    :root { --accent: ${color}; }
    body { font-family: system-ui, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; color: #333; text-align: center; }
    h1 { margin-top: 10px; font-size: 24px; color: var(--accent); }
    .card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 20px; }
    .counter-btn { display: block; width: 100%; padding: 15px; margin: 10px 0; background: var(--accent); color: #fff; font-size: 18px; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; }
    .counter-btn:active { opacity: 0.8; transform: scale(0.98); }
    #ticketView { display: none; }
    .big-ticket { font-size: 64px; font-weight: 900; color: var(--accent); margin: 20px 0; line-height: 1; }
    .status { font-size: 16px; font-weight: bold; color: #555; padding: 10px; background: #eee; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>${establishmentName}</h1>
  
  <div id="selectionView" class="card">
    <p>Selecione um balcão para tirar a sua senha:</p>
    ${counters.map(c => `
      <button class="counter-btn" onclick="takeTicket('${c.label}')">${c.label}</button>
    `).join('')}
    ${counters.length === 0 ? '<p>Não há balcões configurados.</p>' : ''}
  </div>

  <div id="ticketView" class="card">
    <p>A sua senha para <strong id="lblCounter"></strong> é:</p>
    <div class="big-ticket" id="lblTicket">---</div>
    <div class="status" id="lblStatus">Aguarde pela sua vez...</div>
  </div>

  <script>
    const widgetId = '${req.params.id}';
    let myTicket = null;
    let myCounter = null;
    
    async function takeTicket(counterName) {
      try {
        const res = await fetch('/public/q/' + widgetId + '/issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ counter: counterName })
        });
        const data = await res.json();
        if (data.ticket) {
          myTicket = data.ticket;
          myCounter = data.counter;
          
          document.getElementById('selectionView').style.display = 'none';
          document.getElementById('ticketView').style.display = 'block';
          document.getElementById('lblTicket').innerText = myTicket;
          document.getElementById('lblCounter').innerText = myCounter;
          
          startPolling();
        } else {
          alert('Erro ao tirar senha.');
        }
      } catch (err) {
        alert('Erro de rede.');
      }
    }
    
    function startPolling() {
      setInterval(async () => {
        try {
          const res = await fetch('/public/q/' + widgetId + '/state');
          const data = await res.json();
          if (data && data.current) {
            if (data.current.ticket === myTicket && data.current.counter === myCounter) {
              document.getElementById('lblStatus').innerText = 'CHEGOU A SUA VEZ!';
              document.getElementById('lblStatus').style.background = 'var(--accent)';
              document.getElementById('lblStatus').style.color = '#fff';
              
              if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
            } else {
              document.getElementById('lblStatus').innerText = 'Aguarde pela sua vez...';
              document.getElementById('lblStatus').style.background = '#eee';
              document.getElementById('lblStatus').style.color = '#555';
            }
          }
        } catch(e) {}
      }, 3000);
    }
  </script>
</body>
</html>`;

  res.send(html);
});

// POST /public/q/:id/issue - User takes a ticket
router.post('/:id/issue', express.json(), (req, res) => {
  const widget = db.prepare('SELECT * FROM widgets WHERE id = ?').get(req.params.id);
  if (!widget || widget.widget_type !== 'ticket-queue') {
    return res.status(404).json({ error: 'Widget not found' });
  }

  let config = {};
  try { config = JSON.parse(widget.config || '{}'); } catch (e) {}

  const counterName = req.body.counter || 'Geral';
  let issueTicket = parseInt(config.issueTicket) || parseInt(config.currentTicket) || 0;
  
  issueTicket++;
  const formatted = issueTicket.toString().padStart(3, '0');
  
  config.issueTicket = formatted;
  
  db.prepare("UPDATE widgets SET config = ?, updated_at = strftime('%s','now') WHERE id = ?").run(JSON.stringify(config), req.params.id);
  
  res.json({ ticket: formatted, counter: counterName });
});

// GET /public/q/:id/state - Returns current queue state
router.get('/:id/state', (req, res) => {
  const widget = db.prepare('SELECT * FROM widgets WHERE id = ?').get(req.params.id);
  if (!widget) return res.status(404).json({ error: 'Not found' });
  
  let config = {};
  try { config = JSON.parse(widget.config || '{}'); } catch (e) {}
  
  res.json({
    current: {
      ticket: config.currentTicket || '000',
      counter: config.counterName || 'Balcão 1'
    }
  });
});

module.exports = router;
