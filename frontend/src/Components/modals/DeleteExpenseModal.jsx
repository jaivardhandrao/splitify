import React, { useState } from 'react';
import { useDashboard } from '../../Contexts/DashboardContext';
import axios from 'axios';

const DeleteExpenseModal = ({ expenseId, onClose }) => {
  const {
    expenses,
    activeGroup,
    setExpenses,
    setBalances,
    updatingExpenses,
    setUpdatingExpenses,
    showNotification,
    API_BASE,
    token,
  } = useDashboard();

  const [deleteError, setDeleteError] = useState('');

  // Find the expense details for display
  const expense = expenses.find(exp => exp._id === expenseId);

  const handleDeleteExpense = async () => {
    try {
      // Set loading state
      setUpdatingExpenses(prev => ({ ...prev, [expenseId]: true }));

      // Optimistic update - remove expense from UI immediately
      setExpenses(prevExpenses => prevExpenses.filter(exp => exp._id !== expenseId));

      // Optimistically update balances
      setBalances(prevBalances => {
        const newBalances = { ...prevBalances };
        const expenseToDelete = expenses.find(exp => exp._id === expenseId);
        if (expenseToDelete) {
          const share = expenseToDelete.amount / expenseToDelete.participants.length;
          const paidById = `${expenseToDelete.paidBy._id}`;
          newBalances[paidById] -= expenseToDelete.amount;
          expenseToDelete.participants.forEach(participantId => {
            newBalances[participantId.toString()] += share;
          });
        }
        return newBalances;
      });

      // Perform the DELETE request
      await axios.delete(
        `${API_BASE}/expenses/${expenseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showNotification('Expense deleted!');

      // Close modal
      onClose();

    } catch (err) {
      // Revert optimistic update on failure by refetching
      showNotification('Expense deleted!');
      const res = await axios.get(
        `${API_BASE}/expenses/${activeGroup._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses(res.data.expenses);
      setBalances(res.data.balances);
    } finally {
      setUpdatingExpenses(prev => {
        const newState = { ...prev };
        delete newState[expenseId];
        return newState;
      });
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 flex items-center justify-center z-60" 
        style={{ backdropFilter: 'blur(5px)' }}
        onClick={onClose}
      >
        <div 
          className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4 animate-modal-appear mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
          
          <p className="text-sm text-red-600 font-bold uppercase">
            YOU WANT TO DELETE THE TRANSACTION WITH
          </p>
          
          {expense && (
            <p className="text-sm text-gray-600">
              Name: {expense.title}, Amount: ₹{expense.amount}
            </p>
          )}
          
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleDeleteExpense}
              disabled={updatingExpenses[expenseId]}
              className={`flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-all duration-200 ${
                updatingExpenses[expenseId] ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {updatingExpenses[expenseId] ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Confirm Delete'
              )}
            </button>
            
            <button
              onClick={onClose}
              disabled={updatingExpenses[expenseId]}
              className={`flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-all duration-200 ${
                updatingExpenses[expenseId] ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Cancel
            </button>
          </div>
          
          {deleteError && (
            <p className="text-red-600 text-sm text-center mt-2 animate-fade-in">
              {deleteError}
            </p>
          )}
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
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-modal-appear {
          animation: modal-appear 0.2s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-in;
        }
      `}</style>
    </>
  );
};

export default DeleteExpenseModal;