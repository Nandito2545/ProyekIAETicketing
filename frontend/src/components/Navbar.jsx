import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, Dropdown, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { User, Shield } from "lucide-react"; 

const NavBar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null); // ✅ 1. State baru untuk nama

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    if (storedUsername) {
      setIsLoggedIn(true);
      setUserRole(storedRole);
      setUsername(storedUsername); // ✅ 2. Simpan nama ke state
    }
  }, []); 

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    setIsLoggedIn(false);
    setUserRole(null);
    setUsername(null); // ✅ 3. Hapus nama dari state

    navigate("/SignIn");
  };

  const ProfileIcon = () => {
    if (userRole === 'admin') {
      return <Shield size={20} />; 
    }
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

        {/* ✅ PERBAIKAN: Bungkus div dengan 'align-items-center' */}
        <div className="d-flex gap-2 align-items-center">
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
            // ✅ PERBAIKAN: Tambahkan <span> untuk nama
            <>
              {/* Tampilkan nama di layar besar, sembunyikan di mobile */}
              <span className="fw-semibold text-dark me-2 d-none d-lg-block">
                {username}
              </span>

              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  id="dropdown-profile"
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    padding: 0,
                    borderRadius: "50%",
                    border: "1px solid #ccc",
                  }}
                >
                  <ProfileIcon />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {/* Tampilkan nama di menu dropdown (hanya di mobile) */}
                  <Dropdown.Header className="d-lg-none">
                    Signed in as: <br/>
                    <strong>{username}</strong>
                  </Dropdown.Header>
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
};

export default NavBar;