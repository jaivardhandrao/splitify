
import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../Contexts/DashboardContext';
import axios from 'axios';

const AddExpenseModal = ({ isOpen, onClose }) => {
  const {
    activeGroup,
    user,
    setExpenses,
    setBalances,
    showNotification,
    setError,
    token,
    API_BASE,
  } = useDashboard();

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [expenseParticipants, setExpenseParticipants] = useState([]);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // Set default paidBy to user's email when modal opens
  useEffect(() => {
    if (isOpen && user.email) {
      setExpensePaidBy(user.email);
    }
  }, [isOpen, user.email]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setIsSubmittingExpense(true);

    if (!expenseTitle || !expenseAmount || expenseParticipants.length === 0) {
      setError('All fields required');
      setIsSubmittingExpense(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/expenses`,
        {
          groupId: activeGroup._id,
          title: expenseTitle,
          amount: parseFloat(expenseAmount),
          paidBy: activeGroup.members.find(m => m.email === expensePaidBy)._id,
          participants: expenseParticipants,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification('Expense added!');

      // Refresh expenses and balances
      const res = await axios.get(
        `${API_BASE}/expenses/${activeGroup._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses(res.data.expenses);
      setBalances(res.data.balances);

      // Reset form and close modal
      setExpenseTitle('');
      setExpenseAmount('');
      setExpensePaidBy(user.email);
      setExpenseParticipants([]);
      onClose();

    } catch (err) {
      setError('Failed to add expense: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  if (!isOpen) return null;

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
              {activeGroup && activeGroup.members.map((m) => (
                <option key={m._id} value={m.email}>
                  {m.name || m.email}
                </option>
              ))}
            </select>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participants:
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activeGroup && activeGroup.members.map((m) => (
                  <div key={m._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`participant-${m._id}`}
                      checked={expenseParticipants.includes(m._id)}
                      onChange={() =>
                        setExpenseParticipants(prev =>
                          prev.includes(m._id)
                            ? prev.filter(id => id !== m._id)
                            : [...prev, m._id]
                        )
                      }
                      disabled={isSubmittingExpense}
                      className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label
                      htmlFor={`participant-${m._id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
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
              className={`w-full py-3 rounded-md font-medium transition-all duration-200 ${
                isSubmittingExpense
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

export default AddExpenseModal;