import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "./Layout.css";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <h2 className="sidebar-title">Financial Module (ERP)</h2>
          <nav>
            <ul className="nav-list">
              <li className={location.pathname === "/" ? "active" : ""}>
                <Link to="/">Dashboard</Link>
              </li>
              <li className={location.pathname === "/clients" ? "active" : ""}>
                <Link to="/clients">Clients</Link>
              </li>
              <li className={location.pathname === "/quotations" ? "active" : ""}>
                <Link to="/quotations">Quotations</Link>
              </li>
              <li className={location.pathname === "/invoices" ? "active" : ""}>
                <Link to="/invoices">Invoices</Link>
              </li>
              <li className={location.pathname === "/receipts" ? "active" : ""}>
                <Link to="/receipts">Receipts</Link>
              </li>
            </ul>
          </nav>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
        <footer className="sidebar-footer">
          © {new Date().getFullYear()} ERP App
        </footer>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
