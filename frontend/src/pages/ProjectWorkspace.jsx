import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  ArrowLeft, 
  Loader2, 
  MessageSquare, 
  X 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BoardTab from '../components/BoardTab';
import MemberTab from '../components/MemberTab';
import SettingsTab from '../components/SettingsTab';
import ProjectChat from '../components/ProjectChat'; // Using your existing component

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // States
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('board');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      const data = response.data.data;

      setProject({
        ...data.project,
        role: data.role 
      });
    } catch (err) {
      console.error("Error fetching project:", err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  useEffect(() => { 
    fetchProjectDetails(); 
  }, [fetchProjectDetails]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] relative">
      <Navbar />
      
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <ArrowLeft size={20}/>
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {project?.name}
                </h1>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-widest">
                  {project?.role || 'Member'}
                </span>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['board', 'team', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
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

      {/* --- CHAT IMPLEMENTATION --- */}
      
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setShowChat(!showChat)}
        className={`fixed bottom-8 right-8 p-4 rounded-full shadow-2xl transition-all z-50 flex items-center justify-center active:scale-90 ${
          showChat ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {showChat ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window Popup */}
      {showChat && (
        <div className="fixed bottom-24 right-8 w-[400px] z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <ProjectChat projectId={projectId} />
        </div>
      )}
    </div>
  );
};

export default ProjectWorkspace;