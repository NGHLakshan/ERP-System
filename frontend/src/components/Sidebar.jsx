import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager' || isAdmin;

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span className="brand-icon">⚡</span>
                <span className="brand-name">ERP<span className="brand-accent">Pro</span></span>
            </div>
            
            <div className="user-info" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{user?.username}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary-color)', textTransform: 'uppercase' }}>{user?.role}</p>
            </div>

            <nav className="sidebar-nav">
                <p className="nav-section-label">GENERAL</p>
                <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">🚀</span> Dashboard
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span> Reports
                </NavLink>

                <p className="nav-section-label">INVENTORY</p>
                <NavLink to="/products" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📦</span> Products
                </NavLink>
                {isManager && (
                    <NavLink to="/add" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">➕</span> Add Product
                    </NavLink>
                )}

                <p className="nav-section-label">SALES</p>
                <NavLink to="/customers" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">👥</span> Customers
                </NavLink>
                <NavLink to="/sales" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📈</span> Sales Orders
                </NavLink>
                <NavLink to="/sales/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📝</span> New Sales Order
                </NavLink>

                <p className="nav-section-label">FINANCE</p>
                <NavLink to="/finance" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">💰</span> Dashboard
                </NavLink>
                <NavLink to="/finance/transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📋</span> Transactions
                </NavLink>
                <NavLink to="/finance/profit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span> Profit Summary
                </NavLink>
 
                {isAdmin && (
                    <>
                        <p className="nav-section-label">SYSTEM</p>
                        <NavLink to="/audit-logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">📜</span> Audit Logs
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
                <button 
                    onClick={handleLogout}
                    className="btn btn-danger" 
                    style={{ width: '100%', marginBottom: '1rem', border: 'none', background: 'rgba(239, 68, 68, 0.1)' }}
                >
                    Logout
                </button>
                <span className="version-badge">v2.2</span>
            </div>
        </aside>
    );
}
