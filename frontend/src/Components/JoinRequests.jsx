import React, { useState } from 'react';
import { useDashboard } from '../Contexts/DashboardContext';
import axios from 'axios';

const JoinRequests = () => {
  const {
    joinRequests,
    setJoinRequests,
    activeGroup,
    showNotification,
    setError,
    token,
    API_BASE,
  } = useDashboard();

  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  const handleApproveReject = async (requestId, action) => {
    setProcessingRequestId(requestId);
    setProcessingAction(action);

    try {
      // Find the request and the user making the request
      const request = joinRequests.find(req => req._id === requestId);
      if (!request) {
        setError('Request not found');
        setProcessingRequestId(null);
        setProcessingAction(null);
        return;
      }

      // Check if the user is already a member of the group
      const isAlreadyMember = activeGroup.members.some(
        member => member._id.toString() === request.user._id.toString()
      );

      if (isAlreadyMember) {
        showNotification(`User is already a member of ${activeGroup.name} Group :)`);

        // Remove all requests from that user, not just one
        setJoinRequests(prev =>
          prev.filter(req => req.user._id.toString() !== request.user._id.toString())
        );

        const temp = "decline";
        await axios.post(
          `${API_BASE}/groups/${activeGroup._id}/respond`,
          { requestId, temp },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProcessingRequestId(null);
        setProcessingAction(null);
        return;
      }

      // Proceed with API call if user is not a member
      await axios.post(
        `${API_BASE}/groups/${activeGroup._id}/respond`,
        { requestId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJoinRequests(joinRequests.filter(req => req._id !== requestId));
      showNotification(`Request ${action}ed!`);
      setProcessingRequestId(null);
      setProcessingAction(null);

    } catch (err) {
      setError('Failed to process request: ' + err.message);
      setProcessingAction(null);
      setProcessingRequestId(null);
    }

    // Reload page to refresh members list
    window.location.reload();
  };

  if (!activeGroup || joinRequests.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Join Requests</h3>
      <ul className="space-y-4">
        {joinRequests.map((req) => (
          <li
            key={req._id}
            className="p-4 bg-gray-50 rounded-lg shadow-md border border-gray-200"
          >
            <p className="font-medium">{req.user.name} ({req.user.email})</p>
            <p className="text-sm text-gray-600">Phone: {req.user.phone}</p>
            <div className="mt-2 flex items-center">
              <button
                onClick={() => handleApproveReject(req._id, 'accept')}
                disabled={processingRequestId === req._id}
                className={`mr-2 px-3 py-1 rounded flex items-center transition-all duration-300 ${
                  processingRequestId === req._id && processingAction === 'decline'
                    ? 'opacity-30 bg-gray-300 text-gray-500'
                    : processingRequestId === req._id && processingAction === 'accept'
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {processingRequestId === req._id && processingAction === 'accept' ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Approve'
                )}
              </button>
              <button
                onClick={() => handleApproveReject(req._id, 'decline')}
                disabled={processingRequestId === req._id}
                className={`px-3 py-1 rounded flex items-center transition-all duration-300 ${
                  processingRequestId === req._id && processingAction === 'accept'
                    ? 'opacity-30 bg-gray-300 text-gray-500'
                    : processingRequestId === req._id && processingAction === 'decline'
                    ? 'bg-red-600 text-white cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {processingRequestId === req._id && processingAction === 'decline' ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JoinRequests;