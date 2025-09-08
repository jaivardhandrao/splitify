const express = require('express');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/expenses - Add expense
router.post('/', auth, async (req, res) => {
  try {
    const { groupId, title, amount, paidBy, participants } = req.body;
    const user = req.user;
    const group = await Group.findById(groupId);
    if (!group || !group.members.some(m => m.toString() === user._id.toString())) return res.status(403).json({ error: 'Unauthorized' });

    const expense = new Expense({ group: groupId, title, amount, paidBy: paidBy || user._id, participants });
    await expense.save();

    group.expenses.push(expense._id);
    await group.save();

    res.status(201).json({ message: 'Expense added', expense });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/expenses/:groupId - List expenses and balances
router.get('/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const user = req.user;
    const group = await Group.findById(groupId).populate('members', 'email').populate('expenses');
    if (!group || !group.members.some(m => m._id.toString() === user._id.toString())) return res.status(403).json({ error: 'Unauthorized' });

    // Simple balance calculation
    const balances = {};
    group.members.forEach(m => balances[m._id] = 0);
    group.expenses.forEach(exp => {
      const share = exp.amount / exp.participants.length;
      balances[exp.paidBy] -= share * (exp.participants.length - 1);
      exp.participants.forEach(p => {
        if (p.toString() !== exp.paidBy.toString()) balances[p] += share;
      });
    });

    const settlements = []; // Simplified: who owes whom
    Object.keys(balances).forEach(id => {
      if (balances[id] > 0) settlements.push({ user: id, owes: balances[id] });
    });

    res.json({ expenses: group.expenses, balances, settlements });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;