import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

// Point to backend server port 3000
const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace("/api", "") 
  : "http://localhost:3000";

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  return useContext(SocketContext);
};
