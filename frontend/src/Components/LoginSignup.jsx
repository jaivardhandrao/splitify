// import React, { useState } from 'react';
// import axios from 'axios';

// function LoginSignup() {
//   const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
//   const [email, setEmail] = useState(''); // Shared email input
//   const [password, setPassword] = useState(''); // Added for password
//   const [name, setName] = useState(''); // User's name
//   const [phone, setPhone] = useState(''); // User's phone number
//   const [error, setError] = useState(''); // For error messages
//   const [loading, setLoading] = useState(false); // For submit loading
//   const [notification, setNotification] = useState(''); // For success notifications

//   // New: State for Forgot Password modal
//   const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
//   const [forgotEmail, setForgotEmail] = useState(''); // Email for reset

//   // OLD
// const API_BASE = 'http://localhost:5666/api';
// // const API_BASE = import.meta.env.VITE_API_BASE_URL;

// // NEW

//   // Function for notification popup
//   const showNotification = (msg) => {
//     setNotification(msg);
//     setTimeout(() => setNotification(''), 3000); // 3s duration
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       let response;
//       if (isLogin) {
//         response = await axios.post(`${API_BASE}/auth/login`, { email, password });
//         localStorage.setItem('token', response.data.token);
//         showNotification('Login successful! Redirecting...');
//         setTimeout(() => {
//           window.location.href = '/dashboard';
//         }, 1500);
//       } else {
//         response = await axios.post(`${API_BASE}/auth/register`, { email, password, name, phone });
//         showNotification('Registration successful! Check your email for verification link.');
//         setIsLogin(true); // Switch to login
//         setName(''); // Reset signup fields
//         setPhone('');
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || 'An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }

//     // Reset common fields
//     // setEmail('');
//     // setPassword('');
//   };

//   // Handle forgot password submit
//   const handleForgotPassword = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       await axios.post(`${API_BASE}/auth/forgot-password`, { email: forgotEmail });
//       showNotification('Password reset link sent! Check your email.');
//       setIsForgotModalOpen(false);
//       setForgotEmail('');
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to send reset email.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       {/* Notification Popup */}
//       {notification && (
//         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50 animate-fade-in-out">
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//           </svg>
//           <p>{notification}</p>
//         </div>
//       )}

//       <div className="max-w-md w-full space-y-8">
//         {/* App Header */}
//         <div className="text-center">
//           <h2 className="text-4xl font-bold text-gray-900">Splitify</h2>
//           <p className="mt-2 text-sm text-gray-600">Split expenses effortlessly with friends</p>
//         </div>

//         {/* Toggle between Login and Signup */}
//         <div className="bg-white relative">
//           <div className="absolute inset-0 flex items-center">
//             <div className="w-full border-b border-gray-300" />
//           </div>
//           <div className="relative flex justify-center text-sm">
//             <span
//               className={`${
//                 isLogin ? 'bg-white px-3 py-2 text-gray-900 font-semibold' : 'bg-transparent px-3 py-2 text-gray-500'
//               } cursor-pointer transition-colors duration-200`}
//               onClick={() => setIsLogin(true)}
//             >
//               Login
//             </span>
//             <span
//               className={`${
//                 !isLogin ? 'bg-white px-3 py-2 text-gray-900 font-semibold' : 'bg-transparent px-3 py-2 text-gray-500'
//               } cursor-pointer transition-colors duration-200`}
//               onClick={() => setIsLogin(false)}
//             >
//               Sign Up
//             </span>
//           </div>
//         </div>

//         {/* Form Card */}
//         <div className="mt-8 bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             {/* Error Message */}
//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
//                 {error}
//               </div>
//             )}

//             {/* Email Input */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
//                 placeholder="Enter your email"
//               />
//             </div>

//             {/* Password Input */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
//                 placeholder="Enter your password"
//               />
//             </div>

//             {/* Name and Phone Inputs (only for Sign Up) */}
//             {!isLogin && (
//               <>
//                 <div>
//                   <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
//                     Name
//                   </label>
//                   <input
//                     id="name"
//                     name="name"
//                     type="text"
//                     required
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
//                     placeholder="Enter your name"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
//                     Phone Number
//                   </label>
//                   <input
//                     id="phone"
//                     name="phone"
//                     type="tel"
//                     required
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
//                     placeholder="Enter your phone number"
//                   />
//                 </div>
//               </>
//             )}

//             {/* Submit Button */}
//             <div>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//               >
//                 {loading ? (
//                   <span className="flex items-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Processing...
//                   </span>
//                 ) : (
//                   isLogin ? 'Login' : 'Sign Up'
//                 )}
//               </button>
//             </div>

//             {/* Forgot Password Link (only for Login mode) */}
//             {isLogin && (
//               <div className="text-center">
//                 <button
//                   type="button"
//                   onClick={() => setIsForgotModalOpen(true)}
//                   className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
//                 >
//                   Forgot Password?
//                 </button>
//               </div>
//             )}

//             {/* Switch Link */}
//             <div className="text-center">
//               <p className="text-sm text-gray-600">
//                 {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
//                 <button
//                   type="button"
//                   onClick={() => setIsLogin(!isLogin)}
//                   className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
//                 >
//                   {isLogin ? 'Sign up' : 'Login'}
//                 </button>
//               </p>
//             </div>

//             {/* Additional Info */}
//             {isLogin && (
//               <div className="text-xs text-gray-500 text-center">
//                 <p>Email login only after verification.</p>
//               </div>
//             )}
//             {!isLogin && (
//               <div className="text-xs text-gray-500 text-center">
//                 <p>We'll send a verification link to your email.</p>
//               </div>
//             )}
//           </form>
//         </div>

//         {/* Footer */}
//         <div className="text-center text-sm text-gray-500">
//           <p>&copy; 2025 Splitify. All rights reserved.</p>
//         </div>
//       </div>

//       {/* Forgot Password Modal */}
//       {isForgotModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
//             <h3 className="text-lg font-bold text-gray-900">Forgot Password?</h3>
//             <p className="text-sm text-gray-600">Enter your email to receive a reset link.</p>
//             <form onSubmit={handleForgotPassword} className="space-y-4">
//               <input
//                 type="email"
//                 value={forgotEmail}
//                 onChange={(e) => setForgotEmail(e.target.value)}
//                 placeholder="Enter your email"
//                 required
//                 className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               />
//               <div className="flex space-x-2">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-1 bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
//                 >
//                   {loading ? 'Sending...' : 'Send Reset Link'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setIsForgotModalOpen(false);
//                     setForgotEmail('');
//                     setError('');
//                   }}
//                   className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//               </div>
//               {error && <p className="text-red-600 text-sm text-center">{error}</p>}
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Styles for Animations */}
//       <style>{`
//         @keyframes fade-in-out { 0% { opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { opacity: 0; } }
//         .animate-fade-in-out { animation: fade-in-out 3s ease-in-out; }
//       `}</style>
//     </div>
//   );
// }

// export default LoginSignup;

import React, { useState } from 'react';
import axios from 'axios';

function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [email, setEmail] = useState(''); // Shared email input
  const [password, setPassword] = useState(''); // Added for password
  const [name, setName] = useState(''); // User's name
  const [phone, setPhone] = useState(''); // User's phone number
  const [error, setError] = useState(''); // For error messages
  const [loading, setLoading] = useState(false); // For submit loading
  const [notification, setNotification] = useState(''); // For success notifications

  // New: State for Forgot Password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(''); // Email for reset

  // OLD
// const API_BASE = 'http://localhost:5666/api';
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// NEW

  // Function for notification popup
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000); // 3s duration
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
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        response = await axios.post(`${API_BASE}/auth/register`, { email, password, name, phone });
        showNotification('Registration successful! Check your email (and spam folder) for verification link.');
        setIsLogin(true); // Switch to login
        setName(''); // Reset signup fields
        setPhone('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }

    // Reset common fields
    // setEmail('');
    // setPassword('');
  };

  // Handle forgot password submit
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
              onClick={() => setIsLogin(true)}
            >
              Login
            </span>
            <span
              className={`${
                !isLogin ? 'bg-white px-3 py-2 text-gray-900 font-semibold' : 'bg-transparent px-3 py-2 text-gray-500'
              } cursor-pointer transition-colors duration-200`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="mt-8 bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

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

            {/* Switch Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  {isLogin ? 'Sign up' : 'Login'}
                </button>
              </p>
            </div>

            {/* Additional Info */}
            {isLogin && (
              <div className="text-xs text-gray-500 text-center">
                <p>Email login only after verification.</p>
              </div>
            )}
            {!isLogin && (
              <div className="text-xs text-gray-500 text-center">
                <p>We'll send a verification link to your email (check spam folder if not in inbox).</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2025 Splitify. All rights reserved.</p>
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
  );
}

export default LoginSignup;