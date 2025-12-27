import React from 'react';
import { useDashboard } from '../Contexts/DashboardContext';

const PastMembers = () => {
  const { pastMembers } = useDashboard();

  if (!pastMembers || pastMembers.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 my-5 bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center mb-4">
        <svg 
          className="w-5 h-5 mr-2 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Past Members</h3>
        <span className="ml-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {pastMembers.length}
        </span>
      </div>

      <div className="space-y-2">
        {pastMembers.map((pm, index) => {
          if (!pm.user) return null;
          
          const leftDate = new Date(pm.leftAt);
          const formattedDate = leftDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div 
              key={index} 
              className="p-3 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">
                    {pm.user.name?.charAt(0)?.toUpperCase() || pm.user.email?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-500 line-through">
                    {pm.user.name || pm.user.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    {pm.user.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  <svg 
                    className="w-3 h-3 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                  Left
                </span>
                <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700 flex items-start">
          <svg 
            className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span>
            Past members' expenses and transactions remain visible for record-keeping. 
            If they rejoin, they'll be moved back to active members.
          </span>
        </p>
      </div>
    </div>
  );
};

export default PastMembers;

