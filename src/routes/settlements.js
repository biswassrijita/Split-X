import express from 'express';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';

const router = express.Router();

function computeSettlements(memberNames, expenses) {
  const totals = Object.fromEntries(memberNames.map((m) => [m, 0]));
  expenses.forEach((e) => {
    totals[e.paidBy] = (totals[e.paidBy] || 0) + e.amount;
  });
  const totalAmount = Object.values(totals).reduce((a, b) => a + b, 0);
  const perPerson = memberNames.length > 0 ? totalAmount / memberNames.length : 0;

  const creditors = [];
  const debtors = [];
  memberNames.forEach((name) => {
    const balance = (totals[name] || 0) - perPerson;
    if (balance > 0.01) creditors.push({ name, amount: balance });
    else if (balance < -0.01) debtors.push({ name, amount: -balance });
  });

  const settlements = [];
  for (const c of creditors) {
    for (const d of debtors) {
      if (c.amount <= 0) break;
      if (d.amount <= 0) continue;
      const pay = Math.min(c.amount, d.amount);
      if (pay > 0.01) {
        settlements.push({ from: d.name, to: c.name, amount: pay });
        c.amount -= pay;
        d.amount -= pay;
      }
    }
  }

  return { totalAmount, perPerson, settlements, totals };
}

router.get('/:groupId', async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const expenses = await Expense.find({ groupId: group._id });
    const result = computeSettlements(group.memberNames, expenses);
    res.json({ groupId: group._id, groupName: group.name, ...result });
  } catch (err) {
    next(err);
  }
});

export default router;