import React, { useState } from 'react';
import { useDashboard } from '../../Contexts/DashboardContext';  // Capital C
import axios from 'axios';

const ShareModal = ({ isOpen, onClose }) => {
  const { activeGroup, user, showNotification, APP_URL } = useDashboard();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const message = `Hi! You're invited to join "${activeGroup.name}" on Splitify by ${user.name}. Use Group ID: ${activeGroup._id} to join. Download the app or visit ${APP_URL} to get started!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    showNotification('Message copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Share Group Invitation</h3>
        <p className="text-sm text-gray-600">Share this with friends to invite them:</p>
        <div className="bg-gray-100 p-3 rounded-md">
          <p className="text-sm font-mono break-all">{activeGroup._id}</p>
          <p className="text-xs text-gray-500 mt-1">Group: {activeGroup.name} | Invited by: {user.name}</p>
        </div>
        <textarea
          readOnly
          value={message}
          className="w-full p-3 border rounded-md resize-none text-sm"
          rows={3}
        />
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700"
          >
            {copied ? 'Copied!' : 'Copy Message'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;