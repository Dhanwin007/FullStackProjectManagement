import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Loader2 } from 'lucide-react';
import api from '../api/axios';

const ProjectChat = ({ projectId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef(null);

  // Safely get user data once
  const currentUser = JSON.parse(sessionStorage.getItem('user'))?.user;

  // 1. Setup Socket Connection
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', {
      withCredentials: true
    });
    setSocket(newSocket);

    newSocket.emit('join_project', projectId);

    newSocket.on('receive_message', (data) => {
      // Logic: Only add if it's from someone else, 
      // OR if it's from me but doesn't exist in state yet (to avoid duplicates)
      setMessages((prev) => {
        const isDuplicate = prev.find(m => m._id === data._id && data._id !== undefined);
        if (isDuplicate) return prev;
        return [...prev, data];
      });
    });

    return () => {
      newSocket.emit('leave_project', projectId);
      newSocket.close();
    };
  }, [projectId]);

  // 2. Fetch Chat History
 // Inside ProjectChat.jsx

useEffect(() => {
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      // Ensure this path matches app.use("/api/v1/chat", chatRouter) in app.js
      const res = await api.get(`/chat/${projectId}`); 
      
      // Accessing the data correctly based on your ApiResponse structure
      if (res.data && res.data.data) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error("❌ Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (projectId) {
    fetchHistory();
  }
}, [projectId]);

  // 3. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messagePayload = {
      project: projectId,
      content: newMessage,
      sender: currentUser // Sending full user object for immediate UI update
    };

    // 1. Emit to socket for real-time
    socket.emit('send_message', messagePayload);
    
    // 2. Save to DB & clear input
    try {
      setNewMessage(''); // Clear immediately for UX
      await api.post(`/chat/${projectId}`, { content: newMessage });
    } catch (err) {
      console.error("Failed to save message");
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Project Chat</h3>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fcfcfd] custom-scrollbar">
        {loadingHistory ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-300" />
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender?._id === currentUser?._id;
            return (
              <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {!isMe && (
                    <div className="h-7 w-7 rounded-full overflow-hidden border border-slate-200 flex-shrink-0 mt-auto">
                      <img 
                        src={msg.sender?.avatar?.url || `https://ui-avatars.com/api/?name=${msg.sender?.username}`} 
                        className="h-full w-full object-cover" 
                        alt="avatar"
                      />
                    </div>
                  )}
                  
                  <div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-100 shadow-lg' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <p className={`text-[9px] mt-1 font-bold uppercase tracking-tight ${isMe ? 'text-right text-slate-400' : 'text-left text-slate-400'}`}>
                      {!isMe && `${msg.sender?.username} • `}
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text"
          placeholder="Message teammates..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-300"
        >
          <Send size={18}/>
        </button>
      </form>
    </div>
  );
};

export default ProjectChat;