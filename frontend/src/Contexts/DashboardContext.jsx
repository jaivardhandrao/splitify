import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [optimizedTransactions, setOptimizedTransactions] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [user, setUser] = useState({ email: '', name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [currentCurrency, setCurrentCurrency] = useState('INR');
  const [updatingExpenses, setUpdatingExpenses] = useState({});
  const [isExpenseHistoryLoading, setIsExpenseHistoryLoading] = useState(false);

  // NEW: MyExpenses state
  const [myExpenses, setMyExpenses] = useState([]);
  const [myExpensesTotalSpent, setMyExpensesTotalSpent] = useState(0);
  const [isMyExpensesLoading, setIsMyExpensesLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const APP_URL = 'https://splitify-pi.vercel.app/';
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Error:', error);
  }, [error]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    setLoading(true);
    axios
      .get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUser({
          email: res.data.email,
          name: res.data.name || 'User',
          phone: res.data.phone || 'N/A',
        });
        fetchGroups();
      })
      .catch(() => {
        setError('Session expired. Logging out...');
        localStorage.removeItem('token');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const fetchGroups = () => {
    axios
      .get(`${API_BASE}/groups`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setGroups(res.data))
      .catch((err) => setError('Failed to load groups: ' + err.message));
  };

  // NEW: Fetch My Expenses function
  const fetchMyExpenses = async () => {
    if (!token) return;
    
    setIsMyExpensesLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/expenses/my/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyExpenses(response.data.expenses);
      setMyExpensesTotalSpent(response.data.totalSpent);
    } catch (err) {
      console.error('Failed to fetch my expenses:', err);
      setError('Failed to load your expenses');
    } finally {
      setIsMyExpensesLoading(false);
    }
  };

  useEffect(() => {
    if (activeGroup === null) {
      setExpenses([]);
      setBalances({});
      setOptimizedTransactions([]);
      setIsExpenseHistoryLoading(false);
      return;
    }
    if (activeGroup && token) {
      setLoading(true);
      setIsExpenseHistoryLoading(true);

      axios
        .get(`${API_BASE}/expenses/${activeGroup._id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setExpenses(res.data.expenses);
          setBalances(res.data.balances);
          setIsExpenseHistoryLoading(false);
        })
        .catch((err) => {
          setError('Failed to load expenses: ' + err.message);
          setIsExpenseHistoryLoading(false);
        })
        .finally(() => setLoading(false));

      axios
        .get(`${API_BASE}/groups/${activeGroup._id}/requests`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setJoinRequests(res.data))
        .catch((err) => {
          if (err.response?.status === 403) {
            setJoinRequests([]);
          } else {
            setError('Failed to load requests: ' + err.message);
          }
        });
    }
  }, [activeGroup, token]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCreateGroup = async (name) => {
    if (!name) return;
    try {
      const response = await axios.post(
        `${API_BASE}/groups`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroups([...groups, response.data.group]);
      showNotification('Group created! ID: ' + response.data.group._id);
      fetchGroups();
    } catch (err) {
      setError('Error creating group: ' + err.message);
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!groupId) return;
    try {
      await axios.post(
        `${API_BASE}/groups/request`,
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('Join request sent!');
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const calculateOptimizedTransactions = () => {
    if (!activeGroup || !activeGroup.members || expenses.length === 0) {
      setOptimizedTransactions([]);
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);

    const computedBalances = {};
    activeGroup.members.forEach((member) => {
      computedBalances[member._id.toString()] = 0;
    });

    expenses.forEach((expense) => {
      if (expense.splitType !== 'equal' || expense.isSettled === true) {
        return;
      }
      const share = expense.amount / (expense.participants ? expense.participants.length : 1);
      const paidById = expense.paidBy?._id?.toString() || expense.paidBy;

      if (paidById && computedBalances[paidById] !== undefined) {
        computedBalances[paidById] += expense.amount;
      }

      if (expense.participants && Array.isArray(expense.participants)) {
        expense.participants.forEach((participantObj) => {
          const pId = participantObj?._id?.toString() || participantObj;
          if (pId && computedBalances[pId] !== undefined) {
            computedBalances[pId] -= share;
          }
        });
      }
    });

    const debtors = [];
    const creditors = [];
    Object.entries(computedBalances).forEach(([userId, amount]) => {
      if (amount < -0.01) {
        debtors.push({ userId, amount: Math.abs(amount) });
      } else if (amount > 0.01) {
        creditors.push({ userId, amount });
      }
    });

    const transactions = [];
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let debtorIdx = 0;
    let creditorIdx = 0;
    while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
      const debtor = debtors[debtorIdx];
      const creditor = creditors[creditorIdx];
      const payAmount = Math.min(debtor.amount, creditor.amount);

      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: payAmount,
      });

      debtor.amount -= payAmount;
      creditor.amount -= payAmount;

      if (debtor.amount < 0.01) debtorIdx++;
      if (creditor.amount < 0.01) creditorIdx++;
    }

    const namedTransactions = transactions.map((tx) => {
      const fromMember = activeGroup.members.find((m) => m._id.toString() === tx.from);
      const toMember = activeGroup.members.find((m) => m._id.toString() === tx.to);
      return {
        from: fromMember
          ? fromMember.email === user.email
            ? 'You'
            : fromMember.name || fromMember.email
          : tx.from,
        to: toMember
          ? toMember.email === user.email
            ? 'You'
            : toMember.name || toMember.email
          : tx.to,
        amount: tx.amount,
      };
    });

    setTimeout(() => {
      setOptimizedTransactions(namedTransactions);
      setIsCalculating(false);
    }, 1000);
  };

  const value = {
    groups,
    setGroups,
    activeGroup,
    setActiveGroup,
    expenses,
    setExpenses,
    balances,
    setBalances,
    optimizedTransactions,
    setOptimizedTransactions,
    isCalculating,
    joinRequests,
    setJoinRequests,
    user,
    loading,
    setLoading,
    error,
    setError,
    notification,
    currentCurrency,
    setCurrentCurrency,
    updatingExpenses,
    setUpdatingExpenses,
    isExpenseHistoryLoading,
    setIsExpenseHistoryLoading,
    // NEW: MyExpenses exports
    myExpenses,
    setMyExpenses,
    myExpensesTotalSpent,
    setMyExpensesTotalSpent,
    isMyExpensesLoading,
    setIsMyExpensesLoading,
    fetchMyExpenses,
    // Existing functions
    showNotification,
    fetchGroups,
    handleCreateGroup,
    handleJoinGroup,
    handleLogout,
    calculateOptimizedTransactions,
    API_BASE,
    APP_URL,
    token,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};