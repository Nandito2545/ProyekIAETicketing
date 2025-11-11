import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Home from "./pages/user/Home";
import Event from "./pages/user/Event";
import EventDetail from "./pages/user/EventDetail";
import MyTickets from "./pages/user/MyTickets";

// ✅ 1. Import Admin Layout dan halaman-halaman baru
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import EventManagement from "./pages/admin/EventManagement";
import AddEvent from "./pages/admin/AddEvent";
import UserManagement from "./pages/admin/UserManagement";
import EditEvent from "./pages/admin/EditEvent"; // ✅ 1. Import file baru


function AppContent() {
  const location = useLocation();

  // ✅ 2. Perbarui logic untuk menyembunyikan layout
  // Sembunyikan NavBar/Footer di halaman auth DAN semua halaman admin
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

        {/* === Rute Admin (Menggunakan Layout Khusus) === */}
        {/* ✅ 3. Definisikan Rute Admin yang baru */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Index route (default untuk /admin) */}
          <Route index element={<Dashboard />} /> 
          <Route path="Dashboard" element={<Dashboard />} />
          <Route path="event-management" element={<EventManagement />} />
          <Route path="add-event" element={<AddEvent />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="edit-event/:id" element={<EditEvent />} />
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