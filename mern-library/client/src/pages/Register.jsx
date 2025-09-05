// Register.jsx
import React, { useState, useEffect } from "react";
import "../styles.css";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://api-fable-forest.onrender.com/api/auth/register",
        form
      );
      localStorage.setItem("token", res.data.token);
      alert("Registration successful!");
      window.location.href = "/user";
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="login-container">
      <div id="particles-js"></div>
      <div
        className="login-box"
        style={{
          width: "320px",
          padding: "25px 20px",
          background: "transparent",
          border: "1px solid #00ffff",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
        }}
      >
        <h2 style={{ fontSize: "24px", marginBottom: "6px", color: "#00ffff" }}>
          REGISTER
        </h2>
        <p style={{ fontSize: "12px", marginBottom: "15px", color: "#888" }}>
          Create your account
        </p>
        <form onSubmit={handleRegister}>
          <div className="input-box" style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "#888" }}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                padding: "6px 8px",
                fontSize: "12px",
                background: "transparent",
                border: "1px solid #00ffff",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>
          <div className="input-box" style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "#888" }}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                padding: "6px 8px",
                fontSize: "12px",
                background: "transparent",
                border: "1px solid #00ffff",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>
          <div className="input-box" style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "#888" }}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                padding: "6px 8px",
                fontSize: "12px",
                background: "transparent",
                border: "1px solid #00ffff",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn"
            style={{
              padding: "8px",
              fontSize: "13px",
              width: "100%",
              background: "#00ffff",
              color: "#000",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Sign Up
          </button>
          <p
            className="register"
            style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}
          >
            Already have an account?{" "}
            <a href="/login" style={{ color: "#00ffff" }}>
              Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
