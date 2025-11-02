import React, { useEffect, useState } from 'react';
import axiosInstance from "../api/axiosInstance"; // adjust path
import { useNavigate } from 'react-router-dom';

function NewInvoicePage(){
    const [clients, setClients] = useState([]);
    const [invoice, setInvoice] = useState({
        client_id: '',
        invoice_date: '',
        due_date: '',
        notes: '',
        items: [
            {description: '', quantity: 1, unit_price: 0}
        ]
    });

    const navigate = useNavigate();

    useEffect(()=>{
        axiosInstance.get('http://localhost:5000/api/clients')
         .then(res => setClients(res.data.data))
         .catch(err=> console.error(err));
    }, [])

    const handleItemChange = (index, field, value) =>{
        const updatedItems = [...invoice.items];
        updatedItems[index][field] = field === 'quantity' || field === 'unit_price' ? Number(value) : value;
        setInvoice({...invoice, items: updatedItems});
    };
    const addItem =() =>{
        setInvoice({...invoice, items: [...invoice.items, {description: '', quantity: 1, unit_price: 0}]})
    }
    const removeItem = (index) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: updatedItems });
     };
     
  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance.post('http://localhost:5000/api/invoices', invoice)
      .then(() => {
        alert('Invoice created!');
        navigate('/invoices');
      })
      .catch(err => {
        console.error('Error creating invoice', err);
        alert('Failed to create invoice.');
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create New Invoice</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Client:</label><br />
          <select
            value={invoice.client_id}
            onChange={(e) => setInvoice({ ...invoice, client_id: e.target.value })}
            required
          >
            <option value="">-- Select Client --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Invoice Date:</label><br />
          <input
            type="date"
            value={invoice.invoice_date}
            onChange={(e) => setInvoice({ ...invoice, invoice_date: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Due Date:</label><br />
          <input
            type="date"
            value={invoice.due_date}
            onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Notes:</label><br />
          <textarea
            value={invoice.notes}
            onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
          />
        </div>

        <h3>Items</h3>
        {invoice.items.map((item, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <label>Description:</label><br />
            <input
              value={item.description}
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              required
            /><br />

            <label>Quantity:</label><br />
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              required
            /><br />

            <label>Unit Price:</label><br />
            <input
              type="number"
              value={item.unit_price}
              onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
              required
            /><br />

            {invoice.items.length > 1 && (
              <button type="button" onClick={() => removeItem(index)}>Remove</button>
            )}
          </div>
        ))}

        <button type="button" onClick={addItem}>Add Item</button><br /><br />
        <button type="submit">Create Invoice</button>
      </form>
    </div>
  );
}

export default NewInvoicePage;