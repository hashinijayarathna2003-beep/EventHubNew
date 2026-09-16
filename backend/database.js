const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'eventhub.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user', -- 'user' or 'organizer'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Events table
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organizer_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date_time TEXT NOT NULL,
        location TEXT NOT NULL,
        category TEXT,
        price REAL DEFAULT 0,
        total_seats INTEGER NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(organizer_id) REFERENCES users(id)
      )
    `);

    // Bookings table
    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        seats INTEGER NOT NULL DEFAULT 1,
        status TEXT DEFAULT 'confirmed', -- 'confirmed' or 'cancelled'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(event_id) REFERENCES events(id)
      )
    `);
    
    console.log('Database tables initialized.');
  });
}

module.exports = db;
