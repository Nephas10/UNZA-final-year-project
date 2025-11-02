const db = require("../config/db");

//POST /api/quotations - create a new quotation with items
exports.createQuote = (req, res) => {
  const { client_id, quotation_date, valid_until, status, notes, items } = req.body;

  if (!client_id || !items || items.length === 0) {
    return res
      .status(400)
      .json({ msg: "Client and at least one item are required." });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ msg: "Failed to start transaction" });

    // 1️⃣ Insert the quotation itself
    const quotationSQL = `
      INSERT INTO quotations (client_id, quotation_date, valid_until, status, notes)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
      quotationSQL,
      [client_id, quotation_date, valid_until, status || "Draft", notes || ""],
      (err, result) => {
        if (err) {
          console.error("Quotation insertion failed:", err);
          return db.rollback(() =>
            res.status(500).json({ msg: "Quotation insertion failed" })
          );
        }

        const quotationId = result.insertId;

        // 2️⃣ Prepare items with computed line_total
        const itemValues = items.map((item) => [
          quotationId,
          item.description,
          item.quantity,
          item.unit_price,
          item.quantity * item.unit_price, // ✅ computed line_total
        ]);

        const itemSQL = `
          INSERT INTO quotation_items (quotation_id, description, quantity, unit_price, line_total)
          VALUES ?
        `;

        db.query(itemSQL, [itemValues], (err) => {
          if (err) {
            console.error("Item insertion failed:", err);
            return db.rollback(() =>
              res.status(500).json({ msg: "Item insert failed" })
            );
          }

          // 3️⃣ Update total amount in quotations
          const updateTotalSQL = `
            UPDATE quotations
            SET total_amount = (
              SELECT SUM(line_total)
              FROM quotation_items
              WHERE quotation_id = ?
            )
            WHERE id = ?
          `;

          db.query(updateTotalSQL, [quotationId, quotationId], (err) => {
            if (err) {
              console.error("Total update failed:", err);
              return db.rollback(() =>
                res.status(500).json({ msg: "Total update failed" })
              );
            }

            // 4️⃣ Commit the transaction
            db.commit((err) => {
              if (err) {
                console.error("Commit failed:", err);
                return db.rollback(() =>
                  res.status(500).json({ msg: "Commit failed" })
                );
              }

              res.status(201).json({
                msg: "Quotation created successfully",
                quotationId,
              });
            });
          });
        });
      }
    );
  });
}
exports.getQuotations = (req, res) =>{
    const sql = 'SELECT q.id, q.client_id, c.name AS client_name, q.quotation_date, q.status, q.total_amount FROM quotations q JOIN clients c ON q.client_id = c.id ';

    db.query(sql, (err, results) =>{
        if (err) {
            console.error('error: ', err);
            return res.status(500).json({message: 'failed to fetch quotations'});
        }
        res.json({msg: 'Quotations', data: results});
    })
}
exports.getQuotationById = (req, res) => {
  const quotationId = req.params.id;
  console.log('📥 Requested quotation ID:', quotationId); // Log incoming request

  const sqlQuotation = `
    SELECT q.*, c.name AS client_name
    FROM quotations q
    JOIN clients c ON q.client_id = c.id
    WHERE q.id = ?
  `;

  const sqlItems = `
    SELECT id, description, quantity, unit_price, line_total
    FROM quotation_items
    WHERE quotation_id = ?
  `;

  db.query(sqlQuotation, [quotationId], (err, quotationResult) => {
    if (err) {
      console.error('❌ Error fetching quotation:', err);
      return res.status(500).json({ message: 'Error fetching quotation' });
    }

    //console.log('📦 Quotation query result:', quotationResult);

    if (quotationResult.length === 0) {
      console.warn(`⚠️ Quotation with ID ${quotationId} not found.`);
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const quotation = quotationResult[0];

    db.query(sqlItems, [quotationId], (err, itemsResult) => {
      if (err) {
        console.error('❌ Error fetching items:', err);
        return res.status(500).json({ message: 'Error fetching items' });
      }

      //console.log('🧾 Items for quotation:', itemsResult);

      quotation.items = itemsResult;

      res.json({
        message: 'Quotation details',
        data: quotation
      });
    });
  });
};

// PUT /api/quotations/:id/status - Update quotation status
exports.updateQuotationStatus = (req, res) => {
  const quotationId = req.params.id;
  const { status } = req.body;

  // Allowed statuses
  const validStatuses = ['Draft', 'Sent', 'Accepted', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  // Update quotation status
  const sql = 'UPDATE quotations SET status = ? WHERE id = ?';
  db.query(sql, [status, quotationId], (err, result) => {
    if (err) {
      console.error('Error updating status:', err);
      return res.status(500).json({ message: 'Failed to update status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // If status is NOT "Accepted", just return success
    if (status !== 'Accepted') {
      return res.json({ message: `Quotation status updated to ${status}` });
    }

    // ============================
    // AUTO-CREATE INVOICE SECTION
    // ============================

    // 1. Get quotation details
    const getQuotationSQL = `SELECT * FROM quotations WHERE id = ?`;
    db.query(getQuotationSQL, [quotationId], (err, quotationResult) => {
      if (err || quotationResult.length === 0) {
        console.error('Error fetching quotation for invoice creation:', err);
        return res.status(500).json({ message: 'Error fetching quotation for invoice creation' });
      }

      const quotation = quotationResult[0];

      // 2. Insert new invoice
      const insertInvoiceSQL = `
        INSERT INTO invoices (client_id, invoice_date, due_date, status, total_amount, notes)
        VALUES (?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Unpaid', ?, ?)
      `;

      db.query(insertInvoiceSQL, [quotation.client_id, quotation.total_amount, quotation.notes], (err, invoiceResult) => {
        if (err) {
          console.error('Error creating invoice:', err);
          return res.status(500).json({ message: 'Error creating invoice' });
        }

        const invoiceId = invoiceResult.insertId;

        // 3. Copy items from quotation_items to invoice_items
        const copyItemsSQL = `
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, line_total)
          SELECT ${invoiceId}, description, quantity, unit_price, line_total
          FROM quotation_items WHERE quotation_id = ?
        `;

        db.query(copyItemsSQL, [quotationId], (err) => {
          if (err) {
            console.error('Error copying items to invoice:', err);
            return res.status(500).json({ message: 'Error copying items to invoice' });
          }

          // Success response
          return res.json({
            message: `Quotation accepted and Invoice #${invoiceId} created successfully.`,
            invoice_id: invoiceId
          });
        });
      });
    });
  });
};
