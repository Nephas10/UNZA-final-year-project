import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance"; // adjust path

import { useNavigate } from "react-router-dom";
import "./css/NewQuotationPage.css"; // 👈 Import CSS

function NewQuotationPage() {
  const [clients, setClients] = useState([]);
  const [quotation, setQuotation] = useState({
    client_id: "",
    quotation_date: "",
    valid_until: "",
    notes: "",
    items: [
      {
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ],
  });

  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("http://localhost:5000/api/clients")
      .then((res) => setClients(res.data.data))
      .catch((err) => console.error("failed to load clients", err));
  }, []);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...quotation.items];
    updatedItems[index][field] =
      field === "quantity" || field === "unit_price" ? Number(value) : value;
    setQuotation({ ...quotation, items: updatedItems });
  };

  const addItem = () => {
    setQuotation({
      ...quotation,
      items: [
        ...quotation.items,
        { description: "", quantity: 1, unit_price: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    const updatedItems = quotation.items.filter((_, i) => i !== index);
    setQuotation({ ...quotation, items: updatedItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance
      .post("quotations", quotation)
      .then(() => {
        alert("Quotation created");
        navigate("/quotations");
      })
      .catch((err) => {
        console.error(err);
        alert("something went wrong");
      });
  };

  return (
    <div className="quotation-container">
      <h2>Create New Quotation</h2>

      <form className="quotation-form" onSubmit={handleSubmit}>
        <div>
          <label>Client:</label>
          <select
            value={quotation.client_id}
            onChange={(e) =>
              setQuotation({ ...quotation, client_id: e.target.value })
            }
            required
          >
            <option value="">-- Select Client --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Quotation Date:</label>
          <input
            type="date"
            value={quotation.quotation_date}
            onChange={(e) =>
              setQuotation({ ...quotation, quotation_date: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label>Valid Until:</label>
          <input
            type="date"
            value={quotation.valid_until}
            onChange={(e) =>
              setQuotation({ ...quotation, valid_until: e.target.value })
            }
          />
        </div>

        <div>
          <label>Notes:</label>
          <textarea
            value={quotation.notes}
            onChange={(e) =>
              setQuotation({ ...quotation, notes: e.target.value })
            }
          />
        </div>

        <div className="items-section">
          <h3>Items</h3>
          {quotation.items.map((item, index) => (
            <div key={index} className="item-card">
              <label>Description:</label>
              <input
                value={item.description}
                onChange={(e) =>
                  handleItemChange(index, "description", e.target.value)
                }
                required
              />

              <label>Quantity:</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
                required
              />

              <label>Unit Price:</label>
              <input
                type="number"
                value={item.unit_price}
                onChange={(e) =>
                  handleItemChange(index, "unit_price", e.target.value)
                }
                required
              />

              {quotation.items.length > 1 && (
                <button
                  type="button"
                  className="btn remove-btn"
                  onClick={() => removeItem(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button type="button" className="btn" onClick={addItem}>
            + Add Item
          </button>
        </div>

        <button type="submit" className="btn">
          ✅ Create Quotation
        </button>
      </form>
    </div>
  );
}

export default NewQuotationPage;
