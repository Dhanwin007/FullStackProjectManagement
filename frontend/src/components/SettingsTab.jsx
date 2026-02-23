import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Save, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

const SettingsTab = ({ project, onUpdate, onDelete }) => {
  // 1. Initialize with empty strings to prevent "controlled/uncontrolled" warnings
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '' 
  });
  const [loading, setLoading] = useState(false);

  // 2. IMPORTANT: Sync state when the project prop changes or finally loads
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || ''
      });
    }
  }, [project]);

  // 3. Robust Permission Check (Match your backend role string)
  const isAdmin = project?.role?.toUpperCase() === 'ADMIN';

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      // Ensure the endpoint matches your Express router: /api/v1/projects/:projectId
      const response = await api.put(`/projects/${project._id}`, formData);
      
      if (response.data.success) {
        onUpdate(); // Trigger re-fetch in parent
        alert("Project updated successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (!window.confirm("CRITICAL WARNING: This will permanently delete the project, all tasks, and attachments. This cannot be undone. Proceed?")) return;
    
    setLoading(true);
    try {
      await api.delete(`/projects/${project._id}`);
      onDelete(); // Redirect to dashboard
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-900">General Settings</h3>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1">Project Name</label>
            <input 
              className={`w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                !isAdmin ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-slate-50'
              }`}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter project name"
              disabled={!isAdmin || loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1">Description</label>
            <textarea 
              rows="4"
              className={`w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                !isAdmin ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-slate-50'
              }`}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your project"
              disabled={!isAdmin || loading}
            />
          </div>

          {isAdmin && (
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-200"
            >
              {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
              Save Changes
            </button>
          )}
        </form>
      </div>

      {isAdmin && (
        <div className="bg-red-50 p-8 rounded-3xl border border-red-100 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle size={24}/>
            <h3 className="text-lg font-black tracking-tight">Danger Zone</h3>
          </div>
          <p className="text-sm text-red-700 font-medium leading-relaxed">
            Deleting this project will remove all associated team memberships, Kanban tasks, and Cloudinary attachments.
          </p>
          <button 
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100 disabled:opacity-50"
          >
            <Trash2 size={18}/> Permanently Delete Project
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;