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

  let counter = null;
  if (config.counter_id) {
    counter = db.prepare('SELECT * FROM ticket_counters WHERE id = ?').get(config.counter_id);
  }

  const establishmentName = config.establishment_name || (counter ? counter.name : 'Bem-vindo');
  const color = (counter && counter.color) ? counter.color : (config.color || '#e53935');
  const logoUrl = counter && counter.logo_url ? counter.logo_url : '';

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
    .logo { max-width: 150px; max-height: 80px; margin-bottom: 10px; }
    .card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 20px; }
    .counter-btn { display: block; width: 100%; padding: 15px; margin: 10px 0; background: var(--accent); color: #fff; font-size: 18px; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; }
    .counter-btn:active { opacity: 0.8; transform: scale(0.98); }
    #ticketView { display: none; }
    .big-ticket { font-size: 64px; font-weight: 900; color: var(--accent); margin: 20px 0; line-height: 1; }
    .status { font-size: 16px; font-weight: bold; color: #555; padding: 10px; background: #eee; border-radius: 8px; }
  </style>
</head>
<body>
  ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo">` : ''}
  <h1>${establishmentName}</h1>
  
  <div id="selectionView" class="card">
    <p>Selecione para tirar a sua senha:</p>
    ${counter 
      ? `<button class="counter-btn" onclick="takeTicket('${counter.id}')">Tirar Senha para ${counter.name}</button>`
      : '<p>Este ecrã não tem balcão associado.</p>'}
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
    
    async function takeTicket(counterId) {
      try {
        const res = await fetch('/public/q/' + widgetId + '/issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ counter_id: counterId })
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

  if (!config.counter_id) {
    return res.status(400).json({ error: 'No counter associated' });
  }

  const counter = db.prepare('SELECT * FROM ticket_counters WHERE id = ?').get(config.counter_id);
  if (!counter) return res.status(404).json({ error: 'Counter not found' });

  let issueTicket = parseInt(counter.issue_ticket) || parseInt(counter.current_ticket) || 0;
  issueTicket++;
  const formatted = issueTicket.toString().padStart(3, '0');
  
  db.prepare("UPDATE ticket_counters SET issue_ticket = ? WHERE id = ?").run(issueTicket, counter.id);
  
  res.json({ ticket: formatted, counter: counter.name });
});

// GET /public/q/:id/state - Returns current queue state
router.get('/:id/state', (req, res) => {
  const widget = db.prepare('SELECT * FROM widgets WHERE id = ?').get(req.params.id);
  if (!widget) return res.status(404).json({ error: 'Not found' });
  
  let config = {};
  try { config = JSON.parse(widget.config || '{}'); } catch (e) {}
  
  let counterName = 'Balcão 1';
  let ticket = '000';
  
  if (config.counter_id) {
    const counter = db.prepare('SELECT * FROM ticket_counters WHERE id = ?').get(config.counter_id);
    if (counter) {
      counterName = counter.name;
      ticket = counter.current_ticket;
    }
  }
  
  res.json({
    current: {
      ticket: ticket,
      counter: counterName
    }
  });
});

module.exports = router;
