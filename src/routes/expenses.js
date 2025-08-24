import express from 'express';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { amount, description, paidBy, groupId, date } = req.body;
    if (!amount || !description || !paidBy || !groupId) {
      return res.status(400).json({ error: 'amount, description, paidBy, groupId are required' });
    }
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const expense = await Expense.create({ amount, description, paidBy, groupId, date: date ? new Date(date) : new Date() });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
});

router.get('/group/:groupId', async (req, res, next) => {
  try {
    const list = await Expense.find({ groupId: req.params.groupId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await Expense.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Expense not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;