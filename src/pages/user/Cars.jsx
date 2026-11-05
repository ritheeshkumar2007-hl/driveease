import { useMemo, useState } from 'react';
import { Img, Modal } from '../../components/Ui.jsx';
import BookingModal from './BookingModal.jsx';
import { getCars } from '../../store.js';
import { inr } from '../../utils.js';
import { PHOTO_LIB } from '../../data.js';

export default function Cars({ user, toast }) {
  const [cars] = useState(getCars);
  const [f, setF] = useState({ q: '', t: '', y: '', p: '', s: '' });
  const [cmp, setCmp] = useState([]);
  const [bookId, setBookId] = useState(null);
  const [modal, setModal] = useState(null); // 'pay' | 'cmp'
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const types = [...new Set(cars.map(c => c.type))].sort();
  const years = [...new Set(cars.map(c => c.year))].sort((a, b) => b - a);
  const hero = cars.find(c => c.isNew);

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const r = cars.filter(c => c.name.toLowerCase().includes(q) && (!f.t || c.type === f.t) && (!f.y || c.year === +f.y) && (!f.p || c.price <= +f.p));
    if (f.s === 'asc') r.sort((a, b) => a.price - b.price);
    if (f.s === 'desc') r.sort((a, b) => b.price - a.price);
    if (f.s === 'r') r.sort((a, b) => b.rating - a.rating);
    if (f.s === 'new') r.sort((a, b) => b.year - a.year);
    return r;
  }, [cars, f]);

  const toggle = (id, on) => {
    if (on && cmp.length >= 3) return toast('You can compare up to 3 cars.');
    setCmp(on ? [...cmp, id] : cmp.filter(x => x !== id));
  };
  const chip = { background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' };

  return (
    <>
      <section className="page-hero">
        <div>
          <span className="eyebrow">Self-drive car rental · India</span>
          <h2>Namaste {user.name.split(' ')[0]}, pick your ride.</h2>
          <p>{cars.length} cars across {types.length} body types. Tick up to 3 to compare side by side, then book in under a minute.</p>
          <div className="chips" style={{ marginTop: 20 }}>
            <span style={chip}>🎁 10% off on 7+ days</span><span style={chip}>🧾 GST invoice</span><span style={chip}>📍 20+ cities</span>
          </div>
        </div>
        <div className="hero-img"><Img src={hero?.photo || PHOTO_LIB.generic} alt={hero?.name || 'Featured car'} /></div>
      </section>

      <div className="info-banner">
        <span className="icon">💳</span>
        <div className="text"><b>How does payment work?</b><span>Pay via Card, UPI or Net banking. GST 18% included. Instant confirmation with printable receipt.</span></div>
        <button className="btn" onClick={() => setModal('pay')}>See payment flow</button>
      </div>

      <div className="filters-bar">
        <input placeholder="🔍 Search by car name…" value={f.q} onChange={set('q')} />
        <select value={f.t} onChange={set('t')}><option value="">All types</option>{types.map(t => <option key={t}>{t}</option>)}</select>
        <select value={f.y} onChange={set('y')}><option value="">All years</option>{years.map(y => <option key={y} value={y}>{y}{y >= 2024 ? ' (New)' : ''}</option>)}</select>
        <select value={f.p} onChange={set('p')}>
          <option value="">Any price</option>{[2000, 3000, 4000, 6000].map(p => <option key={p} value={p}>Up to {inr(p)}</option>)}
        </select>
        <select value={f.s} onChange={set('s')}>
          <option value="">Sort by</option><option value="asc">Price: low → high</option><option value="desc">Price: high → low</option>
          <option value="r">Top rated</option><option value="new">Newest first</option>
        </select>
      </div>

      <div className="grid">
        {list.length === 0 && <div className="empty"><h3>No cars match these filters</h3><p>Try clearing a filter or searching a different name.</p></div>}
        {list.map(c => (
          <article className="car" key={c.id}>
            <div className="car-img"><Img src={c.photo} alt={c.name} />{c.isNew && <span className="badge-new">NEW {c.year}</span>}</div>
            <div className="car-body">
              <div className="car-title-row"><h3>{c.name}</h3><span className="rate">★ {c.rating}</span></div>
              <div className="car-year">{c.year} model · {c.type}</div>
              <div className="specs">
                <div className="spec"><i>👥</i>{c.seats} seats</div><div className="spec"><i>⛽</i>{c.fuel}</div>
                <div className="spec"><i>⚙️</i>{c.trans}</div><div className="spec"><i>🛣️</i>{c.mileage}</div>
              </div>
              <div className="price-row">
                <div className="price">{inr(c.price)} <small>/ day</small></div>
                <button className="btn" onClick={() => setBookId(c.id)}>Book now →</button>
              </div>
              <label className="cmp-row"><input type="checkbox" checked={cmp.includes(c.id)} onChange={e => toggle(c.id, e.target.checked)} /> Add to compare</label>
            </div>
          </article>
        ))}
      </div>

      {cmp.length > 0 && (
        <div className="cmpbar">
          <span>{cmp.length} car{cmp.length > 1 ? 's' : ''} selected</span>
          <button className="btn sm" disabled={cmp.length < 2} onClick={() => setModal('cmp')}>Compare prices</button>
          <button className="btn ghost sm" onClick={() => setCmp([])}>Clear</button>
        </div>
      )}

      {modal === 'pay' && (
        <Modal onClose={() => setModal(null)}>
          <h2>💳 How payment works</h2>
          <div style={{ fontSize: '.92rem', lineHeight: 1.65, color: 'var(--ink2)' }}>
            <p><b style={{ color: 'var(--brand)' }}>Step 1 — Choose car &amp; dates.</b> Availability is checked against existing bookings and maintenance schedules.</p>
            <p><b style={{ color: 'var(--brand)' }}>Step 2 — Add-ons &amp; coupons.</b> Add insurance, GPS, child seat or extra driver. Use <code>WELCOME10</code> for 10% off.</p>
            <p><b style={{ color: 'var(--brand)' }}>Step 3 — Price.</b> (days × rate) − weekly discount (10% for 7+ days) − coupon + add-ons, then 18% GST.</p>
            <p><b style={{ color: 'var(--brand)' }}>Step 4 — Pay.</b> Card, UPI or Net banking, validated in your browser.</p>
            <p><b style={{ color: 'var(--brand)' }}>Step 5 — Confirmation.</b> Booking saved with a unique TXN ID and a printable receipt.</p>
            <p><b>⚠ Demo note:</b> Academic project — no real money moves. Data stays in your browser's Local Storage.</p>
          </div>
          <div style={{ textAlign: 'right', marginTop: 18 }}><button className="btn" onClick={() => setModal(null)}>Got it</button></div>
        </Modal>
      )}

      {modal === 'cmp' && <Compare cars={cars.filter(c => cmp.includes(c.id))} onClose={() => setModal(null)} onBook={id => { setModal(null); setBookId(id); }} />}
      {bookId && <BookingModal car={cars.find(c => c.id === bookId)} user={user} onClose={() => setBookId(null)} />}
    </>
  );
}

function Compare({ cars, onClose, onBook }) {
  const minP = Math.min(...cars.map(c => c.price)), maxS = Math.max(...cars.map(c => c.seats)), maxR = Math.max(...cars.map(c => c.rating));
  const row = (label, fn, best) => <tr><th>{label}</th>{cars.map(c => <td key={c.id} className={best && best(c) ? 'best' : ''}>{fn(c)}</td>)}</tr>;
  return (
    <Modal onClose={onClose} wide>
      <h2>Compare cars</h2>
      <p className="meta">Green cells mark the best value in each row.</p>
      <div className="wrap" style={{ marginTop: 14 }}>
        <table><tbody>
          <tr><th>Car</th>{cars.map(c => <th key={c.id}>{c.name}</th>)}</tr>
          <tr><th>Photo</th>{cars.map(c => <td key={c.id}><div style={{ width: 140, aspectRatio: '16/10', borderRadius: 10, overflow: 'hidden' }}><Img src={c.photo} alt={c.name} /></div></td>)}</tr>
          {row('Price / day', c => inr(c.price), c => c.price === minP)}
          {row('3-day cost', c => inr(c.price * 3), c => c.price === minP)}
          {row('7-day cost (10% off)', c => inr(c.price * 7 * 0.9), c => c.price === minP)}
          {row('Year', c => c.year + (c.isNew ? ' 🆕' : ''))}
          {row('Type', c => c.type)}
          {row('Seats', c => c.seats, c => c.seats === maxS)}
          {row('Fuel', c => c.fuel)}
          {row('Transmission', c => c.trans)}
          {row('Mileage', c => c.mileage)}
          {row('Rating', c => '★ ' + c.rating, c => c.rating === maxR)}
        </tbody></table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 18 }}>
        <button className="btn ghost" onClick={onClose}>Close</button>
        <button className="btn" onClick={() => onBook(cars.find(c => c.price === minP).id)}>Book the cheapest</button>
      </div>
    </Modal>
  );
}
