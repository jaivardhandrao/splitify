import React, { useRef, useMemo, createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [optimizedTransactions, setOptimizedTransactions] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
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
  const [notification, setNotification] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy ID');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveError, setLeaveError] = useState(''); // For balance error
  const [isPressed, setIsPressed] = useState(false); // For button press effect
  const [expenseIsSettled, setExpenseIsSettled] = useState(false); // New state for settled status
  const [updatingExpenses, setUpdatingExpenses] = useState({});
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isExpenseHistoryLoading, setIsExpenseHistoryLoading] = useState(false);


  
  // OLD
  // const API_BASE = 'http://localhost:5666/api';

  // NEW

  // log the error instead of showing it to the ui

  useEffect(() => {
    console.log('Error:', error);
  }, [error])


  const APP_URL = 'https://splitify-pi.vercel.app/'
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5666/api';

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
        setExpensePaidBy(res.data.email);
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
      setIsExpenseHistoryLoading(true); // Start expense history loading

      axios.get(`${API_BASE}/expenses/${activeGroup._id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setExpenses(res.data.expenses);
          setBalances(res.data.balances);
          // calculateOptimizedTransactions(res.data.balances);
          setIsExpenseHistoryLoading(false); // Stop expense history loading on success
        })
        .catch(err => {
          setError('Failed to load expenses: ' + err.message);
          setIsExpenseHistoryLoading(false); // Stop expense history loading on error
        });

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

    setProcessingRequestId(requestId);
    setProcessingAction(action); // for loader

    try {
      await axios.post(`${API_BASE}/groups/${activeGroup._id}/respond`, { requestId, action }, { headers: { Authorization: `Bearer ${token}` } });
      setJoinRequests(joinRequests.filter(req => req._id !== requestId));
      showNotification(`Request ${action}ed!`);
      setProcessingRequestId(null);
      setProcessingAction(null);
    } catch (err) {
      setError('Failed to process request: ' + err.message);
      setProcessingAction(null);
      setProcessingRequestId(null);
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
    setIsSubmittingExpense(true);
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
      axios.get(`${API_BASE}/expenses/${activeGroup._id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setExpenses(res.data.expenses);
          setBalances(res.data.balances);
          // calculateOptimizedTransactions(res.data.balances);
        });
    } catch (err) {
      setError('Failed to add expense: ' + (err.response?.data?.error || err.message));
    }

    setExpenseTitle('');
    setExpenseAmount('');
    setExpensePaidBy(userEmail);
    setExpenseParticipants([]);
    setIsSubmittingExpense(false);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleShareGroupId = async () => {
    if (!activeGroup) return;

    const shareData = {
      title: `Join ${activeGroup.name} on Splitify!`,
      text: `Hi! You're invited to join "${activeGroup.name}" on Splitify by ${userName}. Use Group ID: ${activeGroup._id} to join. Download the app or visit ${APP_URL} to get started!`,
      url: `${APP_URL}/`
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showNotification('Group shared successfully!');
        return;
      }
    } catch (err) {
      console.log('Share failed:', err);
    }

    // setIsShareModalOpen(true);
  };


  useEffect(() => {

    setOptimizedTransactions([]);

    setIsExpenseHistoryLoading(true); // Start loading when group changes

  }, [activeGroup]);


  const calculateOptimizedTransactions = (currentBalances) => {  // Ignore param, use expenses
    // console.log('Expenses for calculation:', expenses);  

    if (!activeGroup || !activeGroup.members || expenses.length === 0) {
      // console.log('No group, members, or expenses, returning empty');
      setOptimizedTransactions([]);
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);

    // Step A: Build pairwise flows from the raw expenses (participant -> paidBy)
    const pairFlows = {}; // { fromId: { toId: amount, ... }, ... }
    expenses.forEach(expense => {
      if (expense.splitType !== 'equal' || expense.isSettled) return;
      const share = expense.amount / (expense.participants?.length || 1);
      const paidById = expense.paidBy?._id?.toString() || expense.paidBy;
      if (!expense.participants || !Array.isArray(expense.participants)) return;

      expense.participants.forEach(participantObj => {
        const pId = participantObj?._id?.toString() || participantObj;
        if (!pId || pId === paidById) return; // skip payer paying themself
        pairFlows[pId] = pairFlows[pId] || {};
        pairFlows[pId][paidById] = (pairFlows[pId][paidById] || 0) + share;
      });
    });

    // Step B: Net opposite flows only between same pair (A->B vs B->A)
    const EPS = 0.01;
    Object.keys(pairFlows).forEach(a => {
      Object.keys(pairFlows[a]).forEach(b => {
        if (!pairFlows[b] || !pairFlows[b][a]) return;
        const amtAB = pairFlows[a][b];
        const amtBA = pairFlows[b][a];
        const net = Math.min(amtAB, amtBA);
        if (net > EPS) {
          pairFlows[a][b] -= net;
          pairFlows[b][a] -= net;
        }
        // clean very small values
        if (pairFlows[a][b] <= EPS) delete pairFlows[a][b];
        if (pairFlows[b][a] <= EPS) delete pairFlows[b][a];
      });
    });

    // Step C: Emit transactions from remaining pairFlows (no new cross-pairs)
    const transactions = [];
    Object.keys(pairFlows).forEach(from => {
      Object.keys(pairFlows[from]).forEach(to => {
        const amt = pairFlows[from][to];
        if (amt > EPS) transactions.push({ from, to, amount: amt });
      });
    });

    // Step D: Map ids to names/emails like you already do
    const namedTransactions = transactions.map(tx => {
      const fromMember = activeGroup.members.find(m => m._id.toString() === tx.from);
      const toMember = activeGroup.members.find(m => m._id.toString() === tx.to);
      return {
        from: fromMember ? (fromMember.email === userEmail ? 'You' : (fromMember.name || fromMember.email)) : tx.from,
        to: toMember ? (toMember.email === userEmail ? 'You' : (toMember.name || toMember.email)) : tx.to,
        amount: tx.amount
      };
    });

    setTimeout(() => {
      setOptimizedTransactions(namedTransactions);
      setIsCalculating(false);
    }, 1000);


  };

  const handleRecalculateClick = () => {
    if (!isCalculating && activeGroup) {
      calculateOptimizedTransactions(balances);
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeGroup) return;

    const userBalance = balances[userEmail] || 0;
    if (Math.abs(userBalance) > 0.01) {
      setLeaveError(`Cannot leave. You have a pending balance of ₹${Math.abs(userBalance).toFixed(2)}. Settle it first.`);
      return;
    }

    try {
      await axios.post(`${API_BASE}/groups/${activeGroup._id}/leave`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showNotification('Successfully left the group!');
      setActiveGroup(null);
      fetchGroups();
    } catch (err) {
      setLeaveError(err.response?.data?.error || 'Failed to leave group.');
    }
  };

  const handleCopyGroupId = async () => {
    try {
      await navigator.clipboard.writeText(activeGroup._id);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = activeGroup._id;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    }
  };

  // Add this function to toggle dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Add this function to close dropdown when clicking outside
  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50 animate-fade-in-out">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p>{notification}</p>
        </div>
      )}

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
          <div className="relative flex-shrink-0">
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center space-x-2 bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded-md transition-all duration-300 ease-in-out transform"
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{userEmail.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:inline">{userName}</span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 hidden md:block ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu - now controlled by state for mobile compatibility */}
            <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 transition-all duration-300 ease-in-out ${isProfileDropdownOpen
              ? 'opacity-100 visible transform translate-y-0'
              : 'opacity-0 invisible transform -translate-y-2'
              }`}>
              <a
                href="#"
                onClick={closeProfileDropdown}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Profile
              </a>
              <a
                href="#"
                onClick={closeProfileDropdown}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Settings
              </a>
              <button
                onClick={() => {
                  handleLogout();
                  closeProfileDropdown();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Invisible overlay to close dropdown when clicking outside (mobile) */}
        {isProfileDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={closeProfileDropdown}
          ></div>
        )}

        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={closeSidebar}
          ></div>
        )}
      </nav>



      <div className="flex flex-1 overflow-hidden relative">
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

              {groups.length === 0 ? (
                // Modern loading state
                <div className="space-y-3">
                  {/* Loading text with animated dots */}
                  <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
                        <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                        <span className="font-medium">Loading groups</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skeleton loading cards */}
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="animate-pulse">
                      <div className="w-full px-3 py-3 rounded-md bg-gray-100 border border-gray-200">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Actual groups list
                <ul className="space-y-2">
                  {groups.map((group) => (
                    <li key={group._id}>
                      <button
                        onClick={() => { setActiveGroup(group); setIsSidebarOpen(false); }}
                        className={`w-full text-left px-3 py-3 rounded-md transition-all duration-300 ease-in-out ${activeGroup?._id === group._id
                          ? 'bg-emerald-100 text-emerald-700 font-medium border border-emerald-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                          } transform hover:scale-[1.01] text-sm`}
                      >
                        <div className="font-medium truncate">{group.name}</div>
                        <div className="text-xs text-gray-500">{group.members.length} members</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
                  <div className="text-sm text-gray-600 mt-1 flex items-center flex-wrap gap-2">
                    <span>Group ID: {activeGroup._id} (Share to invite)</span>
                    <button
                      onClick={handleCopyGroupId}
                      className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-md transition-all duration-200 border border-blue-200 hover:border-blue-300"
                    >
                      {copied ? (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleShareGroupId}
                      className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-md transition-all duration-200 border border-blue-200 hover:border-blue-300"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span>Share ID</span>
                    </button>
                  </div>
                </div>
                {/* floating button for adding expense */}
                <button
                  onClick={() => setIsAddExpenseModalOpen(true)}
                  className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg hover:shadow-xl z-50 flex items-center justify-center group"
                >
                  <svg
                    className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>

                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Add New Expense
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                  </div>
                </button>
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
                    <div className="mt-2 flex items-center">
                      <button
                        onClick={() => handleApproveReject(req._id, 'accept')}
                        disabled={processingRequestId === req._id}
                        className={`mr-2 px-3 py-1 rounded flex items-center transition-all duration-300 ${processingRequestId === req._id && processingAction === 'decline'
                          ? 'opacity-30 bg-gray-300 text-gray-500'
                          : processingRequestId === req._id && processingAction === 'accept'
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                      >
                        {processingRequestId === req._id && processingAction === 'accept' ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                        className={`px-3 py-1 rounded flex items-center transition-all duration-300 ${processingRequestId === req._id && processingAction === 'accept'
                          ? 'opacity-30 bg-gray-300 text-gray-500'
                          : processingRequestId === req._id && processingAction === 'decline'
                            ? 'bg-red-600 text-white cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                      >
                        {processingRequestId === req._id && processingAction === 'decline' ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
          )}
          {/* Optimized Transactions */}

          <div className="mt-8 my-5 bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Optimized Transactions
              </h3>
              <button
                onClick={handleRecalculateClick}
                disabled={isCalculating || !activeGroup}
                className="px-4 py-2 bg-emerald-600 text-white cursor-pointer rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300 ease-in-out transform shadow-md hover:shadow-lg optimize-btn-container"
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => setIsPressed(false)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: (isCalculating || !activeGroup) ? 'not-allowed' : 'pointer',
                  minWidth: '220px',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isPressed ? 'translateY(-1px) scale(0.98)' :
                    (isCalculating || !activeGroup) ? 'none' : 'translateY(0) scale(1)',
                  boxShadow: (isCalculating || !activeGroup)
                    ? '0 4px 16px rgba(16,185,129,0.1)'
                    : isCalculating
                      ? '0 16px 48px rgba(16,185,129,0.4), 0 8px 24px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                      : '0 8px 32px rgba(16,185,129,0.3), 0 4px 16px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                  opacity: (isCalculating || !activeGroup) ? 0.6 : 1,
                }}
              >
                {isCalculating ? (
                  <>
                    <svg
                      className="lightning-icon"
                      style={{
                        width: '20px',
                        height: '20px',
                        color: '#a7f3d0',
                        filter: 'drop-shadow(0 0 8px rgba(167,243,208,0.6))',
                        transition: 'all 0.3s ease',
                        animation: 'energyPulse 1.5s infinite ease-in-out',
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span
                      className="btn-text"
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Optimizing Transactions...
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="lightning-icon"
                      style={{
                        width: '20px',
                        height: '20px',
                        color: '#a7f3d0',
                        filter: 'drop-shadow(0 0 8px rgba(167,243,208,0.6))',
                        transition: 'all 0.3s ease',
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span
                      className="btn-text"
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Recalculate
                    </span>
                  </>
                )}
              </button>
            </div>
            <div className="space-y-3 cursor-pointer">
              {optimizedTransactions.map((tx, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200 flex justify-between items-center">
                  <p className="font-medium text-gray-900">{tx.from} will pay {tx.to}</p>
                  <p className="text-red-600 font-semibold">₹{tx.amount.toFixed(2)}</p>
                </div>
              ))}
              {optimizedTransactions.length === 0 && <p className="text-gray-500 text-center">All settled up!</p>}
            </div>
          </div>



          {/* Expenses History */}

          {/* Add expense button stays at bottom */}
          {activeGroup && (
            <button
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="group relative w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] border border-emerald-400/20 overflow-hidden"
            >
              {/* Subtle animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

              {/* Content */}
              <div className="relative flex items-center justify-center space-x-2">
                <svg
                  className="w-6 h-6 transition-transform group-hover:rotate-180 duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="relative">Add New Expense</span>
              </div>

              {/* Bottom highlight */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-300/0 via-emerald-300/80 to-emerald-300/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
            </button>
          )}




          <div className="bg-white my-5 rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses History</h3>

            {/* Scrollable container with fixed height */}
            <div className="max-h-150 overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-4">
                {isExpenseHistoryLoading ? (
                  // Skeleton Loading State
                  <>
                    {[1, 2, 3, 4, 5].map((skeleton) => (
                      <div key={skeleton} className="p-4 bg-gray-50 rounded-md shadow border border-gray-200 animate-pulse">
                        <div className="flex justify-between items-start mb-2">
                          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-32"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-20"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-24"></div>
                          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-36"></div>
                          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-48"></div>
                        </div>
                        <div className="mt-2 flex items-center">
                          <div className="h-5 w-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded"></div>
                          <div className="ml-2 h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  // Actual Expenses Content
                  expenses
                    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                    .map((expense) => {
                      const paidById = expense.paidBy?._id || expense.paidBy;
                      const paidByMember = activeGroup.members.find(m => m._id.toString() === paidById.toString());
                      const paidByDisplay = paidByMember
                        ? (paidByMember.email === userEmail ? 'You' : (paidByMember.name || paidByMember.email))
                        : (expense.paidBy?.name || 'Unknown');

                      const participantDisplays = expense.participants.map((participantObj) => {
                        const participantId = participantObj?._id || participantObj;
                        const participantMember = activeGroup.members.find(m => m._id.toString() === participantId.toString());
                        return participantMember
                          ? (participantMember.email === userEmail ? 'You' : (participantMember.name || participantMember.email))
                          : participantId;
                      }).join(', ');

                      // Get loading state for this specific expense
                      const isUpdating = updatingExpenses[expense._id] || false;

                      // Handler to toggle isSettled with loading state
                      const handleToggleSettled = async () => {
                        // Set loading state for this specific expense
                        setUpdatingExpenses(prev => ({ ...prev, [expense._id]: true }));
                        try {
                          await axios.patch(`${API_BASE}/expenses/${expense._id}`, {
                            isSettled: !expense.isSettled
                          }, { headers: { Authorization: `Bearer ${token}` } });
                          showNotification(`Expense marked as ${!expense.isSettled ? 'settled' : 'unsettled'}!`);
                          // Refresh expenses to update the UI
                          const res = await axios.get(`${API_BASE}/expenses/${activeGroup._id}`, { headers: { Authorization: `Bearer ${token}` } });
                          setExpenses(res.data.expenses);
                          setBalances(res.data.balances);
                          calculateOptimizedTransactions(res.data.balances);
                        } catch (err) {
                          setError(`Failed to update expense: ${err.response?.data?.error || err.message}`);
                        } finally {
                          // Remove loading state for this specific expense
                          setUpdatingExpenses(prev => {
                            const newState = { ...prev };
                            delete newState[expense._id];
                            return newState;
                          });
                        }
                      };

                      return (
                        <div key={expense._id} className="p-4 bg-gray-50 rounded-md shadow border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-gray-900">{expense.title}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(expense.createdAt || expense.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Amount: ₹{expense.amount}</p>
                          <p className="text-sm text-gray-600">Paid by: {paidByDisplay}</p>
                          <p className="text-sm text-gray-600">Participants: {participantDisplays}</p>
                          {/* Settled/Unsettled Toggle with Loader */}
                          <div className="mt-2 flex items-center">
                            <div className="relative">
                              <input
                                type="checkbox"
                                id={`settled-${expense._id}`}
                                checked={expense.isSettled || false}
                                onChange={handleToggleSettled}
                                disabled={isUpdating}
                                className={`h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 transition-all duration-200 ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                              />
                              {isUpdating && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                            </div>
                            <label
                              htmlFor={`settled-${expense._id}`}
                              className={`ml-2 text-sm font-medium transition-colors ${isUpdating
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-700 hover:text-emerald-600'
                                }`}
                            >
                              {expense.isSettled ? 'Settled' : 'Unsettled'}
                              {isUpdating && <span className="ml-1 text-xs">(updating...)</span>}
                            </label>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>



        </main>
      </div>

      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full space-y-4 mx-4">
            <h3 className="text-lg font-bold text-gray-900">Add Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <input
                type="text"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="Title (e.g., Dinner)"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
                disabled={isSubmittingExpense}
              />
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Amount (e.g., 100)"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
                disabled={isSubmittingExpense}
              />
              <select
                value={expensePaidBy}
                onChange={(e) => setExpensePaidBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                disabled={isSubmittingExpense}
              >
                <option value="">Who Paid?</option>
                {activeGroup.members.map((m) => (
                  <option key={m._id} value={m.email}>{m.name || m.email}</option>
                ))}
              </select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Participants:</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {activeGroup.members.map((m) => (
                    <div key={m._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`participant-${m._id}`}
                        checked={expenseParticipants.includes(m._id)}
                        onChange={() => setExpenseParticipants(prev =>
                          prev.includes(m._id) ? prev.filter(id => id !== m._id) : [...prev, m._id]
                        )}
                        disabled={isSubmittingExpense}
                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <label htmlFor={`participant-${m._id}`} className="ml-2 text-sm text-gray-700">
                        {m.name || m.email}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button with Loader */}
              <button
                type="submit"
                disabled={isSubmittingExpense}
                className={`w-full py-3 rounded-md font-medium transition-all duration-200 ${isSubmittingExpense
                  ? 'bg-emerald-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
                  } text-white flex items-center justify-center space-x-2`}
              >
                {isSubmittingExpense ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Expense...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsAddExpenseModalOpen(false)}
                disabled={isSubmittingExpense}
                className={`w-full py-3 rounded-md font-medium transition-all duration-200 ${isSubmittingExpense
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {isShareModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Share Group Invitation</h3>
            <p className="text-sm text-gray-600">Share this with friends to invite them:</p>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-sm font-mono break-all">{activeGroup._id}</p>
              <p className="text-xs text-gray-500 mt-1">Group: {activeGroup.name} | Invited by: {userName}</p>
            </div>
            <textarea
              readOnly
              value={`Hi! You're invited to join "${activeGroup.name}" on Splitify by ${userName}. Use Group ID: ${activeGroup._id} to join. Download the app or visit ${APP_URL} to get started!`}
              className="w-full p-3 border rounded-md resize-none text-sm"
              rows={3}
              placeholder="Preset message (copy and paste)"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Hi! You're invited to join "${activeGroup.name}" on Splitify by ${userName}. Use Group ID: ${activeGroup._id} to join. Download the app or visit ${APP_URL} to get started!`);
                  showNotification('Message copied!');
                }}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700"
              >
                Copy Message
              </button>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isLeaveModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Leave Group?</h3>
            <p className="text-sm text-gray-600">Are you sure you want to leave "{activeGroup.name}"? This action cannot be undone.</p>
            {leaveError && <p className="text-red-600 text-sm">{leaveError}</p>}
            <div className="flex space-x-2">
              <button
                onClick={handleLeaveGroup}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
              >
                Confirm Leave
              </button>
              <button
                onClick={() => {
                  setIsLeaveModalOpen(false);
                  setLeaveError('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`

      @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-out { 0% { opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes energyPulse {
          0%, 100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 8px rgba(167,243,208,0.6)); }
          25% { transform: rotate(90deg) scale(1.1); filter: drop-shadow(0 0 16px rgba(167,243,208,1)); }
          50% { transform: rotate(180deg) scale(1.2); filter: drop-shadow(0 0 20px rgba(255,255,255,1)); }
          75% { transform: rotate(270deg) scale(1.1); filter: drop-shadow(0 0 16px rgba(167,243,208,1)); }
        }
        .optimize-btn-container {
          position: relative;
        }
        .optimize-btn-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.6s ease-in-out;
          pointer-events: none;
          border-radius: 12px;
        }
        .optimize-btn-container:hover::before {
          left: 100%;
        }
        .optimize-btn-container:hover .lightning-icon {
          color: #ffffff;
          filter: drop-shadow(0 0 12px rgba(255,255,255,0.8)) !important;
        }
        .optimize-btn-container:hover .btn-text {
          text-shadow: 0 0 8px rgba(255,255,255,0.6);
        }
        .optimize-btn-container:hover {
          transform: translateY(-3px) scale(1.02) !important;
          background: linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%) !important;
          box-shadow: 0 16px 48px rgba(16,185,129,0.4), 0 8px 24px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.3) !important;
        }
        .optimize-btn-container:active {
          transform: translateY(-1px) scale(0.98) !important;
          transition: all 0.1s ease !important;
        }
        .optimize-btn-container:disabled:hover {
          transform: none !important;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%) !important;
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-fade-in-out { animation: fade-in-out 3s ease-in-out; }
      `}</style>
    </div>
  );
}

export default Dashboard;