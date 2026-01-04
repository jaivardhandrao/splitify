import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../Contexts/DashboardContext';

const UpiIdReminder = () => {
  const { user } = useDashboard();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has UPI ID
    if (!user || !user._id) return;

    // Check if notification was dismissed
    const dismissedUntil = localStorage.getItem('upiReminderDismissed');
    const now = Date.now();

    if (dismissedUntil && now < parseInt(dismissedUntil)) {
      return; // Still dismissed
    }

    // Show notification if no UPI ID
    if (!user.upiId || user.upiId.trim() === '') {
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 2000); // Show after 2 seconds
    }
  }, [user]);

  const handleAddUpiId = () => {
    handleClose();
    navigate('/profile');
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleDismissForNow = () => {
    handleClose();
    // Dismiss for 24 hours
    const dismissUntil = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('upiReminderDismissed', dismissUntil.toString());
  };

  const handleDismissPermanently = () => {
    handleClose();
    // Dismiss for 30 days
    const dismissUntil = Date.now() + (30 * 24 * 60 * 60 * 1000);
    localStorage.setItem('upiReminderDismissed', dismissUntil.toString());
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismissForNow}
      />

      {/* Notification Card */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className={`bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto transform transition-all duration-300 ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10 flex items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Add Your UPI ID</h3>
                    <p className="text-blue-100 text-sm">Start receiving payments!</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDismissForNow}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-700 text-base mb-4">
                Set up your UPI ID to receive payments from group members directly on your mobile device.
              </p>
              
              {/* Feature list */}
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-blue-900">Receive payments via Google Pay, PhonePe, BHIM</p>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-blue-900">Quick one-tap payments for group members</p>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-blue-900">Secure and instant transactions</p>
                </div>
              </div>

              {/* Reassurance note */}
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700 text-center leading-relaxed">
                  <span className="font-medium">Don't worry!</span> You can add your UPI ID now and change it anytime later from your Profile page.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleAddUpiId}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add UPI ID Now</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDismissForNow}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Remind me later
                </button>
                <button
                  onClick={handleDismissPermanently}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Don't show again
                </button>
              </div>
            </div>

            {/* Info note */}
            <div className="mt-4 space-y-2">
              <div className="flex items-start space-x-2 text-xs text-gray-500">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Your UPI ID format: yourname@paytm, yourname@ybl, etc.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default UpiIdReminder;

