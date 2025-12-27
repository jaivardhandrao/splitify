import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../../Contexts/DashboardContext';
import LeaveModal from './LeaveModal';
import DeleteGroupModal from './DeleteGroupModal';
import TransferOwnershipModal from './TransferOwnershipModal';

function GroupSettingsDropdown({ group }) {
  const { user, handleDeleteGroup } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Check if current user is the owner
  // group.owner could be populated (object with _id) or just an ObjectId string
  const ownerId = group?.owner?._id || group?.owner;
  const userId = user?._id;
  const isOwner = ownerId?.toString() === userId?.toString();
    
  const memberCount = group?.members?.length || 0;
  const isOnlyMember = memberCount === 1;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLeaveClick = () => {
    setIsOpen(false);
    if (isOwner) {
      // Owner wants to leave - show transfer ownership modal
      if (isOnlyMember) {
        // Only member - show delete option instead
        alert('You are the only member. Please delete the group if you want to leave.');
      } else {
        // Multiple members - show transfer ownership modal
        setIsTransferModalOpen(true);
      }
    } else {
      setIsLeaveModalOpen(true);
    }
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    setIsDeleteModalOpen(true);
  };

  if (!group) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Settings Icon Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
          title="Group Settings"
        >
          <svg 
            className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-slide-down">
            {/* Header */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Group Settings
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {/* Owner Badge (if owner) */}
              {isOwner && (
                <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="text-xs font-medium text-emerald-700">You're the owner</span>
                  </div>
                </div>
              )}

              {/* Group Info */}
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">Group Name</p>
                <p className="text-sm font-medium text-gray-900 truncate">{group.name}</p>
              </div>

              {/* Leave Group / Transfer Ownership */}
              <button
                onClick={handleLeaveClick}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-150 text-orange-700 hover:bg-orange-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isOwner && !isOnlyMember ? (
                    // Transfer icon for owner with multiple members
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  ) : (
                    // Leave icon for non-owners or owner being prompted to delete
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  )}
                </svg>
                <div className="flex-1">
                  <span className="block text-sm font-medium">
                    {isOwner && !isOnlyMember ? 'Transfer Ownership & Leave' : 'Leave Group'}
                  </span>
                  {isOwner && !isOnlyMember && (
                    <span className="block text-xs text-orange-600 mt-0.5">
                      Choose new owner first
                    </span>
                  )}
                  {isOwner && isOnlyMember && (
                    <span className="block text-xs text-gray-400 mt-0.5">
                      Delete group instead
                    </span>
                  )}
                </div>
              </button>

              {/* Divider - Only show if delete option will be shown */}
              {isOwner && isOnlyMember && (
                <div className="border-t border-gray-100 my-1"></div>
              )}

              {/* Delete Group (Only visible when owner is the only member) */}
              {isOwner && isOnlyMember && (
                <button
                  onClick={handleDeleteClick}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-150 text-red-700 hover:bg-red-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <div className="flex-1">
                    <span className="block text-sm font-medium">Delete Group</span>
                    <span className="block text-xs text-red-600 mt-0.5">
                      Permanently delete this group
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />
      <TransferOwnershipModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        group={group}
      />
      <DeleteGroupModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={async (confirmationName) => {
          // Call the context's handleDeleteGroup function
          await handleDeleteGroup(confirmationName);
        }}
        groupName={group?.name || ''}
      />

      {/* Animation Styles */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

export default GroupSettingsDropdown;

