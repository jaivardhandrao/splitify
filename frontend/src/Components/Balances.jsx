import React from 'react';
import { useDashboard } from '../Contexts/DashboardContext';

const Balances = () => {
  const { balances, currentCurrency, user } = useDashboard();

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Balances</h3>
      <ul className="space-y-2">
        {Object.entries(balances).map(([email, amount]) => (
          <li key={email} className={`p-2 rounded-md ${amount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {email === user.email ? 'You' : email}: {amount} {currentCurrency}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Balances;