const express = require('express');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const auth = require('../middleware/auth');
const router = express.Router();

// PATCH /api/expenses/:expenseId - Update isSettled status
router.patch('/:expenseId', auth, async (req, res) => {
  try {
    const { isSettled } = req.body;
    if (typeof isSettled !== 'boolean') return res.status(400).json({ error: 'isSettled must be a boolean' });

    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const user = req.user;
    const group = await Group.findById(expense.group);
    if (!group || !group.members.some(m => m.toString() === user._id.toString())) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    expense.isSettled = isSettled;
    await expense.save();

    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

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

// new code
router.get('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members', 'name email _id') // Ensure _id, name, email populated
      .populate({
        path: 'expenses',
        populate: { path: 'paidBy', select: 'name email _id' },
        populate: { path: 'participants', select: '_id' } // participants are refs to User _id
      });

    if (!group) return res.status(404).json({ error: 'Group not found' });

    // Compute balances keyed by _id
    const balances = {};
    group.members.forEach(member => {
      balances[member._id.toString()] = 0; // Initialize to 0 for all members
    });

    group.expenses.forEach(expense => {
      const share = expense.amount / expense.participants.length;
      const paidById = expense.paidBy._id.toString();

      // Add full amount to paidBy
      balances[paidById] += expense.amount;

      // Subtract share from ALL participants (including paidBy if they are one)
      expense.participants.forEach(participantId => {
        const pId = participantId.toString();
        balances[pId] -= share;
      });
    });

    res.json({ 
      expenses: group.expenses, 
      balances, // Keyed by _id
      members: group.members // Ensure frontend has this if needed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE /api/expenses/:expenseId - Delete expense (only if paidBy matches user)
router.delete('/:expenseId', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const user = req.user;
    const paidById = expense.paidBy.toString();
    if (paidById !== user._id.toString()) {
      return res.status(403).json({ error: 'Only the payer can delete this expense' });
    }

    // Remove from group's expenses array
    const group = await Group.findById(expense.group);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    group.expenses = group.expenses.filter(e => e.toString() !== expense._id.toString());
    await group.save();

    // FIXED: Use findByIdAndDelete instead of deprecated remove()
    await Expense.findByIdAndDelete(req.params.expenseId);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});