
// // export default App;
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import LoginSignup from './Components/LoginSignup';
// import Dashboard from './Components/Dashboard';
// import Verify from './Components/Verify'; 
// import ResetPassword from './Components/ResetPassword'; // New import

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LoginSignup />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/verify/:token" element={<Verify />} />
//         <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* New route */}
//       </Routes>
//     </Router>
//   );
// }

// export default App; // old app


// new faster BETA VERSION
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardProvider } from './Contexts/DashboardContext';
import LoginSignup from './Components/LoginSignup';
import Dashboard from './Components/Dashboard/Dashboard';  // Path to the entry point (subfolder)
import Verify from './Components/Verify';
import ResetPassword from './Components/ResetPassword';
import MyExpenses from './Components/MyExpenses';

function App() {
  return (
    <Router>
      <DashboardProvider>

      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/my-expenses" element={<MyExpenses />} />
        <Route path="/dashboard" element={<Dashboard />} />  {/* Now uses new componentized version */}
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>

      </DashboardProvider>
      
    </Router>
  );
}

export default App;