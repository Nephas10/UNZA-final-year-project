const db = require('../config/db');

exports.getClients = (req, res)=>{
    const sql = 'SELECT * FROM clients';
    db.query(sql, (err, results) =>{
        if(err) return res.status(500).json({msg: 'cant fetch clients'});
        res.send({
            msg: 'clients',
            data: results
        })
    })
}

exports.createClient = (req, res) =>{
    const {name, email, phone, address} = req.body;

    if(!name) return res.status(400).json({msg: 'name is required'});
    
    const sql = 'INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, phone, address], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error creating client' });
    res.status(201).json({ message: 'Client added', clientId: result.insertId });
  });
};

//get clients by a specific id
exports.getClientById = (req, res) => {
  const clientId = req.params.id;

  const sql = 'SELECT * FROM clients WHERE id = ?';
  db.query(sql, [clientId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching client' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client found', data: results[0] });
  });
};

// PUT /api/clients/:id - Update client info
exports.updateClient = (req, res) => {
  const clientId = req.params.id;
  const { name, email, phone, address } = req.body;

  if (!name) return res.status(400).json({ message: 'Name is required' });

  const sql = 'UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?';

  db.query(sql, [name, email, phone, address, clientId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to update client' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client updated successfully' });
  });
};

// DELETE /api/clients/:id - Delete a client
exports.deleteClient = (req, res) => {
  const clientId = req.params.id;

  const sql = 'DELETE FROM clients WHERE id = ?';
  db.query(sql, [clientId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to delete client' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  });
};

