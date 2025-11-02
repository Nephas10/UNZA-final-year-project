import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance"; // adjust path
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./css/ReceiptDetailPage.css";


function ReceiptDetailPage() {
  const { invoiceId } = useParams();
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`http://localhost:5000/api/receipts/invoice/${invoiceId}`)
      .then((res) => setReceipt(res.data.data))
      .catch((err) => console.error("Failed to fetch receipt", err));
  }, [invoiceId]);

  const exportReceiptToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Receipt #${receipt.receipt_number}`, 14, 15);

    doc.setFontSize(12);
    doc.text(`Invoice ID: ${receipt.invoice_id}`, 14, 25);
    doc.text(`Client: ${receipt.client_name}`, 14, 35);
    doc.text(`Date: ${new Date(receipt.receipt_date).toLocaleDateString()}`, 14, 45);
    doc.text(`Amount Paid: ZMW ${receipt.amount_paid}`, 14, 55);

    doc.save(`receipt_${receipt.id}.pdf`);
  };

  if (!receipt) return <div className="loading">Loading receipt...</div>;

  return (
    <div className="receipt-container">
      <div className="receipt-card">
        <h2>Receipt #{receipt.receipt_number}</h2>
        <p><strong>Invoice ID:</strong> {receipt.invoice_id}</p>
        <p><strong>Client Name:</strong> {receipt.client_name}</p>
        <p><strong>Amount Paid:</strong> ZMW {receipt.amount_paid}</p>
        <p><strong>Date:</strong> {new Date(receipt.receipt_date).toLocaleDateString()}</p>
        <button className="pdf-btn" onClick={exportReceiptToPDF}>
          📄 Download Receipt PDF
        </button>
      </div>
    </div>
  );
}

export default ReceiptDetailPage;
