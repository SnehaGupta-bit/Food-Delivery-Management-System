import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext.jsx";
import { loginUser, googleAuth } from "../services/api.js";
import toast from "react-hot-toast";
import "../styles/customer-panel.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const data = await loginUser(form);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      toast.success("Welcome back! 🎉", {
        style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(255,255,255,0.08)" },
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        // Step 1: Get user info from Google
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await res.json();
        
        // Step 2: Send to backend
        const data = await googleAuth({
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.sub,
          avatar: googleUser.picture,
        });

        localStorage.setItem("token", data.token);
        setUser(data.user);
        toast.success(`Welcome back, ${googleUser.name}! 🎉`, {
          style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(255,255,255,0.08)" },
        });
        navigate("/");
      } catch (err) {
        toast.error("Google login failed.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("Google login cancelled")
  });

  return (
    <div className="auth-wrap">
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Visual Side */}
        <motion.div
          className="auth-visual"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="auth-visual-emoji">👋</div>
          <div className="auth-visual-title">Welcome to QuickBite</div>
          <div className="auth-visual-sub">
            AI-powered food delivery with mood-based ordering, group dining, and ultra-fast delivery.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            {["🍕", "🍔", "🍜", "🍣", "🍰"].map((e, i) => (
              <motion.span
                key={i}
                style={{ fontSize: 28 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              >
                {e}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Form Side */}
        <div className="auth-card">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-sub">Continue your food journey</p>
          </motion.div>

          <motion.button
            className="google-btn"
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          <div className="auth-divider">or sign in with email</div>

          <form onSubmit={handleSubmit}>
            <motion.div className="form-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" name="email"
                placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </motion.div>

            <motion.div className="form-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input className="form-input" type={showPass ? "text" : "password"} name="password"
                  placeholder="••••••••" value={form.password} onChange={handleChange}
                  style={{ paddingRight: 44 }} />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "var(--text-muted)",
                    cursor: "pointer", fontSize: 16,
                  }}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.p className="error-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              className="form-btn"
              disabled={loading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </motion.button>
          </form>

          <div className="auth-switch">
            Don't have an account? <Link to="/register">Create one →</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}