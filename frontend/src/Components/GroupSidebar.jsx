import React from 'react';
import { useDashboard } from '../Contexts/DashboardContext';

const GroupSidebar = ({ isOpen, toggleSidebar }) => {
  const {
    groups,
    activeGroup,
    setActiveGroup,
    handleCreateGroup,
    handleJoinGroup,
  } = useDashboard();

  const handleCreate = () => {
    const name = prompt('Enter group name:');
    if (name) {
      handleCreateGroup(name);
    }
  };

  const handleJoin = () => {
    const groupId = prompt('Enter group ID to join:');
    if (groupId) {
      handleJoinGroup(groupId);
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
        className={`bg-white border-r border-gray-200 shadow-lg transform transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 w-64 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:w-64`}
      >
        <div className="p-4 sm:p-6 h-full overflow-y-auto">
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

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-4">Your Groups</h4>

            {groups.length === 0 ? (
              // Modern loading state
              <div className="space-y-3">
                {/* Loading text with animated dots */}
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
                      <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                      <span className="font-medium">Loading groups</span>
                      <div className="flex space-x-1">
                        <div
                          className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        ></div>
                      </div>
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
        </div>
      </aside>
    </>
  );
};

export default GroupSidebar;