import { useState, useRef, useEffect } from 'react';
import { MoreVertical, User, Mail, Shield, LogOut, Layout, Lock, KeyRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const userData = JSON.parse(sessionStorage.getItem('user')) || {};
  const user = userData.user || {};

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout'); 
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.setItem('user', null);
      // Replace the current history entry so 'Back' doesn't go to Dashboard
navigate('/login', { replace: true });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Hits your changeCurrentPassword controller
      await api.post('/auth/change-password', passwordData);
      alert("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="flex items-center justify-between bg-white px-8 py-4 shadow-sm border-b border-slate-100 relative">
      <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
        <Layout size={24} />
        <span className="tracking-tight text-slate-800">DevDashboard</span>
      </div>

      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-600 active:scale-90"
        >
          <MoreVertical size={20} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white shadow-2xl border border-slate-100 py-6 z-50 animate-in fade-in zoom-in duration-150">
            {/* User Profile Info Section */}
            <div className="px-6 pb-6 border-b border-slate-50 flex flex-col items-center">
              <div className="relative mb-4">
                <img 
                  src={user.avatar?.url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
                  alt="Profile" 
                  className="h-20 w-20 rounded-full object-cover border-4 border-blue-50 shadow-sm"
                />
                <div className="absolute bottom-1 right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight uppercase tracking-wide">
                {user.username || "User"}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                <Shield size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{user.role || "Member"}</span>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="mt-4 px-4 space-y-1">
              <div className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 rounded-xl">
                <Mail size={18} className="text-slate-400" />
                <span className="truncate font-medium">{user.email}</span>
              </div>

              {/* NEW: Change Password Button */}
              <button 
                onClick={() => { setShowPasswordModal(true); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <KeyRound size={18} className="text-slate-400" />
                Change Password
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PASSWORD RESET MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Update Security</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Current Password</label>
                <input 
                  type="password" required 
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">New Password</label>
                <input 
                  type="password" required 
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
              <button 
                disabled={loading}
                type="submit" 
                className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition-all disabled:bg-blue-300"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;