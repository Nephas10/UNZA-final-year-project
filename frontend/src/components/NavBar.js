import React from "react";
import {Link} from 'react-router-dom';

function Navbar(){
    const navStyle = {
        padding: '10px',
        background: '#f0f0f0',
        marginBottom: '20px'
    };
    const linkstyle = {
        marginRight: '15px',
        textDecoderation: 'none',
        color: '#333'
    };

    return (
        <nav style={navStyle}>
            <Link to="/clients" style={linkstyle}>Clients</Link>
            <Link to="/clients/new" style={linkstyle}>Add Client</Link>
            <Link to="/quotations" style={linkstyle}>Quotations</Link>
            <Link to="/invoices" style={linkstyle}>Invoices</Link>
            <Link to="/quotations/new" style={linkstyle}>Add Quotation</Link>
            <Link to="/invoices/new" style={linkstyle}>Add Invoice</Link>
           

        </nav>
    );
}

export default Navbar;