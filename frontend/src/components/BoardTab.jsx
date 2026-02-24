import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { Plus, Loader2, AlertCircle, LayoutDashboard } from 'lucide-react';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailDrawer from './TaskDetailDrawer'; // 1. Component Imported

const BoardTab = ({ projectId, userRole }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null); // 2. Selection state added

  // 1. Permissions Logic
  const user = JSON.parse(sessionStorage.getItem('user'));
  const currentUserRole = userRole?.toLowerCase();
  const canManage = currentUserRole === 'admin' || currentUserRole === 'project_admin';

  // 2. Fetch Tasks using your specific path
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/tasks/${projectId}`);
      setTasks(res.data.data || []);
    } catch (err) {
      console.error("Board Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchTasks();
  }, [fetchTasks]);

  // 3. Define Column Structure
  const columns = [
    { id: 'todo', label: 'To Do', color: 'bg-slate-400' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
    { id: 'done', label: 'Completed', color: 'bg-emerald-500' }
  ];

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Board...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full">
      {/* --- BOARD HEADER --- */}
      <div className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Project Board</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Workflow Management</p>
          </div>
        </div>

        {canManage && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      {/* --- KANBAN BOARD --- */}
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[550px] custom-scrollbar">
        {columns.map((column) => {
          const columnTasks = tasks.filter(t => t.status?.toLowerCase() === column.id);

          return (
            <div key={column.id} className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4 px-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${column.color}`}></span>
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">{column.label}</h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/50 border border-slate-200/60 rounded-[2rem] p-3 flex-1 space-y-4">
                {columnTasks.map((task) => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    projectId={projectId} 
                    onUpdate={fetchTasks}
                    canManage={canManage}
                    // 3. Updated onClick to set selection for drawer
                    onClick={() => setSelectedTaskId(task._id)} 
                  />
                ))}

                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 opacity-30">
                    <AlertCircle size={32} className="mb-2 text-slate-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No Tasks Found</p>
                  </div>
                )}

                {canManage && (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-2xl border border-dashed border-slate-200 hover:border-blue-200 transition-all group"
                  >
                    <Plus size={14} className="group-hover:scale-125 transition-transform" /> 
                    Add Task to {column.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 4. TASK DETAIL DRAWER (Conditional Rendering) --- */}
      {selectedTaskId && (
        <TaskDetailDrawer 
          taskId={selectedTaskId}
          projectId={projectId}
          onClose={() => {
            setSelectedTaskId(null);
            fetchTasks(); // Refresh board in case subtasks changed
          }}
        />
      )}

      {/* --- TASK CREATION MODAL --- */}
      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projectId={projectId} 
        onTaskCreated={fetchTasks} 
      />
    </div>
  );
};

export default BoardTab;