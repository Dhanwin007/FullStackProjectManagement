import { Calendar, ArrowRight, ClipboardList, Shield, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const ProjectCard = ({ data }) => {
  const navigate = useNavigate();

  // Mapping logic based on your specific aggregation structure
  const project = data?.project || {};
  const name = project?.name || "Untitled Project";
  const description = project?.description || "No description provided.";
  const role = data?.role || "MEMBER";
  const id = project?._id;
  const createdAt = project?.createdAt;
  
  // 1. MATCHING YOUR CONTROLLER: Your controller sends 'members'
  const membersCount = project?.members || 0;
  const creator = project?.createdBy || "Owner";

  const handleNavigation = () => {
  if (id) {
    // This matches the path you defined in your App routes
    navigate(`/project/${id}`);
  } else {
    console.error("Navigation failed: No project ID found in data", project);
  }
};
  return (
    <div 
      onClick={handleNavigation}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-blue-400 cursor-pointer relative"
    >
      {/* Role Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 group-hover:bg-blue-50 transition-colors">
        <Shield size={10} className="text-slate-400 group-hover:text-blue-500" />
        <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-500 group-hover:text-blue-700">
          {role}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
            <ClipboardList size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 truncate pr-10">
            {name}
          </h3>
        </div>
        
        <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <Calendar size={12} />
          {createdAt ? new Date(createdAt).toLocaleDateString('en-GB') : "Recently"}
        </p>
      </div>
      
      <p className="mb-6 text-sm text-slate-500 line-clamp-2 leading-relaxed min-h-[40px]">
        {description}
      </p>

      {/* Meta Info Row */}
      <div className="flex items-center gap-3 mb-2 text-[11px] font-semibold text-slate-500">
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
          <Users size={14} className="text-slate-400" />
          <span>{membersCount} {membersCount === 1 ? 'Member' : 'Members'}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
          <User size={14} className="text-slate-400" />
          <span className="truncate max-w-[100px]">By {creator}</span>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
        <span className="text-[10px] font-bold text-blue-600/40 group-hover:text-blue-600 transition-colors uppercase tracking-widest">
          View Details
        </span>
        <span className="text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Open <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;