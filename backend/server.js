const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const cliRoutes = require('./routes/cliRoutes');
const quoteRoutes = require('./routes/QuoteRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const receiptRoutes = require('./routes/receipts')
const authRoutes = require('./routes/authRoutes')

app.use('/api/clients', cliRoutes);
app.use('/api/quotations', quoteRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/receipts', receiptRoutes)
app.use("/api/admin", authRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log('server running on http://localhost:'+PORT);
})