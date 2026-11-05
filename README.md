# DriveEase – Car Rental India (React + Vite)

## Modules
| Module | Routes | What it does |
|---|---|---|
| **Auth** | `/login` | Login + Signup (User / Admin tabs), passwords SHA-256 hashed in Local Storage |
| **User** | `/cars`, `/bookings` | Browse/filter/compare cars, book with add-ons + coupons + payment, receipt, view/cancel own bookings |
| **Admin** | `/admin` | Fleet stats, add/remove cars, edit prices, schedule maintenance, view/cancel all bookings, list users |

Demo logins: `admin@driveease.com / admin123` · `user@driveease.com / user123`. New signups are always `user` role.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
```

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. vercel.com → **Add New → Project** → import the repo.
3. Framework preset: **Vite** (auto-detected). Build: `npm run build`, Output: `dist`.
4. Deploy. `vercel.json` rewrites all paths to `index.html`, so refreshing `/admin` or `/cars` works.

Or with the CLI: `npm i -g vercel && vercel --prod`.

## Local Storage keys
`driveease_users_v3`, `driveease_cars_v3`, `driveease_bookings_v3`, `driveease_session_v3`
(clear them in DevTools → Application to reset the demo data).
