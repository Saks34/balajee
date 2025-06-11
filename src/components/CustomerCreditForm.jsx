import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerCreditForm = () => {
  const { customerId } = useParams();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [razorpayKey, setRazorpayKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch Razorpay key from backend
        const keyRes = await axios.get('http://localhost:5000/api/customers/payments/get-key');
        setRazorpayKey(keyRes.data.key);

        // Get customer info
        if (!customerId) {
          const res = await axios.get('http://localhost:5000/api/customers/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCustomerInfo(res.data.customer);
        } else {
          setCustomerInfo({ _id: customerId });
        }
      } catch (error) {
        console.error('Error fetching customer info:', error);
        setMessage('Error loading customer information');
      }
    };

    fetchCustomerInfo();
  }, [customerId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    if (!customerInfo) {
      setMessage('Customer information not loaded');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      const token = localStorage.getItem('token');
      const targetCustomerId = customerInfo._id;

      // Create Razorpay order
      const orderRes = await axios.post(
        'http://localhost:5000/api/customers/payments/create-order',
        { amount: Number(amount) * 100, customerId: targetCustomerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create Razorpay order');
      }

      if (!window.Razorpay || !razorpayKey) {
        throw new Error('Razorpay SDK or Key not loaded');
      }

      const options = {
        key: razorpayKey,
        amount: Number(amount) * 100,
        currency: 'INR',
        name: 'Balajee Sales',
        description: 'Khata Payment',
        order_id: orderRes.data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              'http://localhost:5000/api/customers/payments/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerId: targetCustomerId,
                amount: parseFloat(amount),
                date: moment().format('YYYY-MM-DD')
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              setMessage('Payment successful!');
              if (verifyRes.data.receiptURL) {
                window.open(verifyRes.data.receiptURL, '_blank');
              }
              setTimeout(() => navigate('/dashboard'), 1500);
            } else {
              throw new Error(verifyRes.data.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            setMessage(error.response?.data?.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage('Payment cancelled');
          }
        },
        prefill: {
          name: customerInfo.name || 'Customer'
        },
        theme: {
          color: '#007bff'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setLoading(false);
        setMessage(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      setMessage(error.response?.data?.message || error.message || 'Error while processing payment');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (!customerInfo) {
    return <div>Loading customer information...</div>;
  }

  return (
    <div className="credit-form" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Make Online Payment</h2>
      {customerInfo.name && <p>Customer: {customerInfo.name}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Amount (₹):</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            step="0.01"
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              flex: 1
            }}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>
        </div>
      </form>

      {message && (
        <p style={{
          color: message.includes('successful') ? 'green' : 'red',
          marginTop: '15px',
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default CustomerCreditForm;
