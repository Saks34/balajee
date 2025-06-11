import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const paymentMethods = ["cash", "cheque", "upi", "online"];

const AddCredit = () => {
  const { id: customerId } = useParams();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(paymentMethods[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");

    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) return toast.error("Authentication token missing");

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/admin/customers/${customerId}/credits`,
        {
          amount: parseFloat(amount),
          paymentMethod: method,
          date,
          customer: customerId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Credit added successfully!");
      if (res.data.receiptURL) {
        window.open(res.data.receiptURL, "_blank");
      }

      setTimeout(() => navigate(`/admin/users/${customerId}`), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add credit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <ToastContainer />
      <h2 className="text-xl font-bold mb-4">Add Credit</h2>

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Amount (₹)
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </label>

        <label className="block mb-2">
          Payment Method
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          >
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </label>

        <div className="flex justify-between items-center mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Processing..." : "Add Credit"}
          </button>

          <Link
            to={`/admin/customers/${customerId}`}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Customer
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AddCredit;
