import { useState } from 'react';
import {
  addCar, cancelBooking, getBookings, getCars, getUsers, inr, removeCar, updateCar,
} from '../store.js';

const blank = { name: '', brand: '', type: 'Hatchback', fuel: 'Petrol', seats: 5, transmission: 'Manual', price: 2000, city: '', emoji: '🚗' };

export default function Admin() {
  const [cars, setCars] = useState(getCars);
  const [bookings, setBookings] = useState(getBookings);
  const [users] = useState(getUsers);
  const [tab, setTab] = useState('fleet');
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState('');

  const refresh = () => { setCars(getCars()); setBookings(getBookings()); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const revenue = confirmed.reduce((s, b) => s + b.total, 0);

  const add = (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.city.trim()) return setMsg('Name and city are required.');
    addCar({ ...f, name: f.name.trim(), city: f.city.trim(), seats: +f.seats, price: +f.price });
    setF(blank);
    setMsg('Car added.');
    refresh();
  };

  const del = (c) => {
    if (!confirm(`Remove ${c.name}?`)) return;
    removeCar(c.id);
    refresh();
  };

  const price = (c) => {
    const v = prompt(`New daily price for ${c.name} (₹)`, c.price);
    if (v === null) return;
    const n = Number(v);
    if (!(n > 0)) return alert('Enter a valid price.');
    updateCar(c.id, { price: n });
    refresh();
  };

  const maint = (c) => {
    if (c.maintenance) {
      updateCar(c.id, { maintenance: null });
      return refresh();
    }
    const from = prompt('Maintenance from (YYYY-MM-DD)');
    if (!from) return;
    const to = prompt('Maintenance until (YYYY-MM-DD)');
    if (!to) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || to < from) return alert('Invalid dates.');
    updateCar(c.id, { maintenance: { from, to } });
    refresh();
  };

  const cancel = (id) => {
    if (!confirm('Cancel this booking?')) return;
    cancelBooking(id);
    refresh();
  };

  return (
    <div>
      <h1>Admin dashboard</h1>
      <div className="stats">
        <div className="card stat"><span>Total cars</span><b>{cars.length}</b></div>
        <div className="card stat"><span>Active bookings</span><b>{confirmed.length}</b></div>
        <div className="card stat"><span>Revenue</span><b>{inr(revenue)}</b></div>
        <div className="card stat"><span>Users</span><b>{users.filter((u) => u.role === 'user').length}</b></div>
      </div>

      <div className="tabs wide">
        {[['fleet', 'Fleet'], ['bookings', 'Bookings'], ['users', 'Users']].map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'fleet' && (
        <>
          <form className="card addform" onSubmit={add}>
            <h3>Add a car</h3>
            <div className="formgrid">
              <input placeholder="Name" value={f.name} onChange={set('name')} />
              <input placeholder="Brand" value={f.brand} onChange={set('brand')} />
              <input placeholder="City" value={f.city} onChange={set('city')} />
              <select value={f.type} onChange={set('type')}>{['Hatchback', 'Sedan', 'SUV', 'MUV'].map((x) => <option key={x}>{x}</option>)}</select>
              <select value={f.fuel} onChange={set('fuel')}>{['Petrol', 'Diesel', 'CNG', 'Electric'].map((x) => <option key={x}>{x}</option>)}</select>
              <select value={f.transmission} onChange={set('transmission')}><option>Manual</option><option>Automatic</option></select>
              <input type="number" min="2" max="12" placeholder="Seats" value={f.seats} onChange={set('seats')} />
              <input type="number" min="1" placeholder="₹ / day" value={f.price} onChange={set('price')} />
              <input placeholder="Emoji" value={f.emoji} onChange={set('emoji')} />
            </div>
            {msg && <p className="muted">{msg}</p>}
            <button className="btn primary">Add car</button>
          </form>

          <div className="card scroll">
            <table className="tbl">
              <thead><tr><th>Car</th><th>City</th><th>Price/day</th><th>Maintenance</th><th>Actions</th></tr></thead>
              <tbody>
                {cars.map((c) => (
                  <tr key={c.id}>
                    <td>{c.emoji} {c.name}</td>
                    <td>{c.city}</td>
                    <td>{inr(c.price)}</td>
                    <td>{c.maintenance ? `${c.maintenance.from} → ${c.maintenance.to}` : '—'}</td>
                    <td className="row gap">
                      <button className="btn ghost small" onClick={() => price(c)}>Edit price</button>
                      <button className="btn ghost small" onClick={() => maint(c)}>{c.maintenance ? 'Clear maint.' : 'Schedule maint.'}</button>
                      <button className="btn danger small" onClick={() => del(c)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'bookings' && (
        <div className="card scroll">
          {bookings.length === 0 ? <p className="muted">No bookings yet.</p> : (
            <table className="tbl">
              <thead><tr><th>ID</th><th>Customer</th><th>Car</th><th>Dates</th><th>Total</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.userName}<br /><small className="muted">{b.userEmail}</small></td>
                    <td>{b.carEmoji} {b.carName}</td>
                    <td>{b.start} → {b.end}</td>
                    <td>{inr(b.total)}</td>
                    <td><span className={'badge ' + b.status}>{b.status}</span></td>
                    <td>{b.status === 'confirmed' && <button className="btn danger small" onClick={() => cancel(b.id)}>Cancel</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="card scroll">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.createdAt.slice(0, 10)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
