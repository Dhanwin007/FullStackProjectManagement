import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, LayoutDashboard, Loader2, FolderSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';

const Dashboard = () => {
  // 1. Updated State Name
  const [projects, setProjects] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      // Always good to fall back to an empty array
      const data = response.data?.data || [];
      // 2. Updated Setter
      setProjects(Array.isArray(data) ? data : []); 
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        sessionStorage.removeItem('isLoggedIn');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [navigate]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="mx-auto max-w-7xl p-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Projects</h1>
            <p className="text-slate-500 text-sm mt-1">Select a project to manage tasks and team</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={20} /> New Project
          </button>
        </div>

        {/* 3. Updated Length Check */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <FolderSearch className="text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">No projects found. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 4. Updated Map Function */}
            {projects.map((item) => (
              <ProjectCard 
                key={item.project?._id || item._id || Math.random()} 
                data={item} 
              />
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProjectCreated={fetchProjects} 
      />
    </div>
  );
};

export default Dashboard;