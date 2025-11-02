import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Link } from "react-router-dom";
import "./css/Clientpage.css";

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get("/clients");
      setClients(res.data.data);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const confirmDelete = (client) => {
    setClientToDelete(client);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/clients/${clientToDelete.id}`);
      alert("✅ Client deleted successfully");
      setShowModal(false);
      setClientToDelete(null);
      fetchClients();
    } catch (err) {
      console.error("Failed to delete client", err);
      alert("cant delete a client with an existing quotation or invoice");
    }
  };

  return (
    <div className="clients-container">
      {/* Header */}
      <div className="clients-header">
        <h2>Clients</h2>
        <Link to="/clients/new">
          <button className="create-client-btn">+ Create New Client</button>
        </Link>
      </div>

      {/* Clients Table */}
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.id}</td>
              <td>{client.name}</td>
              <td>{client.email}</td>
              <td>{client.phone}</td>
              <td>{client.address}</td>
              <td>
                <Link to={`/clients/${client.id}/edit`}>
                  <button className="edit-btn">✏️ Edit</button>
                </Link>
                <button
                  onClick={() => confirmDelete(client)}
                  className="delete-btn"
                  style={{ marginLeft: "10px" }}
                >
                  🗑 Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{clientToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="modal-buttons">
              <button onClick={handleDelete} className="confirm-btn">
                Yes, Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsPage;
