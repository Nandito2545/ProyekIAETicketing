import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/Navbar.jsx";
import Footer from "./components/Footer";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Home from "./pages/user/Home";
import Event from "./pages/user/Event";
import EventDetail from "./pages/user/EventDetail";
import MyTickets from "./pages/user/MyTickets";
import ViewTicket from "./pages/user/ViewTicket";
import Profile from "./pages/user/Profile";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import EventManagement from "./pages/admin/EventManagement";
import AddEvent from "./pages/admin/AddEvent";
import EditEvent from "./pages/admin/EditEvent";
import UserManagement from "./pages/admin/UserManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";

function AppContent() {
  const location = useLocation();

  const hideLayout = ["/SignIn", "/SignUp"].includes(location.pathname) || 
                     location.pathname.startsWith("/admin");

  return (
    <>
      {!hideLayout && <NavBar />}
      <Routes>
        {/* === Rute Publik / User === */}
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Event" element={<Event />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/EventDetail" element={<EventDetail />} />
        <Route path="/MyTickets" element={<MyTickets />} />
        <Route path="/ticket/:id" element={<ViewTicket />} />
        <Route path="/profile" element={<Profile />} />

        {/* === Rute Admin === */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} /> 
          <Route path="Dashboard" element={<Dashboard />} />
          <Route path="event-management" element={<EventManagement />} />
          <Route path="add-event" element={<AddEvent />} />
          <Route path="edit-event/:id" element={<EditEvent />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="payment-management" element={<PaymentManagement />} /> 
        </Route>
        
      </Routes>
      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;