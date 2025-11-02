import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance"; // adjust path
import { Link } from "react-router-dom";

function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axiosInstance.get("http://localhost:5000/api/invoices")
      .then(res => setInvoices(res.data.data))
      .catch(err => console.error("Failed to fetch invoices", err));
  }, []);

  // ✅ Filter + Search + Sort
  const filteredInvoices = invoices
    .filter(inv =>
      inv.client_name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(inv =>
      filterStatus === "All" ? true : inv.status === filterStatus
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.invoice_date) - new Date(a.invoice_date);
      } else if (sortBy === "amount") {
        return parseFloat(b.total_amount) - parseFloat(a.total_amount);
      }
      return 0;
    });

  // ✅ Pagination logic applied to filtered list
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Invoices</h2>

      {/* 🔹 Controls */}
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Search by client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "6px", borderRadius: "5px", border: "1px solid #ccc" }}
        />

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>
      </div>

      {/* 🔹 Table */}
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentInvoices.length > 0 ? (
            currentInvoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{inv.client_name}</td>
                <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                <td>ZMW {inv.total_amount}</td>
                <td>{inv.status}</td>
                <td>
                  <Link to={`/invoices/${inv.id}`}>👁 View</Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No invoices found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔹 Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ⬅ Prev
          </button>

          <span> Page {currentPage} of {totalPages} </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
}

export default InvoicesPage;
