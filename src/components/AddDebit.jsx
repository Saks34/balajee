import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const AddDebit = () => {
  const { id: customerId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setInvoiceFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceFile) {
      toast.error("Please select an invoice file to upload.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Unauthorized. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("invoice", invoiceFile);

      const res = await axios.post(
        `http://localhost:5000/api/admin/customers/${customerId}/debits`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Debit added successfully!");
      navigate(`/admin/users/${customerId}`); // ✅ Redirect to CustomerDetails after success
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Failed to add debit.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow">
            <div className="card-header bg-white border-bottom-0 pt-4">
              <h2 className="h3 mb-0 text-dark fw-bold">Add Debit</h2>
            </div>
            <div className="card-body px-4 pb-4">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm mb-4 d-flex align-items-center"
                onClick={() => navigate(-1)}
              >
                <i className="me-1">←</i> Back
              </button>

              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark mb-2">
                    Upload Invoice (PDF)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="form-control form-control-lg"
                    required
                  />
                  <div className="form-text">
                    Please select a PDF file to upload
                  </div>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    disabled={loading || !invoiceFile}
                    className={`btn btn-lg ${
                      loading || !invoiceFile
                        ? "btn-outline-secondary"
                        : "btn-primary"
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      "Add Debit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDebit;