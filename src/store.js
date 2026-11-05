// LocalStorage-backed data layer for DriveEase
const K = {
  users: 'driveease_users_v3',
  cars: 'driveease_cars_v3',
  bookings: 'driveease_bookings_v3',
  session: 'driveease_session_v3',
};

const read = (k, d) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch {
    return d;
  }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const uid = (p) => p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

export async function sha256(text) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // fallback for insecure contexts (not cryptographically strong)
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return 'fallback-' + (h >>> 0).toString(16);
}

const SEED_CARS = [
  { name: 'Maruti Swift', brand: 'Maruti Suzuki', type: 'Hatchback', fuel: 'Petrol', seats: 5, transmission: 'Manual', price: 1500, city: 'Hyderabad', emoji: '🚗' },
  { name: 'Hyundai i20', brand: 'Hyundai', type: 'Hatchback', fuel: 'Petrol', seats: 5, transmission: 'Automatic', price: 1800, city: 'Bengaluru', emoji: '🚙' },
  { name: 'Honda City', brand: 'Honda', type: 'Sedan', fuel: 'Petrol', seats: 5, transmission: 'Automatic', price: 2600, city: 'Mumbai', emoji: '🚘' },
  { name: 'Tata Nexon EV', brand: 'Tata', type: 'SUV', fuel: 'Electric', seats: 5, transmission: 'Automatic', price: 3200, city: 'Delhi', emoji: '⚡' },
  { name: 'Mahindra Thar', brand: 'Mahindra', type: 'SUV', fuel: 'Diesel', seats: 4, transmission: 'Manual', price: 3800, city: 'Chennai', emoji: '🛻' },
  { name: 'Toyota Innova Crysta', brand: 'Toyota', type: 'MUV', fuel: 'Diesel', seats: 7, transmission: 'Manual', price: 4200, city: 'Hyderabad', emoji: '🚐' },
  { name: 'Kia Seltos', brand: 'Kia', type: 'SUV', fuel: 'Petrol', seats: 5, transmission: 'Automatic', price: 3000, city: 'Pune', emoji: '🚙' },
  { name: 'Maruti Ertiga', brand: 'Maruti Suzuki', type: 'MUV', fuel: 'CNG', seats: 7, transmission: 'Manual', price: 2400, city: 'Visakhapatnam', emoji: '🚐' },
];

export async function seed() {
  if (!read(K.users, null)) {
    write(K.users, [
      { id: 'u_admin', name: 'Admin', email: 'admin@driveease.com', role: 'admin', passwordHash: await sha256('admin123'), createdAt: new Date().toISOString() },
      { id: 'u_demo', name: 'Demo User', email: 'user@driveease.com', role: 'user', passwordHash: await sha256('user123'), createdAt: new Date().toISOString() },
    ]);
  }
  if (!read(K.cars, null)) {
    write(K.cars, SEED_CARS.map((c, i) => ({ ...c, id: 'c' + (i + 1), maintenance: null })));
  }
  if (!read(K.bookings, null)) write(K.bookings, []);
}

/* ---------- Auth ---------- */
export const getSession = () => read(K.session, null);
export const logout = () => localStorage.removeItem(K.session);

export async function signup({ name, email, password }) {
  name = name.trim();
  email = email.trim().toLowerCase();
  if (name.length < 2) throw new Error('Please enter your full name.');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  const users = read(K.users, []);
  if (users.some((u) => u.email === email)) throw new Error('An account with this email already exists.');
  const user = { id: uid('u_'), name, email, role: 'user', passwordHash: await sha256(password), createdAt: new Date().toISOString() };
  write(K.users, [...users, user]);
  return startSession(user);
}

export async function login({ email, password, role }) {
  email = email.trim().toLowerCase();
  const user = read(K.users, []).find((u) => u.email === email);
  if (!user || user.passwordHash !== (await sha256(password))) throw new Error('Invalid email or password.');
  if (user.role !== role) throw new Error(`This account is not a${role === 'admin' ? 'n admin' : ' user'} account. Switch the tab above.`);
  return startSession(user);
}

function startSession(u) {
  const s = { id: u.id, name: u.name, email: u.email, role: u.role };
  write(K.session, s);
  return s;
}

export const getUsers = () => read(K.users, []).map(({ passwordHash, ...u }) => u);

/* ---------- Cars ---------- */
export const getCars = () => read(K.cars, []);
export const saveCars = (c) => write(K.cars, c);
export function addCar(car) {
  const cars = getCars();
  saveCars([...cars, { ...car, id: uid('c_'), maintenance: null }]);
}
export const removeCar = (id) => saveCars(getCars().filter((c) => c.id !== id));
export const updateCar = (id, patch) => saveCars(getCars().map((c) => (c.id === id ? { ...c, ...patch } : c)));

/* ---------- Bookings ---------- */
export const getBookings = () => read(K.bookings, []);
export const saveBookings = (b) => write(K.bookings, b);

export const ADDONS = [
  { id: 'gps', label: 'GPS Navigation', price: 150 },
  { id: 'child', label: 'Child Seat', price: 100 },
  { id: 'insurance', label: 'Full Insurance', price: 250 },
  { id: 'driver', label: 'Chauffeur', price: 800 },
];
export const COUPONS = {
  WELCOME10: { type: 'pct', value: 10, label: '10% off' },
  DRIVE20: { type: 'pct', value: 20, label: '20% off (min 3 days)', minDays: 3 },
  FLAT500: { type: 'flat', value: 500, label: '₹500 off (min 2 days)', minDays: 2 },
};
export const GST = 0.12;

export const dayCount = (s, e) => Math.round((new Date(e) - new Date(s)) / 86400000);

export function isAvailable(car, start, end, ignoreBookingId) {
  if (car.maintenance && start <= car.maintenance.to && end > car.maintenance.from) return false;
  return !getBookings().some(
    (b) => b.carId === car.id && b.status === 'confirmed' && b.id !== ignoreBookingId && start < b.end && b.start < end
  );
}

export function quote({ car, start, end, addons, coupon }) {
  const days = dayCount(start, end);
  if (!(days > 0)) return null;
  const base = car.price * days;
  const addonCost = addons.reduce((s, id) => s + (ADDONS.find((a) => a.id === id)?.price || 0) * days, 0);
  const subtotal = base + addonCost;
  let discount = 0;
  let couponError = '';
  if (coupon) {
    const c = COUPONS[coupon.toUpperCase()];
    if (!c) couponError = 'Invalid coupon code.';
    else if (c.minDays && days < c.minDays) couponError = `Coupon needs at least ${c.minDays} days.`;
    else discount = c.type === 'pct' ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
  }
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * GST);
  return { days, base, addonCost, subtotal, discount, couponError, tax, total: taxable + tax };
}

export function createBooking({ user, car, start, end, addons, coupon, payment }) {
  if (!isAvailable(car, start, end)) throw new Error('Car is not available for these dates.');
  const q = quote({ car, start, end, addons, coupon });
  if (!q || q.couponError) throw new Error(q?.couponError || 'Invalid dates.');
  const booking = {
    id: 'BK' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    userId: user.id, userName: user.name, userEmail: user.email,
    carId: car.id, carName: car.name, carEmoji: car.emoji,
    start, end, addons, coupon: q.discount ? coupon.toUpperCase() : '',
    payment, ...q, status: 'confirmed', createdAt: new Date().toISOString(),
  };
  saveBookings([booking, ...getBookings()]);
  return booking;
}

export const cancelBooking = (id) =>
  saveBookings(getBookings().map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));

export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
