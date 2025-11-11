import React from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import "./AdminLayout.css";
// ✅ Import ikon baru
import { LayoutDashboard, Calendar, Users, LogOut, CreditCard } from "lucide-react"; 

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/SignIn");
  };

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <Link to="/admin/Dashboard" className="admin-sidebar-header">
          TICKET.ID
        </Link>
        <div className="admin-nav">
          <NavLink to="/admin/Dashboard" className="admin-nav-link">
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/event-management" className="admin-nav-link">
            <Calendar size={20} />
            Event Management
          </NavLink>
          {/* ✅ TAMBAHKAN LINK BARU */}
          <NavLink to="/admin/payment-management" className="admin-nav-link">
            <CreditCard size={20} />
            Payment Management
          </NavLink>
          <NavLink to="/admin/user-management" className="admin-nav-link">
            <Users size={20} />
            User Management
          </NavLink>
          
          <button onClick={handleLogout} className="admin-nav-link" style={{border: 'none', background: 'none', marginTop: 'auto', color: '#f0d9eb'}}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </nav>

      <main className="admin-content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;