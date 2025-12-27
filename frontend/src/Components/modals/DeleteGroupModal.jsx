import React, { useState } from 'react';

function DeleteGroupModal({ isOpen, onClose, onDelete, groupName }) {
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isConfirmationValid = confirmationText === groupName;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConfirmationValid) {
      setError('Group name does not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onDelete(confirmationText);
      setConfirmationText('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmationText('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-20 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all animate-slide-up">
        {/* Header */}
        <div className="bg-red-100/60 backdrop-blur-xl px-6 py-4 rounded-t-xl border-b border-red-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-200/40 rounded-lg backdrop-blur-sm">
                <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-900">Delete Group</h3>
            </div>
            {!loading && (
              <button
                onClick={handleClose}
                className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-200/30"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900 mb-2">Warning: This action cannot be undone</h4>
                <p className="text-sm text-red-700 mb-2">
                  Deleting this group will permanently remove:
                </p>
                <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                  <li>All expenses in this group</li>
                  <li>All member associations</li>
                  <li>All pending join requests</li>
                  <li>All transaction history</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Confirmation Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-gray-700">
              You are about to delete the group:
            </p>
            <div className="bg-white border border-gray-300 rounded-md px-4 py-2">
              <p className="font-semibold text-gray-900">{groupName}</p>
            </div>
            <p className="text-sm text-gray-700">
              To confirm deletion, please type <span className="font-semibold text-gray-900">"{groupName}"</span> below:
            </p>
          </div>

          <div>
            <label htmlFor="confirmationText" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm group name *
            </label>
            <input
              id="confirmationText"
              type="text"
              value={confirmationText}
              onChange={(e) => {
                setConfirmationText(e.target.value);
                setError('');
              }}
              placeholder={`Type "${groupName}" to confirm`}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-red-500 transition-colors duration-200 ${
                confirmationText && !isConfirmationValid
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-red-500'
              }`}
              autoFocus
              disabled={loading}
              autoComplete="off"
            />
            {confirmationText && !isConfirmationValid && (
              <p className="mt-2 text-xs text-red-600 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Group name does not match</span>
              </p>
            )}
            {confirmationText && isConfirmationValid && (
              <p className="mt-2 text-xs text-green-600 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Group name matched</span>
              </p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isConfirmationValid}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Group</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default DeleteGroupModal;

