import React, { useEffect } from "react";
import "../styles.css";
import "particles.js";

const Login = () => {
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

  return (
    <div className="login-container">
      <div id="particles-js"></div>
      <div className="login-box">
        <h2>LOGIN</h2>
        <p>Welcome Back</p>
        <form>
          <div className="input-box">
            <label>Username</label>
            <input type="text" required />
          </div>
          <div className="input-box">
            <label>Password</label>
            <input type="password" required />
          </div>
          <button type="submit" className="btn">Sign In</button>
          <p className="register">
            Don’t have an account? <a href="/">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
