import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { 
  X, User, AlignLeft, CheckSquare, Paperclip, 
  Trash2, ExternalLink, Loader2, Clock, Plus, Trash
} from 'lucide-react';

const TaskDetailDrawer = ({ taskId, projectId, onClose }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newSubtask, setNewSubtask] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTaskDetails = useCallback(async () => {
    try {
      const res = await api.get(`/tasks/${projectId}/t/${taskId}`);
      setTask(res.data.data);
    } catch (err) {
      console.error("Fetch Details Error:", err);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [taskId, projectId, onClose]);

  useEffect(() => {
    if (taskId) fetchTaskDetails();
  }, [fetchTaskDetails]);

  // --- SUBTASK ACTIONS ---

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    setSubmitting(true);
    try {
      // Matches your createSubTask: POST /tasks/:projectId/t/:taskId/subtasks
      await api.post(`/tasks/${projectId}/t/${taskId}/subtasks`, { title: newSubtask });
      setNewSubtask('');
      fetchTaskDetails(); // Refresh list
    } catch (err) {
      alert("Failed to add subtask");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubtask = async (subTaskId, currentStatus) => {
    try {
      // Matches your updateSubTask: PUT /tasks/:projectId/st/:subTaskId
      await api.put(`/tasks/${projectId}/st/${subTaskId}`, { 
        isCompleted: !currentStatus 
      });
      fetchTaskDetails();
    } catch (err) {
      alert("Failed to update subtask");
    }
  };

  const handleDeleteSubtask = async (subTaskId) => {
    try {
      // Matches your deleteSubTask: DELETE /tasks/:projectId/st/:subTaskId
      await api.delete(`/tasks/${projectId}/st/${subTaskId}`);
      fetchTaskDetails();
    } catch (err) {
      alert("Failed to delete subtask");
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            task.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {task.status?.replace('_', ' ')}
          </span>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400">
            <X size={20}/>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Title & Meta */}
          <section>
            <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">{task.title}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><User size={16}/></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Assignee</p>
                  <p className="text-xs font-bold text-slate-700">{task.assignedTo?.username || 'Unassigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-amber-600"><Clock size={16}/></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Created</p>
                  <p className="text-xs font-bold text-slate-700">{new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Subtasks Section */}
          <section className="space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-slate-800">
              <CheckSquare size={18} className="text-slate-400"/> Subtasks
            </h3>
            
            {/* Add Subtask Input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input 
                type="text"
                placeholder="Add a step..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={submitting}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus size={20}/>
              </button>
            </form>

            {/* Subtask List */}
            <div className="space-y-2">
              {task.subtasks?.map((st) => (
                <div key={st._id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={() => toggleSubtask(st._id, st.isCompleted)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className={`text-sm ${st.isCompleted ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                      {st.title}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteSubtask(st._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash size={14}/>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Attachments */}
          {task.attachments?.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-slate-800">
                <Paperclip size={18} className="text-slate-400"/> Attachments
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {task.attachments.map((file, i) => (
                  <a key={i} href={file.url} target="_blank" rel="noreferrer"
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-[10px]">
                        {file.mimetype?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </div>
                      <div className="truncate text-xs font-bold text-slate-700">View File {i + 1}</div>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-500" />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailDrawer;