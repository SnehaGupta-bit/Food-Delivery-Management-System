import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { loginUser } from "../services/api.js";

export default function Login() {
  const [form, setForm] = useState({ email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const data = await loginUser(form);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ fontSize:48, marginBottom:16 }}>👋</div>
        <h1 className="auth-title">Welcome back!</h1>
        <p className="auth-sub">Sign in to continue your food journey</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" name="email"
              placeholder="you@example.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password"
              placeholder="••••••••" value={form.password} onChange={handleChange} />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="form-btn" disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in..." : "Sign In 🚀"}
          </button>
        </form>
        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create one →</Link>
        </div>
      </div>
    </div>
  );
}