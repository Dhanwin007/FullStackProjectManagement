import { useState } from 'react';
import { X, FolderPlus, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(''); // Clear previous errors

  try {
    await api.post('/projects', formData);
    onProjectCreated();
    onClose();
    setFormData({ name: '', description: '', priority: 'MEDIUM', dueDate: '' });
  } catch (err) {
    // 1. Capture the message from your ApiError class
    const errorMessage = err.response?.data?.message || 'Something went wrong';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <FolderPlus size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Create New Project</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake">
    <AlertCircle size={18} className="shrink-0" />
    <span className="text-sm font-semibold">{error}</span>
  </div>
)}
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1.5">Project Name *</label>
            <input
              type="text" required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1.5">Description *</label>
            <textarea
              required rows="3"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1.5">Priority</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1.5">Due Date</label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:bg-blue-400">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;