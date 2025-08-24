import express from 'express';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, members } = req.body; // members: array of names
    if (!name) return res.status(400).json({ error: 'Group name is required' });
    const group = await Group.create({ name, memberNames: Array.isArray(members) ? members : [] });
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const expenses = await Expense.find({ groupId: group._id }).sort({ createdAt: -1 });
    res.json({ ...group.toObject(), expenses });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/members', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Member name is required' });
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { memberNames: name } },
      { new: true }
    );
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (err) {
    next(err);
  }
});

export default router;