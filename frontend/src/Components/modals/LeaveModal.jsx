import React, { useState } from 'react';
import { useDashboard } from '../../Contexts/DashboardContext';  // Capital C
import axios from 'axios';

const LeaveModal = ({ isOpen, onClose }) => {
  const { activeGroup, showNotification, setActiveGroup, token, API_BASE, balances, user, fetchGroups } = useDashboard();
  const [leaveError, setLeaveError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLeaveGroup = async () => {
    setIsLoading(true);
    setLeaveError('');

    try {
      await axios.post(
        `${API_BASE}/groups/${activeGroup._id}/leave`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showNotification('Successfully left the group!');
      
      // Clear active group
      setActiveGroup(null);
      
      // Refetch groups to update sidebar
      fetchGroups();
      
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to leave group: ' + err.message;
      setLeaveError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-opacity-20 backdrop-blur-md z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full space-y-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Leave Group?</h3>
        </div>
        
        <p className="text-sm text-gray-600">
          Are you sure you want to leave <span className="font-semibold">"{activeGroup?.name}"</span>? 
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-700">
              Your expense history and name will remain visible to other group members. Any pending balances should be settled outside the app.
            </p>
          </div>
        </div>
        
        {leaveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{leaveError}</span>
          </div>
        )}
        
        <div className="flex space-x-3 pt-2">
          <button
            onClick={() => {
              onClose();
              setLeaveError('');
            }}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleLeaveGroup}
            disabled={isLoading}
            className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Leaving...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Leave Group</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;