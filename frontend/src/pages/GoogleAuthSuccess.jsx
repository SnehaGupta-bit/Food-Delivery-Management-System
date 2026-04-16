import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (token) {
      localStorage.setItem("token", token);
      
      // Decode token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Fetch user details
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          setUser(data.user);
          toast.success("Welcome! 🎉");
          navigate("/");
        })
        .catch(() => {
          toast.error("Authentication failed");
          navigate("/login");
        });
      } catch (error) {
        toast.error("Authentication failed");
        navigate("/login");
      }
    } else {
      toast.error("Authentication failed");
      navigate("/login");
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ fontSize: '3rem' }}>🔐</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Completing sign in...</div>
    </div>
  );
}
