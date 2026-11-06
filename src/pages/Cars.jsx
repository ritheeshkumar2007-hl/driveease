import { useMemo, useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import CarImg from '../components/CarImg.jsx';
import {
  ADDONS, COUPONS, createBooking, getCars, inr, isAvailable, quote,
} from '../store.js';

const today = () => new Date().toISOString().slice(0, 10);
const plus = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x.toISOString().slice(0, 10);
};

export default function Cars() {
  const { user } = useAuth();
  const [cars] = useState(getCars);
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const [fuel, setFuel] = useState('All');
  const [city, setCity] = useState('All');
  const [sort, setSort] = useState('low');
  const [cmp, setCmp] = useState([]);
  const [showCmp, setShowCmp] = useState(false);
  const [booking, setBooking] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const uniq = (k) => ['All', ...new Set(cars.map((c) => c[k]))];

  const list = useMemo(() => {
    let r = cars.filter(
      (c) =>
        (type === 'All' || c.type === type) &&
        (fuel === 'All' || c.fuel === fuel) &&
        (city === 'All' || c.city === city) &&
        c.name.toLowerCase().includes(q.toLowerCase())
    );
    r = [...r].sort((a, b) => (sort === 'low' ? a.price - b.price : b.price - a.price));
    return r;
  }, [cars, q, type, fuel, city, sort]);

  const toggleCmp = (id) =>
    setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));

  return (
    <div>
      <section className="hero">
        <div>
          <h1>Drive India your way 🇮🇳</h1>
          <p>Hatchbacks to SUVs, EVs to 7-seaters — book in minutes with transparent pricing.</p>
          <div className="hero-stats">
            <span><b>{cars.length}</b> cars</span>
            <span><b>{new Set(cars.map((c) => c.city)).size}</b> cities</span>
            <span><b>24/7</b> support</span>
          </div>
        </div>
      </section>
      <div className="filters card">
        <input placeholder="Search car…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>{uniq('type').map((x) => <option key={x}>{x}</option>)}</select>
        <select value={fuel} onChange={(e) => setFuel(e.target.value)}>{uniq('fuel').map((x) => <option key={x}>{x}</option>)}</select>
        <select value={city} onChange={(e) => setCity(e.target.value)}>{uniq('city').map((x) => <option key={x}>{x}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </select>
      </div>

      {cmp.length > 0 && (
        <div className="cmpbar">
          {cmp.length} selected (max 3)
          <button className="btn small" disabled={cmp.length < 2} onClick={() => setShowCmp(true)}>Compare</button>
          <button className="btn ghost small" onClick={() => setCmp([])}>Clear</button>
        </div>
      )}

      <div className="grid">
        {list.map((c) => {
          const under = c.maintenance && c.maintenance.to >= today() && c.maintenance.from <= today();
          return (
            <div className="card car" key={c.id}>
              <CarImg car={c} />
              <h3>{c.name}</h3>
              <p className="muted">{c.brand} · {c.city}</p>
              <div className="tags">
                <span>{c.type}</span><span className={'f-' + c.fuel}>{c.fuel}</span><span>{c.transmission}</span><span>{c.seats} seats</span>
              </div>
              {c.maintenance && <p className="warn">🔧 Maintenance {c.maintenance.from} → {c.maintenance.to}</p>}
              <div className="row between">
                <b className="price">{inr(c.price)}<small>/day</small></b>
                <label className="chk"><input type="checkbox" checked={cmp.includes(c.id)} onChange={() => toggleCmp(c.id)} /> Compare</label>
              </div>
              <button className="btn primary block" disabled={under} onClick={() => setBooking(c)}>
                {under ? 'In maintenance' : 'Book now'}
              </button>
            </div>
          );
        })}
        {list.length === 0 && <p className="muted">No cars match your filters.</p>}
      </div>

      {showCmp && <Compare cars={cars.filter((c) => cmp.includes(c.id))} onClose={() => setShowCmp(false)} />}
      {booking && (
        <BookModal
          car={booking}
          user={user}
          onClose={() => setBooking(null)}
          onDone={(b) => { setBooking(null); setReceipt(b); }}
        />
      )}
      {receipt && <Receipt b={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="row between"><h2>{title}</h2><button className="btn ghost small" onClick={onClose}>✕</button></div>
        {children}
      </div>
    </div>
  );
}

function Compare({ cars, onClose }) {
  const rows = [
    ['Brand', 'brand'], ['Type', 'type'], ['Fuel', 'fuel'], ['Transmission', 'transmission'],
    ['Seats', 'seats'], ['City', 'city'], ['Price / day', 'price'],
  ];
  return (
    <Modal title="Compare cars" onClose={onClose}>
      <table className="tbl">
        <thead><tr><th></th>{cars.map((c) => <th key={c.id}><CarImg car={c} className="mini" />{c.name}</th>)}</tr></thead>
        <tbody>
          {rows.map(([l, k]) => (
            <tr key={k}><td>{l}</td>{cars.map((c) => <td key={c.id}>{k === 'price' ? inr(c[k]) : c[k]}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}

function BookModal({ car, user, onClose, onDone }) {
  const [start, setStart] = useState(plus(today(), 1));
  const [end, setEnd] = useState(plus(today(), 3));
  const [addons, setAddons] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [pay, setPay] = useState('UPI');
  const [err, setErr] = useState('');

  const qt = quote({ car, start, end, addons, coupon: coupon.trim() });
  const avail = qt ? isAvailable(car, start, end) : true;

  const toggle = (id) => setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const confirm = () => {
    setErr('');
    try {
      onDone(createBooking({ user, car, start, end, addons, coupon: coupon.trim(), payment: pay }));
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <Modal title={`Book ${car.name}`} onClose={onClose}>
      <div className="two">
        <label>Pick-up<input type="date" min={today()} value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>Return<input type="date" min={plus(start, 1)} value={end} onChange={(e) => setEnd(e.target.value)} /></label>
      </div>

      <p className="lbl">Add-ons</p>
      <div className="addons">
        {ADDONS.map((a) => (
          <label key={a.id} className="chk"><input type="checkbox" checked={addons.includes(a.id)} onChange={() => toggle(a.id)} /> {a.label} (+{inr(a.price)}/day)</label>
        ))}
      </div>

      <label>Coupon
        <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder={Object.keys(COUPONS).join(' / ')} />
      </label>
      {qt?.couponError && <div className="alert">{qt.couponError}</div>}

      <label>Payment method
        <select value={pay} onChange={(e) => setPay(e.target.value)}>
          <option>UPI</option><option>Credit/Debit Card</option><option>Net Banking</option><option>Pay at pickup</option>
        </select>
      </label>

      {!qt && <div className="alert">Return date must be after pick-up date.</div>}
      {qt && !avail && <div className="alert">This car is not available for the selected dates.</div>}

      {qt && (
        <div className="bill">
          <div><span>{inr(car.price)} × {qt.days} day(s)</span><span>{inr(qt.base)}</span></div>
          {qt.addonCost > 0 && <div><span>Add-ons</span><span>{inr(qt.addonCost)}</span></div>}
          {qt.discount > 0 && <div className="green"><span>Discount</span><span>− {inr(qt.discount)}</span></div>}
          <div><span>GST (12%)</span><span>{inr(qt.tax)}</span></div>
          <div className="tot"><span>Total</span><span>{inr(qt.total)}</span></div>
        </div>
      )}

      {err && <div className="alert">{err}</div>}
      <button className="btn primary block" disabled={!qt || !avail || !!qt.couponError} onClick={confirm}>Confirm &amp; Pay</button>
    </Modal>
  );
}

export function Receipt({ b, onClose }) {
  return (
    <Modal title="Booking confirmed ✅" onClose={onClose}>
      <div className="receipt">
        <p><b>Booking ID:</b> {b.id}</p>
        <p><b>Car:</b> {b.carEmoji} {b.carName}</p>
        <p><b>Customer:</b> {b.userName} ({b.userEmail})</p>
        <p><b>Dates:</b> {b.start} → {b.end} ({b.days} days)</p>
        <p><b>Add-ons:</b> {b.addons.length ? b.addons.map((id) => ADDONS.find((a) => a.id === id)?.label).join(', ') : 'None'}</p>
        {b.coupon && <p><b>Coupon:</b> {b.coupon}</p>}
        <p><b>Payment:</b> {b.payment}</p>
        <div className="bill">
          <div><span>Subtotal</span><span>{inr(b.subtotal)}</span></div>
          {b.discount > 0 && <div className="green"><span>Discount</span><span>− {inr(b.discount)}</span></div>}
          <div><span>GST</span><span>{inr(b.tax)}</span></div>
          <div className="tot"><span>Total paid</span><span>{inr(b.total)}</span></div>
        </div>
        <button className="btn ghost block" onClick={() => window.print()}>Print receipt</button>
      </div>
    </Modal>
  );
}
