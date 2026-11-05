import { useState } from 'react';
import { Img } from '../components/Ui.jsx';
import { PHOTO_LIB } from '../data.js';
import { login, signup } from '../store.js';

export default function Auth({ onAuth, toast }) {
  const [tab, setTab] = useState('user');     // user | admin
  const [mode, setMode] = useState('login');  // login | signup
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  const L = mode === 'login';
  const type = show ? 'text' : 'password';
  const switchTo = (fn, v) => { setErr(''); fn(v); };

  async function submit(e) {
    e.preventDefault();
    const f = e.target, email = f.email.value.trim().toLowerCase(), pw = f.password.value;
    if (L) {
      const r = await login({ email, password: pw, role: tab });
      return r.error ? setErr(r.error) : onAuth(r.user);
    }
    const name = f.name.value.trim();
    if (name.length < 2) return setErr('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Please enter a valid email address.');
    if (pw.length < 6) return setErr('Password must be at least 6 characters.');
    if (pw !== f.confirm.value) return setErr('Passwords do not match.');
    const r = await signup({ name, email, password: pw });
    if (r.error) return setErr(r.error);
    setErr(''); setMode('login'); setTab('user'); toast('Account created — please log in.');
  }

  return (
    <div className="lg">
      <div className="lg-l">
        <div className="road"><i></i><i></i><i></i><i></i></div><div className="wm">SWIFT</div>
        <div className="brand">Drive<b>Ease</b> <span className="pill">INDIA</span></div>
        <h2>Rent India's favourite cars.<br /><span>Own every road.</span></h2>
        <p>From the new Tata Curvv to the trusted Toyota Fortuner — search, compare and book self-drive cars across India with transparent rupee pricing, GST included.</p>
        <div className="swift-hero"><Img src={PHOTO_LIB.hatchRed} alt="Maruti Swift 2024" /><span className="swift-tag">🚗 Maruti Swift · from ₹1,800/day</span></div>
        <div className="chips"><span>🇮🇳 100% Indian fleet</span><span>⚡ Instant confirmation</span><span>🛡️ Insurance add-on</span></div>
      </div>
      <div className="lg-r">
        <div className="lg-card">
          <h3>{L ? 'Welcome back' : 'Create your account'}</h3>
          <div className="meta" style={{ color: 'var(--muted)', fontSize: '.88rem' }}>{L ? 'Log in to book your ride.' : 'It takes less than a minute.'}</div>
          {L && (
            <div className="role-tabs">
              <button type="button" className={tab === 'user' ? 'on' : ''} onClick={() => switchTo(setTab, 'user')}><span className="r-icon">👤</span> User Login</button>
              <button type="button" className={tab === 'admin' ? 'on' : ''} onClick={() => switchTo(setTab, 'admin')}><span className="r-icon">🛡️</span> Admin Login</button>
            </div>
          )}
          <div className="mode-tabs">
            <button type="button" className={L ? 'on' : ''} onClick={() => switchTo(setMode, 'login')}>Log in</button>
            <button type="button" className={L ? '' : 'on'} onClick={() => switchTo(setMode, 'signup')}>Sign up</button>
          </div>
          <form onSubmit={submit} noValidate key={mode}>
            {!L && <><label htmlFor="name">Full name</label><input id="name" name="name" autoComplete="name" placeholder="Rahul Sharma" /></>}
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type={type} placeholder="••••••" />
            {!L && <><label htmlFor="confirm">Confirm password</label><input id="confirm" name="confirm" type={type} placeholder="••••••" /></>}
            <label className="chk"><input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} /> Show password</label>
            <div className="err">{err}</div>
            <button className="btn" style={{ width: '100%' }}>{L ? `Log in as ${tab === 'admin' ? 'Admin' : 'User'}` : 'Create account'}</button>
          </form>
          {L && (
            <div className="demo-box"><b>DEMO CREDENTIALS</b>
              {tab === 'admin'
                ? <>Admin → <code>admin@driveease.com</code> / <code>admin123</code></>
                : <>User → <code>user@driveease.com</code> / <code>user123</code><br />Or sign up with any email.</>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
