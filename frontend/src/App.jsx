import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardProvider } from './Contexts/DashboardContext';
import LoginSignup from './Components/LoginSignup';
import Dashboard from './Components/Dashboard/Dashboard';
import Verify from './Components/Verify';
import ResetPassword from './Components/ResetPassword';
import MyExpenses from './Components/MyExpenses';

// Wrapper component for routes that need DashboardProvider
function ProtectedRoutes({ children }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES - NO DashboardProvider wrapper */}
        <Route path="/" element={<LoginSignup />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* PROTECTED ROUTES - WITH DashboardProvider wrapper */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/my-expenses"
          element={
            <ProtectedRoutes>
              <MyExpenses />
            </ProtectedRoutes>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;