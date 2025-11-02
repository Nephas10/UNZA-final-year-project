import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance"; // adjust path
import { useNavigate } from "react-router-dom";
import "./css/NewClientPage.css"; // 👈 Import CSS

function NewClientPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance
      .post("/clients", formData)
      .then(() => {
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate("/clients");
        }, 1000);
      })
      .catch((err) => {
        console.error("error adding client", err);
        alert("something went wrong");
      });
  };

  return (
    <div className="new-client-container">
      <h2>Add New Client</h2>

      {showPopup && <div className="success-popup">✅ Client added!</div>}

      <form className="new-client-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="new-client-btn">
          Add Client
        </button>
      </form>
    </div>
  );
}

export default NewClientPage;
