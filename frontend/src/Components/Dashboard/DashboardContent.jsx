import React, { useState, lazy, Suspense } from 'react';
import { useDashboard } from '../../Contexts/DashboardContext';
import GroupSidebar from '../GroupSidebar';
import ExpenseHistory from '../ExpenseHistory';
import OptimizedTransactions from '../OptimizedTransactions';
import PastMembers from '../PastMembers';
import Notification from '../Notification';
import JoinRequests from '../JoinRequests';
import NavBar from '../NavBar';
import GroupSettingsDropdown from '../modals/GroupSettingsDropdown';
import UpiIdReminder from '../UpiIdReminder';
import { useNavigate } from 'react-router-dom';

// Inside your component

const AddExpenseModal = lazy(() => import('../modals/AddExpenseModal'));
const PaymentModal = lazy(() => import('../modals/PaymentModal'));

function DashboardContent() {
  const navigate = useNavigate();
  const {
    notification,
    activeGroup,
    user,
    APP_URL,
  } = useDashboard();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleCopyGroupId = async () => {
    if (!activeGroup) return;

    try {
      await navigator.clipboard.writeText(activeGroup._id);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
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

  const handleShareGroupId = async () => {
    if (!activeGroup) return;

    const shareData = {
      title: `Join ${activeGroup.name} on Splitify!`,
      text: `Hi! You're invited to join "${activeGroup.name}" on Splitify by ${user.name}. Use Group ID: ${activeGroup._id} to join. Download the app or visit ${APP_URL} to get started!`,
      url: `${APP_URL}/`
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Notification */}
      {notification && <Notification message={notification} />}

      {/* UPI ID Reminder */}
      <UpiIdReminder />

      {/* Navbar Component */}
      <NavBar
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <GroupSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto transition-all duration-300 w-full">
          <div className="p-4 sm:p-6">
            {activeGroup ? (
              <>
                {/* Active Group Header */}
                <div className="mb-6 sm:mb-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="w-full sm:w-auto mb-4 sm:mb-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {activeGroup.name}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium text-gray-700">Group Owner:</span>{' '}
                            {activeGroup.owner?.name || activeGroup.owner?.email || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 break-words">
                            <span className="font-medium text-gray-700">Members:</span>{' '}
                            {activeGroup.members.map(m => m.name || m.email).join(', ')}
                          </p>
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
                        
                        {/* Settings Dropdown */}
                        <div className="ml-4">
                          <GroupSettingsDropdown group={activeGroup} />
                        </div>
                      </div>
                    </div>

                    {/* Floating Add Expense Button */}
                    <button
                      onClick={() => setIsAddExpenseModalOpen(true)}
                      className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-102 shadow-lg hover:shadow-xl z-50 flex items-center justify-center group"
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

                {/* Join Requests */}
                <JoinRequests />

                {/* Past Members */}
                <PastMembers />

                {/* I Want to Pay Button */}
                <div className="mb-6">
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] border border-blue-400/20 overflow-hidden group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                    
                    <div className="relative flex items-center justify-center space-x-3">
                      <svg
                        className="w-6 h-6 transition-transform group-hover:scale-110 duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="relative">I Want to Pay</span>
                      <svg
                        className="w-5 h-5 transition-transform group-hover:translate-x-1 duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300/0 via-blue-300/80 to-blue-300/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
                  </button>
                </div>

                {/* Optimized Transactions */}
                <OptimizedTransactions />

                {/* Expense History */}
                <ExpenseHistory />

                {/* Add Expense Button at Bottom */}
                <button
                  onClick={() => setIsAddExpenseModalOpen(true)}
                  className="group relative w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] border border-emerald-400/20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

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

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-300/0 via-emerald-300/80 to-emerald-300/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md px-4">
                  <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-600 text-lg font-medium">Select a group from the sidebar</p>
                  <p className="text-gray-500 text-sm mt-1 mb-6">Choose a group to view expenses and transactions</p>

                  {/* New Feature Badge */}
                  <div className="relative inline-block" onClick={() => navigate('/my-expenses')}>
                    {/* Pulsing glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>

                    {/* Main Card */}
                    <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 text-white px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-102 hover:shadow-purple-500/50 cursor-pointer group">
                      {/* NEW badge */}
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                        NEW ✨
                      </div>

                      {/* Sparkle decorations */}
                      <div className="absolute -top-1 -left-1 text-yellow-300 animate-ping">✨</div>
                      <div className="absolute -bottom-1 -right-1 text-yellow-300 animate-ping" style={{ animationDelay: '0.5s' }}>✨</div>

                      <div className="flex items-center space-x-3">
                        <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="text-left">
                          <p className="font-bold text-lg">My Expenses</p>
                          <p className="text-purple-100 text-sm">Track all your expenses across groups!</p>
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className="mt-2 flex items-center justify-center space-x-1 text-sm opacity-90 group-hover:opacity-100 transition-opacity">
                        <span>Click to explore</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            )}
           
          </div>
        </main>
      </div>

      {/* Modals with Lazy Loading and Suspense */}
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium">Loading Modal...</span>
            </div>
          </div>
        </div>
      }>
        {isAddExpenseModalOpen && (
          <AddExpenseModal
            isOpen={isAddExpenseModalOpen}
            onClose={() => setIsAddExpenseModalOpen(false)}
          />
        )}
        {isPaymentModalOpen && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
          />
        )}
      </Suspense>

      {/* Global Styles */}
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
        @keyframes fade-in-out {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-fade-in-out { animation: fade-in-out 3s ease-in-out; }
      `}</style>
    </div>
  );
}

export default DashboardContent;
