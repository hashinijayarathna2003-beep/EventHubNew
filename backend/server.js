const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(express.json());

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        const token = jwt.sign({ id: this.lastID, email, name, role: 'user' }, JWT_SECRET);
        res.json({ token, user: { id: this.lastID, email, name } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
});

// --- EVENTS ROUTES ---
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM events', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/events/:id', (req, res) => {
  db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Event not found' });
    res.json(row);
  });
});

// Create event (mock for organizer)
app.post('/api/events', authenticateToken, (req, res) => {
  const { title, description, date_time, location, category, price, total_seats, image_url } = req.body;
  
  db.run(
    'INSERT INTO events (organizer_id, title, description, date_time, location, category, price, total_seats, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, title, description, date_time, location, category, price, total_seats, image_url],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Event created successfully' });
    }
  );
});

// --- BOOKINGS ROUTES ---
app.post('/api/bookings', authenticateToken, (req, res) => {
  const { event_id, seats } = req.body;
  const user_id = req.user.id;
  
  db.run(
    'INSERT INTO bookings (user_id, event_id, seats, status) VALUES (?, ?, ?, ?)',
    [user_id, event_id, seats || 1, 'confirmed'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Booking successful' });
    }
  );
});

app.get('/api/bookings', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const query = `
    SELECT bookings.*, events.title, events.date_time, events.location 
    FROM bookings 
    JOIN events ON bookings.event_id = events.id 
    WHERE bookings.user_id = ?
  `;
  
  db.all(query, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/bookings/:id/cancel', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const booking_id = req.params.id;
  
  db.run(
    'UPDATE bookings SET status = "cancelled" WHERE id = ? AND user_id = ?',
    [booking_id, user_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Booking not found or not authorized' });
      res.json({ message: 'Booking cancelled' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
