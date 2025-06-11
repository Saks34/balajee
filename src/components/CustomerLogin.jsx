import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CustomerLogin() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Login failed');
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);

      if (rememberMe) {
        localStorage.removeItem('tokenExpiry'); // no expiry, keep until logout
      } else {
        const expiryTime = Date.now() + 4 * 60 * 60 * 1000; // 4 hours
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      }

      // Changed navigation path to match new route structure
      navigate('/dashboard');
    } catch (err) {
      setError('Server error, please try again later.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Customer Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Business Name</label><br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Phone Number</label><br />
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />{' '}
            Remember Me
          </label>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ marginTop: 15 }}>Login</button>
      </form>
    </div>
  );
}

export default CustomerLogin;
