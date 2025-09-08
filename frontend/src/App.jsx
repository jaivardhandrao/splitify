
// export default App;
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginSignup from './Components/LoginSignup';
import Dashboard from './Components/Dashboard';
import Verify from './Components/Verify'; 
import ResetPassword from './Components/ResetPassword'; // New import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* New route */}
      </Routes>
    </Router>
  );
}

export default App;