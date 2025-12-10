import React, { useState, useEffect } from "react";
import { getAllPayments } from "../../services/paymentService";
import { Spinner, Alert } from "react-bootstrap";
import "./EventManagement.css";

const getStatusBadge = (status) => {
  const styles = {
    success: 'bg-success text-white',
    paid: 'bg-success text-white', // Tambahkan 'paid'
    pending: 'bg-warning text-dark',
    failed: 'bg-danger text-white',
    cancelled: 'bg-secondary text-white',
  };
  return styles[status] || 'bg-light text-dark';
};

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllPayments();
      
      if (res.payments) {
        setPayments(res.payments || []);
      } else {
        setError(res.message || "Failed to fetch payments");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Payment Management</h1>
      
      <div className="admin-table-wrapper">
        {loading && <div className="text-center p-5"><Spinner animation="border" /></div>}
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Event</th>
                {/* ✅ TAMBAHKAN: Kolom Customer */}
                <th>Customer Name</th>
                <th>Customer Email</th>
                <th>Amount (Rp)</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.transaction_id}</td>
                  <td>{payment.event_title}</td>
                  {/* ✅ TAMBAHKAN: Data Customer */}
                  <td>{payment.customer_name}</td>
                  <td>{payment.customer_email}</td>
                  <td>{payment.amount.toLocaleString('id-ID')}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(payment.status)}`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(payment.payment_date).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;