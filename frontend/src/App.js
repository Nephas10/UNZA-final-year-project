import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout with Sidebar
import Layout from './components/Layouts';

// Pages
import ClientsPage from './pages/Clients/ClientPage';
import NewClientPage from './pages/Clients/NewClientPage';
import EditClientPage from './pages/Clients/EditClientPage';
import Quotations from './pages/Quotation/QuotationsPage';
import NewQuotationPage from './pages/Quotation/NewQuotationPage';
import DetailPage from './pages/Quotation/QuoteDetailsPage';
import InvoicesPage from './pages/InvoicePage';
import InvoiceDetailPage from './pages/InvDetailPage';
import NewInvoicePage from './pages/NewInvoice';
import ReceiptDetailPage from './pages/Receipts/ReceiptDetailPage';
import ReceiptsPage from './pages/Receipts/ReceiptPage';
import LoginPage from './pages/Authentication/LoginPage';
import SignupPage from './pages/Authentication/SIgnupPage';
import DashboardPage from './pages/Dashboard/Dashboard';


// Auth Context + Protected Routes
import { AuthProvider } from './pages/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    // ✅ Wrap the entire app with AuthProvider
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} /> {/* Default route */}
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Clients */}
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/new" element={<NewClientPage />} />
            <Route path="clients/:id/edit" element={<EditClientPage />} />


            {/* Quotations */}
            <Route path="quotations" element={<Quotations />} />
            <Route path="quotations/new" element={<NewQuotationPage />} />
            <Route path="quotations/:id" element={<DetailPage />} />
            

            {/* Invoices */}
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/new" element={<NewInvoicePage />} />
            <Route path="invoices/:id" element={<InvoiceDetailPage />} />

            {/* Receipts */}
            <Route path="receipts/invoice/:invoiceId" element={<ReceiptDetailPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
