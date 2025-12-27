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
    
    // Check if user is already a member
    if (group.members.includes(user._id)) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    // Check if there's already a pending request
    const existingRequest = await Request.findOne({
      user: user._id,
      group: groupId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending request for this group' });
    }

    const request = new Request({ user: user._id, group: groupId });
    await request.save();
    group.joinRequests.push(request._id);
    await group.save();

    res.json({ message: 'Join request sent successfully' });
  } catch (error) {
    console.error('Join request error:', error);
    res.status(500).json({ error: 'Failed to send join request' });
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
      // If user was a past member, remove them from pastMembers
      if (group.pastMembers && group.pastMembers.length > 0) {
        group.pastMembers = group.pastMembers.filter(
          pm => pm.user.toString() !== request.user.toString()
        );
      }
      
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

// New: POST /api/groups/:groupId/leave - Leave group (no balance restriction)
router.post('/:groupId/leave', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const user = req.user;

    console.log('🔍 Leave Group Request:', {
      groupId,
      userId: user._id.toString(),
      userEmail: user.email
    });

    // Fetch group and check membership
    const group = await Group.findById(groupId).populate('members', '_id email');
    if (!group) {
      console.log('❌ Group not found');
      return res.status(404).json({ error: 'Group not found' });
    }
    
    console.log('📊 Group Info:', {
      groupName: group.name,
      ownerId: group.owner.toString(),
      memberCount: group.members.length,
      members: group.members.map(m => ({ id: m._id.toString(), email: m.email }))
    });
    
    if (!group.members.some(m => m._id.toString() === user._id.toString())) {
      console.log('❌ User not a member');
      return res.status(400).json({ error: 'Not a member of this group' });
    }

    // Check if user is the owner
    const isOwner = group.owner.toString() === user._id.toString();
    console.log('👑 Owner check:', { isOwner, ownerId: group.owner.toString(), userId: user._id.toString() });
    
    if (isOwner) {
      // If owner is the only member, suggest deletion
      if (group.members.length === 1) {
        console.log('❌ Owner is solo member');
        return res.status(400).json({ error: 'You are the only member and owner of this group. Please delete the group instead.' });
      }
      // Otherwise, suggest transfer ownership
      console.log('❌ Owner must transfer first');
      return res.status(400).json({ error: 'As the group owner, you must transfer ownership before leaving.' });
    }

    console.log('✅ Regular member leaving...');

    // NOTE: No balance check - users can leave with pending balances
    // Their expenses and name remain in the group for historical records

    // Add user to pastMembers
    if (!group.pastMembers) {
      group.pastMembers = [];
    }
    
    // Check if user rejoined after leaving - remove from pastMembers
    group.pastMembers = group.pastMembers.filter(pm => pm.user.toString() !== user._id.toString());
    
    // Add to past members
    group.pastMembers.push({
      user: user._id,
      leftAt: new Date()
    });

    // Remove user from current members
    // members might be populated objects or IDs, handle both cases
    group.members = group.members.filter(m => {
      const memberId = m._id ? m._id.toString() : m.toString();
      return memberId !== user._id.toString();
    });
    
    console.log('💾 Saving group with updated members:', group.members.length);
    await group.save();

    // Remove group from user's groups
    user.groups = user.groups.filter(g => g.toString() !== groupId);
    console.log('💾 Saving user with updated groups');
    await user.save();

    console.log('✅ Successfully left group');
    res.json({ 
      message: 'Successfully left the group! Your expense history remains visible to other members.' 
    });
  } catch (error) {
    console.error('❌ Leave group error:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// DELETE /api/groups/:groupId - Delete group (owner only, with confirmation)
router.delete('/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { confirmationName } = req.body;
    const user = req.user;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is the owner
    if (group.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Only the group owner can delete the group' });
    }

    // Verify confirmation name matches
    if (confirmationName !== group.name) {
      return res.status(400).json({ error: 'Group name does not match. Please type the exact group name to confirm deletion.' });
    }

    // Remove group from all members' groups array
    await User.updateMany(
      { groups: groupId },
      { $pull: { groups: groupId } }
    );

    // Remove group from owner's ownedGroups array
    await User.updateOne(
      { _id: user._id },
      { $pull: { ownedGroups: groupId } }
    );

    // Delete all join requests associated with this group
    await Request.deleteMany({ group: groupId });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// POST /api/groups/:groupId/transfer-owner - Transfer group ownership (owner only)
router.post('/:groupId/transfer-owner', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newOwnerId, shouldLeave } = req.body;
    const user = req.user;

    if (!newOwnerId) {
      return res.status(400).json({ error: 'New owner ID is required' });
    }

    const group = await Group.findById(groupId).populate('members', '_id name email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if current user is the owner
    if (group.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Only the group owner can transfer ownership' });
    }

    // Check if new owner is a member of the group
    if (!group.members.some(m => m._id.toString() === newOwnerId)) {
      return res.status(400).json({ error: 'New owner must be a group member' });
    }

    // Check if trying to transfer to self
    if (newOwnerId === user._id.toString()) {
      return res.status(400).json({ error: 'You are already the owner' });
    }

    const oldOwner = user;
    const newOwner = await User.findById(newOwnerId);
    
    if (!newOwner) {
      return res.status(404).json({ error: 'New owner not found' });
    }

    // Transfer ownership
    group.owner = newOwnerId;

    // Update user ownership records
    // Remove from old owner's ownedGroups
    oldOwner.ownedGroups = oldOwner.ownedGroups.filter(g => g.toString() !== groupId);
    await oldOwner.save();

    // Add to new owner's ownedGroups
    if (!newOwner.ownedGroups) {
      newOwner.ownedGroups = [];
    }
    if (!newOwner.ownedGroups.includes(groupId)) {
      newOwner.ownedGroups.push(groupId);
    }
    await newOwner.save();

    // If old owner wants to leave after transfer
    if (shouldLeave) {
      // No balance check - users can leave with pending balances
      // Their expenses remain in the group for historical accuracy

      // Add to past members
      if (!group.pastMembers) {
        group.pastMembers = [];
      }
      group.pastMembers = group.pastMembers.filter(pm => pm.user.toString() !== oldOwner._id.toString());
      group.pastMembers.push({
        user: oldOwner._id,
        leftAt: new Date()
      });

      // Remove from members
      group.members = group.members.filter(m => m._id.toString() !== oldOwner._id.toString());
      
      // Remove group from old owner's groups
      oldOwner.groups = oldOwner.groups.filter(g => g.toString() !== groupId);
      await oldOwner.save();

      await group.save();
      return res.json({ 
        message: `Ownership transferred to ${newOwner.name} and you have left the group! Your expense history remains visible.` 
      });
    }

    await group.save();
    res.json({ 
      message: `Ownership successfully transferred to ${newOwner.name}!` 
    });
  } catch (error) {
    console.error('Transfer ownership error:', error);
    res.status(500).json({ error: 'Failed to transfer ownership' });
  }
});

// GET /api/groups - List user's groups
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    const groups = await Group.find({ members: user._id })
      .populate('members', 'email name')
      .populate('owner', 'email name');  // Populate owner info
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;