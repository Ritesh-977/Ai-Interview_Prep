import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Upload from './pages/Upload.jsx';
import Chat from './pages/Chat.jsx';
import Landing from './pages/Landing.jsx';

// Import Page Components
import Login from './pages/Login';
import Signup from './pages/Signup';

// --- Navbar Component ---
const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  return (
    <nav className="bg-white shadow-md p-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">AI Prep</Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <Link to="/upload" className="text-gray-600 hover:text-blue-500">Upload</Link>
              <Link to="/chat" className="text-gray-600 hover:text-blue-500">Chat</Link>
              <button 
                onClick={logout} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-blue-500">Login</Link>
              <Link 
                to="/signup" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};


function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          {/* Public Routes */}
         <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes  */}
          <Route element={<ProtectedRoute />}>
            <Route path="/upload" element={<Upload />} />
            <Route path="/chat" element={<Chat />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}



export default App;