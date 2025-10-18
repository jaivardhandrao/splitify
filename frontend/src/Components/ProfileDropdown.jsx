import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../Contexts/DashboardContext';

const ProfileDropdown = () => {
  const { user, handleLogout } = useDashboard();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeProfileDropdown();
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  return (
    <>
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={toggleProfileDropdown}
          className="flex items-center space-x-2 bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded-md transition-all duration-300 ease-in-out transform"
        >
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:inline">
            {user.name || 'User'}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-300 hidden md:block ${
              isProfileDropdownOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        <div
          className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 transition-all duration-300 ease-in-out ${
            isProfileDropdownOpen
              ? 'opacity-100 visible transform translate-y-0'
              : 'opacity-0 invisible transform -translate-y-2'
          }`}
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Profile
            </p>
          </div>
          
          <div className="px-4 py-2">
            <p className="text-xs text-gray-500">Name</p>
            <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
          </div>

          <div className="px-4 py-2">
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900 break-all">{user.email}</p>
          </div>

          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm font-medium text-gray-900">{user.phone || 'N/A'}</p>
          </div>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              closeProfileDropdown();
            }}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            Profile
          </a>
          
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              closeProfileDropdown();
            }}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            Settings
          </a>
          
          <button
            onClick={() => {
              handleLogout();
              closeProfileDropdown();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Invisible overlay to close dropdown when clicking outside (mobile backup) */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeProfileDropdown}
          style={{ pointerEvents: 'auto' }}
        ></div>
      )}
    </>
  );
};

export default ProfileDropdown;