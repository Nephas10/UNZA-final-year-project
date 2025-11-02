import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import "./css/ReceiptsPage.css"; // 👈 new CSS file

function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/receipts")
      .then((res) => setReceipts(res.data.data))
      .catch((err) => {
        console.error("Failed to load receipts", err);
      });
  }, []);

  return (
    <div className="receipts-container">
      {/* Header */}
      <div className="receipts-header">
        <h2>Receipts</h2>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="receipts-table">
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Invoice ID</th>
              <th>Client</th>
              <th>Date</th>
              <th>Amount Paid</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length > 0 ? (
              receipts.map((receipt) => (
                <tr key={receipt.id}>
                  <td>{receipt.receipt_number}</td>
                  <td>{receipt.invoice_id}</td>
                  <td>{receipt.client_name}</td>
                  <td>
                    {new Date(receipt.receipt_date).toLocaleDateString()}
                  </td>
                  <td>ZMW {receipt.amount_paid}</td>
                  <td>
                    <Link
                      to={`/receipts/invoice/${receipt.invoice_id}`}
                      className="view-link"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No receipts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReceiptsPage;
