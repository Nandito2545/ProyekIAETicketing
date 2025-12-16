import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { User, Shield, LogOut, Settings } from "lucide-react"; 
import { getImageUrl } from "../utils/imageUtils"; // ✅ Pastikan import ini ada

const NavBar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null); 
  const [profilePic, setProfilePic] = useState(null); // ✅ State untuk foto

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role"); // atau 'userRole' sesuaikan dengan SignIn Anda
    const storedPic = localStorage.getItem("profile_picture"); // ✅ Ambil foto

    if (storedUsername) {
      setIsLoggedIn(true);
      setUserRole(storedRole);
      setUsername(storedUsername);
      setProfilePic(storedPic); // ✅ Set foto
    }
  }, []); 

  const handleLogout = () => {
    localStorage.clear(); // Hapus semua data sesi
    setIsLoggedIn(false);
    setUserRole(null);
    setUsername(null);
    setProfilePic(null);
    navigate("/SignIn");
  };

  // ✅ LOGIKA TAMPILAN ICON / FOTO
  const renderProfileImage = () => {
    // 1. Jika Admin, SELALU tampilkan ikon Shield (tanpa foto)
    if (userRole === 'admin') {
      return <Shield size={20} />; 
    }

    // 2. Jika User biasa DAN punya foto profil, tampilkan FOTO
    if (profilePic && profilePic !== "null" && profilePic !== "") {
      return (
        <img 
          src={getImageUrl(profilePic)} 
          alt="Profile" 
          style={{ 
            width: "100%", 
            height: "100%", 
            borderRadius: "50%", 
            objectFit: "cover" 
          }}
        />
      );
    }

    // 3. Default (User biasa tanpa foto), tampilkan ikon User
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
            <>
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
                    overflow: "hidden" // Agar gambar bulat sempurna
                  }}
                >
                  {/* ✅ Panggil fungsi render di sini */}
                  {renderProfileImage()}
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-sm border-0">
                  <Dropdown.Header className="d-lg-none">
                    Signed in as: <br/>
                    <strong>{username}</strong>
                  </Dropdown.Header>
                  <Dropdown.Divider className="d-lg-none" />

                  <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center gap-2">
                    <User size={16} /> My Profile
                  </Dropdown.Item>

                  <Dropdown.Divider />
                  
                  <Dropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center gap-2">
                    <LogOut size={16} /> Logout
                  </Dropdown.Item>
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