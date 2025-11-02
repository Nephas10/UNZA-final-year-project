import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance"; // adjust path
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  // fetch invoice details
  const fetchInvoice = () => {
    axiosInstance
      .get(`http://localhost:5000/api/invoices/${id}`)
      .then((res) => {
        setInvoice(res.data.data);
      })
      .catch((err) => {
        console.error("Failed to fetch invoice", err);
      });
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  // ✅ Mark as paid
  const markAsPaid = () => {
    axiosInstance
      .put(`http://localhost:5000/api/invoices/${id}/status`, {
        status: "paid",
      })
      .then((res) => {
        alert(res.data.msg);
        fetchInvoice(); // refresh invoice details after update
      })
      .catch((err) => {
        console.error("Failed to update invoice status", err);
      });
  };
  const ExportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Invoice #${invoice.id}`, 14, 15);

    doc.setFontSize(12);
    doc.text(`Client: ${invoice.client_name}`, 14, 25);
    doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 14, 35);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 14, 45);
    doc.text(`Status: ${invoice.status}`, 14, 55);
    doc.text(`Total Amount: ZMW ${invoice.total_amount}`, 14, 65);
    if (invoice.notes) doc.text(`Notes: ${invoice.notes}`, 14, 75);

    autoTable(doc, {
      startY: invoice.notes ? 85 : 75,
      head: [["Description", "Quantity", "Unit Price", "Line Total"]],
      body: invoice.items.map((item) => [
        item.description,
        item.quantity.toString(),
        item.unit_price.toString(),
        item.line_total.toString(),
      ]),
    });

    doc.save(`invoice_${invoice.id}.pdf`);
  };

  if (!invoice) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Invoice #{invoice.id}</h2>
      <p>
        <strong>Client:</strong> {invoice.client_name}
      </p>
      <p>
        <strong>Date:</strong>{" "}
        {new Date(invoice.invoice_date).toLocaleDateString()}
      </p>
      <p>
        <strong>Due Date:</strong>{" "}
        {new Date(invoice.due_date).toLocaleDateString()}
      </p>
      <p>
        <strong>Status:</strong> {invoice.status}
      </p>
      <p>
        <strong>Total:</strong> ZMW {invoice.total_amount}
      </p>
      <p>
        <strong>Notes:</strong> {invoice.notes || "N/A"}
      </p>

      {/* ✅ Show Mark as Paid button only if unpaid/overdue */}
      {invoice.status !== "Paid" && (
        <button onClick={markAsPaid} style={{ marginTop: "10px" }}>
          Mark as Paid
        </button>
      )}

      <h3>Items</h3>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{item.unit_price}</td>
                <td>{item.line_total}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No items in this invoice</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <button onClick={ExportToPDF} style={{ marginTop: '20px' }}>
          Export to PDF
          </button>
      </div>
    </div>
  );
}

export default InvoiceDetailPage;
