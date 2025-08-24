import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/splitx';
const PORT = process.env.PORT || 4000;

// Minimal models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  trustScore: { type: Number, default: 100 },
  badges: { type: [String], default: ['New Member'] },
}, { timestamps: true });

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  memberNames: { type: [String], default: [] },
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Group = mongoose.model('Group', groupSchema);
const Expense = mongoose.model('Expense', expenseSchema);

await mongoose.connect(MONGODB_URI, { autoIndex: true });

app.get('/health', (req, res) => res.json({ ok: true }));

// Essential endpoints only
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  const user = await User.findOneAndUpdate(
    { email },
    { $setOnInsert: { name, email }, $set: { name } },
    { new: true, upsert: true }
  );
  res.status(201).json(user);
});

app.post('/groups', async (req, res) => {
  const { name, members } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const group = await Group.create({ name, memberNames: Array.isArray(members) ? members : [] });
  res.status(201).json(group);
});

app.get('/groups', async (req, res) => {
  const groups = await Group.find().sort({ createdAt: -1 });
  res.json(groups);
});

app.get('/groups/:id', async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const expenses = await Expense.find({ groupId: group._id }).sort({ createdAt: -1 });
  res.json({ ...group.toObject(), expenses });
});

app.post('/groups/:id/members', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'member name required' });
  const updated = await Group.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { memberNames: name } },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Group not found' });
  res.json(updated);
});

app.post('/expenses', async (req, res) => {
  const { amount, description, paidBy, groupId, date } = req.body;
  if (!amount || !description || !paidBy || !groupId) return res.status(400).json({ error: 'missing fields' });
  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const expense = await Expense.create({ amount, description, paidBy, groupId, date: date ? new Date(date) : new Date() });
  res.status(201).json(expense);
});

app.get('/expenses/group/:groupId', async (req, res) => {
  const list = await Expense.find({ groupId: req.params.groupId }).sort({ createdAt: -1 });
  res.json(list);
});

app.delete('/expenses/:id', async (req, res) => {
  const result = await Expense.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: 'Expense not found' });
  res.json({ ok: true });
});

// Stub used by frontend export
app.post('/api/export-expense-data', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`[splitx-lite] listening on http://localhost:${PORT}`));