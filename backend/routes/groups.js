const express = require('express');
const Group = require('../models/Group');
const User = require('../models/User');
const Request = require('../models/Request');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/groups - Create group
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const user = req.user;
    const group = new Group({ name, owner: user._id, members: [user._id] });
    await group.save();

    user.groups.push(group._id);
    user.ownedGroups.push(group._id);
    await user.save();

    res.status(201).json({ message: 'Group created', group });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/groups/request - Request to join
router.post('/request', auth, async (req, res) => {
  try {
    const { groupId } = req.body;
    const user = req.user;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.members.includes(user._id)) return res.status(400).json({ error: 'Already member' });

    const request = new Request({ user: user._id, group: groupId });
    await request.save();
    group.joinRequests.push(request._id);
    await group.save();

    res.json({ message: 'Request sent' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/groups/:groupId/requests - View requests (owner only)
router.get('/:groupId/requests', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const user = req.user;
    const group = await Group.findById(groupId);
    if (!group || group.owner.toString() !== user._id.toString()) return res.status(403).json({ error: 'Unauthorized' });

    const requests = await Request.find({ group: groupId, status: 'pending' }).populate('user', 'email name phone');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/groups/:groupId/respond - Accept/decline (owner only)
router.post('/:groupId/respond', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { requestId, action } = req.body; // action: 'accept' or 'decline'
    const user = req.user;
    const group = await Group.findById(groupId);
    if (!group || group.owner.toString() !== user._id.toString()) return res.status(403).json({ error: 'Unauthorized' });

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = action === 'accept' ? 'accepted' : 'declined';
    await request.save();

    if (action === 'accept') {
      group.members.push(request.user);
      await group.save();
      const requester = await User.findById(request.user);
      requester.groups.push(group._id);
      await requester.save();
    }

    res.json({ message: `Request ${request.status}` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/groups - List user's groups
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    // const groups = await Group.find({ members: user._id }).populate('members', 'email');
    const groups = await Group.find({ members: user._id }).populate('members', 'email name');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;