import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [liveAlert, setLiveAlert] = useState(null);

  useEffect(() => {
    // Connect to backend Socket.IO
    const newSocket = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    setSocket(newSocket);

    if (user?.id) {
      newSocket.emit('join_user_room', user.id);
    }

    newSocket.on('notification', (data) => {
      setLiveAlert(data);
      setTimeout(() => setLiveAlert(null), 5000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, liveAlert, clearAlert: () => setLiveAlert(null) }}>
      {children}
      {liveAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-navy-900 text-white p-4 rounded-xl shadow-2xl border border-electric-500/40 flex items-start space-x-3 transition-all animate-bounce">
          <div className="p-2 bg-electric-600 rounded-lg shrink-0">🔔</div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{liveAlert.title || 'WorkPay Alert'}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{liveAlert.message}</p>
          </div>
          <button
            onClick={() => setLiveAlert(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

