import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState(null);
  const [summary, setSummary] = useState(null);
  const [debits, setDebits] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDebits, setExpandedDebits] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please login');
        setLoading(false);
        return;
      }

      try {
        // Fetch customer info, debits, credits
        const res = await fetch('http://localhost:5000/api/customers/me', {
          headers: { 'Authorization': 'Bearer ' + token },
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError('Session expired, please login again');
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch customer data');
        }
        
        const data = await res.json();
        
        // Add null checks for the response data
        if (!data || !data.customer) {
          throw new Error('Invalid customer data received');
        }
        
        setCustomer(data.customer);
        setDebits(data.debits || []);
        setCredits(data.credits || []);

        // Fetch summary separately
        const sumRes = await fetch('http://localhost:5000/api/customers/me/summary', {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        });
        
        if (!sumRes.ok) {
          if (sumRes.status === 401) {
            setError('Session expired, please login again');
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch summary');
        }
        
        const sumData = await sumRes.json();
        setSummary(sumData.summary || {
          debitAmount: 0,
          creditAmount: 0,
          balance: 0
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDebitExpansion = (debitId) => {
    const newExpanded = new Set(expandedDebits);
    if (newExpanded.has(debitId)) {
      newExpanded.delete(debitId);
    } else {
      newExpanded.add(debitId);
    }
    setExpandedDebits(newExpanded);
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <p className="text-center mt-3">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        {error.includes('login') && (
          <div className="text-center">
            <button 
              onClick={() => navigate('/login')} 
              className="btn btn-primary"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    );
  }

  // Add null checks for customer and summary
  if (!customer) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Customer data not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h3 mb-1">
                <i className="bi bi-person-circle me-2 text-primary"></i>
                Welcome, {customer.name || 'User'}
              </h2>
              <p className="text-muted mb-0">
                <i className="bi bi-telephone me-1"></i>
                Phone: {customer.phone || '-'}
              </p>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-outline-danger"
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>

          {/* Make Payment Button */}
          <div className="mb-4">
            <button
              onClick={() => navigate('/pay')}
              className="btn btn-primary btn-lg"
            >
              <i className="bi bi-credit-card me-2"></i>
              Make Payment
            </button>
          </div>

          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-12 mb-3">
              <h3 className="h4 mb-3">
                <i className="bi bi-bar-chart me-2 text-info"></i>
                Khata Summary
              </h3>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card bg-danger text-white">
                <div className="card-body text-center">
                  <i className="bi bi-arrow-down-circle fs-2 mb-2"></i>
                  <h4>₹{summary?.debitAmount || 0}</h4>
                  <p className="mb-0">Total Debits</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <i className="bi bi-arrow-up-circle fs-2 mb-2"></i>
                  <h4>₹{summary?.creditAmount || 0}</h4>
                  <p className="mb-0">Total Credits</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className={`card ${(summary?.balance || 0) >= 0 ? 'bg-info' : 'bg-warning'} text-white`}>
                <div className="card-body text-center">
                  <i className="bi bi-wallet2 fs-2 mb-2"></i>
                  <h4>₹{summary?.balance || 0}</h4>
                  <p className="mb-0">Balance</p>
                </div>
              </div>
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
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debits.map(d => (
                        <React.Fragment key={d._id}>
                          <tr>
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
                            <td>
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => toggleDebitExpansion(d._id)}
                                aria-expanded={expandedDebits.has(d._id)}
                              >
                                <i className={`bi ${expandedDebits.has(d._id) ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`}></i>
                                {expandedDebits.has(d._id) ? 'Hide' : 'Show'} Items
                              </button>
                            </td>
                          </tr>
                          {expandedDebits.has(d._id) && (
                            <tr className="bg-light">
                              <td colSpan="4">
                                <div className="p-3">
                                  <h6 className="mb-3">
                                    <i className="bi bi-box-seam me-2"></i>
                                    Product Details
                                  </h6>
                                  {d.items && d.items.length > 0 ? (
                                    <div className="table-responsive">
                                      <table className="table table-sm table-bordered">
                                        <thead className="table-secondary">
                                          <tr>
                                            <th>#</th>
                                            <th>Product Name</th>
                                            <th>HSN Code</th>
                                            <th>Quantity</th>
                                            <th>Unit Price</th>
                                            <th>Amount</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {d.items.map((item, index) => (
                                            <tr key={index}>
                                              <td>{item.serialNo || (index + 1)}</td>
                                              <td>{item.name || 'N/A'}</td>
                                              <td>
                                                <span className="badge bg-secondary">
                                                  {item.hsnCode || 'N/A'}
                                                </span>
                                              </td>
                                              <td>{item.qty || 0}</td>
                                              <td>₹{item.unitPrice || 0}</td>
                                              <td>
                                                <strong>₹{item.amount || 0}</strong>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="text-center py-3">
                                      <i className="bi bi-inbox text-muted fs-3"></i>
                                      <p className="text-muted mt-2 mb-0">No product details available</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
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