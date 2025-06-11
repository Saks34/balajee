import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');  // clear token
    navigate('/customer/login');       // redirect to login page
  };

  return (
    <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
      Logout
    </button>
  );
}
