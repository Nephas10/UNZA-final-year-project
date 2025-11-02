import React from "react";
import { Link } from "react-router-dom";
import "./DashboardPage.css"; // optional styling

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        👋 Welcome, {user?.username || "Admin"}!
      </h1>
      <p className="dashboard-subtitle">
        Manage your system easily using the shortcuts below.
      </p>

      <div className="dashboard-cards">
        <Link to="/clients" className="dashboard-card">
          <h3>👥 Clients</h3>
          <p>View or create clients</p>
        </Link>

        <Link to="/quotations" className="dashboard-card">
          <h3>📄 Quotations</h3>
          <p>Create and manage quotations</p>
        </Link>

        <Link to="/invoices" className="dashboard-card">
          <h3>💰 Invoices</h3>
          <p>View and manage invoices</p>
        </Link>

        <Link to="/receipts" className="dashboard-card">
          <h3>🧾 Receipts</h3>
          <p>Track payments and receipts</p>
        </Link>
      </div>
    </div>
  );
}

export default DashboardPage;
