import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { cancelBooking, getBookings, inr } from '../store.js';
import { Receipt } from './Cars.jsx';

export default function Bookings() {
  const { user } = useAuth();
  const [all, setAll] = useState(getBookings);
  const [view, setView] = useState(null);
  const mine = all.filter((b) => b.userId === user.id);

  const cancel = (id) => {
    if (!confirm('Cancel this booking?')) return;
    cancelBooking(id);
    setAll(getBookings());
  };

  return (
    <div>
      <h1>My bookings</h1>
      {mine.length === 0 && <p className="muted">You have no bookings yet. Head to Cars to book one.</p>}
      <div className="list">
        {mine.map((b) => (
          <div className="card row between wrap" key={b.id}>
            <div>
              <h3>{b.carEmoji} {b.carName} <span className={'badge ' + b.status}>{b.status}</span></h3>
              <p className="muted">{b.id} · {b.start} → {b.end} · {b.days} day(s)</p>
            </div>
            <div className="row gap">
              <b>{inr(b.total)}</b>
              <button className="btn ghost small" onClick={() => setView(b)}>Receipt</button>
              {b.status === 'confirmed' && b.start > new Date().toISOString().slice(0, 10) && (
                <button className="btn danger small" onClick={() => cancel(b.id)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {view && <Receipt b={view} onClose={() => setView(null)} />}
    </div>
  );
}
