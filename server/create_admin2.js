const { db } = require('./db/database');
const bcrypt = require('bcryptjs');

const email = 'ivandro.work@gmail.com';
const password = '#whatever';
const hash = bcrypt.hashSync(password, 10);

db.prepare('UPDATE users SET password_hash = ?, role = ? WHERE email = ?').run(hash, 'platform_admin', email);
console.log('Password and role updated');
