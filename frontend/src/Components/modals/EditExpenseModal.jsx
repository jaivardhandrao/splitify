import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../Contexts/DashboardContext';
import axios from 'axios';

const EditExpenseModal = ({ isOpen, onClose, expense }) => {
  const {
    activeGroup,
    user,
    pastMembers,
    setExpenses,
    setBalances,
    showNotification,
    setError,
    token,
    API_BASE,
  } = useDashboard();

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseParticipants, setExpenseParticipants] = useState([]);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // Pre-fill form with existing expense data when modal opens
  useEffect(() => {
    if (isOpen && expense) {
      setExpenseTitle(expense.title || '');
      setExpenseAmount(expense.amount?.toString() || '');
      
      // Convert participants to array of string IDs
      const participantIds = expense.participants.map(p => {
        const id = p?._id?.toString() || p?.toString();
        return id;
      });
      setExpenseParticipants(participantIds);
    }
  }, [isOpen, expense]);

  const handleEditExpense = async (e) => {
    e.preventDefault();
    setIsSubmittingExpense(true);

    // Validation
    if (!expenseTitle || !expenseAmount || expenseParticipants.length === 0) {
      setError('All fields required and at least one participant must be selected');
      setIsSubmittingExpense(false);
      return;
    }

    try {
      await axios.patch(
        `${API_BASE}/expenses/${expense._id}/edit`,
        {
          title: expenseTitle,
          amount: parseFloat(expenseAmount),
          participants: expenseParticipants,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification('Expense edited!');

      // Refresh expenses and balances
      const res = await axios.get(
        `${API_BASE}/expenses/${activeGroup._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses(res.data.expenses);
      setBalances(res.data.balances);

      onClose();

    } catch (err) {
      setError('Failed to edit expense: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  if (!isOpen || !expense) return null;

  // Get payer info for display
  const paidById = expense.paidBy?._id || expense.paidBy;
  
  // Check current members first
  let paidByMember = activeGroup?.members.find(m => m._id.toString() === paidById.toString());
  let paidByIsPast = false;
  
  // If not found in current members, check past members
  if (!paidByMember) {
    const pastMember = pastMembers.find(pm => pm.user?._id?.toString() === paidById.toString());
    if (pastMember && pastMember.user) {
      paidByMember = pastMember.user;
      paidByIsPast = true;
    }
  }
  
  const paidByDisplay = paidByMember
    ? (paidByMember.email === user.email ? 'You' : (paidByMember.name || paidByMember.email)) + (paidByIsPast ? ' (left)' : '')
    : 'Unknown';

  // Create a combined list of all members (current + past)
  // This ensures that participants who were in the expense but left the group are still shown
  const allAvailableMembers = [
    // Current members
    ...activeGroup.members.map(m => ({ ...m, isPast: false })),
    // Past members (only those not already in current members)
    ...pastMembers
      .filter(pm => pm.user && !activeGroup.members.some(m => m._id.toString() === pm.user._id.toString()))
      .map(pm => ({ ...pm.user, isPast: true }))
  ];

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full space-y-4 mx-4 animate-modal-appear"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-gray-900">Edit Expense</h3>
          
          <form onSubmit={handleEditExpense} className="space-y-4">
            {/* Title Input */}
            <input
              type="text"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="Title (e.g., Dinner)"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              required
              disabled={isSubmittingExpense}
            />

            {/* Amount Input */}
            <input
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="Amount (e.g., 100)"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              required
              disabled={isSubmittingExpense}
            />

            {/* Paid By - Disabled (Cannot be changed) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid By (Cannot be changed):
              </label>
              <input
                type="text"
                value={paidByDisplay}
                disabled
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Participants Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participants:
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                {allAvailableMembers.map((m) => {
                  const memberId = m._id.toString();
                  const isChecked = expenseParticipants.includes(memberId);
                  
                  return (
                    <div key={memberId} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`edit-participant-${memberId}`}
                        checked={isChecked}
                        onChange={() => {
                          setExpenseParticipants(prev => {
                            const prevIds = prev.map(id => id.toString());
                            if (prevIds.includes(memberId)) {
                              return prev.filter(id => id.toString() !== memberId);
                            } else {
                              return [...prev, memberId];
                            }
                          });
                        }}
                        disabled={isSubmittingExpense}
                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <label
                        htmlFor={`edit-participant-${memberId}`}
                        className={`ml-2 text-sm cursor-pointer ${m.isPast ? 'text-gray-400' : 'text-gray-700'}`}
                      >
                        {m.name || m.email}
                        {m.isPast && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            left
                          </span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {allAvailableMembers.filter(m => m.isPast).length > 0 && (
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Members marked "left" have left the group but can still be part of this expense
                  </span>
                )}
              </p>
            </div>

            {/* Submit Button with Loader */}
            <button
              type="submit"
              disabled={isSubmittingExpense}
              className={`w-full py-3 rounded-md font-medium transition-all duration-200 ${
                isSubmittingExpense
                  ? 'bg-emerald-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } text-white flex items-center justify-center space-x-2`}
            >
              {isSubmittingExpense ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Editing Expense...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmittingExpense}
              className={`w-full py-3 rounded-md font-medium transition-all duration-200 ${
                isSubmittingExpense
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modal-appear {
          animation: modal-appear 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default EditExpenseModal;