import React from 'react';

const Notification = ({ message }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50 animate-fade-in-out">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <p>{message}</p>
    </div>
  );
};

export default Notification;