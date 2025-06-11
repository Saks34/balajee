import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [summary, setSummary] = useState(null);
  const [debits, setDebits] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('adminToken');

        if (!token) throw new Error('Unauthorized: No token found');

        const headers = {
          Authorization: `Bearer ${token}`
        };

        // Fetch customer and summary
        const res = await fetch(`http://localhost:5000/api/admin/customers/${id}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch customer details');
        const data = await res.json();
        if (!data.success) throw new Error('Error fetching customer details');
        setCustomer(data.customer);
        setSummary(data.summary);

        // Fetch debits
        const debitsRes = await fetch(`http://localhost:5000/api/admin/debits/${id}`, { headers });
        if (!debitsRes.ok) {
          const errorData = await debitsRes.json();
          throw new Error(errorData.message || 'Failed to fetch debits');
        }
        const debitsData = await debitsRes.json();
        if (debitsData.success) {
          setDebits(debitsData.debits || []);
        } else {
          console.warn('Debits fetch unsuccessful:', debitsData.message);
          setDebits([]);
        }

        // Fetch credits
        const creditsRes = await fetch(`http://localhost:5000/api/admin/credits/${id}`, { headers });
        if (!creditsRes.ok) {
          const errorData = await creditsRes.json();
          throw new Error(errorData.message || 'Failed to fetch credits');
        }
        const creditsData = await creditsRes.json();
        if (creditsData.success) {
          setCredits(creditsData.credits || []);
        } else {
          console.warn('Credits fetch unsuccessful:', creditsData.message);
          setCredits([]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="container mt-5">
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <p className="text-center mt-3">Loading customer details...</p>
    </div>
  );

  if (error) return (
    <div className="container mt-5">
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    </div>
  );

  // Add null checks for customer and summary
  if (!customer || !summary) return (
    <div className="container mt-5">
      <div className="alert alert-warning" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Customer data not found.
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h3">Customer Details</h2>
            <div>
              <Link to="/admin/users" className="btn btn-outline-secondary me-2">
                <i className="bi bi-arrow-left"></i> Back to Customers
              </Link>
              <Link to={`/admin/users/${id}/edit`} className="btn btn-primary">
                <i className="bi bi-pencil"></i> Edit Customer
              </Link>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Customer Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Name:</strong> {customer.name || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Phone:</strong> {customer.phone || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card bg-danger text-white">
                <div className="card-body text-center">
                  <i className="bi bi-arrow-down-circle fs-2 mb-2"></i>
                  <h4>₹{summary.debitAmount || 0}</h4>
                  <p className="mb-0">Total Debits</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <i className="bi bi-arrow-up-circle fs-2 mb-2"></i>
                  <h4>₹{summary.creditAmount || 0}</h4>
                  <p className="mb-0">Total Credits</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className={`card ${(summary.balance || 0) >= 0 ? 'bg-info' : 'bg-warning'} text-white`}>
                <div className="card-body text-center">
                  <i className="bi bi-wallet2 fs-2 mb-2"></i>
                  <h4>₹{summary.balance || 0}</h4>
                  <p className="mb-0">Balance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="row mb-4">
            <div className="col-md-6 mb-2">
              <Link to={`/admin/users/${id}/debit`} className="btn btn-danger w-100">
                <i className="bi bi-plus-circle me-2"></i>
                Add Debit
              </Link>
            </div>
            <div className="col-md-6 mb-2">
              <Link to={`/admin/users/${id}/credit`} className="btn btn-success w-100">
                <i className="bi bi-plus-circle me-2"></i>
                Add Credit
              </Link>
            </div>
          </div>

          {/* Debits Table */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-arrow-down-circle text-danger me-2"></i>
                Debits
              </h5>
            </div>
            <div className="card-body">
              {debits.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <p className="text-muted mt-2">No debits yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debits.map(d => (
                        <tr key={d._id}>
                          <td>
                            <strong className="text-danger">₹{d.totalAmount || 0}</strong>
                          </td>
                          <td>{d.date ? new Date(d.date).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            {d.invoicePdfPath ? (
                              <a
                                href={`${d.invoicePdfPath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary btn-sm"
                              >
                                <i className="bi bi-download me-1"></i>
                                Download
                              </a>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Credits Table */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-arrow-up-circle text-success me-2"></i>
                Credits
              </h5>
            </div>
            <div className="card-body">
              {credits.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <p className="text-muted mt-2">No credits yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Date</th>
                        <th>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {credits.map(c => (
                        <tr key={c._id}>
                          <td>
                            <strong className="text-success">₹{c.amount || 0}</strong>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {c.paymentMethod || 'Credit'}
                            </span>
                          </td>
                          <td>{c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            {c.receiptUrl ? (
                              <a
                                href={c.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-success btn-sm"
                              >
                                 <i className="bi bi-download me-1"></i>
                                Download
                              </a>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}