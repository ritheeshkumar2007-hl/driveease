export const PHOTO_LIB = {
  // ---- SUVs ----
  suvRed:      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
  suvDark:     'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop',
  suvWhite:    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop',
  suvSilver:   'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80&auto=format&fit=crop',
  suvBlue:     'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80&auto=format&fit=crop',
  suvBlack:    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80&auto=format&fit=crop',
  suvOffroad:  'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&q=80&auto=format&fit=crop',
  suvCompact:  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80&auto=format&fit=crop',

  // ---- Sedans ----
  sedanRed:    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80&auto=format&fit=crop',
  sedanBlue:   'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=80&auto=format&fit=crop',
  sedanBlack:  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80&auto=format&fit=crop',
  sedanWhite:  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&auto=format&fit=crop',
  sedanSilver: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80&auto=format&fit=crop',
  sedanGrey:   'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop',

  // ---- Hatchbacks ----
  hatchRed:    'https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=800&q=80&auto=format&fit=crop',
  hatchBlue:   'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=800&q=80&auto=format&fit=crop',
  hatchWhite:  'https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&q=80&auto=format&fit=crop',
  hatchSilver: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80&auto=format&fit=crop',

  // ---- EVs ----
  evWhite:     'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80&auto=format&fit=crop',
  evBlue:      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80&auto=format&fit=crop',

  // ---- MUVs ----
  muvWhite:    'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&q=80&auto=format&fit=crop',
  muvSilver:   'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop',

  // ---- Generic fallback ----
  generic:     'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop'
};

/* Assign the best-fit photo to each car in the fleet */
export const PHOTO_BY_NAME = {
  // Latest 2024-25
  'Tata Curvv':              PHOTO_LIB.suvBlue,
  'Mahindra Thar Roxx':      PHOTO_LIB.suvOffroad,
  'Tata Nexon 2024':         PHOTO_LIB.suvRed,
  'Hyundai Creta 2024':      PHOTO_LIB.suvWhite,
  'Maruti Swift 2024':       PHOTO_LIB.hatchRed,
  'Maruti Fronx':            PHOTO_LIB.suvCompact,
  'Mahindra XUV 3XO':        PHOTO_LIB.suvDark,
  'Hyundai Exter':           PHOTO_LIB.suvSilver,
  'Tata Punch':              PHOTO_LIB.suvCompact,
  'Honda Elevate':           PHOTO_LIB.suvWhite,
  // Previous
  'Hyundai Creta 2022':      PHOTO_LIB.suvBlack,
  'Kia Seltos':              PHOTO_LIB.suvDark,
  'Kia Sonet':               PHOTO_LIB.suvSilver,
  'Honda City':              PHOTO_LIB.sedanBlue,
  'Hyundai Verna':           PHOTO_LIB.sedanRed,
  'Skoda Slavia':            PHOTO_LIB.sedanBlack,
  'Tata Altroz':             PHOTO_LIB.hatchSilver,
  'Maruti Baleno':           PHOTO_LIB.hatchBlue,
  'Tata Harrier':            PHOTO_LIB.suvBlack,
  'Mahindra XUV700':         PHOTO_LIB.suvDark,
  'Mahindra Thar':           PHOTO_LIB.suvOffroad,
  'Toyota Innova Crysta':    PHOTO_LIB.muvWhite,
  'Maruti Ertiga':           PHOTO_LIB.muvSilver,
  'Tata Nexon EV':           PHOTO_LIB.evWhite,
  'Toyota Fortuner':         PHOTO_LIB.suvWhite
};

export function photoFor(name, type) {
  if (PHOTO_BY_NAME[name]) return PHOTO_BY_NAME[name];
  const t = String(type || '');
  if (/Electric/i.test(t)) return PHOTO_LIB.evWhite;
  if (/MUV/i.test(t))      return PHOTO_LIB.muvWhite;
  if (/SUV/i.test(t))      return PHOTO_LIB.suvWhite;
  if (/Sedan/i.test(t))    return PHOTO_LIB.sedanBlue;
  if (/Hatch/i.test(t))    return PHOTO_LIB.hatchRed;
  return PHOTO_LIB.generic;
}

export const FLEET = [
  // Latest 2024-25
  { name:'Tata Curvv',           type:'SUV',       seats:5, fuel:'Petrol',   price:3500, year:2024, rating:4.6, trans:'Automatic', mileage:'17 kmpl' },
  { name:'Mahindra Thar Roxx',   type:'SUV',       seats:5, fuel:'Diesel',   price:4200, year:2024, rating:4.7, trans:'Automatic', mileage:'15 kmpl' },
  { name:'Tata Nexon 2024',      type:'SUV',       seats:5, fuel:'Petrol',   price:3200, year:2024, rating:4.6, trans:'Automatic', mileage:'17 kmpl' },
  { name:'Hyundai Creta 2024',   type:'SUV',       seats:5, fuel:'Petrol',   price:3300, year:2024, rating:4.7, trans:'Automatic', mileage:'17 kmpl' },
  { name:'Maruti Swift 2024',    type:'Hatchback', seats:5, fuel:'Petrol',   price:1800, year:2024, rating:4.5, trans:'Manual',    mileage:'24 kmpl' },
  { name:'Maruti Fronx',         type:'SUV',       seats:5, fuel:'Petrol',   price:2400, year:2024, rating:4.5, trans:'Automatic', mileage:'20 kmpl' },
  { name:'Mahindra XUV 3XO',     type:'SUV',       seats:5, fuel:'Petrol',   price:2900, year:2024, rating:4.6, trans:'Automatic', mileage:'18 kmpl' },
  { name:'Hyundai Exter',        type:'SUV',       seats:5, fuel:'Petrol',   price:2200, year:2024, rating:4.4, trans:'Manual',    mileage:'19 kmpl' },
  { name:'Tata Punch',           type:'SUV',       seats:5, fuel:'Petrol',   price:2100, year:2023, rating:4.4, trans:'Automatic', mileage:'18 kmpl' },
  { name:'Honda Elevate',        type:'SUV',       seats:5, fuel:'Petrol',   price:3100, year:2023, rating:4.5, trans:'Automatic', mileage:'16 kmpl' },
  // Previous 2020-23
  { name:'Hyundai Creta 2022',   type:'SUV',       seats:5, fuel:'Diesel',   price:2800, year:2022, rating:4.5, trans:'Automatic', mileage:'18 kmpl' },
  { name:'Kia Seltos',           type:'SUV',       seats:5, fuel:'Petrol',   price:2900, year:2022, rating:4.4, trans:'Automatic', mileage:'16 kmpl' },
  { name:'Kia Sonet',            type:'SUV',       seats:5, fuel:'Petrol',   price:2400, year:2022, rating:4.3, trans:'Automatic', mileage:'18 kmpl' },
  { name:'Honda City',           type:'Sedan',     seats:5, fuel:'Petrol',   price:2500, year:2021, rating:4.5, trans:'Automatic', mileage:'18 kmpl' },
  { name:'Hyundai Verna',        type:'Sedan',     seats:5, fuel:'Petrol',   price:2600, year:2021, rating:4.4, trans:'Automatic', mileage:'20 kmpl' },
  { name:'Skoda Slavia',         type:'Sedan',     seats:5, fuel:'Petrol',   price:2700, year:2022, rating:4.3, trans:'Automatic', mileage:'19 kmpl' },
  { name:'Tata Altroz',          type:'Hatchback', seats:5, fuel:'Diesel',   price:1900, year:2021, rating:4.2, trans:'Manual',    mileage:'23 kmpl' },
  { name:'Maruti Baleno',        type:'Hatchback', seats:5, fuel:'Petrol',   price:1800, year:2021, rating:4.3, trans:'Automatic', mileage:'19 kmpl' },
  { name:'Tata Harrier',         type:'SUV',       seats:5, fuel:'Diesel',   price:3600, year:2021, rating:4.6, trans:'Manual',    mileage:'16 kmpl' },
  { name:'Mahindra XUV700',      type:'SUV',       seats:7, fuel:'Diesel',   price:4500, year:2021, rating:4.7, trans:'Automatic', mileage:'16 kmpl' },
  { name:'Mahindra Thar',        type:'SUV',       seats:4, fuel:'Diesel',   price:4000, year:2020, rating:4.8, trans:'Manual',    mileage:'15 kmpl' },
  { name:'Toyota Innova Crysta', type:'MUV',       seats:7, fuel:'Diesel',   price:3800, year:2020, rating:4.7, trans:'Manual',    mileage:'14 kmpl' },
  { name:'Maruti Ertiga',        type:'MUV',       seats:7, fuel:'CNG',      price:2400, year:2021, rating:4.3, trans:'Manual',    mileage:'26 km/kg' },
  { name:'Tata Nexon EV',        type:'SUV',       seats:5, fuel:'Electric', price:3200, year:2022, rating:4.5, trans:'Automatic', mileage:'325 km range' },
  { name:'Toyota Fortuner',      type:'SUV',       seats:7, fuel:'Diesel',   price:5500, year:2021, rating:4.9, trans:'Automatic', mileage:'12 kmpl' }
];

export const ADDONS = { ins:['Full insurance cover',200], gps:['GPS navigation',100], seat:['Child seat',80], driver:['Additional driver',150] };
export const COUPONS = { WELCOME10:0.10, INDIA15:0.15 };
