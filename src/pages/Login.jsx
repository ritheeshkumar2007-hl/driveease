import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { login, signup } = useAuth();
  const [role, setRole] = useState('user');
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const isSignup = mode === 'signup' && role === 'user';

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      if (isSignup) await signup(f);
      else await login({ email: f.email, password: f.password, role });
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  const fill = (email, password) => setF({ ...f, email, password });

  return (
    <div className="auth-wrap">
      <form className="card auth" onSubmit={submit}>
        <h1>{isSignup ? 'Create account' : 'Welcome back'}</h1>
        <p className="muted">Rent a car anywhere in India with DriveEase.</p>

        <div className="tabs">
          {['user', 'admin'].map((r) => (
            <button type="button" key={r} className={role === r ? 'on' : ''} onClick={() => { setRole(r); setMode('login'); setErr(''); }}>
              {r === 'user' ? 'User' : 'Admin'}
            </button>
          ))}
        </div>

        {isSignup && (
          <label>Full name<input value={f.name} onChange={set('name')} placeholder="Ravi Kumar" required /></label>
        )}
        <label>Email<input type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" required /></label>
        <label>Password<input type="password" value={f.password} onChange={set('password')} placeholder="Min 6 characters" required /></label>

        {err && <div className="alert">{err}</div>}

        <button className="btn primary block" disabled={busy}>{busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Login'}</button>

        {role === 'user' ? (
          <p className="muted center">
            {isSignup ? 'Already registered?' : 'New here?'}{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setMode(isSignup ? 'login' : 'signup'); setErr(''); }}>
              {isSignup ? 'Login' : 'Create an account'}
            </a>
          </p>
        ) : (
          <p className="muted center">Admin accounts cannot be self-registered.</p>
        )}

        <div className="demo">
          <span>Demo:</span>
          <button type="button" className="chip" onClick={() => { setRole('user'); setMode('login'); fill('user@driveease.com', 'user123'); }}>User</button>
          <button type="button" className="chip" onClick={() => { setRole('admin'); setMode('login'); fill('admin@driveease.com', 'admin123'); }}>Admin</button>
        </div>
      </form>
    </div>
  );
}
