import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../api/axios';
import { 
  X, User, AlignLeft, CheckSquare, Paperclip, 
  ExternalLink, Loader2, Clock, Plus, Trash, Edit3, Save, 
  UserPlus, Upload, Type
} from 'lucide-react';

const TaskDetailDrawer = ({ taskId, projectId, onClose }) => {
  const [task, setTask] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubtask, setNewSubtask] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Edit States
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  const fileInputRef = useRef(null);

  const userDataSession = JSON.parse(sessionStorage.getItem('user')) || {};
  const currentUser = userDataSession.user || {}; 
  const userRole = currentUser?.role?.toLowerCase();
  const canManage = ['admin', 'project_admin', 'member'].includes(userRole);

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/tasks/${projectId}/t/${taskId}`);
      const data = res.data.data;
      setTask(data);
      setEditedDesc(data.description || '');
      setEditedTitle(data.title || '');
    } catch (err) {
      onClose();
    } finally {
      setLoading(false);
    }
  }, [taskId, projectId, onClose]);

  const fetchProjectMembers = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      // Most VTU-based project structures return members where user info is an array from aggregation
      setProjectMembers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching members", err);
    }
  }, [projectId]);

  useEffect(() => {
    if (taskId) {
        fetchTaskDetails();
        fetchProjectMembers();
    }
  }, [fetchTaskDetails, fetchProjectMembers]);

  // --- UNIVERSAL UPDATE FUNCTION ---
  const updateTaskData = async (updates) => {
    if (!canManage) return;
    try {
      setSubmitting(true);
      const payload = {
        title: updates.title || task.title,
        status: updates.status || task.status,
        description: updates.description !== undefined ? updates.description : task.description,
        assignedTo: updates.assignedTo !== undefined ? updates.assignedTo : task.assignedTo?._id,
        priority: task.priority
      };

      const res = await api.put(`/projects/tasks/${projectId}/t/${taskId}`, payload);
      setTask(res.data.data);
      return res.data.data;
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  // --- SUBTASK ACTIONS ---
  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    try {
      setSubmitting(true);
      await api.post(`/projects/tasks/${projectId}/t/${taskId}/subtasks`, { title: newSubtask });
      setNewSubtask('');
      fetchTaskDetails(); 
    } catch (err) {
      alert("Failed to add subtask");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubtask = async (subTaskId, currentStatus) => {
    try {
      await api.put(`/projects/tasks/${projectId}/st/${subTaskId}`, { 
        isCompleted: !currentStatus 
      });
      fetchTaskDetails();
    } catch (err) {
      alert("Failed to update subtask");
    }
  };

  const handleDeleteSubtask = async (subTaskId) => {
    if(!window.confirm("Delete this subtask?")) return;
    try {
      await api.delete(`/projects/tasks/${projectId}/st/${subTaskId}`);
      fetchTaskDetails();
    } catch (err) {
      alert("Failed to delete subtask");
    }
  };

  // --- ATTACHMENT ACTIONS ---
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => formData.append('attachments', file));
    formData.append('title', task.title);
    formData.append('status', task.status);

    try {
      setSubmitting(true);
      const res = await api.put(`/projects/tasks/${projectId}/t/${taskId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTask(res.data.data);
      alert("Files uploaded successfully");
    } catch (err) {
      alert("Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    </div>
  );

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-md shadow-blue-100">
              {task.status?.replace('_', ' ')}
          </span>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* TITLE SECTION */}
          <section>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Type size={14}/> Task Title
                </h3>
                {isEditingTitle ? (
                    <button onClick={async () => { await updateTaskData({title: editedTitle}); setIsEditingTitle(false); }} className="text-emerald-600 text-[10px] font-bold">SAVE</button>
                ) : (
                    <button onClick={() => setIsEditingTitle(true)} className="text-slate-400 hover:text-blue-600"><Edit3 size={14}/></button>
                )}
            </div>
            {isEditingTitle ? (
                <input 
                    className="text-2xl font-black text-slate-900 w-full bg-slate-50 border-b-2 border-blue-500 outline-none pb-1"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    autoFocus
                />
            ) : (
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{task.title}</h2>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Assignee</p>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden border bg-white flex items-center justify-center">
                        {task.assignedTo?.avatar?.url ? <img src={task.assignedTo.avatar.url} className="h-full w-full object-cover" /> : <User size={14} className="text-slate-300"/>}
                    </div>
                    <select 
                        className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer w-full"
                        value={task.assignedTo?._id || ""}
                        onChange={(e) => updateTaskData({ assignedTo: e.target.value || null })}
                    >
                        <option value="">Unassigned</option>
                        {projectMembers.map(m => {
                            const u = Array.isArray(m.user) ? m.user[0] : m.user;
                            return u ? <option key={u._id} value={u._id}>{u.username}</option> : null;
                        })}
                    </select>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Created On</p>
                <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                    <Clock size={14} className="text-amber-500"/>
                    {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2"><AlignLeft size={14}/> Description</h3>
                <button onClick={() => isEditingDesc ? updateTaskData({description: editedDesc}).then(() => setIsEditingDesc(false)) : setIsEditingDesc(true)} className="text-[10px] font-bold text-blue-600">
                    {isEditingDesc ? <span className="flex items-center gap-1 text-emerald-600"><Save size={12}/> Save</span> : "Edit"}
                </button>
            </div>
            {isEditingDesc ? (
                <textarea className="w-full bg-slate-50 border border-blue-200 rounded-2xl p-4 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500" value={editedDesc} onChange={(e) => setEditedDesc(e.target.value)}/>
            ) : (
                <div className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">{task.description || "No description provided."}</div>
            )}
          </section>

          {/* SUBTASKS */}
          <section className="space-y-4">
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2"><CheckSquare size={14}/> Subtasks ({task.subtasks?.length || 0})</h3>
            <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input 
                    type="text"
                    placeholder="Add a step..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                />
                <button type="submit" disabled={submitting || !newSubtask.trim()} className="p-2 bg-slate-900 text-white rounded-xl active:scale-95 transition-transform"><Plus size={20}/></button>
            </form>
            <div className="space-y-2">
              {task.subtasks?.map((st) => (
                <div key={st._id} className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={st.isCompleted} onChange={() => toggleSubtask(st._id, st.isCompleted)} className="w-5 h-5 rounded-lg text-blue-600 cursor-pointer" />
                    <span className={`text-sm font-medium ${st.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>{st.title}</span>
                  </div>
                  <button onClick={() => handleDeleteSubtask(st._id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash size={14}/></button>
                </div>
              ))}
            </div>
          </section>

          {/* ATTACHMENTS */}
          <section className="space-y-4 pb-10">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2"><Paperclip size={14}/> Attachments</h3>
                <button onClick={() => fileInputRef.current.click()} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Upload size={14}/></button>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {task.attachments?.map((file, i) => (
                <a key={i} href={file.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-white hover:border-blue-400 group shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-[10px]">{file.mimetype?.split('/')[1]?.toUpperCase() || 'FILE'}</div>
                    <div className="truncate max-w-[200px]"><p className="text-xs font-black text-slate-800 truncate">File {i + 1}</p></div>
                  </div>
                  <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500" />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailDrawer;

