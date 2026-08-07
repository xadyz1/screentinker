import re

with open('server/server.js', 'r') as f:
    content = f.read()

new_route = """app.post('/api/provision/url', requireAuth, resolveTenancy, checkDeviceLimit, (req, res) => {
  if (!req.workspaceId) return res.status(403).json({ error: 'No workspace context. Switch to a workspace before provisioning.' });
  
  const name = req.body.name || 'URL Display ' + (db.prepare('SELECT COUNT(*) as count FROM devices WHERE user_id = ?').get(req.user.id).count + 1);
  const id = uuidv4();
  const device_token = require('crypto').randomBytes(32).toString('hex');
  const settingsPin = String(Math.floor(100000 + Math.random() * 900000));
  
  try {
    db.prepare(`
      INSERT INTO devices (id, name, user_id, workspace_id, device_token, status, settings_pin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'online', ?, strftime('%s','now'), strftime('%s','now'))
    `).run(id, name, req.user.id, req.workspaceId, device_token, settingsPin);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to provision URL display' });
  }

  const updated = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
  require('./lib/device-sanitize').stripDeviceSecrets(updated);
  
  const { workspaceRoom, emitToWorkspace } = require('./lib/socket-rooms');
  emitToWorkspace(dashboardNs, workspaceRoom(updated.workspace_id), 'dashboard:device-added', updated);

  // Return the raw token ONLY once so the client can construct the URL
  res.json({ ...updated, _raw_token: device_token });
});
"""

# Insert after the end of app.post('/api/provision/pair', ...) which ends around line 936
content = re.sub(
    r"(res\.json\(updated\);\n\}\);)",
    r"\1\n\n" + new_route,
    content,
    count=1
)

with open('server/server.js', 'w') as f:
    f.write(content)
