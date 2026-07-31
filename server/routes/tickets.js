const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { PLATFORM_ROLES } = require('../middleware/auth');

// List counters for workspace
router.get('/', (req, res) => {
  if (!req.workspaceId) return res.json([]);
  const counters = db.prepare('SELECT * FROM ticket_counters WHERE workspace_id = ? ORDER BY created_at ASC').all(req.workspaceId);
  res.json(counters);
});

// Get a single counter
router.get('/:id', (req, res) => {
  if (!req.workspaceId) return res.status(403).json({ error: 'No workspace' });
  const counter = db.prepare('SELECT * FROM ticket_counters WHERE id = ? AND workspace_id = ?').get(req.params.id, req.workspaceId);
  if (!counter) return res.status(404).json({ error: 'Not found' });
  res.json(counter);
});

// Create counter
router.post('/', express.json(), (req, res) => {
  if (!req.workspaceId) return res.status(403).json({ error: 'No workspace' });
  const id = uuidv4();
  const { name, description, color, logo_url } = req.body;
  
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  db.prepare(`
    INSERT INTO ticket_counters (id, workspace_id, name, description, color, logo_url, current_ticket, issue_ticket, last_called_json)
    VALUES (?, ?, ?, ?, ?, ?, '000', 0, '[]')
  `).run(id, req.workspaceId, name, description || '', color || '#e53935', logo_url || '');
  
  res.json(db.prepare('SELECT * FROM ticket_counters WHERE id = ?').get(id));
});

// Update counter
router.put('/:id', express.json(), (req, res) => {
  if (!req.workspaceId) return res.status(403).json({ error: 'No workspace' });
  const counter = db.prepare('SELECT * FROM ticket_counters WHERE id = ? AND workspace_id = ?').get(req.params.id, req.workspaceId);
  if (!counter) return res.status(404).json({ error: 'Not found' });
  
  const { name, description, color, logo_url, is_active } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  db.prepare(`
    UPDATE ticket_counters 
    SET name = ?, description = ?, color = ?, logo_url = ?, is_active = ? 
    WHERE id = ?
  `).run(name, description || '', color || counter.color, logo_url || '', is_active !== undefined ? is_active : 1, req.params.id);
  
  res.json(db.prepare('SELECT * FROM ticket_counters WHERE id = ?').get(req.params.id));
});

// Delete counter
router.delete('/:id', (req, res) => {
  if (!req.workspaceId) return res.status(403).json({ error: 'No workspace' });
  db.prepare('DELETE FROM ticket_counters WHERE id = ? AND workspace_id = ?').run(req.params.id, req.workspaceId);
  res.json({ success: true });
});

// Call next ticket (Admin action)
router.post('/:id/call', express.json(), (req, res) => {
  if (!req.workspaceId) return res.status(403).json({ error: 'No workspace' });
  const counter = db.prepare('SELECT * FROM ticket_counters WHERE id = ? AND workspace_id = ?').get(req.params.id, req.workspaceId);
  if (!counter) return res.status(404).json({ error: 'Not found' });
  
  const body = req.body || {};
  let current = parseInt(counter.current_ticket) || 0;
  
  if (body.ticket) {
    current = parseInt(body.ticket) || current;
  } else {
    current++;
  }
  
  const formatted = current.toString().padStart(3, '0');
  const lastCalled = JSON.parse(counter.last_called_json || '[]');
  
  if (counter.current_ticket && counter.current_ticket !== '000') {
    lastCalled.unshift({ ticket: counter.current_ticket, counter: counter.name });
    if (lastCalled.length > 5) lastCalled.pop();
  }
  
  db.prepare(`
    UPDATE ticket_counters 
    SET current_ticket = ?, last_called_json = ? 
    WHERE id = ?
  `).run(formatted, JSON.stringify(lastCalled), req.params.id);
  
  res.json({ success: true, currentTicket: formatted, counter: counter.name, lastCalled });
});

module.exports = router;
