import React from 'react';
import { Link } from 'react-router-dom';
const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <img src="/logo.png" alt="SignSpeakly Logo" style={styles.logoImage} />
        <span style={styles.logoText}>
          Sign<span style={styles.accent}>Speakly</span>
        </span>
      </div>

      {/* Make nav scrollable if it overflows */}
      <div style={styles.navLinks}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/learn" style={styles.link}>Learn</Link>
        <Link to="/quiz" style={styles.link}>Quiz</Link>
        <Link to="/translation" style={styles.link}>Translate</Link>
        <Link to="/authpage" style={styles.link}>Login / Signup</Link>
        <Link to="/profile" style={styles.link}>Profile</Link>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap', // ✅ Allows wrapping on small screens
    padding: '18px 40px',
    background: 'linear-gradient(90deg, #2e7d32, #66bb6a)',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '26px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  logoImage: {
    height: '60px',
    width: '60px',
    borderRadius: '12px',
    objectFit: 'contain',
  },
  logoText: {
    fontFamily: 'Segoe UI, sans-serif',
    color: '#fff',
  },
  accent: {
    color: '#c8e6c9',
    fontWeight: 'bold',
  },
  navLinks: {
    display: 'flex',
    flexWrap: 'wrap', // ✅ Ensures items don't overflow on smaller screens
    gap: '16px',
    justifyContent: 'center',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '17px',
    fontWeight: '500',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'background 0.3s ease',
  },
};

export default Navbar;
