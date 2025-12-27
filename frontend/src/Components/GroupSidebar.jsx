import React, { useState } from 'react';
import { useDashboard } from '../Contexts/DashboardContext';
import CreateGroupModal from './modals/CreateGroupModal';
import JoinGroupModal from './modals/JoinGroupModal';
import DeleteGroupModal from './modals/DeleteGroupModal';

const GroupSidebar = ({ isOpen, toggleSidebar }) => {
  const {
    groups,
    activeGroup,
    setActiveGroup,
    handleCreateGroup,
    handleJoinGroup,
    handleDeleteGroup,
    isGroupsLoading,
    user,
  } = useDashboard();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleJoin = () => {
    setIsJoinModalOpen(true);
  };

  const handleDelete = () => {
    if (activeGroup) {
      setIsDeleteModalOpen(true);
    }
  };

  const handleGroupSelect = (group) => {
    setActiveGroup(group);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 shadow-lg transform transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-6 w-64 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:w-64 flex flex-col`}
      >
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Groups</h3>

          <nav className="space-y-4">
            <button
              onClick={handleCreate}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-medium hover:bg-emerald-100 transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-sm hover:shadow-md text-left"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Create Group</span>
            </button>

            <button
              onClick={handleJoin}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-sm hover:shadow-md text-left"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 7l6 3.6v7.2L18 17V7zM3 7l-6 3.6v7.2L3 17V7z"
                />
              </svg>
              <span>Join Group</span>
            </button>
          </nav>
        </div>

        {/* Scrollable Groups Section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Your Groups</h4>

            {isGroupsLoading ? (
              // Loading state with skeletons
              <div className="space-y-3">
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
                      <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                      <span className="font-medium">Loading groups</span>
                    </div>
                  </div>
                </div>

                {/* Skeleton loading cards */}
                {[1, 2, 3].map((index) => (
                  <div key={index} className="animate-pulse">
                    <div className="w-full px-3 py-3 rounded-md bg-gray-100 border border-gray-200">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : groups.length === 0 ? (
              // Empty state - no groups yet
              <div className="text-center py-8 px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">No groups yet</p>
                <p className="text-xs text-gray-500">Create or join a group to get started!</p>
              </div>
            ) : (
              // Actual groups list
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li key={group._id}>
                    <button
                      onClick={() => handleGroupSelect(group)}
                      className={`w-full text-left px-3 py-3 rounded-md transition-all duration-300 ease-in-out ${
                        activeGroup?._id === group._id
                          ? 'bg-emerald-100 text-emerald-700 font-medium border border-emerald-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                      } transform hover:scale-[1.01] text-sm`}
                    >
                      <div className="font-medium truncate">{group.name}</div>
                      <div className="text-xs text-gray-500">
                        {group.members.length} members
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </aside>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateGroup}
      />
      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinGroup}
      />
      <DeleteGroupModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteGroup}
        groupName={activeGroup?.name || ''}
      />
    </>
  );
};

export default GroupSidebar;