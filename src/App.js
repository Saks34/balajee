import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import CustomerLogin from './components/CustomerLogin';
import CustomerDashboard from './components/CustomerDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Logout from './components/Logout';
import AdminLogout from './components/AdminLogout';
import AdminCustomerAdd from './components/AdminCustomerAdd';
import AddCredit from './components/AddCredit';
import AdminAddDebit from './components/AddDebit';
import AdminCustomerList from './components/CustomerList';
import AdminCustomerDetails from './components/CustomerDetails';
import CustomerEdit from './components/CustomerEdit';
import CustomerCreditForm from './components/CustomerCreditForm';

// Private Route wrapper for admin
function AdminPrivateRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
}

// Private Route wrapper for regular users
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const expiry = localStorage.getItem('tokenExpiry');
  if (token && expiry && Date.now() > parseInt(expiry, 10)) {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    return <Navigate to="/login" />;
  }
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      {/* Main routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/dashboard" element={<PrivateRoute><CustomerDashboard /></PrivateRoute>} />
      <Route path="/logout" element={<Logout />} />
      {/* Changed this line to accept customer ID parameter */}
      {/* Support both /pay and /pay/:customerId routes */}
      <Route path="/pay" element={<PrivateRoute><CustomerCreditForm /></PrivateRoute>} />
      <Route path="/pay/:customerId" element={<PrivateRoute><CustomerCreditForm /></PrivateRoute>} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/logout" element={<AdminLogout />} />
      <Route path="/admin/dashboard" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
      <Route path="/admin/users" element={<AdminPrivateRoute><AdminCustomerList /></AdminPrivateRoute>} />
      <Route path="/admin/users/add" element={<AdminPrivateRoute><AdminCustomerAdd /></AdminPrivateRoute>} />
      <Route path="/admin/users/:id" element={<AdminPrivateRoute><AdminCustomerDetails /></AdminPrivateRoute>} />
      <Route path="/admin/users/:id/credit" element={<AdminPrivateRoute><AddCredit /></AdminPrivateRoute>} />
      <Route path="/admin/users/:id/debit" element={<AdminPrivateRoute><AdminAddDebit /></AdminPrivateRoute>} />
      <Route path="/admin/users/:id/edit" element={<AdminPrivateRoute><CustomerEdit /></AdminPrivateRoute>} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;