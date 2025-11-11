import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, Dropdown, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
// ✅ 1. Import ikon User dan Shield
import { User, Shield } from "lucide-react"; 

const NavBar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // ✅ 2. State baru untuk role

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role"); // ✅ 3. Ambil role
    if (storedUsername) {
      setIsLoggedIn(true);
      setUserRole(storedRole); // ✅ 4. Simpan role
    }
  }, []); // Hanya cek saat komponen dimuat

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userId"); // ✅ 5. Hapus userId juga
    localStorage.removeItem("token");

    setIsLoggedIn(false);
    setUserRole(null);

    navigate("/SignIn");
  };

  // ✅ 6. Logika untuk menampilkan ikon
  const ProfileIcon = () => {
    if (userRole === 'admin') {
      return <Shield size={20} />; // Ikon untuk Admin
    }
    // Default ikon untuk 'user'
    return <User size={20} />; 
  };

  return (
    <Navbar expand="lg" className="py-3 bg-white shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
          TICKET.ID
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-center">
          <Nav className="gap-4">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/Event">Event</Nav.Link>
            <Nav.Link as={Link} to="/MyTickets">My Tickets</Nav.Link>
          </Nav>
        </Navbar.Collapse>

        <div className="d-flex gap-2">
          {!isLoggedIn ? (
            <>
              <Button as={Link} to="/SignIn" variant="outline-dark" size="sm">
                Sign in
              </Button>
              <Button as={Link} to="/SignUp" variant="secondary" size="sm">
                Sign Up
              </Button>
            </>
          ) : (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-profile"
                className="d-flex align-items-center justify-content-center" // ✅ 7. Styling
                style={{
                  width: "40px",
                  height: "40px",
                  padding: 0,
                  borderRadius: "50%",
                  border: "1px solid #ccc",
                }}
              >
                {/* ✅ 8. Ganti <img> dengan <ProfileIcon /> */}
                <ProfileIcon />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </Container>
    </Navbar>
  );
};

export default NavBar;