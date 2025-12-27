import React, { useState, useMemo, useEffect } from 'react';
import { useDashboard } from '../Contexts/DashboardContext';
import NavBar from './NavBar';

const MyExpenses = () => {
  const {
    myExpenses,
    myExpensesTotalSpent,
    isMyExpensesLoading,
    fetchMyExpenses,
    currentCurrency,
    user,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month, year, custom
  const [sortBy, setSortBy] = useState('date'); // date, amount
  const [sortOrder, setSortOrder] = useState('desc'); // desc, asc
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Fetch expenses on component mount
  useEffect(() => {
    fetchMyExpenses();
  }, []);

  // Currency symbol
  const currencySymbol = currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '₹';

  // Filter expenses by search query and date
  const filteredExpenses = useMemo(() => {
    let result = [...myExpenses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(expense => 
        expense.title.toLowerCase().includes(query) ||
        expense.group?.name.toLowerCase().includes(query) ||
        expense.paidBy?.name?.toLowerCase().includes(query) ||
        expense.paidBy?.email?.toLowerCase().includes(query)
      );
    }

    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateFilter === 'today') {
      result = result.filter(expense => {
        const expenseDate = new Date(expense.createdAt || expense.date);
        return expenseDate >= today;
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter(expense => {
        const expenseDate = new Date(expense.createdAt || expense.date);
        return expenseDate >= weekAgo;
      });
    } else if (dateFilter === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter(expense => {
        const expenseDate = new Date(expense.createdAt || expense.date);
        return expenseDate >= monthStart;
      });
    } else if (dateFilter === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      result = result.filter(expense => {
        const expenseDate = new Date(expense.createdAt || expense.date);
        return expenseDate >= yearStart;
      });
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(expense => {
        const expenseDate = new Date(expense.createdAt || expense.date);
        return expenseDate >= start && expenseDate <= end;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (sortBy === 'amount') {
        const shareA = a.amount / a.participants.length;
        const shareB = b.amount / b.participants.length;
        return sortOrder === 'desc' ? shareB - shareA : shareA - shareB;
      }
      return 0;
    });

    return result;
  }, [myExpenses, searchQuery, dateFilter, sortBy, sortOrder, customStartDate, customEndDate]);

  // Calculate filtered total
  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => {
      const share = expense.amount / expense.participants.length;
      return sum + share;
    }, 0);
  }, [filteredExpenses]);

  return (
    <>
    <NavBar/>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-800/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">My Expenses</h1>
                  <p className="text-emerald-100 text-sm mt-1">Track all your shared expenses</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-emerald-100 text-sm font-medium">Total Expenses</p>
                  <p className="text-3xl font-bold mt-1">
                    {isMyExpensesLoading ? (
                      <span className="inline-block w-16 h-8 bg-white/20 rounded animate-pulse"></span>
                    ) : (
                      myExpenses.length
                    )}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-emerald-100 text-sm font-medium">Total Spent</p>
                  <p className="text-3xl font-bold mt-1">
                    {isMyExpensesLoading ? (
                      <span className="inline-block w-24 h-8 bg-white/20 rounded animate-pulse"></span>
                    ) : (
                      `${currencySymbol}${myExpensesTotalSpent.toFixed(2)}`
                    )}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-emerald-100 text-sm font-medium">Showing</p>
                  <p className="text-3xl font-bold mt-1">
                    {isMyExpensesLoading ? (
                      <span className="inline-block w-16 h-8 bg-white/20 rounded animate-pulse"></span>
                    ) : (
                      filteredExpenses.length
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 animate-slide-up">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, group, or payer..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Date Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'today', 'week', 'month', 'year', 'custom'].map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  dateFilter === filter
                    ? 'bg-emerald-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All Time' : filter === 'week' ? 'Last Week' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
            >
              <svg 
                className={`w-5 h-5 text-gray-600 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {filteredExpenses.length < myExpenses.length && (
              <div className="ml-auto text-sm text-emerald-600 font-medium">
                Showing {filteredExpenses.length} of {myExpenses.length} expenses
                {filteredExpenses.length > 0 && ` • ${currencySymbol}${filteredTotal.toFixed(2)}`}
              </div>
            )}
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-4">
          {isMyExpensesLoading ? (
            // Loading Skeletons
            <>
              {[1, 2, 3, 4, 5].map((skeleton) => (
                <div key={skeleton} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
                    </div>
                    <div className="h-8 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredExpenses.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-500">
                {searchQuery || dateFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t been added to any expenses yet'}
              </p>
            </div>
          ) : (
            // Expenses Cards
            filteredExpenses.map((expense, index) => {
              const myShare = expense.amount / expense.participants.length;
              const paidByMe = expense.paidBy?._id?.toString() === user.email || expense.paidBy?.email === user.email;
              
              return (
                <div
                  key={expense._id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{expense.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          expense.isSettled
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}>
                          {expense.isSettled ? '✓ Settled' : '⏳ Unsettled'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium text-emerald-600">{expense.group?.name || 'Unknown Group'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Your share</div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {currencySymbol}{myShare.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Total Amount</span>
                      </div>
                      <div className="font-semibold text-gray-900">{currencySymbol}{expense.amount}</div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Paid By</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {paidByMe ? 'You' : (expense.paidBy?.name || expense.paidBy?.email || 'Unknown')}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Date</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {new Date(expense.createdAt || expense.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Split between {expense.participants.length} {expense.participants.length === 1 ? 'person' : 'people'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out both;
        }
      `}</style>
    </div>
    </>
  );
};

export default MyExpenses;