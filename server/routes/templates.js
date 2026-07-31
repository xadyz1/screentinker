const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// Note: In Phase 1 we use basic authentication.
// For workspaces/multi-tenancy, we'd add requireWorkspaceMembership.

// GET /api/templates
// List all templates (global + workspace specific)
router.get('/', requireAuth, (req, res) => {
  const workspaceId = req.user.current_workspace_id; // from auth middleware, if supported
  let templates;
  
  if (workspaceId) {
    templates = db.prepare(`
      SELECT * FROM templates 
      WHERE workspace_id = ? OR is_public = 1 
      ORDER BY sort_order ASC, created_at DESC
    `).all(workspaceId);
  } else {
    // Fallback for single tenant or if workspace isn't fully set
    templates = db.prepare(`
      SELECT * FROM templates 
      ORDER BY sort_order ASC, created_at DESC
    `).all();
  }
  
  // Parse JSON arrays/objects
  templates.forEach(t => {
    try { t.tags = JSON.parse(t.tags); } catch(e) { t.tags = []; }
    try { t.document = JSON.parse(t.document); } catch(e) { t.document = { elements: [] }; }
  });
  
  res.json(templates);
});

// GET /api/templates/:id
// Get a single template
router.get('/:id', requireAuth, (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  try { template.tags = JSON.parse(template.tags); } catch(e) { template.tags = []; }
  try { template.document = JSON.parse(template.document); } catch(e) { template.document = { elements: [] }; }
  
  res.json(template);
});

// POST /api/templates
// Create a new template
router.post('/', requireAuth, (req, res) => {
  const { name, category, description, orientation, document, is_public } = req.body;
  const id = `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const workspaceId = req.user.current_workspace_id || null;
  const docStr = typeof document === 'object' ? JSON.stringify(document) : (document || '{"elements":[]}');
  const cat = category || 'uncategorized';
  
  db.prepare(`
    INSERT INTO templates (id, workspace_id, name, category, description, orientation, document, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, workspaceId, name || 'Untitled Template', cat, description || '', orientation || 'landscape', docStr, is_public ? 1 : 0);
  
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
  res.status(201).json(template);
});

// PUT /api/templates/:id
// Update a template (including document canvas saves)
router.put('/:id', requireAuth, (req, res) => {
  const { name, category, tags, description, thumbnail_url, document, is_public } = req.body;
  
  const current = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  if (!current) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  const updates = [];
  const values = [];
  
  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (category !== undefined) { updates.push('category = ?'); values.push(category); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (thumbnail_url !== undefined) { updates.push('thumbnail_url = ?'); values.push(thumbnail_url); }
  if (is_public !== undefined) { updates.push('is_public = ?'); values.push(is_public ? 1 : 0); }
  
  if (tags !== undefined) {
    updates.push('tags = ?');
    values.push(Array.isArray(tags) ? JSON.stringify(tags) : tags);
  }
  
  if (document !== undefined) {
    updates.push('document = ?');
    values.push(typeof document === 'object' ? JSON.stringify(document) : document);
    
    // Create version snapshot
    const versionId = `v-${Date.now()}`;
    db.prepare(`INSERT INTO template_versions (id, template_id, document) VALUES (?, ?, ?)`).run(
      versionId, req.params.id, typeof document === 'object' ? JSON.stringify(document) : document
    );
  }
  
  if (updates.length > 0) {
    updates.push("updated_at = strftime('%s','now')");
    values.push(req.params.id);
    db.prepare(`UPDATE templates SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  
  const updated = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  try { updated.document = JSON.parse(updated.document); } catch(e) {}
  res.json(updated);
});

// DELETE /api/templates/:id
router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// POST /api/templates/:id/clone
// Clone a template to the user's workspace
router.post('/:id/clone', requireAuth, (req, res) => {
  const current = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  if (!current) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const id = `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const workspaceId = req.user.current_workspace_id || null;
  const newName = current.name + ' (Copy)';
  
  db.prepare(`
    INSERT INTO templates (id, workspace_id, name, category, description, orientation, document, tags, thumbnail_url, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(id, workspaceId, newName, current.category, current.description, current.orientation, current.document, current.tags, current.thumbnail_url);
  
  const cloned = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
  res.status(201).json(cloned);
});

module.exports = router;
