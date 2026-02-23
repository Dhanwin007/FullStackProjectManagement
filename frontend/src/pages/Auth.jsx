import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Layout, Upload, User, Shield, Mail, Lock, ArrowLeft } from 'lucide-react';

export const Auth = ({ isLogin }) => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: 'member' 
  });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // NEW: State for Forgot Password toggle
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      let response;
      if (isLogin) {
        // --- LOGIN FLOW ---
        const loginPayload = { 
          email: formData.email, 
          password: formData.password 
        };

        response = await api.post(endpoint, loginPayload);

        if (response.status === 200 || response.status === 201) {
          // 1. Set the flag for the ProtectedRoute Guard
          sessionStorage.setItem('isLoggedIn', 'true'); 
    sessionStorage.setItem('user', JSON.stringify(response.data.data));
          console.log("Login Success:", response.data); 
          navigate('/dashboard',{ replace: true });
        }
      }  else {
        // --- REGISTER FLOW ---
        const data = new FormData();
        // FIXED: Ensure all fields match backend validators exactly
        data.append('username', formData.username.trim().toLowerCase());
        data.append('email', formData.email.trim().toLowerCase());
        data.append('password', formData.password);
        data.append('role', formData.role.toLowerCase()); 
        
        // FIXED: Added 'fullname' because backend validator expects it
        // We use username as a fallback if you don't want a separate input
        data.append('fullname', formData.username.trim()); 
        
        if (avatar) {
          data.append('avatar', avatar);
        }

        response = await api.post(endpoint, data);
        console.log("Registration Success:", response.data);
        alert("Registration successful! Please login.");
        navigate('/login');
      
      }
    } catch (err) {
      console.error("Auth Error details:", err.response?.data);
      setError(err.response?.data?.message || "Operation failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handler for Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: resetEmail });
      alert("Reset link sent! Check your email.");
      setIsForgotPassword(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-slate-100">
        
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Layout size={28} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isForgotPassword ? 'Enter your email to receive a recovery link' : (isLogin ? 'Enter your credentials to access your dashboard' : 'Join the project management platform')}
          </p>
        </div>

        {isForgotPassword ? (
          /* FORGOT PASSWORD VIEW */
          <form className="mt-8 space-y-4" onSubmit={handleForgotPassword}>
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">{error}</div>}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1"><Mail size={16} /> Email Address</label>
              <input type="email" required className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="name@company.com" onChange={e => setResetEmail(e.target.value)} />
            </div>
            <button disabled={loading} type="submit" className="w-full rounded-lg bg-blue-600 py-3.5 font-bold text-white shadow-lg hover:bg-blue-700 transition-all">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        ) : (
          /* LOGIN / REGISTER VIEW */
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 animate-pulse">{error}</div>}
            
            {!isLogin && (
              <>
                <div className="flex flex-col items-center mb-6">
                  <label className="relative cursor-pointer group">
                    <div className="h-24 w-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden group-hover:border-blue-400 transition-all shadow-inner">
                      {avatar ? <img src={URL.createObjectURL(avatar)} alt="preview" className="h-full w-full object-cover" /> : (
                        <div className="text-center">
                          <Upload className="mx-auto text-slate-400 group-hover:text-blue-500 mb-1" size={20} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Avatar</span>
                        </div>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1"><User size={16} /> Username</label>
                  <input type="text" required className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="johndoe_07" onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1"><Shield size={16} /> Assign Role</label>
                  <select className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="member">Team Member</option>
                    <option value="admin">Project Admin</option>
                  </select>
                </div>
              </>
            )}
            
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1"><Mail size={16} /> Email Address</label>
              <input type="email" required className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="name@company.com" onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1"><Lock size={16} /> Password</label>
              <input type="password" required className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="••••••••" onChange={e => setFormData({...formData, password: e.target.value})} />
              {isLogin && (
                <div className="mt-2 text-right">
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">Forgot Password?</button>
                </div>
              )}
            </div>

            <button disabled={loading} type="submit" className="w-full rounded-lg bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:bg-blue-300">
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Now')}
            </button>
          </form>
        )}

        <div className="text-center text-sm pt-4 border-t border-slate-50">
          <span className="text-slate-500">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <Link to={isLogin ? "/register" : "/login"} className="ml-1 font-bold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline">
            {isLogin ? "Register" : "Login"}
          </Link>
        </div>
      </div>
    </div>
  );
};