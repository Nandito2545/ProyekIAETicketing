import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Shield, LogOut } from "lucide-react"; 
import { getImageUrl } from "../utils/imageUtils"; 

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook untuk mendeteksi perpindahan halaman
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null); 
  const [profilePic, setProfilePic] = useState(null);

  // ✅ Fungsi untuk memuat data user dari LocalStorage
  const loadUserData = () => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedPic = localStorage.getItem("profile_picture");

    if (storedUsername) {
      setIsLoggedIn(true);
      setUserRole(storedRole);
      setUsername(storedUsername);
      setProfilePic(storedPic);
    } else {
      setIsLoggedIn(false);
    }
  };

  // ✅ Update data setiap kali halaman berpindah atau dimuat ulang
  useEffect(() => {
    loadUserData();
  }, [location]); 

  const handleLogout = () => {
    localStorage.clear();
    navigate("/SignIn");
    window.location.reload(); 
  };

  // ✅ Logika Render Gambar (Lebih Aman)
  const renderProfileImage = () => {
    if (userRole === 'admin') {
      return <Shield size={20} />; 
    }

    // Cek apakah ada foto profil yang valid
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
          // Jika gambar gagal dimuat (misal 404), sembunyikan gambar ini (akan fallback ke icon User default dropdow)
          onError={(e) => {
            e.target.style.display = 'none';
            // Bisa tambahkan logika untuk menampilkan icon fallback di sini jika mau
          }}
        />
      );
    }

    return <User size={20} />; 
  };

  return (
    <Navbar expand="lg" className="py-3 bg-white shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          TICKET<span style={{ color: '#C10C99' }}>.ID</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" />
        
        <Navbar.Collapse id="navbar-nav" className="justify-content-center">
          <Nav className="gap-4">
            <Nav.Link as={Link} to="/" className="fw-medium">Home</Nav.Link>
            <Nav.Link as={Link} to="/Event" className="fw-medium">Event</Nav.Link>
            {isLoggedIn && userRole !== 'admin' && (
              <Nav.Link as={Link} to="/MyTickets" className="fw-medium">My Tickets</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>

        <div className="d-flex gap-2 align-items-center">
          {!isLoggedIn ? (
            <>
              <Button as={Link} to="/SignIn" variant="outline-dark" size="sm" className="px-3 rounded-pill">
                Sign in
              </Button>
              <Button as={Link} to="/SignUp" style={{ backgroundColor: '#C10C99', border: 'none' }} size="sm" className="px-3 rounded-pill text-white">
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <span className="fw-semibold text-dark me-2 d-none d-lg-block">
                Hello, {username}
              </span>

              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  id="dropdown-profile"
                  className="d-flex align-items-center justify-content-center p-0"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "2px solid #C10C99",
                    overflow: "hidden"
                  }}
                >
                  {renderProfileImage()}
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-sm border-0 mt-2">
                  <Dropdown.Header className="d-lg-none">
                    Signed in as: <br/>
                    <strong>{username}</strong>
                  </Dropdown.Header>
                  <Dropdown.Divider className="d-lg-none" />

                  <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center gap-2 py-2">
                    <User size={16} /> My Profile
                  </Dropdown.Item>

                  <Dropdown.Divider />
                  
                  <Dropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center gap-2 py-2">
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