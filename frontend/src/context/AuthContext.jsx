import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login from localStorage token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode JWT payload (base64)
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Check expiration
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          // Restore user from stored data
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            setUser({ _id: payload.id, id: payload.id });
          }
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Persist user to localStorage whenever it changes
  const updateUser = (newUser) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);