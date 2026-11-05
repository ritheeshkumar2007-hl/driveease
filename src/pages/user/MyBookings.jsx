import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Img } from '../../components/Ui.jsx';
import { getBooks, saveBooks } from '../../store.js';
import { inr, today } from '../../utils.js';

export default function MyBookings({ user, toast }) {
  const [books, setBooks] = useState(getBooks);
  const list = books.filter(b => b.userEmail === user.email).reverse();

  function cancel(b) {
    if (!confirm(`Cancel booking ${b.id} for ${b.carName}?`)) return;
    const next = books.map(x => x.id === b.id ? { ...x, status: 'cancelled' } : x);
    saveBooks(next); setBooks(next); toast('Booking ' + b.id + ' cancelled.');
  }

  return (
    <>
      <h2 style={{ marginBottom: 18 }}>My bookings</h2>
      {list.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '56px 20px' }}>
          <h3>No bookings yet</h3><p className="meta" style={{ justifyContent: 'center' }}>Browse our Indian fleet and book your first ride.</p>
          <Link to="/cars" className="btn" style={{ display: 'inline-block' }}>Browse cars</Link>
        </div>
      ) : (
        <>
          <div className="wrap"><table>
            <thead><tr><th>Car</th><th>Booking ID</th><th>Dates</th><th>Days</th><th>Total</th><th>Status</th><th></th></tr></thead>
            <tbody>{list.map(b => (
              <tr key={b.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 70, aspectRatio: '16/10', borderRadius: 8, overflow: 'hidden', flex: '0 0 auto' }}><Img src={b.carPhoto} alt={b.carName} /></div>
                  <div><b>{b.carName}</b><br /><span className="meta">{b.carType} {b.carYear ? `(${b.carYear})` : ''}</span></div>
                </td>
                <td><b>{b.id}</b><br /><span className="meta">{b.txn}</span></td>
                <td>{b.start}<br /><span className="meta">→ {b.end}</span></td>
                <td>{b.days}</td>
                <td><b>{inr(b.total)}</b></td>
                <td><span className={'tag ' + (b.status === 'confirmed' ? '' : 'bad')}>{b.status}</span></td>
                <td>{b.status === 'confirmed' && b.start > today() && <button className="btn red sm" onClick={() => cancel(b)}>Cancel</button>}</td>
              </tr>))}
            </tbody>
          </table></div>
          <p className="meta" style={{ marginTop: 14 }}>Free cancellation until the day before pick-up. Refunds go to the original payment method within 5–7 working days.</p>
        </>
      )}
    </>
  );
}
