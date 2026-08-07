const { db } = require('./db/database');
const bcrypt = require('bcryptjs');

// Create test user
try {
  const hash = bcrypt.hashSync('testpass123', 10);
  db.prepare("INSERT OR REPLACE INTO users (id, email, name, password_hash, auth_provider, role, plan_id) VALUES ('u1', 'test@example.com', 'test', ?, 'local', 'user', 'free')").run(hash);
  console.log('Test user created');
} catch (e) {
  console.error('Err creating user', e);
}

const req = {
  body: { email: 'test@example.com', password: 'testpass123' },
  headers: { 'x-forwarded-for': '127.0.0.1' },
  socket: { remoteAddress: '127.0.0.1' }
};

const express = require('express');
const app = express();
app.use(express.json());
app.use('/auth', require('./routes/auth'));

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log('Listening on port', port);
  const resp = await fetch(`http://localhost:${port}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  console.log(resp.status);
  const text = await resp.text();
  console.log(text);
  server.close();
});
