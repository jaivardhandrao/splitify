import React, { useState } from 'react';
import { useDashboard } from '../../Contexts/DashboardContext';
import axios from 'axios';

function TransferOwnershipModal({ isOpen, onClose, group }) {
  const { token, API_BASE, showNotification, fetchGroups, setActiveGroup, user } = useDashboard();
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shouldLeaveAfter, setShouldLeaveAfter] = useState(false);

  if (!isOpen || !group) return null;

  // Get all members except current user (the owner who is transferring)
  const eligibleMembers = group.members?.filter(
    member => member._id?.toString() !== user?._id?.toString()
  ) || [];

  const handleTransfer = async () => {
    if (!selectedMember) {
      setError('Please select a new owner');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE}/groups/${group._id}/transfer-owner`,
        { 
          newOwnerId: selectedMember,
          shouldLeave: shouldLeaveAfter 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification(response.data.message || 'Ownership transferred successfully!');
      
      if (shouldLeaveAfter) {
        // User left the group, clear active group
        setActiveGroup(null);
      }
      
      // Refresh groups
      fetchGroups();
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to transfer ownership');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-20 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-purple-100/60 backdrop-blur-xl px-6 py-4 rounded-t-xl border-b border-purple-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-200/40 rounded-lg backdrop-blur-sm">
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-900">Transfer Ownership</h3>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="text-purple-600 hover:text-purple-800 transition-colors p-1 rounded-md hover:bg-purple-200/30"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Info Box */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-purple-900 mb-1">What happens?</h4>
                <ul className="text-xs text-purple-700 space-y-1 list-disc list-inside">
                  <li>The new owner will have full control of the group</li>
                  <li>They can approve/reject join requests</li>
                  <li>They can delete the group</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Current Group Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Group
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="font-semibold text-gray-900">{group.name}</p>
              <p className="text-xs text-gray-500 mt-1">{group.members?.length || 0} members</p>
            </div>
          </div>

          {/* Select New Owner */}
          <div>
            <label htmlFor="newOwner" className="block text-sm font-medium text-gray-700 mb-2">
              Select New Owner *
            </label>
            {eligibleMembers.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <svg className="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm font-medium text-yellow-900">No other members</p>
                <p className="text-xs text-yellow-700 mt-1">You're the only member in this group</p>
              </div>
            ) : (
              <select
                id="newOwner"
                value={selectedMember}
                onChange={(e) => {
                  setSelectedMember(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                disabled={loading}
              >
                <option value="">-- Choose a member --</option>
                {eligibleMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Leave After Transfer Checkbox */}
          {eligibleMembers.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldLeaveAfter}
                  onChange={(e) => setShouldLeaveAfter(e.target.checked)}
                  disabled={loading}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Leave group after transfer</span>
                  <p className="text-xs text-gray-500 mt-1">
                    If checked, you'll automatically leave the group after transferring ownership. 
                    Your expense history will remain visible to other members.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTransfer}
              disabled={loading || !selectedMember || eligibleMembers.length === 0}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Transfer Ownership</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}

export default TransferOwnershipModal;

