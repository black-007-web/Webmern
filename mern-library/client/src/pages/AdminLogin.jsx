import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles.css";
import "particles.js";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load particles.js config (same as Login.jsx)
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#00ffff" },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: 3 },
        line_linked: { enable: true, color: "#00ffff", opacity: 0.4 },
        move: { enable: true, speed: 2 },
      },
      interactivity: {
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" },
        },
      },
      retina_detect: true,
    });
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/admin/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.admin));
      navigate("/admin");
    } catch (err) {
      alert("Login failed. Check email/password.");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div id="particles-js"></div>
      <div className="login-box">
        <h2>ADMIN LOGIN</h2>
        <p>Welcome Back</p>
        <form onSubmit={handleAdminLogin}>
          <div className="input-box">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-box">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">Login</button>
          <p className="register">
            Not a user? <Link to="/login">User Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
