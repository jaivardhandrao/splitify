import React, { Suspense } from 'react';
import { DashboardProvider } from '../../Contexts/DashboardContext';  // Up to Components/, then into Contexts/
import DashboardContent from './DashboardContent';  // Same folder
import MyExpenses from '../MyExpenses';

const Dashboard = () => (
  <DashboardProvider>
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  </DashboardProvider>
);

export default Dashboard;