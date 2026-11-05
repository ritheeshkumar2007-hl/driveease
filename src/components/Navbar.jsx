import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="nav">
      <div className="nav-in">
        <span className="brand">🚗 Drive<b>Ease</b></span>
        {user && (
          <nav className="links">
            {user.role === 'user' && (
              <>
                <NavLink to="/cars">Cars</NavLink>
                <NavLink to="/bookings">My Bookings</NavLink>
              </>
            )}
            {user.role === 'admin' && <NavLink to="/admin">Admin Dashboard</NavLink>}
            <span className="who">{user.name} · {user.role}</span>
            <button className="btn ghost" onClick={() => { logout(); nav('/login'); }}>Logout</button>
          </nav>
        )}
      </div>
    </header>
  );
}
