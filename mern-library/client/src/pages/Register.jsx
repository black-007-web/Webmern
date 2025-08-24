import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // ✅ Corrected endpoint
      const res = await axios.post('/api/auth/register', form);
      localStorage.setItem('token', res.data.token); // Save token (if returned)
      alert('Registration successful!');
      window.location.href = '/user'; // Redirect to user dashboard
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="register">
      <h2>User Registration</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>Already registered? <a href="/login">Login here</a></p>
    </div>
  );
};

export default Register;
