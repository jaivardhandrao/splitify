import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function Verify() {
  const { token } = useParams(); // Gets token from URL
  const navigate = useNavigate(); // For redirect
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.post(`http://localhost:5666/api/auth/verify/${token}`);
        setMessage(response.data.message);
        setTimeout(() => navigate('/'), 3000); // Redirect to login after 3s
      } catch (err) {
        setError(err.response?.data?.error || 'Verification failed. Try again or contact support.');
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">{message}</h2>
        {error && <p className="text-red-500">{error}</p>}
        {!error && <p className="text-sm text-gray-600">Redirecting to login...</p>}
      </div>
    </div>
  );
}

export default Verify;