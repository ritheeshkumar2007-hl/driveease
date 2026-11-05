import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Cars from './pages/Cars.jsx';
import Bookings from './pages/Bookings.jsx';
import Admin from './pages/Admin.jsx';

const home = (u) => (!u ? '/login' : u.role === 'admin' ? '/admin' : '/cars');

function Guard({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={home(user)} replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to={home(user)} replace />} />
          <Route path="/login" element={user ? <Navigate to={home(user)} replace /> : <Login />} />
          <Route path="/cars" element={<Guard role="user"><Cars /></Guard>} />
          <Route path="/bookings" element={<Guard role="user"><Bookings /></Guard>} />
          <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
          <Route path="*" element={<Navigate to={home(user)} replace />} />
        </Routes>
      </main>
    </>
  );
}
