import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import "./css/NewClientPage.css"; // reuse same styles

function EditClientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    axiosInstance
      .get(`/clients/${id}`)
      .then((res) => setFormData(res.data.data))
      .catch((err) => console.error("Failed to load client", err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance
      .put(`/clients/${id}`, formData)
      .then(() => {
        alert("✅ Client updated successfully");
        navigate("/clients");
      })
      .catch((err) => {
        console.error("Update failed", err);
        alert("Failed to update client");
      });
  };

  return (
    <div className="new-client-container">
      <h2>Edit Client</h2>

      <form className="new-client-form" onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div>
          <label>Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div>
          <label>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} required />
        </div>

        <div>
          <label>Address</label>
          <input name="address" value={formData.address} onChange={handleChange} required />
        </div>

        <button type="submit" className="new-client-btn">💾 Save Changes</button>
      </form>
    </div>
  );
}

export default EditClientPage;
