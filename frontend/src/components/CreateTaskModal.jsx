import { useState, useEffect } from 'react';
import { X, Upload, Loader2, User } from 'lucide-react';
import api from '../api/axios';

const CreateTaskModal = ({ isOpen, onClose, projectId, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo', // Matches your TaskStatusEnum ('todo')
    assignedToID: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch project members so we can assign the task to someone
  useEffect(() => {
    if (isOpen && projectId) {
      const fetchMembers = async () => {
        try {
          const res = await api.get(`/projects/${projectId}/members`);
          setMembers(res.data.data || []);
        } catch (err) {
          console.error("Error fetching members:", err);
        }
      };
      fetchMembers();
    }
  }, [isOpen, projectId]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (attachments.length + selectedFiles.length > 5) {
      alert("Maximum 5 attachments allowed.");
      return;
    }
    setAttachments([...attachments, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Use FormData for multi-part (files + text)
    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('status', formData.status);
    
    if (formData.assignedToID) {
      data.append('assignedToID', formData.assignedToID);
    }

    // Append up to 5 files
    attachments.forEach((file) => {
      data.append('attachments', file);
    });

    try {
      // Matches your backend router.route('/:projectId').post(...)
      await api.post(`/projects/tasks/${projectId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onTaskCreated(); // Refresh the board tasks
      setFormData({ title: '', description: '', status: 'todo', assignedToID: '' });
      setAttachments([]);
      onClose();
    } catch (err) {
      console.error("Task Creation Error:", err.response?.data);
      alert(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">New Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1">Title</label>
            <input 
              type="text" required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-1">Status</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-1">Assign To</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                value={formData.assignedToID}
                onChange={(e) => setFormData({...formData, assignedToID: e.target.value})}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user?._id} value={m.user?._id}>
                    {m.user?.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1">Description</label>
            <textarea 
              rows="3"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Files */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1">Attachments ({attachments.length}/5)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  <button type="button" onClick={() => removeFile(i)}><X size={12}/></button>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
              <Upload size={18} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase">Click to upload</span>
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;