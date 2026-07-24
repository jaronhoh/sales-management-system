const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

// On Vercel (and other read-only serverless filesystems), only /tmp is writable,
// and it is NOT persistent across cold starts or shared between instances.
// Locally, this still resolves to a normal OS temp dir and behaves the same as
// before. See app/README.md and PRD §8.4/§10.4 for the full risk writeup —
// this is a real limitation of the current architecture, not silently patched
// away. A production deployment needs a real external database instead.
const DB_PATH = process.env.VERCEL
  ? path.join(os.tmpdir(), 'data.sqlite')
  : path.join(__dirname, 'data.sqlite');
const isNewDb = !fs.existsSync(DB_PATH);

const db = new Database(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function makeUser(name, username, password, role) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  db.prepare(
    'INSERT INTO users (name, username, password_hash, salt, role) VALUES (?, ?, ?, ?, ?)'
  ).run(name, username, hash, salt, role);
}

if (isNewDb) {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  // Seed: one Admin account and a couple of sample books so the app is usable immediately.
  makeUser('Mr. Robinson', 'admin', 'admin123', 'Admin');
  makeUser('Staff One', 'staff1', 'staff123', 'Staff');

  db.prepare(
    'INSERT INTO books (title, price, cost_price, stock_qty, safety_stock_qty) VALUES (?, ?, ?, ?, ?)'
  ).run('The Great Gatsby', 25.0, 15.0, 20, 5);
  db.prepare(
    'INSERT INTO books (title, price, cost_price, stock_qty, safety_stock_qty) VALUES (?, ?, ?, ?, ?)'
  ).run('Sapiens', 45.0, 28.0, 3, 5);
  db.prepare(
    'INSERT INTO books (title, price, cost_price, stock_qty, safety_stock_qty) VALUES (?, ?, ?, ?, ?)'
  ).run('Atomic Habits', 38.5, 24.0, 15, 5);

  db.prepare(
    'INSERT INTO vendors (name, contact_info) VALUES (?, ?)'
  ).run('Central Book Distributors', 'orders@centralbooks.example / 03-1234 5678');

  console.log('Database initialized with seed data.');
  console.log('  Admin login:  admin / admin123');
  console.log('  Staff login:  staff1 / staff123');
}

module.exports = { db, hashPassword };
