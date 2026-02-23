import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './pages/Auth';
import Dashboard from './pages/Dashboard';
 import ProjectWorkspace from './pages/ProjectWorkspace';

// 1. Protected Route: Only for logged-in users
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isLoggedIn') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 2. Public Route: Only for logged-out users
// Prevents logged-in users from going back to Login/Register
const PublicRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isLoggedIn') === 'true';
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap Login and Register in PublicRoute */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Auth isLogin={true} />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Auth isLogin={false} />
            </PublicRoute>
          } 
        />
        
        {/* Dashboard remains in ProtectedRoute */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/project/:projectId" element={<ProjectWorkspace />} />
       

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route 
          path="*" 
          element={<div className="flex h-screen items-center justify-center text-slate-400">404 - Not Found</div>} 
        />
      </Routes>
    </Router>
  );
}

export default App;