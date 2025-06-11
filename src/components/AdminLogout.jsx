import { useNavigate } from 'react-router-dom';
import React from 'react';

export default function AdminLogout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');  // Clear the token
    navigate('/admin/login');              // Redirect to admin login
  };

  return (
    <button onClick={handleLogout} className="btn btn-outline-danger">
      Logout
    </button>
  );
}
