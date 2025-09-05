// client/src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import "../styles.css";
import "particles.js";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Load particles.js config
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#00ffff" },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: 3 },
        line_linked: { enable: true, color: "#00ffff", opacity: 0.4 },
        move: { enable: true, speed: 2 }
      },
      interactivity: {
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" }
        }
      },
      retina_detect: true
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
  const res = await axios.post('https://api-fable-forest.onrender.com/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/user'; // Redirect to user dashboard
    } catch (err) {
      alert('Login failed. Check email/password.');
    }
  };

  return (
    <div className="login-container">
      <div id="particles-js"></div>
      <div className="login-box">
        <h2>LOGIN</h2>
        <p>Welcome Back</p>
        <form onSubmit={handleLogin}>
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
          <button type="submit" className="btn">Sign In</button>
          <p className="register">
            Don’t have an account? <a href="/register">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
