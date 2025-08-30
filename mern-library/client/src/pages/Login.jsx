import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    <div className="login">
      <h2>User Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>Not registered? <a href="/register">Register here</a></p>
    </div>
  );
};

export default Login;
