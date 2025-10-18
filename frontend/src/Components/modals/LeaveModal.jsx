import React, { useState } from 'react';
import { useDashboard } from '../../Contexts/DashboardContext';  // Capital C
import axios from 'axios';

const LeaveModal = ({ isOpen, onClose }) => {
  const { activeGroup, showNotification, token, API_BASE, balances, user } = useDashboard();
  const [leaveError, setLeaveError] = useState('');

  if (!isOpen) return null;

  const handleLeaveGroup = async () => {
    // Check balances before leaving
    const userBalance = balances[user.email] || 0;
    if (userBalance !== 0) {
      setLeaveError('Please settle your balances before leaving the group.');
      return;
    }

    try {
      await axios.post(`${API_BASE}/groups/${activeGroup._id}/leave`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showNotification('Left the group successfully!');
      onClose();
      // Refetch groups
    } catch (err) {
      setLeaveError('Failed to leave group: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Leave Group?</h3>
        <p className="text-sm text-gray-600">Are you sure you want to leave "{activeGroup.name}"? This action cannot be undone.</p>
        {leaveError && <p className="text-red-600 text-sm">{leaveError}</p>}
        <div className="flex space-x-2">
          <button
            onClick={handleLeaveGroup}
            className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
          >
            Confirm Leave
          </button>
          <button
            onClick={() => {
              onClose();
              setLeaveError('');
            }}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;