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
// old code
// router.get('/:groupId', auth, async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const user = req.user;
//     const group = await Group.findById(groupId).populate('members', 'email').populate('expenses');
//     if (!group || !group.members.some(m => m._id.toString() === user._id.toString())) return res.status(403).json({ error: 'Unauthorized' });

//     // Simple balance calculation
//     const balances = {};
//     group.members.forEach(m => balances[m._id] = 0);
//     group.expenses.forEach(exp => {
//       const share = exp.amount / exp.participants.length;
//       balances[exp.paidBy] -= share * (exp.participants.length - 1);
//       exp.participants.forEach(p => {
//         if (p.toString() !== exp.paidBy.toString()) balances[p] += share;
//       });
//     });

//     const settlements = []; // Simplified: who owes whom
//     Object.keys(balances).forEach(id => {
//       if (balances[id] > 0) settlements.push({ user: id, owes: balances[id] });
//     });

//     res.json({ expenses: group.expenses, balances, settlements });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });


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

module.exports = router;