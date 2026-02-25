import { Paperclip, Trash2, ArrowRightLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const TaskCard = ({ task, projectId, onUpdate, canManage, onClick }) => {
  
  // FIXED: Logic to use your updateTask controller since there's no specific status route
  const handleStatusChange = async (e) => {
    e.stopPropagation(); 
    const statusOrder = ['todo', 'in_progress', 'done'];
    const currentIndex = statusOrder.indexOf(task.status?.toLowerCase());
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    try {
      // Your route is: router.route('/:projectId/t/:taskId').put(...)
      // Your controller looks for title and status in req.body
      await api.put(`/projects/tasks/${projectId}/t/${task._id}`, { 
        title: task.title, 
        status: nextStatus 
      });
      onUpdate(); 
    } catch (err) {
      console.error("Status Update Error:", err.response?.data);
      alert("Failed to move task. Check if status is valid.");
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this task?")) return;
    try {
      // Your route is: router.route('/:projectId/t/:taskId').delete(...)
      await api.delete(`/projects/tasks/${projectId}/t/${task._id}`);
      onUpdate();
    } catch (err) {
      console.error("Delete Error:", err.response?.data);
      alert("Failed to delete task");
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 hover:translate-y-[-2px] transition-all cursor-pointer relative"
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-slate-800 text-[14px] leading-tight group-hover:text-blue-600 pr-6">
          {task.title}
        </h4>
        
        {canManage && (
          <button 
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all absolute top-2 right-2"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          {/* Status Slide Button */}
          <button 
            onClick={handleStatusChange}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border border-blue-100"
          >
            <ArrowRightLeft size={10} /> {task.status?.replace('_', ' ')}
          </button>
          
          {task.attachments?.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Paperclip size={12} /> {task.attachments.length}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
           <img 
             src={task.assignedTo?.avatar.url || `https://ui-avatars.com/api/?name=${task.assignedTo?.username || 'U'}`} 
             className="h-6 w-6 rounded-full border border-slate-200 shadow-sm" 
             title={task.assignedTo?.username} 
           />
           <ChevronRight size={14} className="text-slate-300" />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;