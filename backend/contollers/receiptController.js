const db = require('../config/db');

exports.createReceipt = (req, res) =>{
    const{invoice_id, receipt_number, amount_paid, payment_method, payment_date, notes} = req.body;

    const sql = `INSERT INTO receipts (
      invoice_id, receipt_number, amount_paid, payment_method, payment_date, notes
    ) VALUES (?, ?, ?, ?, ?, ?)`;

    const values = [invoice_id,
    receipt_number,
    amount_paid,
    payment_method,
    payment_date,
    notes];
    db.query(sql, values, (err, result)=>{
        if(err){
            console.error(' Error creating receipt:', err);
            return res.status(500).json({ message: 'Error creating receipt' });
        }
        res.status(201).json({
            msg: 'Receipt created successfully',
            data: {id:result.insertId, ...req.body}
        })
    })
}
// Make sure you have this
exports.getReceiptByInvoiceId = (req, res) => {
  const invoiceId = req.params.invoiceId;

  const sql = `SELECT * FROM receipts WHERE invoice_id = ?`;
  db.query(sql, [invoiceId], (err, result) => {
    if (err) return res.status(500).json({ msg: 'Failed to fetch receipt' });

    if (result.length === 0) {
      return res.status(404).json({ msg: 'Receipt not found' });
    }

    res.json({ msg: 'Receipt found', data: result[0] });
  });
};

exports.getAllReceipts = (req, res) =>{
  const sql = `SELECT * From receipts`;
  db.query(sql, (err, results)=>{
    if(err){
      console.error('Error fetching receipts: ', err)
      return res.status(500).json({message: 'Failed to fetch receipts'});
    }
    return res.json({msg: 'Receipts', data: results})
  })
}