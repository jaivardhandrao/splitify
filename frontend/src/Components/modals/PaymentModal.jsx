import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '../../Contexts/DashboardContext';
import axios from 'axios';

const PaymentModal = ({ isOpen, onClose }) => {
  const { activeGroup, user, API_BASE, token, expenses, pastMembers, currentCurrency } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [userBalances, setUserBalances] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [customAmounts, setCustomAmounts] = useState({});
  const [processingPayment, setProcessingPayment] = useState(null);
  const [upiIds, setUpiIds] = useState({});
  const [settlementOnlyMode, setSettlementOnlyMode] = useState(true);
  const [showAppSelector, setShowAppSelector] = useState(null); // { userId, amount, isCustom }

  // Device detection
  const isMobile = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  const isIOS = () => {
    return /iPad|iPhone|iPod/i.test(navigator.userAgent);
  };

  const isAndroid = () => {
    return /Android/i.test(navigator.userAgent);
  };

  // Calculate balances when modal opens
  useEffect(() => {
    if (!isOpen || !activeGroup) return;

    calculateBalances();
    preloadUpiIds(); // Preload UPI IDs for filtering
  }, [isOpen, activeGroup, expenses]);

  // Preload UPI IDs for all members to filter those without UPI
  const preloadUpiIds = async () => {
    if (!activeGroup || !activeGroup.members) return;

    const allMemberIds = [
      ...activeGroup.members.map(m => m._id.toString()),
      ...pastMembers.filter(pm => pm.user && pm.user._id).map(pm => pm.user._id.toString())
    ];

    // Fetch UPI IDs for all members
    const upiPromises = allMemberIds.map(async (userId) => {
      if (userId === user._id.toString()) return; // Skip current user
      if (upiIds[userId]) return; // Already cached

      try {
        const response = await axios.get(`${API_BASE}/auth/user/${userId}/upi`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return { userId, upiId: response.data.upiId };
      } catch (error) {
        return { userId, upiId: null };
      }
    });

    const results = await Promise.all(upiPromises);
    const newUpiIds = {};
    results.forEach(result => {
      if (result && result.userId) {
        newUpiIds[result.userId] = result.upiId || null;
      }
    });

    setUpiIds(prev => ({ ...prev, ...newUpiIds }));
  };

  const calculateBalances = () => {
    setIsLoading(true);
    
    const balances = {};
    
    // Initialize balances for current members
    activeGroup.members.forEach((member) => {
      balances[member._id.toString()] = {
        userId: member._id,
        name: member.name || member.email,
        email: member.email,
        balance: 0,
        isPast: false
      };
    });
    
    // Initialize balances for past members
    pastMembers.forEach((pm) => {
      if (pm.user && pm.user._id) {
        balances[pm.user._id.toString()] = {
          userId: pm.user._id,
          name: pm.user.name || pm.user.email,
          email: pm.user.email,
          balance: 0,
          isPast: true
        };
      }
    });

    // Calculate balances from expenses
    expenses.forEach((expense) => {
      if (expense.splitType !== 'equal' || expense.isSettled === true) {
        return;
      }
      
      const share = expense.amount / (expense.participants ? expense.participants.length : 1);
      const paidById = expense.paidBy?._id?.toString() || expense.paidBy;

      if (paidById && balances[paidById]) {
        balances[paidById].balance += expense.amount;
      }

      if (expense.participants && Array.isArray(expense.participants)) {
        expense.participants.forEach((participantObj) => {
          const pId = participantObj?._id?.toString() || participantObj;
          if (pId && balances[pId]) {
            balances[pId].balance -= share;
          }
        });
      }
    });

    // Calculate what current user owes to others (negative balance means user owes)
    const currentUserId = user._id.toString();
    const currentUserBalance = balances[currentUserId]?.balance || 0;
    
    // For each user, calculate how much the current user owes them
    const userOwes = {};
    Object.entries(balances).forEach(([userId, data]) => {
      if (userId === currentUserId) return;
      
      // If other user has positive balance and current user has negative balance
      // Calculate the amount current user owes to this specific user
      const otherBalance = data.balance;
      
      if (otherBalance > 0.01 && currentUserBalance < -0.01) {
        // Simplified: distribute the owed amount proportionally
        const totalPositive = Object.values(balances)
          .filter(b => b.balance > 0.01)
          .reduce((sum, b) => sum + b.balance, 0);
        
        const proportionalOwed = (Math.abs(currentUserBalance) * otherBalance) / totalPositive;
        userOwes[userId] = {
          ...data,
          amountOwed: Math.max(0, Math.min(proportionalOwed, otherBalance))
        };
      }
    });

    setUserBalances(userOwes);
    setIsLoading(false);
  };

  // Fetch UPI IDs for users
  const fetchUpiId = async (userId) => {
    if (upiIds[userId]) return upiIds[userId];
    
    try {
      const response = await axios.get(`${API_BASE}/auth/user/${userId}/upi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const upiId = response.data.upiId;
      setUpiIds(prev => ({ ...prev, [userId]: upiId }));
      return upiId;
    } catch (error) {
      console.error('Failed to fetch UPI ID:', error);
      return null;
    }
  };

  // Filter users based on search and settlement mode
  const filteredUsers = useMemo(() => {
    if (settlementOnlyMode) {
      // Show only users with pending settlements AND have UPI ID
      return Object.entries(userBalances).filter(([userId, data]) => {
        if (!data.amountOwed || data.amountOwed < 0.01) return false;
        
        // Hide users without UPI ID
        if (!upiIds[userId] || upiIds[userId].trim() === '') return false;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          data.name.toLowerCase().includes(searchLower) ||
          data.email.toLowerCase().includes(searchLower)
        );
      });
    } else {
      // Show all group members who have UPI ID
      if (!activeGroup || !activeGroup.members) return [];
      
      const allMembers = [];
      
      // Add current members with UPI ID
      activeGroup.members.forEach(member => {
        if (member._id.toString() === user._id.toString()) return; // Skip current user
        
        const userId = member._id.toString();
        // Hide users without UPI ID
        if (!upiIds[userId] || upiIds[userId].trim() === '') return;
        
        const searchLower = searchTerm.toLowerCase();
        const name = member.name || member.email;
        const email = member.email;
        
        if (
          name.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        ) {
          allMembers.push([
            userId,
            {
              userId: member._id,
              name: name,
              email: email,
              amountOwed: userBalances[userId]?.amountOwed || 0,
              isPast: false
            }
          ]);
        }
      });
      
      // Add past members with UPI ID
      pastMembers.forEach(pm => {
        if (!pm.user || !pm.user._id) return;
        if (pm.user._id.toString() === user._id.toString()) return; // Skip current user
        
        const userId = pm.user._id.toString();
        // Hide users without UPI ID
        if (!upiIds[userId] || upiIds[userId].trim() === '') return;
        
        const searchLower = searchTerm.toLowerCase();
        const name = pm.user.name || pm.user.email;
        const email = pm.user.email;
        
        if (
          name.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        ) {
          allMembers.push([
            userId,
            {
              userId: pm.user._id,
              name: name,
              email: email,
              amountOwed: userBalances[userId]?.amountOwed || 0,
              isPast: true
            }
          ]);
        }
      });
      
      return allMembers;
    }
  }, [userBalances, searchTerm, settlementOnlyMode, activeGroup, pastMembers, user, upiIds]);

  // Build UPI payment URL
  const buildUpiQuery = ({ pa, pn, am, tn, cu = 'INR' }) => {
    const params = new URLSearchParams();
    params.set('pa', pa); // UPI ID
    if (pn) params.set('pn', pn);
    if (am) params.set('am', String(am));
    params.set('cu', cu);
    if (tn) params.set('tn', tn);
    return params.toString();
  };

  const openPayment = ({ pa, pn, am, tn, from, to, appType }) => {
    if (!isMobile()) {
      return; // Desktop fallback will show UPI ID
    }

    const q = buildUpiQuery({ pa, pn, am, tn });
    let deepLink = '';

    // Build app-specific deep links based on user selection
    if (appType === 'gpay') {
      // Google Pay
      if (isIOS()) {
        deepLink = `gpay://upi/pay?${q}`;
      } else if (isAndroid()) {
        deepLink = `intent://pay?${q}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
      } else {
        deepLink = `gpay://upi/pay?${q}`;
      }
    } else if (appType === 'phonepe') {
      // PhonePe
      if (isIOS()) {
        deepLink = `phonepe://pay?${q}`;
      } else if (isAndroid()) {
        deepLink = `intent://pay?${q}#Intent;scheme=upi;package=com.phonepe.app;end`;
      } else {
        deepLink = `phonepe://pay?${q}`;
      }
    } else if (appType === 'bhim') {
      // BHIM UPI - Uses standard UPI scheme with app-specific intent on Android
      if (isAndroid()) {
        deepLink = `intent://pay?${q}#Intent;scheme=upi;package=in.org.npci.upiapp;end`;
      } else {
        // iOS and generic - use standard UPI scheme (BHIM supports this)
        deepLink = `upi://pay?${q}`;
      }
    } else if (appType === 'paytm') {
      // Paytm
      deepLink = `paytmmp://pay?${q}`;
    } else {
      // Fallback - generic UPI
      deepLink = `upi://pay?${q}`;
    }

    // Open the selected app
    window.location.href = deepLink;
  };

  const handlePayment = async (userId, amount, isCustom = false, appType = null) => {
    const userToPayId = userId;
    const userToPay = userBalances[userToPayId];
    
    if (!userToPay) return;

    const finalAmount = isCustom ? customAmounts[userToPayId] : amount;
    
    if (!finalAmount || finalAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // If on mobile and no app selected yet, show app selector
    if (isMobile() && !appType) {
      setShowAppSelector({ userId: userToPayId, amount: finalAmount, isCustom });
      return;
    }

    // Fetch UPI ID
    setProcessingPayment(userToPayId);
    const upiId = await fetchUpiId(userToPayId);
    
    if (!upiId) {
      alert(`${userToPay.name} hasn't set up their UPI ID yet. Please ask them to add it in their profile.`);
      setProcessingPayment(null);
      return;
    }

    // On mobile: trigger UPI payment with selected app
    if (isMobile() && appType) {
      openPayment({
        pa: upiId,
        pn: userToPay.name,
        am: finalAmount.toFixed(2),
        tn: `${user.name} to ${userToPay.name} - Splitify`,
        from: user.name,
        to: userToPay.name,
        appType: appType
      });
      
      // Close app selector and modal after initiating payment
      setTimeout(() => {
        setShowAppSelector(null);
        setProcessingPayment(null);
        onClose();
      }, 1000);
    } else {
      // Desktop: UPI ID is already shown, no action needed
      setProcessingPayment(null);
    }
  };

  const handleCustomAmountChange = (userId, value) => {
    const numValue = parseFloat(value);
    setCustomAmounts(prev => ({
      ...prev,
      [userId]: isNaN(numValue) ? '' : numValue
    }));
  };

  const copyUpiId = async (upiId) => {
    try {
      await navigator.clipboard.writeText(upiId);
      alert('UPI ID copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = upiId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('UPI ID copied to clipboard!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Make Payment
              </h2>
              <p className="text-emerald-100 text-sm mt-1">
                {isMobile() ? 'Select a member to pay via UPI' : 'View UPI IDs to make payment'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* UPI ID Reminder Banner (if user hasn't added UPI ID) */}
          {(!user.upiId || user.upiId.trim() === '') && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-blue-900 font-semibold text-sm mb-1">
                    Want to receive payments too?
                  </h4>
                  <p className="text-blue-700 text-xs mb-2 leading-relaxed">
                    Add your UPI ID to receive payments from group members directly via Google Pay, PhonePe & BHIM.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = '/profile';
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add UPI ID in Profile</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settlement Mode Toggle */}
          <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {settlementOnlyMode ? 'Settlement Only' : 'All Members'}
              </span>
            </div>
            
            {/* Toggle Switch */}
            <button
              onClick={() => setSettlementOnlyMode(!settlementOnlyMode)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                settlementOnlyMode ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                  settlementOnlyMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Users List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">Calculating balances...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {settlementOnlyMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                )}
              </svg>
              <p className="text-gray-600 text-lg font-medium">
                {settlementOnlyMode ? 'All settled up!' : 'No members available'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {settlementOnlyMode 
                  ? "You don't owe anyone in this group" 
                  : searchTerm 
                    ? 'Try a different search term'
                    : 'No members with UPI ID set up yet'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map(([userId, userData]) => (
                <UserPaymentCard
                  key={userId}
                  userId={userId}
                  userData={userData}
                  currentCurrency={currentCurrency}
                  isMobile={isMobile()}
                  customAmount={customAmounts[userId]}
                  onCustomAmountChange={handleCustomAmountChange}
                  onPayment={handlePayment}
                  processingPayment={processingPayment}
                  upiIds={upiIds}
                  fetchUpiId={fetchUpiId}
                  copyUpiId={copyUpiId}
                  settlementOnlyMode={settlementOnlyMode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="text-center space-y-2">
            {isMobile() ? (
              <>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
                  <span className="font-semibold">Supported Apps:</span>
                  <span className="bg-white px-2 py-1 rounded border border-gray-200">Google Pay</span>
                  <span className="bg-white px-2 py-1 rounded border border-gray-200">PhonePe</span>
                  <span className="bg-white px-2 py-1 rounded border border-gray-200">BHIM UPI</span>
                  <span className="bg-white px-2 py-1 rounded border border-gray-200">Paytm</span>
                </div>
                <p className="text-xs text-gray-500">
                  💡 Choose your preferred UPI app when making payment. Details will be prefilled.
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-500">
                💡 Copy the UPI ID to make payment from your mobile device or UPI app.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* App Selector Modal Overlay */}
      {showAppSelector && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Payment App</h3>
              <p className="text-sm text-gray-600">
                Select your preferred UPI app to complete payment of{' '}
                <span className="font-bold text-emerald-600">
                  {currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '₹'}
                  {showAppSelector.amount.toFixed(2)}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              {/* Google Pay */}
              <button
                onClick={() => handlePayment(showAppSelector.userId, showAppSelector.amount, showAppSelector.isCustom, 'gpay')}
                disabled={processingPayment !== null}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none">
                      <path d="M44 24C44 35.046 35.046 44 24 44C12.954 44 4 35.046 4 24C4 12.954 12.954 4 24 4" stroke="#4285F4" strokeWidth="3"/>
                      <path d="M44 24C44 35.046 35.046 44 24 44" stroke="#34A853" strokeWidth="3"/>
                      <path d="M24 4C35.046 4 44 12.954 44 24" stroke="#FBBC04" strokeWidth="3"/>
                      <path d="M4 24C4 12.954 12.954 4 24 4" stroke="#EA4335" strokeWidth="3"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Google Pay</p>
                    <p className="text-xs text-gray-600">Pay with GPay</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* PhonePe */}
              <button
                onClick={() => handlePayment(showAppSelector.userId, showAppSelector.amount, showAppSelector.isCustom, 'phonepe')}
                disabled={processingPayment !== null}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="20" fill="#5F259F"/>
                      <path d="M24 8L32 24L24 40L16 24L24 8Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">PhonePe</p>
                    <p className="text-xs text-gray-600">Pay with PhonePe</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-purple-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* BHIM UPI */}
              <button
                onClick={() => handlePayment(showAppSelector.userId, showAppSelector.amount, showAppSelector.isCustom, 'bhim')}
                disabled={processingPayment !== null}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none">
                      <rect width="48" height="48" rx="8" fill="#F47920"/>
                      <text x="24" y="32" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">B</text>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">BHIM UPI</p>
                    <p className="text-xs text-gray-600">Pay with BHIM</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-orange-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Paytm */}
              <button
                onClick={() => handlePayment(showAppSelector.userId, showAppSelector.amount, showAppSelector.isCustom, 'paytm')}
                disabled={processingPayment !== null}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 border-2 border-cyan-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="20" fill="#00BAF2"/>
                      <path d="M24 12V36M15 24H33" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Paytm</p>
                    <p className="text-xs text-gray-600">Pay with Paytm</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-cyan-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setShowAppSelector(null)}
              className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>

            {/* Processing Indicator */}
            {processingPayment !== null && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Opening payment app...</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

// Separate component for each user card
const UserPaymentCard = ({
  userId,
  userData,
  currentCurrency,
  isMobile,
  customAmount,
  onCustomAmountChange,
  onPayment,
  processingPayment,
  upiIds,
  fetchUpiId,
  copyUpiId,
  settlementOnlyMode
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [upiIdLoaded, setUpiIdLoaded] = useState(false);
  const [showUpiId, setShowUpiId] = useState(false);

  const currencySymbol = currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '₹';
  const dueAmount = userData.amountOwed || 0;

  const handleShowUpiId = async () => {
    if (!upiIdLoaded && !upiIds[userId]) {
      await fetchUpiId(userId);
      setUpiIdLoaded(true);
    }
    setShowUpiId(!showUpiId);
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
      {/* User Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            {userData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center">
              {userData.name}
              {userData.isPast && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  Left group
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500">{userData.email}</p>
          </div>
        </div>
        {settlementOnlyMode && dueAmount > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">You owe</p>
            <p className="text-xl font-bold text-red-600">
              {currencySymbol}{dueAmount.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Payment Options */}
      <div className="space-y-3">
        {/* Pay Due Amount (Only in settlement mode with due amount) */}
        {settlementOnlyMode && dueAmount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowCustom(false);
                onPayment(userId, dueAmount, false);
              }}
              disabled={processingPayment === userId}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              {processingPayment === userId ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Pay {currencySymbol}{dueAmount.toFixed(2)}</span>
                </>
              )}
            </button>
            
            {/* Toggle Custom Amount */}
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="px-4 py-2.5 border-2 border-emerald-500 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-all text-sm"
              title="Pay custom amount"
            >
              Custom
            </button>
          </div>
        )}

        {/* Custom Amount for Non-Settlement Mode */}
        {!settlementOnlyMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Pay Custom Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={customAmount || ''}
                onChange={(e) => onCustomAmountChange(userId, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <button
                onClick={() => onPayment(userId, customAmount, true)}
                disabled={!customAmount || customAmount <= 0 || processingPayment === userId}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {processingPayment === userId ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Pay'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Custom Amount Input (Settlement Mode) */}
        {settlementOnlyMode && showCustom && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 animate-slide-down">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Custom Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={customAmount || ''}
                onChange={(e) => onCustomAmountChange(userId, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <button
                onClick={() => onPayment(userId, customAmount, true)}
                disabled={!customAmount || customAmount <= 0 || processingPayment === userId}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Pay
              </button>
            </div>
          </div>
        )}

        {/* Desktop: Show UPI ID */}
        {!isMobile && (
          <div className="mt-3">
            <button
              onClick={handleShowUpiId}
              className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center space-x-1 py-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{showUpiId ? 'Hide' : 'Show'} UPI ID</span>
            </button>
            
            {showUpiId && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 animate-slide-down">
                {upiIds[userId] ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">UPI ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">{upiIds[userId]}</p>
                    </div>
                    <button
                      onClick={() => copyUpiId(upiIds[userId])}
                      className="ml-2 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {userData.name} hasn't set up their UPI ID yet.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default PaymentModal;

