CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin','Staff')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  price REAL NOT NULL,
  cost_price REAL NOT NULL DEFAULT 0,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  safety_stock_qty INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
);

CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_info TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
);

CREATE TABLE IF NOT EXISTS sales_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  salesperson_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Confirmed','Delivered','Paid','Cancelled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
  confirmed_at TEXT,
  delivered_at TEXT,
  paid_at TEXT,
  cancelled_at TEXT
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sales_order_id INTEGER NOT NULL REFERENCES sales_orders(id),
  book_id INTEGER NOT NULL REFERENCES books(id),
  qty INTEGER NOT NULL,
  unit_price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  vendor_id INTEGER NOT NULL REFERENCES vendors(id),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Confirmed','GRN','Paid','Cancelled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
  confirmed_at TEXT,
  grn_at TEXT,
  paid_at TEXT,
  cancelled_at TEXT
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id),
  book_id INTEGER NOT NULL REFERENCES books(id),
  qty INTEGER NOT NULL,
  unit_cost REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS cash_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('in','out')),
  amount REAL NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
);
