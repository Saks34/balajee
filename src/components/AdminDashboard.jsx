import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Admin not logged in. Token missing.');
      setLoading(false);
      return;
    }

    const fetchSummaryAndCustomers = async () => {
      try {
        const [summaryRes, customersRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/summary', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('http://localhost:5000/api/admin/customers', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const summaryData = await summaryRes.json();
        const customersData = await customersRes.json();

        if (!summaryRes.ok) throw new Error(summaryData.message || 'Failed to fetch summary');
        if (!customersRes.ok) throw new Error(customersData.message || 'Failed to fetch customers');

        setSummary(summaryData.summary || {});
        setCustomers(customersData.customers.slice(0, 3)); // Show top 3 customers
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryAndCustomers();
  }, []);

  if (loading) return (
    <div className="container mt-5">
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <p className="text-center mt-3">Loading dashboard...</p>
    </div>
  );
  
  if (error) return (
    <div className="container mt-5">
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h2">Admin Dashboard</h1>
            <Link to="/admin/logout" className="btn btn-outline-danger">
              🚪 Logout
            </Link>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-6 col-lg-4 mb-3">
              <Link to="/admin/users/add" className="btn btn-primary w-100">
                <i className="bi bi-person-plus"></i> Add New Customer
              </Link>
            </div>
            <div className="col-md-6 col-lg-4 mb-3">
              <Link to="/admin/users" className="btn btn-success w-100">
                <i className="bi bi-people"></i> Manage Customers
              </Link>
            </div>
          </div>

          {summary && (
            <div className="row mb-4">
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h4 className="card-title">{summary.totalCustomers}</h4>
                        <p className="card-text">Total Customers</p>
                      </div>
                      <div className="align-self-center">
                        <i className="bi bi-people fs-2"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card bg-danger text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h4 className="card-title">₹{summary.totalDebits}</h4>
                        <p className="card-text">Total Debits</p>
                      </div>
                      <div className="align-self-center">
                        <i className="bi bi-arrow-down-circle fs-2"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h4 className="card-title">₹{summary.totalCredits}</h4>
                        <p className="card-text">Total Credits</p>
                      </div>
                      <div className="align-self-center">
                        <i className="bi bi-arrow-up-circle fs-2"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h4 className="card-title">₹{summary.balance}</h4>
                        <p className="card-text">Balance</p>
                      </div>
                      <div className="align-self-center">
                        <i className="bi bi-wallet2 fs-2"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top Customers</h5>
              <Link to="/admin/users" className="btn btn-outline-primary btn-sm">
                📄 Show All Customers
              </Link>
            </div>
            <div className="card-body">
              {customers.length > 0 ? (
                <div className="list-group list-group-flush">
                  {customers.map(c => (
                    <Link 
                      key={c.id || c._id}
                      to={`/admin/users/${c.id || c._id}`}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 className="mb-1">{c.name}</h6>
                        <small className="text-muted">{c.phone}</small>
                      </div>
                      <i className="bi bi-chevron-right"></i>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-person-x fs-1 text-muted"></i>
                  <p className="text-muted mt-2">No customers found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;