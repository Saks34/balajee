import React, { useState } from 'react';

export default function AdminCustomerAdd() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Admin not authenticated');
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, address }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Customer added successfully!');
        setName('');
        setPhone('');
        setAddress('');
      } else {
        setError(data.message || 'Failed to add customer');
      }
    } catch (err) {
      setError('Network error');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Add New Customer</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name*</label><br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Phone*</label><br />
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Address</label><br />
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
        <button type="submit" disabled={loading} style={{ marginTop: 15 }}>
          {loading ? 'Adding...' : 'Add Customer'}
        </button>
      </form>
    </div>
  );
}
