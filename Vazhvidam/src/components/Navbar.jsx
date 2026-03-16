import { Link } from "react-router-dom";
import { getUserRole } from "../utils/auth";
import "../styles/navbar.css";

const Navbar = () => {
  const role = getUserRole();

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" className="logo-link">
          <img src="/logo.jpeg" alt="Vazhvidam" className="logo-image" />
          <span className="logo-text">Vazhvidam</span>
        </Link>
      </div>
      
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About Company</Link></li>
        
        {role === "owner" && (
          <>
            <li><Link to="/owner-dashboard">Owner Dashboard</Link></li>
          </>
        )}

        {role === "admin" && (
          <li><Link to="/admin">Admin Dashboard</Link></li>
        )}

        {!role && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="btn">Register</Link></li>
          </>
        )}
        
        {role && (
          <li>
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                window.location.href = "/";
              }}
              className="btn"
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
