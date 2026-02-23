import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { UserPlus, X, Mail, Loader2, ShieldCheck, UserMinus, Lock } from 'lucide-react';

const MemberTab = ({ projectId, userRole }) => {
  const [members, setMembers] = useState([]);
  const [inviteData, setInviteData] = useState({ email: '', role: 'MEMBER' });
  const [isInviting, setIsInviting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Normalize userRole to lowercase for robust permission checking
  const currentUserRole = userRole?.toLowerCase();
  const isAdmin = currentUserRole === 'admin' || currentUserRole === 'project_admin';

  const fetchMembers = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      setMembers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching members", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsInviting(true);

    // FIX: Send lowercase role to match your backend constants ('member', 'project_admin')
    const payload = {
      email: inviteData.email.trim().toLowerCase(),
      role: inviteData.role.toLowerCase() 
    };

    try {
      await api.post(`/projects/${projectId}/members`, payload);
      setInviteData({ email: '', role: 'MEMBER' });
      fetchMembers();
      alert("Member added successfully!");
    } catch (err) {
      console.error("Validation Errors:", err.response?.data?.errors);
      alert(err.response?.data?.message || "User not found or validation failed");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      // FIX: Ensure newRole is sent in lowercase ('member' vs 'MEMBER')
      await api.put(`/projects/${projectId}/members/${userId}`, { 
        newRole: newRole.toLowerCase() 
      });
      fetchMembers();
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      fetchMembers();
    } catch (err) {
      alert("Failed to remove member");
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      {/* 🟢 Invite Column */}
      <div className="lg:col-span-1">
        <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-32 transition-opacity ${!isAdmin ? 'opacity-60' : ''}`}>
          <div className="flex items-center gap-2 mb-6">
            <div className={`p-2 rounded-lg ${isAdmin ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
              {isAdmin ? <UserPlus size={20} /> : <Lock size={20} />}
            </div>
            <h3 className="text-lg font-bold text-slate-800">{isAdmin ? 'Invite Team' : 'Team Access'}</h3>
          </div>

          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@email.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:cursor-not-allowed"
                value={inviteData.email}
                onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                required
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assign Role</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-600 disabled:cursor-not-allowed"
                value={inviteData.role}
                onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                disabled={!isAdmin}
              >
                <option value="MEMBER">Member</option>
                <option value="PROJECT_ADMIN">Project Admin</option>
              </select>
            </div>
            <button 
              disabled={!isAdmin || isInviting} 
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
            >
              {isInviting ? "Adding..." : "Add Member"}
            </button>
          </form>
        </div>
      </div>

      {/* 🔵 Table Column */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Members ({members.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400">User Details</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400">Project Role</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m, index) => {
                // FIX: Support both array-wrapped users (lookup) or flattened users (unwind)
                const userData = Array.isArray(m.user) ? m.user[0] : m.user;
                if (!userData) return null;

                // Normalize roles for comparison
                const isMainAdmin = m.role?.toLowerCase() === 'admin';
                const canManage = isAdmin && !isMainAdmin;

                return (
                  <tr key={userData._id || index} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 flex items-center gap-3">
                      <img src={userData.avatar.url} className="h-10 w-10 rounded-full border border-slate-200 object-cover shadow-sm" />
                      <div>
                        <p className="font-bold text-sm text-slate-900 leading-none mb-1">{userData.username}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{userData.fullName}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {canManage ? (
                        <select 
                          // FIX: Display current role correctly even if backend sends lowercase
                          value={m.role?.toUpperCase()}
                          onChange={(e) => handleRoleUpdate(userData._id, e.target.value)}
                          className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-2 py-1 rounded-md cursor-pointer border-none outline-none hover:bg-blue-100 transition-colors"
                        >
                          <option value="PROJECT_ADMIN">Project Admin</option>
                          <option value="MEMBER">Member</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                          isMainAdmin ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {m.role?.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {canManage && (
                        <button 
                          onClick={() => handleRemoveMember(userData._id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <UserMinus size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberTab;