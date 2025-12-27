import React, { useState, useMemo } from 'react';
import { useDashboard } from '../Contexts/DashboardContext';
import DeleteExpenseModal from './modals/DeleteExpenseModal';
import EditExpenseModal from './modals/EditExpenseModal';
import axios from 'axios';

const ExpenseHistory = () => {
  const {
    expenses,
    activeGroup,
    user,
    pastMembers,
    isExpenseHistoryLoading,
    updatingExpenses,
    currentCurrency,
    setExpenses,
    setBalances,
    setUpdatingExpenses,
    showNotification,
    setError,
    API_BASE,
    token,
  } = useDashboard();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    participant: 'all',
    paidBy: 'all',
    settled: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Handle toggle settled/unsettled
  const handleToggleSettled = async (expenseId, currentSettledStatus) => {
    setUpdatingExpenses(prev => ({ ...prev, [expenseId]: true }));
    try {
      await axios.patch(
        `${API_BASE}/expenses/${expenseId}`,
        { isSettled: !currentSettledStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification(`Expense marked as ${!currentSettledStatus ? 'settled' : 'unsettled'}!`);
      
      const res = await axios.get(
        `${API_BASE}/expenses/${activeGroup._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses(res.data.expenses);
      setBalances(res.data.balances);
    } catch (err) {
      setError(`Failed to update expense: ${err.response?.data?.error || err.message}`);
    } finally {
      setUpdatingExpenses(prev => {
        const newState = { ...prev };
        delete newState[expenseId];
        return newState;
      });
    }
  };

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let result = [...expenses];

    if (filters.participant !== 'all') {
      result = result.filter(exp => 
        exp.participants.some(p => {
          const pId = p?._id?.toString() || p?.toString();
          return pId === filters.participant;
        })
      );
    }

    if (filters.paidBy !== 'all') {
      result = result.filter(exp => {
        const paidById = exp.paidBy?._id?.toString() || exp.paidBy?.toString();
        return paidById === filters.paidBy;
      });
    }

    if (filters.settled !== 'all') {
      result = result.filter(exp => 
        filters.settled === 'settled' ? exp.isSettled : !exp.isSettled
      );
    }

    result.sort((a, b) => {
      if (filters.sortBy === 'date') {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (filters.sortBy === 'amount') {
        return filters.sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [expenses, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.participant !== 'all') count++;
    if (filters.paidBy !== 'all') count++;
    if (filters.settled !== 'all') count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      participant: 'all',
      paidBy: 'all',
      settled: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  if (!activeGroup) {
    return null;
  }

  return (
    <>
      <div className="bg-white my-5 rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Expenses History</h3>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-sm font-medium text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-emerald-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Participant</label>
                <select
                  value={filters.participant}
                  onChange={(e) => setFilters(prev => ({ ...prev, participant: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Participants</option>
                  {activeGroup && activeGroup.members.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.email === user.email ? 'You' : (member.name || member.email)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Paid By</label>
                <select
                  value={filters.paidBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, paidBy: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Payers</option>
                  {activeGroup && activeGroup.members.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.email === user.email ? 'You' : (member.name || member.email)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, settled: 'all' }))}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                      filters.settled === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, settled: 'settled' }))}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                      filters.settled === 'settled'
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Settled
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, settled: 'unsettled' }))}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                      filters.settled === 'unsettled'
                        ? 'bg-orange-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Unsettled
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-medium text-gray-700">Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                </select>
                <button
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc' 
                  }))}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title={filters.sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                >
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform ${
                      filters.sortOrder === 'asc' ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center space-x-1 px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable container */}
        <div className="max-h-150 overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-4">
            {isExpenseHistoryLoading ? (
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
                  </div>
                ))}
              </>
            ) : filteredAndSortedExpenses.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 font-medium">No expenses found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {activeFilterCount > 0 ? 'Try adjusting your filters' : 'Add your first expense to get started'}
                </p>
              </div>
            ) : (
              filteredAndSortedExpenses.map((expense) => {
                const paidById = expense.paidBy?._id || expense.paidBy;
                
                // Check current members first
                let paidByMember = activeGroup.members.find(m => m._id.toString() === paidById.toString());
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
                  : (expense.paidBy?.name || paidById);

                let paidByEmailId = null;
                try {
                  paidByEmailId = paidByMember?.email;
                } catch (err) {
                  console.log("Error getting payer email:", err);
                }

                const participantDisplays = expense.participants.map((participantObj) => {
                  const participantId = participantObj?._id || participantObj;
                  
                  // Check current members first
                  let participantMember = activeGroup.members.find(m => m._id.toString() === participantId.toString());
                  let participantIsPast = false;
                  
                  // If not found in current members, check past members
                  if (!participantMember) {
                    const pastMember = pastMembers.find(pm => pm.user?._id?.toString() === participantId.toString());
                    if (pastMember && pastMember.user) {
                      participantMember = pastMember.user;
                      participantIsPast = true;
                    }
                  }
                  
                  return participantMember
                    ? (participantMember.email === user.email ? 'You' : (participantMember.name || participantMember.email)) + (participantIsPast ? ' (left)' : '')
                    : participantId;
                }).join(', ');

                const isUpdating = updatingExpenses[expense._id] || false;
                const isPayer = paidByEmailId === user.email;

                return (
                  <div key={expense._id} className="p-4 bg-gray-50 rounded-md shadow border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-900">{expense.title}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(expense.createdAt || expense.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Amount: {currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '₹'}{expense.amount}
                    </p>
                    <p className="text-sm text-gray-600">Paid by: {paidByDisplay}</p>
                    <p className="text-sm text-gray-600">Participants: {participantDisplays}</p>
                    
                    <div className="mt-2 flex items-center">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={`settled-${expense._id}`}
                          checked={expense.isSettled || false}
                          onChange={() => handleToggleSettled(expense._id, expense.isSettled)}
                          disabled={isUpdating}
                          className={`h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 transition-all duration-200 ${
                            isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
                        className={`ml-2 text-sm font-medium transition-colors ${
                          isUpdating
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:text-emerald-600'
                        }`}
                      >
                        {expense.isSettled ? 'Settled' : 'Unsettled'}
                        {isUpdating && <span className="ml-1 text-xs">(updating...)</span>}
                      </label>
                    </div>

                    {/* Edit and Delete Buttons - Only for Payer */}
                    {isPayer && (
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => setIsEditModalOpen(expense)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setIsDeleteModalOpen(expense._id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteExpenseModal
          expenseId={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(null)}
        />
      )}

      {/* Edit Expense Modal */}
      {isEditModalOpen && (
        <EditExpenseModal
          isOpen={!!isEditModalOpen}
          onClose={() => setIsEditModalOpen(null)}
          expense={isEditModalOpen}
        />
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
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
        }
      `}</style>
    </>
  );
};

export default ExpenseHistory;