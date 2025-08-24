import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import usersRouter from './src/routes/users.js';
import groupsRouter from './src/routes/groups.js';
import expensesRouter from './src/routes/expenses.js';
import settlementsRouter from './src/routes/settlements.js';
import chatbotRouter from './src/routes/chatbot.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/splitx';
const PORT = process.env.PORT || 4000;

mongoose
  .connect(MONGODB_URI, { autoIndex: true })
  .then(() => console.log('[splitx] Connected to MongoDB'))
  .catch((err) => {
    console.error('[splitx] MongoDB connection error:', err.message);
    process.exit(1);
  });

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use('/users', usersRouter);
app.use('/groups', groupsRouter);
app.use('/expenses', expensesRouter);
app.use('/settlements', settlementsRouter);
app.use('/chatbot', chatbotRouter);

// Minimal stub for export-expense-data used by frontend
app.post('/api/export-expense-data', (req, res) => {
  // In a real app you might email results. Here we just acknowledge.
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error('[splitx] Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`[splitx] API listening on http://localhost:${PORT}`);
});