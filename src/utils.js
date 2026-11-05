import { ADDONS, COUPONS } from './data.js';
export const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
export const today = () => new Date().toISOString().slice(0, 10);
export const addDays = (d, n) => { const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
export const days = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 864e5) + 1);
export const overlap = (s, e, a, b) => s <= b && e >= a;

export function quote(car, s, e, adds, code) {
  const d = days(s, e), base = d * car.price, weekly = d >= 7 ? base * 0.1 : 0;
  const addon = adds.reduce((a, k) => a + (ADDONS[k] ? ADDONS[k][1] * d : 0), 0);
  const c = String(code).trim().toUpperCase(), rate = COUPONS[c] || 0;
  const coupon = (base - weekly) * rate, sub = base - weekly - coupon + addon, gst = sub * 0.18;
  return { d, base, weekly, addon, coupon, couponCode: rate ? c : '', gst, total: sub + gst };
}
