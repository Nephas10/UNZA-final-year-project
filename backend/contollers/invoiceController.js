const db = require('../config/db');

// POST /api/invoices - Create invoice with items
exports.createInvoice = (req, res) => {
  const { client_id, quotation_id, invoice_date, due_date, status, notes, items } = req.body;

  if (!client_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Client and at least one item are required' });
  }

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ message: 'Transaction failed to start' });
    console.error(err);

    const sqlInvoice = `INSERT INTO invoices (client_id, quotation_id, invoice_date, due_date, status, notes) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sqlInvoice, [client_id, quotation_id || null, invoice_date, due_date, status || 'Unpaid', notes || ''], (err, result) => {
      if (err) return db.rollback(() => res.status(500).json({ message: 'Invoice insert failed' }));

      const invoiceId = result.insertId;

      const itemValues = items.map(item => [
        invoiceId,
        item.description,
        item.quantity,
        item.unit_price
      ]);

      const sqlItems = `
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
        VALUES ?
      `;
      db.query(sqlItems, [itemValues], (err) => {
        if (err) return db.rollback(() => res.status(500).json({ message: 'Item insert failed' }));

        const updateTotalSQL = `
          UPDATE invoices
          SET total_amount = (
            SELECT SUM(line_total) FROM invoice_items WHERE invoice_id = ?
          )
          WHERE id = ?
        `;
        db.query(updateTotalSQL, [invoiceId, invoiceId], (err) => {
          if (err) return db.rollback(() => res.status(500).json({ message: 'Failed to update total' }));

          db.commit(err => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Commit failed' }));

            res.status(201).json({ message: 'Invoice created', invoiceId });
          });
        });
      });
    });
  });
};

exports.getInvoices = (req, res) =>{
  const sql = 'SELECT i.id, i.client_id, c.name AS client_name, i.invoice_date, i.due_date, i.status, i.total_amount FROM invoices i JOIN clients c ON i.client_id = c.id ORDER BY i.id DESC';

  db.query(sql, (err, results) =>{
    if(err){
      console.error('fetch error: ', err);
      return res.status(500).json({message: 'failed in retrival'});

    }
    res.status(200).json({msg: 'invoice fetched', data: results})
  });
}
exports.getInvoicesById = (req, res) =>{
  const invoiceId = req.params.id;

  
  const sqlInvoice = `
    SELECT i.*, c.name AS client_name
    FROM invoices i
    JOIN clients c ON i.client_id = c.id
    WHERE i.id = ?
  `;
  const sqlItems = `
    SELECT id, description, quantity, unit_price, line_total
    FROM invoice_items
    WHERE invoice_id = ?
  `;
  db.query(sqlInvoice, [invoiceId], (err, invoiceResult)=>{
    if(err) return res.status(500).json({msg: 'error fetching invoice'});
    if(invoiceResult.length === 0) return res.status(404).json({msg: 'invoice not found'});

    db.query(sqlItems,[invoiceId], (err, itemResult) =>{
      if(err) return res.status(500).json({msg: 'error fetching invoice items'});

      res.json({
        msg: 'invoice details',
        data: {
          ...invoiceResult[0],
          items: itemResult
        }
      })
    })

  })

}
exports.updateInvoicestatus = (req, res) => {
  const invoiceId = req.params.id;
  let { status } = req.body;

  status = status.toLowerCase(); // normalize case
  const validStatuses = ['unpaid', 'paid', 'overdue'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ msg: 'Invalid status value' });
  }

  const updateSql = 'UPDATE invoices SET status = ? WHERE id = ?';
  db.query(updateSql, [status, invoiceId], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Failed to update invoice status' });

    if (results.affectedRows === 0) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    // If marked as paid → create receipt
    if (status === 'paid') {
      const checkReceiptSql = 'SELECT * FROM receipts WHERE invoice_id = ?';
      db.query(checkReceiptSql, [invoiceId], (err, receiptResult) => {
        if (err) return res.status(500).json({ msg: 'Failed to check receipt' });

        if (receiptResult.length > 0) {
          return res.json({ 
            msg: 'Status updated to paid. Receipt already exists.',
            receipt: receiptResult[0] 
          });
        }

        // Get invoice and client data
        const fetchInvoiceSql = `
          SELECT i.id, i.total_amount, i.invoice_date, c.name AS client_name
          FROM invoices i
          JOIN clients c ON i.client_id = c.id
          WHERE i.id = ?
        `;
        db.query(fetchInvoiceSql, [invoiceId], (err, invoiceResult) => {
          if (err || invoiceResult.length === 0) {
            return res.status(500).json({ msg: 'Failed to fetch invoice details' });
          }

          const invoice = invoiceResult[0];
          const receiptNumber = `RCPT-${Date.now()}`; // Simple unique number

          const receiptSql = `
            INSERT INTO receipts (invoice_id, receipt_number, receipt_date, amount_paid, client_name)
            VALUES (?, ?, NOW(), ?, ?)
          `;
          db.query(
            receiptSql,
            [invoice.id, receiptNumber, invoice.total_amount, invoice.client_name],
            (err, receiptInsertResult) => {
              console.error("❌ Receipt Insert Error:", err);
              if (err) return res.status(500).json({ msg: 'Failed to create receipt' });

              return res.json({ 
                msg: 'Status updated to paid. Receipt created successfully.',
                receipt: {
                  id: receiptInsertResult.insertId,
                  receipt_number: receiptNumber,
                  invoice_id: invoice.id,
                  client_name: invoice.client_name,
                  amount_paid: invoice.total_amount
                }
              });
            }
          );
        });
      });
    } else {
      // If not marked as paid, just respond with success
      res.json({ msg: `Status updated to ${status}` });
    }
  });
};
