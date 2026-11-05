import { useState } from 'react';
import { Img } from '../../components/Ui.jsx';
import { photoFor } from '../../data.js';
import { getBooks, getCars, getUsers, saveBooks, saveCars } from '../../store.js';
import { inr, overlap, today } from '../../utils.js';

export default function Dashboard({ toast }) {
  const [cars, setCars] = useState(getCars);
  const [books, setBooks] = useState(getBooks);
  const users = getUsers();
  const t = today();

  const commitCars = (next, msg) => { saveCars(next); setCars(next); msg && toast(msg); };
  const commitBooks = next => { saveBooks(next); setBooks(next); };
  const patch = (id, fields, msg) => commitCars(cars.map(c => c.id === id ? { ...c, ...fields } : c), msg);

  const active = books.filter(b => b.status === 'confirmed');
  const revenue = active.reduce((a, b) => a + b.total, 0);
  const maintCount = cars.filter(c => c.maint && t <= c.maint.to).length;

  function addCar(e) {
    e.preventDefault(); const f = e.target;
    const name = f.name.value.trim(), type = f.type.value.trim(), year = +f.year.value;
    commitCars([...cars, {
      id: Date.now(), name, type, year, isNew: year >= 2024, seats: +f.seats.value, fuel: f.fuel.value, price: +f.price.value,
      rating: 4.3, trans: f.trans.value.trim() || 'Manual', mileage: f.mileage.value.trim() || '—', photo: photoFor(name, type), maint: null,
    }], 'Car added to the fleet.');
    f.reset();
  }
  function setPrice(c, v) {
    if (v >= 100) patch(c.id, { price: v }, 'Price updated.');
    else toast('Price must be at least ₹100.');
  }
  function removeCar(c) {
    if (books.some(x => x.carId === c.id && x.status === 'confirmed')) return toast('Cannot remove a car with active bookings.');
    if (confirm('Remove this car from the fleet?')) commitCars(cars.filter(x => x.id !== c.id), 'Car removed.');
  }
  function cancelBooking(b) {
    if (!confirm('Cancel booking ' + b.id + '?')) return;
    commitBooks(books.map(x => x.id === b.id ? { ...x, status: 'cancelled' } : x)); toast('Booking cancelled.');
  }
  function setMaint(c, from, to) {
    if (!from || !to || to < from) return toast('Please pick a valid maintenance date range.');
    if (books.some(x => x.carId === c.id && x.status === 'confirmed' && overlap(from, to, x.start, x.end))) return toast('This car has confirmed bookings in that range.');
    patch(c.id, { maint: { from, to } }, 'Maintenance scheduled.');
  }

  return (
    <>
      <h2 style={{ marginBottom: 18 }}>Admin dashboard</h2>
      <div className="stats">
        <div className="stat"><b>{cars.length}</b><span>Cars in fleet</span></div>
        <div className="stat"><b>{active.length}</b><span>Active bookings</span></div>
        <div className="stat"><b>{inr(revenue)}</b><span>Total revenue</span></div>
        <div className="stat"><b>{maintCount}</b><span>Under maintenance</span></div>
      </div>

      <div className="panel">
        <h3>Add a new car</h3>
        <form className="form-row" onSubmit={addCar}>
          <input name="name" placeholder="Car name (e.g. Tata Punch)" required />
          <input name="type" placeholder="Type (SUV / Sedan / Hatchback / MUV)" required />
          <input name="year" type="number" min="2015" max="2030" placeholder="Year" required />
          <input name="seats" type="number" min="2" max="12" placeholder="Seats" required />
          <select name="fuel"><option>Petrol</option><option>Diesel</option><option>Electric</option><option>CNG</option></select>
          <input name="price" type="number" min="100" placeholder="Price / day (₹)" required />
          <input name="trans" placeholder="Transmission (Manual / Automatic)" />
          <input name="mileage" placeholder="Mileage (e.g. 18 kmpl)" />
          <button className="btn" style={{ margin: 0 }}>Add car</button>
        </form>
      </div>

      <h3 style={{ marginBottom: 14 }}>Inventory &amp; maintenance</h3>
      <div className="wrap"><table>
        <thead><tr><th>Car</th><th>Price / day</th><th>Maintenance</th><th>Schedule</th><th></th></tr></thead>
        <tbody>{cars.map(c => <CarRow key={c.id + ':' + c.price} c={c} t={t} onPrice={setPrice} onMaint={setMaint}
          onClear={() => patch(c.id, { maint: null }, 'Maintenance cleared.')} onRemove={() => removeCar(c)} />)}</tbody>
      </table></div>

      <h3 style={{ margin: '26px 0 14px' }}>All bookings ({books.length})</h3>
      {books.length === 0 ? <p className="meta">No bookings yet.</p> : (
        <div className="wrap"><table>
          <thead><tr><th>ID</th><th>Customer</th><th>Car</th><th>Dates</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
          <tbody>{[...books].reverse().map(b => (
            <tr key={b.id}>
              <td><b>{b.id}</b><br /><span className="meta">{b.txn}</span></td>
              <td>{b.userName}<br /><span className="meta">{b.userEmail}</span></td>
              <td>{b.carName}</td>
              <td>{b.start} → {b.end}<br /><span className="meta">{b.days} day(s)</span></td>
              <td><b>{inr(b.total)}</b></td>
              <td className="meta">{b.payment}</td>
              <td><span className={'tag ' + (b.status === 'confirmed' ? '' : 'bad')}>{b.status}</span></td>
              <td>{b.status === 'confirmed' && <button className="btn red sm" onClick={() => cancelBooking(b)}>Cancel</button>}</td>
            </tr>))}
          </tbody>
        </table></div>
      )}

      <h3 style={{ margin: '26px 0 14px' }}>Registered users ({users.length})</h3>
      <div className="wrap"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>{users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td><span className={'tag ' + (u.role === 'admin' ? 'warn' : '')}>{u.role}</span></td></tr>)}</tbody>
      </table></div>
    </>
  );
}

function CarRow({ c, t, onPrice, onMaint, onClear, onRemove }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  return (
    <tr>
      <td style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 70, aspectRatio: '16/10', borderRadius: 8, overflow: 'hidden', flex: '0 0 auto' }}><Img src={c.photo} alt={c.name} /></div>
        <div><b>{c.name}</b>{c.isNew && <> <span className="tag warn" style={{ fontSize: '.65rem' }}>NEW</span></>}<br /><span className="meta">{c.year} · {c.type} · {c.seats} seats</span></div>
      </td>
      <td><input type="number" defaultValue={c.price} style={{ width: 110 }} onBlur={e => +e.target.value !== c.price && onPrice(c, +e.target.value)} /></td>
      <td>{c.maint ? <span className="tag bad">{c.maint.from} → {c.maint.to}</span> : <span className="tag">None</span>}</td>
      <td><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="date" min={t} value={from} onChange={e => setFrom(e.target.value)} style={{ width: 150 }} />
        <input type="date" min={t} value={to} onChange={e => setTo(e.target.value)} style={{ width: 150 }} />
        <button className="btn alt sm" onClick={() => onMaint(c, from, to)}>Set</button>
        {c.maint && <button className="btn ghost sm" onClick={onClear}>Clear</button>}
      </div></td>
      <td><button className="btn red sm" onClick={onRemove}>Remove</button></td>
    </tr>
  );
}
