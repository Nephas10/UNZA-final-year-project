import React, { useEffect, useState } from 'react';
import axiosInstance from "../../api/axiosInstance"; // adjust path
import { Link } from 'react-router-dom';
import './css/QuotationsPage.css'; 

function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    axiosInstance.get('/quotations')
      .then(res => setQuotations(res.data.data))
      .catch(err => console.error('Failed to fetch quotations', err));
  }, []);

  // format dates nicely (YYYY-MM-DD)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="quotations-container">
      <div className="quotations-header">
        <h2>Quotations</h2>
        <Link to="/quotations/new">
          <button className="btn-create">
            + Create New Quotation
          </button>
        </Link>
      </div>

      <div className="table-container">
        <table className="quotations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id}>
                <td>{q.id}</td>
                <td>{q.client_name}</td>
                <td>{formatDate(q.quotation_date)}</td>
                <td>
                  <span className={`status-badge ${q.status?.toLowerCase()}`}>
                    {q.status}
                  </span>
                </td>
                <td>k{q.total_amount}</td>
                <td>
                  <Link to={`/quotations/${q.id}`} className="view-link">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuotationsPage;
