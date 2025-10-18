import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';

const NavBar = ({ toggleSidebar, isSidebarOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current view based on pathname
  const currentView = location.pathname === '/my-expenses' ? 'myexpenses' : 'dashboard';

  // Preload routes on hover for faster navigation
  const preloadRoute = (path) => {
    // This will trigger route preloading when hovering
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 px-4 py-3 sm:py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Left section with logo and branding */}
          <div className="flex items-center space-x-3 flex-1">
            {/* Logo/Favicon */}
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative">
                <img
                  src="/fav1.png"
                  alt="Splitify Logo"
                  className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></div>
              </div>

              {/* Brand name */}
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300">
                  Splitify
                </h1>
                <span className="text-[10px] sm:text-xs text-gray-500 -mt-1 hidden sm:block group-hover:text-emerald-600 transition-colors duration-300">
                  Split expenses, simplified
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center ml-6 space-x-2">
              <Link
                to="/dashboard"
                onMouseEnter={() => preloadRoute('/dashboard')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Dashboard</span>
              </Link>

              <Link
                to="/my-expenses"
                onMouseEnter={() => preloadRoute('/my-expenses')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  currentView === 'myexpenses'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>My Expenses</span>
              </Link>
            </div>
          </div>

          {/* Right section with controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Navigation Dropdown */}
            <div className="md:hidden relative">
              <select
                value={currentView}
                onChange={(e) => {
                  const path = e.target.value === 'myexpenses' ? '/my-expenses' : '/dashboard';
                  navigate(path);
                }}
                className="appearance-none bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="dashboard">Dashboard</option>
                <option value="myexpenses">My Expenses</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Mobile menu toggle - Only show on dashboard view */}
            {currentView === 'dashboard' && (
              <button
                onClick={toggleSidebar}
                className="lg:hidden flex items-center p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>

        {/* Invisible overlay to close sidebar when clicking outside (mobile) */}
        {isSidebarOpen && currentView === 'dashboard' && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={closeSidebar}></div>
        )}
      </nav>
    </>
  );
};

export default NavBar;

