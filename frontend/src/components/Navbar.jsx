import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";


const NavBar = () => {
  return (
    <Navbar expand="lg" className="py-3 bg-white shadow-sm">
      <Container>
        <Navbar.Brand href="#" className="fw-bold fs-4">TICKET.ID</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-center">
          <Nav className="gap-4">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/Event">Event</Nav.Link>
            <Nav.Link as={Link} to="/MyTickets">My Tickets</Nav.Link>

          </Nav>
        </Navbar.Collapse>
        <div className="d-flex gap-2">
          <Button as={Link} to="/SignIn" variant="outline-dark" size="sm">
            Sign in
          </Button>
          <Button as={Link} to="/SignUp" variant="secondary" size="sm">Sign Up</Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default NavBar;
