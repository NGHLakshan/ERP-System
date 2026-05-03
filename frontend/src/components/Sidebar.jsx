import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BarChart3, Package, PlusCircle,
  Users, ShoppingCart, FilePlus, DollarSign, Receipt,
  TrendingUp, ScrollText, LogOut, Zap
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
  >
    <Icon className="nav-icon" />
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isAdmin   = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Zap size={18} color="white" />
        </div>
        <span className="brand-name">ERP<span>Pro</span></span>
      </div>

      {/* User Info */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="user-name">{user?.username}</p>
          <p className="user-role">{user?.role}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="nav-section">General</p>
        <NavItem to="/"        icon={LayoutDashboard} label="Dashboard"  end />
        <NavItem to="/reports" icon={BarChart3}       label="Reports" />

        <p className="nav-section">Inventory</p>
        <NavItem to="/products" icon={Package}    label="Products" end />
        {isManager && (
          <NavItem to="/add" icon={PlusCircle} label="Add Product" />
        )}

        <p className="nav-section">Sales</p>
        <NavItem to="/customers"  icon={Users}       label="Customers" end />
        <NavItem to="/sales"      icon={ShoppingCart} label="Sales Orders" end />
        <NavItem to="/sales/new"  icon={FilePlus}    label="New Order" />

        <p className="nav-section">Finance</p>
        <NavItem to="/finance"              icon={DollarSign} label="Finance Dashboard" end />
        <NavItem to="/finance/transactions" icon={Receipt}    label="Transactions" />
        <NavItem to="/finance/profit"       icon={TrendingUp} label="Profit Summary" />

        {isAdmin && (
          <>
            <p className="nav-section">System</p>
            <NavItem to="/audit-logs" icon={ScrollText} label="Audit Logs" />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
        <span className="version-badge">v2.3 — ERPPro</span>
      </div>
    </aside>
  );
}
