import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  // Auto-login check when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsVerifyingToken(true);
      axios
        .get(`${API_BASE}/auth/me`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
        .then((res) => {
          showNotification('Already logged in! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        })
        .catch((err) => {
          localStorage.removeItem('token');
          setIsVerifyingToken(false);
        });
    } else {
      setIsVerifyingToken(false);
    }
  }, [navigate, API_BASE]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await axios.post(`${API_BASE}/auth/login`, { email, password });
        localStorage.setItem('token', response.data.token);
        showNotification('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        response = await axios.post(`${API_BASE}/auth/register`, { email, password, name, phone });
        showNotification('Registration successful! Check your email (and spam folder) for verification link.');
        setIsLogin(true);
        setShowEmailForm(false);
        setName('');
        setPhone('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email: forgotEmail });
      showNotification('Password reset link sent! Check your email (and spam folder).');
      setIsForgotModalOpen(false);
      setForgotEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In Success
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE}/auth/google`, {
        credential: credentialResponse.credential,
      });

      localStorage.setItem('token', response.data.token);
      showNotification(`Welcome ${response.data.user.name}! Redirecting...`);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In Error
  const handleGoogleError = () => {
    setError('Google Sign-In was cancelled or failed. Please try again.');
  };

  // Show loading screen while verifying token
  if (isVerifyingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Verifying your session...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Notification Popup */}
        {notification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50 animate-fade-in-out">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p>{notification}</p>
          </div>
        )}

        <div className="max-w-md w-full space-y-8">
          {/* App Header */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">Splitify</h2>
            <p className="mt-2 text-sm text-gray-600">Split expenses effortlessly with friends</p>
          </div>

          {/* Toggle between Login and Signup */}
          <div className="bg-white relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-b border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className={`${
                  isLogin ? 'bg-white px-3 py-2 text-gray-900 font-semibold' : 'bg-transparent px-3 py-2 text-gray-500'
                } cursor-pointer transition-colors duration-200`}
                onClick={() => {
                  setIsLogin(true);
                  setShowEmailForm(false);
                  setError('');
                }}
              >
                Login
              </span>
              <span
                className={`${
                  !isLogin ? 'bg-white px-3 py-2 text-gray-900 font-semibold' : 'bg-transparent px-3 py-2 text-gray-500'
                } cursor-pointer transition-colors duration-200`}
                onClick={() => {
                  setIsLogin(false);
                  setShowEmailForm(false);
                  setError('');
                }}
              >
                Sign Up
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="mt-8 bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                {error}
              </div>
            )}

            {!showEmailForm ? (
              /* Sign-in Options */
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
                  {isLogin ? 'Choose your sign-in method' : 'Choose your sign-up method'}
                </h3>

                {/* Google Sign-In Button */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    text={isLogin ? 'signin_with' : 'signup_with'}
                    shape="rectangular"
                    size="large"
                    width="350"
                  />
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                {/* Email Sign-In Button */}
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{isLogin ? 'Sign in with Email' : 'Sign up with Email'}</span>
                </button>

                {/* Additional Links */}
                <div className="text-center mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                      }}
                      className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200"
                    >
                      {isLogin ? 'Sign up' : 'Login'}
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              /* Email Form */
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false);
                    setError('');
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Back to options</span>
                </button>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Name and Phone Inputs (only for Sign Up) */}
                {!isLogin && (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      isLogin ? 'Login' : 'Sign Up'
                    )}
                  </button>
                </div>

                {/* Forgot Password Link (only for Login mode) */}
                {isLogin && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Additional Info */}
                {!isLogin && (
                  <div className="text-xs text-gray-500 text-center">
                    <p>We'll send a verification link to your email (check spam folder if not in inbox).</p>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>Made by Jaivardhan with ❤️</p>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {isForgotModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Forgot Password?</h3>
              <p className="text-sm text-gray-600">Enter your email to receive a reset link.</p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(false);
                      setForgotEmail('');
                      setError('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
                {error && <p className="text-red-600 text-sm text-center">{error}</p>}
              </form>
            </div>
          </div>
        )}

        {/* Styles for Animations */}
        <style>{`
          @keyframes fade-in-out { 0% { opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { opacity: 0; } }
          .animate-fade-in-out { animation: fade-in-out 3s ease-in-out; }
        `}</style>
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginSignup;
