// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// function Dashboard() {
//   const [groups, setGroups] = useState([]);
//   const [activeGroup, setActiveGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [balances, setBalances] = useState([]);
//   const [joinRequests, setJoinRequests] = useState([]); // Added: Pending requests
//   const [userEmail, setUserEmail] = useState('');
//   const [userName, setUserName] = useState('');
//   const [userPhone, setUserPhone] = useState('');
//   const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false); // Modal open/close
//   const [expenseTitle, setExpenseTitle] = useState(''); // Form field: title
//   const [expenseAmount, setExpenseAmount] = useState(''); // Form field: amount
//   const [expensePaidBy, setExpensePaidBy] = useState(userEmail); // Form field: paidBy (default to self)
//   const [expenseParticipants, setExpenseParticipants] = useState([]); // Form field: selected participants IDs
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
  
//   // Added: Dropdown state management
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   const API_BASE = 'http://localhost:5666/api';
//   const token = localStorage.getItem('token');
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!token) {
//       navigate('/');
//       return;
//     }

//     setLoading(true);
//     axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
//       .then(res => {
//         setUserEmail(res.data.email);
//         setUserName(res.data.name);
//         setUserPhone(res.data.phone);
//         fetchGroups();
//       })
//       .catch(() => {
//         setError('Session expired. Logging out...');
//         handleLogout();
//       })
//       .finally(() => setLoading(false));
//   }, [token, navigate]);

//   const fetchGroups = () => {
//     axios.get(`${API_BASE}/groups`, { headers: { Authorization: `Bearer ${token}` } })
//       .then(res => setGroups(res.data))
//       .catch(err => setError('Failed to load groups: ' + err.message));
//   };

//   useEffect(() => {
//     if (activeGroup && token) {
//       setLoading(true);
//       axios.get(`${API_BASE}/expenses/${activeGroup._id}`, { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => {
//           setExpenses(res.data.expenses);
//           setBalances(res.data.balances);
//         })
//         .catch(err => setError('Failed to load expenses: ' + err.message));

//       // Added: Fetch join requests if user is owner
//       axios.get(`${API_BASE}/groups/${activeGroup._id}/requests`, { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => setJoinRequests(res.data))
//         .catch(err => {
//           if (err.response?.status === 403) {
//             setJoinRequests([]); // Not owner, clear requests
//           } else {
//             setError('Failed to load requests: ' + err.message);
//           }
//         });

//       setLoading(false);
//     }
//   }, [activeGroup, token]);

//   // Added: Approve/Reject handler
//   const handleApproveReject = async (requestId, action) => {
//     try {
//       await axios.post(`${API_BASE}/groups/${activeGroup._id}/respond`, { requestId, action }, { headers: { Authorization: `Bearer ${token}` } });
//       alert(`Request ${action}ed!`);
//       // Refresh requests
//       setJoinRequests(joinRequests.filter(req => req._id !== requestId));
//     } catch (err) {
//       setError('Failed to process request: ' + err.message);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/');
//   };


//   const handleAddExpense = async (e) => {
//     e.preventDefault(); // Prevent form submit reload
//     if (!expenseTitle || !expenseAmount || expenseParticipants.length === 0) {
//       setError('All fields required');
//       return;
//     }

//     try {
//       await axios.post(`${API_BASE}/expenses`, {
//         groupId: activeGroup._id,
//         title: expenseTitle,
//         amount: parseFloat(expenseAmount),
//         paidBy: activeGroup.members.find(m => m.email === expensePaidBy)._id, // Get ID from email
//         participants: expenseParticipants, // Array of IDs
//       }, { headers: { Authorization: `Bearer ${token}` } });
      
//       // alert('Expense added!');
//       setIsAddExpenseModalOpen(false); // Close modal
//       // Refresh expenses
//       axios.get(`${API_BASE}/expenses/${activeGroup._id}`, { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => {
//           setExpenses(res.data.expenses);
//           setBalances(res.data.balances);
//         });
//     } catch (err) {
//       setError('Failed to add expense: ' + (err.response?.data?.error || err.message));
//     }

//     // Reset form
//     setExpenseTitle('');
//     setExpenseAmount('');
//     setExpensePaidBy(userEmail);
//     setExpenseParticipants([]);
//   };

//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

//   // Added: Dropdown handlers
//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   // Added: Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const handleCreateGroup = async () => {
//     const name = prompt('Enter group name:');
//     if (name) {
//       try {
//         const response = await axios.post(`${API_BASE}/groups`, { name }, { headers: { Authorization: `Bearer ${token}` } });
//         setGroups([...groups, response.data.group]);
//         alert('Group created! ID: ' + response.data.group._id);
//       } catch (err) {
//         alert('Error: ' + err.message);
//       }
//     }
//   };

//   const handleJoinGroup = async () => {
//     const groupId = prompt('Enter group ID to join:');
//     if (groupId) {
//       try {
//         await axios.post(`${API_BASE}/groups/request`, { groupId }, { headers: { Authorization: `Bearer ${token}` } });
//         alert('Join request sent!');
//       } catch (err) {
//         alert('Error: ' + err.message);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       <nav className="bg-white shadow-lg border-b border-gray-200 px-4 py-4">
//         <div className="flex justify-between items-center max-w-7xl mx-auto">
//           <div className="flex items-center space-x-2 flex-1">
//             <h1 className="text-xl sm:text-2xl font-bold text-emerald-600">Splitify</h1>
//             <span className="text-sm text-gray-500 hidden sm:inline">Dashboard</span>
//           </div>
//           <button onClick={toggleSidebar} className="lg:hidden flex items-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//             </svg>
//           </button>

//           {/* Updated: Responsive dropdown menu */}
//           <div className="relative flex-shrink-0" ref={dropdownRef}>
//             <button 
//               onClick={toggleDropdown}
//               onMouseEnter={() => setIsDropdownOpen(true)}
//               className="flex items-center space-x-2 bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded-md transition-all duration-300 ease-in-out transform"
//             >
//               <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
//                 <span className="text-white text-sm font-semibold">{userEmail.charAt(0).toUpperCase() || 'U'}</span>
//               </div>
//               <span className="text-sm font-medium text-gray-700 hidden md:inline">{userName}</span>
//               <svg 
//                 className={`w-4 h-4 text-gray-500 transition-transform duration-300 hidden md:block ${
//                   isDropdownOpen ? 'rotate-180' : ''
//                 }`} 
//                 fill="none" 
//                 stroke="currentColor" 
//                 viewBox="0 0 24 24"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//               </svg>
//             </button>
//             <div 
//               className={`absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-1 z-50 transition-all duration-300 ease-in-out ${
//                 isDropdownOpen 
//                   ? 'opacity-100 visible transform translate-y-0' 
//                   : 'opacity-0 invisible transform -translate-y-2'
//               }`}
//               onMouseLeave={() => setIsDropdownOpen(false)}
//             >
//               <p className="text-xs text-gray-500 text-center px-4 py-2 border-b">{userEmail}</p>
//               <p className="text-xs text-gray-500 text-center px-4 py-2 border-b">{userPhone}</p>
//               <a 
//                 href="#" 
//                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
//                 onClick={(e) => e.preventDefault()}
//               >
//                 Profile
//               </a>
//               <a 
//                 href="#" 
//                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
//                 onClick={(e) => e.preventDefault()}
//               >
//                 Settings
//               </a>
//               <button 
//                 onClick={() => {
//                   handleLogout();
//                   setIsDropdownOpen(false);
//                 }} 
//                 className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:cursor-pointer transition-colors duration-200"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="flex flex-1 overflow-hidden relative">
//         {loading && <p>Loading...</p>}
//         {error && <p className="text-red-500">{error}</p>}
//         <aside className={`bg-white border-r border-gray-200 shadow-lg transform transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 w-64 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:w-64`}>
//           <div className="p-4 sm:p-6 h-full overflow-y-auto">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Groups</h3>
//             <nav className="space-y-4">
//               <button onClick={handleCreateGroup} className="w-full flex items-center space-x-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-medium hover:bg-emerald-100 transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-sm hover:shadow-md text-left">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                 </svg>
//                 <span>Create Group</span>
//               </button>
//               <button onClick={handleJoinGroup} className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-sm hover:shadow-md text-left">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 7l6 3.6v7.2L18 17V7zM3 7l-6 3.6v7.2L3 17V7z" />
//                 </svg>
//                 <span>Join Group</span>
//               </button>
//             </nav>
//             <div className="mt-8 pt-6 border-t border-gray-200">
//               <h4 className="text-sm font-medium text-gray-500 mb-4">Your Groups</h4>
//               <ul className="space-y-2">
//                 {groups.map((group) => (
//                   <li key={group._id}>
//                     <button onClick={() => { setActiveGroup(group); setIsSidebarOpen(false); }} className={`w-full text-left px-3 py-3 rounded-md transition-all duration-300 ease-in-out ${
//                       activeGroup?._id === group._id ? 'bg-emerald-100 text-emerald-700 font-medium border border-emerald-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
//                     } transform hover:scale-[1.01] text-sm`}>
//                       <div className="font-medium truncate">{group.name}</div>
//                       <div className="text-xs text-gray-500">{group.members.length} members</div>
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </aside>
//         <main className="flex-1 p-4 sm:p-6 overflow-y-auto transition-all duration-300 w-full">
//           {activeGroup && (
//             <div className="mb-6 sm:mb-8 animate-fade-in">
//               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
//                 <div className="w-full sm:w-auto mb-4 sm:mb-0">
//                   <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{activeGroup.name}</h2>
//                   <p className="text-sm text-gray-600 mt-1 break-words">Members: {activeGroup.members.map(m => m.name || m.email).join(', ')}</p>
//                   <p className="text-sm text-gray-600 mt-1">Group ID: {activeGroup._id} (Share to invite)</p>
//                 </div>
//                 <div className={`px-3 py-2 rounded-full text-sm font-semibold w-full sm:w-auto text-center ${
//                   balances[userEmail] > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                 } transition-colors duration-300`}>
//                   Your Balance: ${balances[userEmail] || 0}
//                 </div>
//               </div>
//             </div>
//           )}
//           {activeGroup && joinRequests.length > 0 && (
//             <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Join Requests</h3>
//               <ul className="space-y-4">
//                 {joinRequests.map((req) => (
//                   <li key={req._id} className="p-4 bg-gray-50 rounded-lg shadow-md border border-gray-200">
//                     <p className="font-medium">{req.user.name} ({req.user.email})</p>
//                     <p className="text-sm text-gray-600">Phone: {req.user.phone}</p>
//                     <div className="mt-2">
//                       <button onClick={() => handleApproveReject(req._id, 'accept')} className="mr-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
//                       <button onClick={() => handleApproveReject(req._id, 'decline')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//           <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 animate-slide-up">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses ({expenses.length})</h3>
//             <div className="space-y-4">
//               {expenses.map((expense) => (
//                 <div key={expense._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
//                   <div className="w-full sm:w-auto mb-2 sm:mb-0">
//                     <p className="font-medium text-gray-900">{expense.title}</p>
//                     <p className="text-sm text-gray-500">${expense.amount} • Split equally</p>
//                   </div>
//                   <span className={expense.paidBy === userEmail ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
//                     {expense.paidBy === userEmail ? 'You paid' : 'Owe share'}
//                   </span>
//                 </div>
//               ))}
//             </div>
//             <button onClick={() => setIsAddExpenseModalOpen(true)} className="mt-6 w-full bg-emerald-600 text-white py-3 px-4 rounded-md font-medium hover:bg-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-sm hover:shadow-md">
//               Add New Expense
//             </button>
//           </div>
//         </main>
//       </div>


//       {isAddExpenseModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
//             <h3 className="text-lg font-bold text-gray-900">Add Expense</h3>
//             <form onSubmit={handleAddExpense} className="space-y-4">
//               <input
//                 type="text"
//                 value={expenseTitle}
//                 onChange={(e) => setExpenseTitle(e.target.value)}
//                 placeholder="Title (e.g., Dinner)"
//                 className="w-full p-3 border rounded-md"
//                 required
//               />
//               <input
//                 type="number"
//                 value={expenseAmount}
//                 onChange={(e) => setExpenseAmount(e.target.value)}
//                 placeholder="Amount (e.g., 100)"
//                 className="w-full p-3 border rounded-md"
//                 required
//               />
//               {/* Paid By Select */}
//               <select
//                 value={expensePaidBy}
//                 onChange={(e) => setExpensePaidBy(e.target.value)}
//                 className="w-full p-3 border rounded-md"
//               >
//                 <option value="">Who Paid?</option>

//                 {activeGroup.members.map((m) => (
//                   <option key={m._id} value={m.email}>{m.name || m.email}</option>
//                 ))}
//               </select>
//               {/* Participants Checkboxes */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Participants:</label>
//                 {activeGroup.members.map((m) => (
//                   <div key={m._id} className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={expenseParticipants.includes(m._id)}
//                       onChange={() => setExpenseParticipants(prev =>
//                         prev.includes(m._id) ? prev.filter(id => id !== m._id) : [...prev, m._id]
//                       )}
//                     />
//                     {/* <span className="ml-2">{m.email}</span> */}
//                     <span className="ml-2">{m.name || m.email}</span>
//                   </div>
//                 ))}
//               </div>
//               <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-md">Submit</button>
//               <button type="button" onClick={() => setIsAddExpenseModalOpen(false)} className="w-full bg-gray-300 text-gray-700 py-3 rounded-md mt-2">Cancel</button>
//             </form>
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
//         @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-fade-in { animation: fade-in 0.5s ease-out; }
//         .animate-slide-up { animation: slide-up 0.6s ease-out; }
//       `}</style>
//     </div>
//   );
// }

// export default Dashboard;



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [optimizedTransactions, setOptimizedTransactions] = useState([]); // New: Minimized transactions
  const [isCalculating, setIsCalculating] = useState(false); // New: Loader for recalc
  const [joinRequests, setJoinRequests] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [expenseParticipants, setExpenseParticipants] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(''); // For success popups
  const [copyStatus, setCopyStatus] = useState('Copy ID');

  const API_BASE = 'http://localhost:5666/api';
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    setLoading(true);
    axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setUserEmail(res.data.email);
        setUserName(res.data.name || 'User');
        setUserPhone(res.data.phone || 'N/A');
        setExpensePaidBy(res.data.email); // Default to self
        fetchGroups();
      })
      .catch(() => {
        setError('Session expired. Logging out...');
        handleLogout();
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const fetchGroups = () => {
    axios.get(`${API_BASE}/groups`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setGroups(res.data))
      .catch(err => setError('Failed to load groups: ' + err.message));
  };

  useEffect(() => {
    if (activeGroup && token) {
      setLoading(true);
      axios.get(`${API_BASE}/expenses/${activeGroup._id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setExpenses(res.data.expenses);
          setBalances(res.data.balances);
          calculateOptimizedTransactions(res.data.balances); // Call the function
        })
        .catch(err => setError('Failed to load expenses: ' + err.message));

      axios.get(`${API_BASE}/groups/${activeGroup._id}/requests`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setJoinRequests(res.data))
        .catch(err => {
          if (err.response?.status === 403) {
            setJoinRequests([]);
          } else {
            setError('Failed to load requests: ' + err.message);
          }
        });

      setLoading(false);
    }
  }, [activeGroup, token]);

  const handleApproveReject = async (requestId, action) => {
    try {
      await axios.post(`${API_BASE}/groups/${activeGroup._id}/respond`, { requestId, action }, { headers: { Authorization: `Bearer ${token}` } });
      setJoinRequests(joinRequests.filter(req => req._id !== requestId));
      showNotification(`Request ${action}ed!`);
    } catch (err) {
      setError('Failed to process request: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleCreateGroup = async () => {
    const name = prompt('Enter group name:');
    if (name) {
      try {
        const response = await axios.post(`${API_BASE}/groups`, { name }, { headers: { Authorization: `Bearer ${token}` } });
        setGroups([...groups, response.data.group]);
        showNotification('Group created! ID: ' + response.data.group._id);
      } catch (err) {
        setError('Error creating group: ' + err.message);
      }
    }
  };

  const handleJoinGroup = async () => {
    const groupId = prompt('Enter group ID to join:');
    if (groupId) {
      try {
        await axios.post(`${API_BASE}/groups/request`, { groupId }, { headers: { Authorization: `Bearer ${token}` } });
        showNotification('Join request sent!');
      } catch (err) {
        setError('Error: ' + err.message);
      }
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount || expenseParticipants.length === 0) {
      setError('All fields required');
      return;
    }

    try {
      await axios.post(`${API_BASE}/expenses`, {
        groupId: activeGroup._id,
        title: expenseTitle,
        amount: parseFloat(expenseAmount),
        paidBy: activeGroup.members.find(m => m.email === expensePaidBy)._id,
        participants: expenseParticipants,
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setIsAddExpenseModalOpen(false);
      showNotification('Expense added!');
      // Refresh
      axios.get(`${API_BASE}/expenses/${activeGroup._id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setExpenses(res.data.expenses);
          setBalances(res.data.balances);
          calculateOptimizedTransactions(res.data.balances);
        });
    } catch (err) {
      setError('Failed to add expense: ' + (err.response?.data?.error || err.message));
    }

    // Reset form
    setExpenseTitle('');
    setExpenseAmount('');
    setExpensePaidBy(userEmail);
    setExpenseParticipants([]);
  };

  // New: Function for notification popup
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2000);
  };

  // New: Copy group ID
  const handleCopyGroupId = () => {
    navigator.clipboard.writeText(activeGroup._id);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy ID'), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Notification Popup */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50 animate-fade-in-out">
          <svg className="w-5 h-5 animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p>{notification}</p>
        </div>
      )}

      {/* Navbar - same as before */}
      <nav className="bg-white shadow-lg border-b border-gray-200 px-4 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-600">Splitify</h1>
            <span className="text-sm text-gray-500 hidden sm:inline">Dashboard</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden flex items-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="relative flex-shrink-0 group">
            <button className="flex items-center space-x-2 bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{userEmail.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:inline">{userName}</span>
              <svg className="w-4 h-4 text-gray-500 transition-transform duration-300 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">Profile</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">Settings</a>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        <aside className={`bg-white border-r border-gray-200 shadow-lg transform transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 w-64 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:w-64`}>
          <div className="p-4 sm:p-6 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Groups</h3>
            <nav className="space-y-4">
              <button onClick={handleCreateGroup} className="w-full flex items-center space-x-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-medium hover:bg-emerald-100 transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-sm hover:shadow-md text-left">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Group</span>
              </button>
              <button onClick={handleJoinGroup} className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-sm hover:shadow-md text-left">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 7l6 3.6v7.2L18 17V7zM3 7l-6 3.6v7.2L3 17V7z" />
                </svg>
                <span>Join Group</span>
              </button>
            </nav>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Your Groups</h4>
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li key={group._id}>
                    <button onClick={() => { setActiveGroup(group); setIsSidebarOpen(false); }} className={`w-full text-left px-3 py-3 rounded-md transition-all duration-300 ease-in-out ${
                      activeGroup?._id === group._id ? 'bg-emerald-100 text-emerald-700 font-medium border border-emerald-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                    } transform hover:scale-[1.01] text-sm`}>
                      <div className="font-medium truncate">{group.name}</div>
                      <div className="text-xs text-gray-500">{group.members.length} members</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto transition-all duration-300 w-full">
          {activeGroup && (
            <div className="mb-6 sm:mb-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
                <div className="w-full sm:w-auto mb-4 sm:mb-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{activeGroup.name}</h2>
                  <p className="text-sm text-gray-600 mt-1 break-words">Members: {activeGroup.members.map(m => m.name || m.email).join(', ')}</p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    Group ID: {activeGroup._id} (Share to invite)
                    <button onClick={handleCopyGroupId} className="ml-2 text-blue-600 hover:text-blue-500 text-sm">
                      {copyStatus}
                    </button>
                  </p>
                </div>
                <div className={`px-3 py-2 rounded-full text-sm font-semibold w-full sm:w-auto text-center ${
                  balances[userEmail] > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                } transition-colors duration-300`}>
                  Your Balance: ₹{balances[userEmail] || 0}
                </div>
              </div>
            </div>
          )}
          {activeGroup && joinRequests.length > 0 && (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Join Requests</h3>
              <ul className="space-y-4">
                {joinRequests.map((req) => (
                  <li key={req._id} className="p-4 bg-gray-50 rounded-lg shadow-md border border-gray-200">
                    <p className="font-medium">{req.user.name} ({req.user.email})</p>
                    <p className="text-sm text-gray-600">Phone: {req.user.phone}</p>
                    <div className="mt-2">
                      <button onClick={() => handleApproveReject(req._id, 'accept')} className="mr-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                      <button onClick={() => handleApproveReject(req._id, 'decline')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses History</h3>
            <div className="space-y-4 mb-6">
              {expenses.map((expense) => (
                <div key={expense._id} className="p-4 bg-gray-50 rounded-md shadow border border-gray-200">
                  <p className="font-medium text-gray-900">{expense.title}</p>
                  <p className="text-sm text-gray-600">Amount: ₹{expense.amount}</p> 
                  <p className="text-sm text-gray-600">Paid by: {expense.paidBy === userEmail ? 'You' : expense.paidBy}</p>
                  <p className="text-sm text-gray-600">Participants: {expense.participants.join(', ')}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setIsAddExpenseModalOpen(true)} className="mt-6 w-full bg-emerald-600 text-white py-3 px-4 rounded-md font-medium hover:bg-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-sm hover:shadow-md">
              Add New Expense
            </button>
          </div>

          {/* Optimized Transactions */}
          <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Optimized Transactions
              </h3>
              <button onClick={() => calculateOptimizedTransactions(balances)} disabled={isCalculating} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center">
                {isCalculating ? (
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : null}
                {isCalculating ? 'Calculating...' : 'Recalculate'}
              </button>
            </div>
            <div className="space-y-3">
              {optimizedTransactions.map((tx, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200 flex justify-between items-center">
                  <p className="font-medium text-gray-900">{tx.from} pays {tx.to}</p>
                  <p className="text-red-600 font-semibold">₹{tx.amount.toFixed(2)}</p> 
                </div>
              ))}
              {optimizedTransactions.length === 0 && <p className="text-gray-500 text-center">All settled up!</p>}
            </div>
          </div>
        </main>
      </div>

      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <input
                type="text"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="Title (e.g., Dinner)"
                className="w-full p-3 border rounded-md"
                required
              />
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Amount (e.g., 100)"
                className="w-full p-3 border rounded-md"
                required
              />
              <select
                value={expensePaidBy}
                onChange={(e) => setExpensePaidBy(e.target.value)}
                className="w-full p-3 border rounded-md"
              >
                <option value="">Who Paid?</option>
                {activeGroup.members.map((m) => (
                  <option key={m._id} value={m.email}>{m.name || m.email}</option>
                ))}
              </select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Participants:</label>
                {activeGroup.members.map((m) => (
                  <div key={m._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={expenseParticipants.includes(m._id)}
                      onChange={() => setExpenseParticipants(prev =>
                        prev.includes(m._id) ? prev.filter(id => id !== m._id) : [...prev, m._id]
                      )}
                    />
                    <span className="ml-2">{m.name || m.email}</span>
                  </div>
                ))}
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-md">Submit</button>
              <button type="button" onClick={() => setIsAddExpenseModalOpen(false)} className="w-full bg-gray-300 text-gray-700 py-3 rounded-md mt-2">Cancel</button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-out { 0% { opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { opacity: 0; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-fade-in-out { animation: fade-in-out 2s ease-in-out; }
      `}</style>
    </div>
  );
}

export default Dashboard;