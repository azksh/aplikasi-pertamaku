import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
app.use(express.json());

// CORS Configuration: Specify allowed origins instead of '*'
const allowedOrigins = ['http://localhost:3000'];  // <-- Specify allowed origins
app.use(cors({
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
}));

const connection = new sqlite3.Database('./db/aplikasi.db');

// Serve static files from the public directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Parameter validation and sanitization
const isPositiveInteger = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;  // <-- Validate for positive integers
};

app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;

  if (!isPositiveInteger(userId)) {  // <-- Validate userId
    return res.status(400).send('Invalid User ID');
  }

  const query = `SELECT * FROM users WHERE id = ?`;
  connection.all(query, [userId], (error, results) => {
    if (error) {
      console.error(error);  // <-- Log the error for debugging
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
});

app.post('/api/user/:id/change-email', (req, res) => {
  const newEmail = req.body.email;
  const userId = req.params.id;

  // Validate userId
  if (!isPositiveInteger(userId)) {
    return res.status(400).send('Invalid User ID');
  }

  // Simple regex for basic email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // <-- Regex for email validation
  if (!emailPattern.test(newEmail)) {  // <-- Validate email format
    return res.status(400).send('Invalid Email Format');
  }

  const query = `UPDATE users SET email = ? WHERE id = ?`;
  connection.run(query, [newEmail, userId], function (err) {
    if (err) {
      console.error(err);  // <-- Log the error for debugging
      return res.status(500).send('Internal Server Error');
    }
    if (this.changes === 0) {
      return res.status(404).send('User not found');
    } else {
      return res.status(200).send('Email updated successfully');
    }
  });
});

app.get('/api/file', (req, res) => {
  const filePath = path.join(__dirname, 'files', req.query.name);
  res.sendFile(filePath);
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});