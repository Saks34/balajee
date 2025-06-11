import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLogout from './AdminLogout';
import axios from 'axios';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/customers', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setCustomers(data.customers);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/customers/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });
      setCustomers(customers.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete customer");
    }
  };

  if (loading) return (
    <div className="container mt-5">
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <p className="text-center mt-3">Loading customers...</p>
    </div>
  );

  if (error) return (
    <div className="container mt-5">
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Error: {error}
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h3">
              <i className="bi bi-people-fill me-2"></i>
              Customer Management
            </h2>
            <div className="d-flex gap-2">
              <Link to="/admin/dashboard" className="btn btn-outline-secondary">
                <i className="bi bi-house"></i> Dashboard
              </Link>
              <AdminLogout />
            </div>
          </div>

          {/* Add Customer Button */}
          <div className="mb-4">
            <Link to="/admin/users/add" className="btn btn-primary">
              <i className="bi bi-person-plus me-2"></i>
              Add New Customer
            </Link>
          </div>

          {/* Customer List */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                All Customers ({customers.length})
              </h5>
            </div>
            <div className="card-body">
              {customers.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-person-x fs-1 text-muted"></i>
                  <p className="text-muted mt-3">No customers found.</p>
                  <Link to="/admin/users/add" className="btn btn-primary">
                    <i className="bi bi-person-plus me-2"></i>
                    Add First Customer
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>
                          <i className="bi bi-person me-1"></i>
                          Name
                        </th>
                        <th>
                          <i className="bi bi-geo-alt me-1"></i>
                          Address
                        </th>
                        <th>
                          <i className="bi bi-telephone me-1"></i>
                          Phone
                        </th>
                        <th className="text-center">
                          <i className="bi bi-gear me-1"></i>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(({ _id, name, address, phone }) => (
                        <tr key={_id}>
                          <td>
                            <strong>{name}</strong>
                          </td>
                          <td>
                            <span className="text-muted">
                              {address || '-'}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {phone}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <Link 
                                to={`/admin/users/${_id}`} 
                                className="btn btn-primary btn-sm"
                                title="View Khata"
                              >
                                <i className="bi bi-eye"></i>
                                <span className="d-none d-md-inline ms-1">View</span>
                              </Link>
                              <Link 
                                to={`/admin/users/${_id}/edit`} 
                                className="btn btn-warning btn-sm"
                                title="Edit Customer"
                              >
                                <i className="bi bi-pencil"></i>
                                <span className="d-none d-md-inline ms-1">Edit</span>
                              </Link>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(_id)}
                                title="Delete Customer"
                              >
                                <i className="bi bi-trash"></i>
                                <span className="d-none d-md-inline ms-1">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          {customers.length > 0 && (
            <div className="card mt-4 bg-light">
              <div className="card-body text-center">
                <div className="row">
                  <div className="col-md-4">
                    <i className="bi bi-people fs-2 text-primary"></i>
                    <h5 className="mt-2">Total Customers</h5>
                    <h3 className="text-primary">{customers.length}</h3>
                  </div>
                  <div className="col-md-4">
                    <i className="bi bi-plus-circle fs-2 text-success"></i>
                    <h5 className="mt-2">Quick Actions</h5>
                    <Link to="/admin/users/add" className="btn btn-success btn-sm">
                      Add Customer
                    </Link>
                  </div>
                  <div className="col-md-4">
                    <i className="bi bi-house fs-2 text-info"></i>
                    <h5 className="mt-2">Navigation</h5>
                    <Link to="/admin/dashboard" className="btn btn-info btn-sm">
                      Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;