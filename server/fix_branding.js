const { db } = require('./db/database');
try {
  db.prepare('DELETE FROM white_labels').run();
  console.log('Cleared old branding overrides, server will use the new HARDCODED_BRANDING.');
} catch (e) {
  console.error(e);
}
