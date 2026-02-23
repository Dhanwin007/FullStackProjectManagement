import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Layout, Users, Settings, ArrowLeft, Loader2, Plus, Trash2, Edit3 } from 'lucide-react';
import Navbar from '../components/Navbar';
import BoardTab from '../components/BoardTab';
import MemberTab from '../components/MemberTab';
import SettingsTab from '../components/SettingsTab';

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('board');
  const [loading, setLoading] = useState(true);
const fetchProjectDetails = useCallback(async () => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    const data = response.data.data;

    // We spread data.project so all project fields (name, desc) are there,
    // then we explicitly add 'role' so the Tabs can see it.
    setProject({
      ...data.project,
      role: data.role 
    });
  } catch (err) {
    navigate('/dashboard');
  } finally {
    setLoading(false);
  }
}, [projectId]);
  useEffect(() => { fetchProjectDetails(); }, [fetchProjectDetails]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
               <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition"><ArrowLeft size={20}/></button>
               <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project?.name}</h1>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-widest">
                    {project?.role || 'Member'}
                  </span>
               </div>
            </div>

            <nav className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['board', 'team', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {activeTab === 'board' && <BoardTab projectId={projectId} userRole={project?.role} />}
        {activeTab === 'team' && <MemberTab projectId={projectId} userRole={project?.role} />}
        {activeTab === 'settings' && (
          <SettingsTab 
            project={project} 
            onUpdate={fetchProjectDetails} 
            onDelete={() => navigate('/dashboard')} 
          />
        )}
      </main>
    </div>
  );
};

export default ProjectWorkspace;