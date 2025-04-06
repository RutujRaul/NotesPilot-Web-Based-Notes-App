import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');
  const onNotesPage = location.pathname === '/notes';

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact Us</Link>
        {!isLoggedIn && (
          <>
            <Link to="/signup">Signup</Link>
            <Link to="/login">Login</Link>
          </>
        )}
        {/* No Logout here — handled in Notes.js */}
      </div>
    </nav>
  );
};

export default Navbar;
