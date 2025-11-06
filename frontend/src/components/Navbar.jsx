import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">EventSync</h2>
      <div className="menu">
        <Link to="/">Home</Link>
        <Link to="/my-tickets">My Tickets</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}
