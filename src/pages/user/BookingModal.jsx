import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Img, Modal } from '../../components/Ui.jsx';
import { ADDONS } from '../../data.js';
import { getBooks, saveBooks } from '../../store.js';
import { addDays, inr, overlap, quote, today } from '../../utils.js';

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Kotak Mahindra Bank'];

export default function BookingModal({ car, user, onClose }) {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [s, setS] = useState(today());
  const [e, setE] = useState(addDays(today(), 2));
  const [adds, setAdds] = useState([]);
  const [code, setCode] = useState('');
  const [pm, setPm] = useState('Card');
  const [pay, setPay] = useState({ cn: '', ex: '', cv: '', up: '', bank: BANKS[0] });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [soldOut, setSoldOut] = useState(false);
  const [rec, setRec] = useState(null);

  const unavailable = (a, b) =>
    (car.maint && overlap(a, b, car.maint.from, car.maint.to)) ||
    getBooks().some(x => x.carId === car.id && x.status === 'confirmed' && overlap(a, b, x.start, x.end));

  const problem = !s || !e ? 'Select your dates to see the total.'
    : e < s ? 'Return date must be on or after the pick-up date.'
    : s < today() ? 'Pick-up date cannot be in the past.'
    : unavailable(s, e) ? 'This car is unavailable on those dates (already booked or under maintenance).' : '';
  const q = problem ? null : quote(car, s, e, adds, code);

  const toggleAdd = k => setAdds(adds.includes(k) ? adds.filter(x => x !== k) : [...adds, k]);
  const upd = k => ev => setPay({ ...pay, [k]: ev.target.value });
  const fmtCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = v => v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d+)/, '$1/$2');

  function submitPay() {
    let ref = '';
    if (pm === 'Card') {
      const n = pay.cn.replace(/\s/g, ''), ex = pay.ex.match(/^(\d{2})\/(\d{2})$/);
      if (n.length !== 16) return setErr('Enter a valid 16-digit card number.');
      if (!ex || +ex[1] < 1 || +ex[1] > 12) return setErr('Enter a valid expiry date as MM/YY.');
      if (new Date(2000 + +ex[2], +ex[1], 0) < new Date()) return setErr('This card has expired.');
      if (pay.cv.length !== 3) return setErr('Enter the 3-digit CVV.');
      ref = 'Card •••• ' + n.slice(-4);
    } else if (pm === 'UPI') {
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(pay.up.trim())) return setErr('Enter a valid UPI ID (e.g. name@bank).');
      ref = 'UPI ' + pay.up.trim();
    } else ref = 'NetBanking • ' + pay.bank;
    setErr(''); setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (unavailable(s, e)) return setSoldOut(true);
      const r = {
        id: 'DE' + Date.now().toString().slice(-7), carId: car.id, carName: car.name, carType: car.type, carYear: car.year, carPhoto: car.photo,
        userEmail: user.email, userName: user.name, start: s, end: e, days: q.d, addons: adds, coupon: q.couponCode,
        base: q.base, weekly: q.weekly, couponAmt: q.coupon, addonAmt: q.addon, gst: q.gst, total: q.total, payment: ref,
        txn: 'TXN' + Math.random().toString(36).slice(2, 10).toUpperCase(), status: 'confirmed', paidOn: new Date().toLocaleString('en-IN'),
      };
      saveBooks([...getBooks(), r]); setRec(r); setStep(3);
    }, 1700);
  }

  const steps = <div className="steps">{['1 · Dates', '2 · Payment', '3 · Confirmed'].map((t, i) => <span key={t} className={step === i + 1 ? 'on' : ''}>{t}</span>)}</div>;

  if (step === 3 && rec) return (
    <Modal onClose={onClose} wide>
      <div className="ok">✔</div>
      <h2 style={{ textAlign: 'center' }}>Booking confirmed</h2>
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.88rem' }}>A confirmation has been sent to {rec.userEmail}</p>
      <div className="bk-head" style={{ marginTop: 16 }}>
        <div className="bk-pic"><Img src={rec.carPhoto} alt={rec.carName} /></div>
        <div><b style={{ color: 'var(--brand)', fontSize: '1.05rem' }}>{rec.carName}</b><div className="meta">{rec.carType} · {rec.days} day(s)</div></div>
      </div>
      <div className="sum">
        <div><span>Booking ID</span><b>{rec.id}</b></div>
        <div><span>Pick-up</span><span>{rec.start}</span></div>
        <div><span>Return</span><span>{rec.end}</span></div>
        <div><span>Customer</span><span>{rec.userName}</span></div>
        {rec.addons.length > 0 && <div><span>Add-ons</span><span>{rec.addons.map(a => ADDONS[a][0]).join(', ')}</span></div>}
        {rec.couponAmt > 0 && <div><span>Coupon ({rec.coupon})</span><span>− {inr(rec.couponAmt)}</span></div>}
        <div><span>GST @ 18%</span><span>{inr(rec.gst)}</span></div>
        <div><span>Paid via</span><span>{rec.payment}</span></div>
        <div><span>Transaction ID</span><span>{rec.txn}</span></div>
        <div><b>Total paid</b><b>{inr(rec.total)}</b></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 20 }}>
        <button className="btn ghost" onClick={() => window.print()}>🖨 Print receipt</button>
        <button className="btn" onClick={() => { onClose(); nav('/bookings'); }}>View my bookings</button>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose} wide>
      <div className="bk-head">
        <div className="bk-pic"><Img src={car.photo} alt={car.name} /></div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2>{car.name}</h2>
          <div className="meta" style={{ fontSize: '.85rem' }}>{car.year} · {car.type} · {car.seats} seats · {car.fuel} · {car.trans}</div>
          <div className="price" style={{ marginTop: 8 }}>{inr(car.price)} <small>/ day + 18% GST</small></div>
        </div>
      </div>
      {steps}

      {soldOut ? (
        <><p style={{ color: '#dc2626' }}><b>Sorry — this car was just booked for those dates.</b></p><button className="btn" onClick={onClose}>Choose another car</button></>
      ) : busy ? (
        <><div className="spin"></div><p style={{ textAlign: 'center' }}>Processing payment securely…</p></>
      ) : step === 1 ? (
        <>
          <div className="form-row">
            <div><label htmlFor="s">Pick-up date</label><input id="s" type="date" min={today()} value={s} onChange={x => setS(x.target.value)} /></div>
            <div><label htmlFor="e">Return date</label><input id="e" type="date" min={today()} value={e} onChange={x => setE(x.target.value)} /></div>
          </div>
          <label>Add-ons (per day)</label>
          {Object.entries(ADDONS).map(([k, v]) => <label className="chk" key={k}><input type="checkbox" checked={adds.includes(k)} onChange={() => toggleAdd(k)} /> {v[0]} (+{inr(v[1])}/day)</label>)}
          <label htmlFor="cp">Coupon code</label>
          <input id="cp" placeholder="Try WELCOME10 or INDIA15" autoComplete="off" value={code} onChange={x => setCode(x.target.value)} />
          <div className="sum">
            {problem ? <b style={{ color: problem.startsWith('This car') ? '#dc2626' : undefined }}>{problem}</b> : <>
              <div><span>{q.d} day(s) × {inr(car.price)}</span><span>{inr(q.base)}</span></div>
              {q.weekly > 0 && <div><span>Weekly discount (10%)</span><span>− {inr(q.weekly)}</span></div>}
              {q.coupon > 0 && <div><span>Coupon {q.couponCode}</span><span>− {inr(q.coupon)}</span></div>}
              {q.addon > 0 && <div><span>Add-ons</span><span>{inr(q.addon)}</span></div>}
              <div><span>GST @ 18%</span><span>{inr(q.gst)}</span></div>
              <div><b>Total payable</b><b>{inr(q.total)}</b></div></>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 18 }}>
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn" disabled={!q} onClick={() => setStep(2)}>Continue to payment →</button>
          </div>
        </>
      ) : (
        <>
          <div className="pay-info"><b>🔒 Secure demo checkout</b>No real money is charged. Card details are validated in your browser and never stored.</div>
          <p style={{ margin: '8px 0' }}>Amount payable: <b style={{ fontSize: '1.2rem', color: 'var(--brand)' }}>{inr(q.total)}</b> <span className="meta">({q.d} day{q.d > 1 ? 's' : ''}, GST included)</span></p>
          <label htmlFor="pm">Payment method</label>
          <select id="pm" value={pm} onChange={x => { setPm(x.target.value); setErr(''); }}>
            <option value="Card">Credit / Debit card</option><option value="UPI">UPI (GPay / PhonePe / Paytm)</option><option value="NetBanking">Net banking</option>
          </select>
          {pm === 'Card' && <>
            <label htmlFor="cn">Card number</label>
            <input id="cn" inputMode="numeric" placeholder="1234 5678 9012 3456" value={pay.cn} onChange={x => setPay({ ...pay, cn: fmtCard(x.target.value) })} />
            <div className="form-row">
              <div><label htmlFor="ex">Expiry (MM/YY)</label><input id="ex" placeholder="08/29" value={pay.ex} onChange={x => setPay({ ...pay, ex: fmtExp(x.target.value) })} /></div>
              <div><label htmlFor="cv">CVV</label><input id="cv" type="password" maxLength={3} placeholder="123" value={pay.cv} onChange={upd('cv')} /></div>
            </div></>}
          {pm === 'UPI' && <><label htmlFor="up">UPI ID</label><input id="up" placeholder="yourname@bank" value={pay.up} onChange={upd('up')} /></>}
          {pm === 'NetBanking' && <><label htmlFor="bk2">Select your bank</label><select id="bk2" value={pay.bank} onChange={upd('bank')}>{BANKS.map(b => <option key={b}>{b}</option>)}</select></>}
          <div className="err">{err}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 18 }}>
            <button className="btn ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn" onClick={submitPay}>Pay {inr(q.total)}</button>
          </div>
        </>
      )}
    </Modal>
  );
}
