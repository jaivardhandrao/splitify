import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Verify() {
  const { token } = useParams(); // Extract token from URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState('');
 // OLD
// const API_BASE = 'http://localhost:5666/api';

// NEW
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5666/api';

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Invalid verification link. Please request a new one.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(`${API_BASE}/auth/verify/${token}`, {}, { // Empty body for POST
          headers: { 'Content-Type': 'application/json' } // Ensure proper headers
        });
        setMessage(response.data.message || 'Email verified successfully!');
        setTimeout(() => {
          navigate('/'); // Redirect to login after success
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.error || 'Verification failed. The link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verification</h2>
          {loading ? (
            <div className="flex justify-center items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-emerald-600">{message}</p>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center">
              <p className="font-medium mb-2">Verification Failed</p>
              <p>{error}</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Back to Login
              </button>
              <p className="text-sm text-gray-500 mt-2">Request a new link if needed.</p>
            </div>
          ) : (
            <div className="text-green-600 text-center">
              <p className="font-medium mb-2">Success!</p>
              <p>{message}</p>
              <p className="text-sm text-gray-600 mt-4">Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>

      {/* Styles for Spinner Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default Verify;