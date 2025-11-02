import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from "../../api/axiosInstance"; // adjust path
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './css/QuoteDetailsPage.css'; // 👈 external CSS

function QuotationDetailPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const navigate = useNavigate();

  const handleAccept = () => {
    axiosInstance.put(`http://localhost:5000/api/quotations/${id}/status`, { status: "Accepted" })
      .then(res => {
        alert(res.data.message);
        setQuotation(prev => ({ ...prev, status: "Accepted" }));
        if (res.data.invoice_id) {
          navigate(`/invoices/${res.data.invoice_id}`);
        }
      })
      .catch(err => {
        console.error("Failed to update status", err);
        alert("Error updating quotation status.");
      });
  };

  useEffect(() => {
    axiosInstance.get(`http://localhost:5000/api/quotations/${id}`)
      .then(res => setQuotation(res.data.data))
      .catch(err => console.error('Failed to load quotation', err));
  }, [id]);

  if (!quotation) return <div className="loading">Loading...</div>;

  // ✅ PDF export function
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Quotation QTN #${quotation.id}`, 14, 15);

    doc.setFontSize(12);
    doc.text(`Client: ${quotation.client_name}`, 14, 25);
    doc.text(`Date: ${new Date(quotation.quotation_date).toLocaleDateString()}`, 14, 35);
    doc.text(`Valid Until: ${new Date(quotation.valid_until).toLocaleDateString()}`, 14, 45);
    doc.text(`Status: ${quotation.status}`, 14, 55);
    doc.text(`Total Amount: ZMW ${quotation.total_amount}`, 14, 65);
    if (quotation.notes) doc.text(`Notes: ${quotation.notes}`, 14, 75);

    autoTable(doc, {
      startY: quotation.notes ? 85 : 75,
      head: [['Description', 'Quantity', 'Unit Price', 'Line Total']],
      body: quotation.items.map(item => [
        item.description,
        item.quantity.toString(),
        item.unit_price.toString(),
        item.line_total.toString()
      ]),
    });

    doc.save(`quotation_${quotation.id}.pdf`);
  };

  return (
    <div className="quotation-detail">
      <h2>
        Quotation #{quotation.id}
        <span className={`status-badge ${quotation.status?.toLowerCase()}`}>
          {quotation.status}
        </span>
      </h2>

      {quotation.status !== "Accepted" ? (
        <button className="btn-accept" onClick={handleAccept}>
          Mark as Accepted
        </button>
      ) : (
        <p className="accepted-msg">✅ Quotation Accepted (Invoice Created)</p>
      )}

      <div className="quotation-info">
        <p><strong>Client:</strong> {quotation.client_name}</p>
        <p><strong>Date:</strong> {new Date(quotation.quotation_date).toLocaleDateString()}</p>
        <p><strong>Valid Until:</strong> {new Date(quotation.valid_until).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ZMW {quotation.total_amount}</p>
        <p><strong>Notes:</strong> {quotation.notes || 'N/A'}</p>
      </div>

      <h3>Items</h3>
      <div className="table-container">
        <table className="quotation-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items?.length > 0 ? (
              quotation.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit_price}</td>
                  <td>{item.line_total}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No items in this quotation.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="btn-export" onClick={exportToPDF}>
        Export to PDF
      </button>
    </div>
  );
}

export default QuotationDetailPage;
