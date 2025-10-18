import React, { useState } from 'react';
import { useDashboard } from '../Contexts/DashboardContext';

const OptimizedTransactions = () => {
  const {
    optimizedTransactions,
    isCalculating,
    calculateOptimizedTransactions,
    activeGroup,
    currentCurrency,
  } = useDashboard();

  const [isPressed, setIsPressed] = useState(false);

  const handleRecalculateClick = () => {
    if (!isCalculating && activeGroup) {
      calculateOptimizedTransactions();
    }
  };


  return (
    <div className="mt-8 my-5 bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Optimized Transactions
        </h3>

        <button
          onClick={handleRecalculateClick}
          disabled={isCalculating || !activeGroup}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white cursor-pointer rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-300 ease-in-out transform shadow-md hover:shadow-lg optimize-btn-container"
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: window.innerWidth < 640 ? '12px 16px' : '16px 32px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: window.innerWidth < 640 ? '12px' : '14px',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            cursor: isCalculating || !activeGroup ? 'not-allowed' : 'pointer',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isPressed
              ? 'translateY(-1px) scale(0.98)'
              : isCalculating || !activeGroup
              ? 'none'
              : 'translateY(0) scale(1)',
            boxShadow:
              isCalculating || !activeGroup
                ? '0 4px 16px rgba(16,185,129,0.1)'
                : isCalculating
                ? '0 16px 48px rgba(16,185,129,0.4), 0 8px 24px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                : '0 8px 32px rgba(16,185,129,0.3), 0 4px 16px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
            opacity: isCalculating || !activeGroup ? 0.6 : 1,
          }}
        >
          {isCalculating ? (
            <>
              <svg
                className="lightning-icon"
                style={{
                  width: '16px',
                  height: '16px',
                  minWidth: '16px',
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
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {window.innerWidth < 640 ? 'Optimizing...' : 'Optimizing Transactions...'}
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
                  transition: 'all 0.3s ease',
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
          <div
            key={index}
            className="p-3 bg-gray-50 rounded-md border border-gray-200 flex justify-between items-center"
          >
            <p className="font-medium text-gray-900">
              {tx.from} will pay {tx.to}
            </p>
            <p className="text-red-600 font-semibold">
              {currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '₹'}
              {tx.amount.toFixed(2)}
            </p>
          </div>
        ))}
        {optimizedTransactions.length === 0 && (
          <p className="text-gray-500 text-center">All settled up!</p>
        )}
      </div>

      <style>{`
        @keyframes energyPulse {
          0%, 100% {
            transform: rotate(0deg) scale(1);
            filter: drop-shadow(0 0 8px rgba(167,243,208,0.6));
          }
          25% {
            transform: rotate(90deg) scale(1.1);
            filter: drop-shadow(0 0 16px rgba(167,243,208,1));
          }
          50% {
            transform: rotate(180deg) scale(1.2);
            filter: drop-shadow(0 0 20px rgba(255,255,255,1));
          }
          75% {
            transform: rotate(270deg) scale(1.1);
            filter: drop-shadow(0 0 16px rgba(167,243,208,1));
          }
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
      `}</style>
    </div>
  );
};

export default OptimizedTransactions;