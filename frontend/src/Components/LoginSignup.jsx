// import React, { useState } from 'react';
// import axios from 'axios';

// function LoginSignup() {
//   const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
//   const [email, setEmail] = useState(''); // Shared email input
//   const [password, setPassword] = useState(''); // Added for password
//   const [name, setName] = useState(''); // users name 
//   const [phone, setPhone] = useState(''); // users phone number
//   const [error, setError] = useState(''); // For error messages
//   const [loading, setLoading] = useState(false); // For submit loading

//   const API_BASE = 'http://localhost:5666/api'; // Your backend port

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       let response;
//       if (isLogin) {
//         response = await axios.post(`${API_BASE}/auth/login`, { email, password });
//         localStorage.setItem('token', response.data.token);
//         alert('Login successful!');
//         window.location.href = '/dashboard'; // Or use useNavigate if in Router
//       } else {
//         response = await axios.post(`${API_BASE}/auth/register`, { email, password });
//         alert('Registration successful! Check your email for verification link.');
//         setIsLogin(true); // Switch to login after register
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || 'An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }

//     // Reset form fields
//     setEmail('');
//     setPassword('');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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

  const API_BASE = 'http://localhost:5666/api'; // Your backend port

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await axios.post(`${API_BASE}/auth/login`, { email, password });
        localStorage.setItem('token', response.data.token);
        alert('Login successful!');
        window.location.href = '/dashboard'; // Or use useNavigate if in Router
      } else {
        response = await axios.post(`${API_BASE}/auth/register`, { email, password, name, phone });
        alert('Registration successful! Check your email for verification link.');
        setIsLogin(true); // Switch to login after register
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }

    // Reset form fields
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
                <p>We'll send a verification link to your email.</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2025 Splitify. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;