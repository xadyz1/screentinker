require('dotenv').config();
const Database = require('libsql');
const db = new Database('test.db', { syncUrl: process.env.BUNNY_DATABASE_URL, authToken: process.env.BUNNY_DATABASE_AUTH_TOKEN });
console.log(db.sync());
