const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pastMembers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    leftAt: { type: Date, default: Date.now }
  }],
  expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request' }],
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);