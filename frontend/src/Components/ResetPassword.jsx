import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';


function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(false);

// NEW
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5666/api';

  // Debounced password validation
  useEffect(() => {
    // Only validate if both fields have values
    if (!password || !confirmPassword) {
      setPasswordError('');
      setPasswordsMatch(false);
      return;
    }

    const timer = setTimeout(() => {
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        setPasswordsMatch(false);
      } else {
        setPasswordError('');
        setPasswordsMatch(true);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation check
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/reset-password/${token}`, { password });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => window.location.href = '/', 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        {message && (
          <p className={`text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              required
              minLength={6}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              required
              minLength={6}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                passwordError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : confirmPassword && passwordsMatch 
                    ? 'border-green-500 focus:ring-green-500' 
                    : 'focus:ring-emerald-500'
              }`}
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {passwordError}
              </p>
            )}
            {confirmPassword && passwordsMatch && (
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Passwords match
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !passwordsMatch || !password || !confirmPassword}
            className="w-full bg-emerald-600 text-white py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;