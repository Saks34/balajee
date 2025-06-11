import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    axios.get(`/api/admin/customers/${id}`).then((res) => {
      const { name, phone, address } = res.data.customer;
      setCustomer({ name, phone, address });
    });
  }, [id]);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/customers/${id}`, customer);
      navigate("/admin/customers");
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Edit Customer</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input className="form-control" name="name" value={customer.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input className="form-control" name="phone" value={customer.phone} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <input className="form-control" name="address" value={customer.address} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-success">Update</button>
      </form>
    </div>
  );
};

export default CustomerEdit;
