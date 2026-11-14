# QueueFlow

A full-stack queue management platform. Managers create queues, issue sequential tokens, reorder, serve or cancel people, and track performance on an analytics dashboard.

## Features
- Manager registration/login (bcrypt + JWT), protected routes, session restore, expired-session handling
- Multiple queues per manager; each manager can only access their own
- Add person → atomic, never-reused, sequential token numbers per queue
- Move up/down, Serve next, Cancel (with confirmation); only waiting tokens can change; history is kept
- Dashboard: totals, average wait, weekly activity (area chart), waiting by queue (bar chart), recent served, current waiting
- Responsive Tailwind UI with a mobile slide-over menu, toasts, loading/empty/error states

## Stack
React + Vite, Tailwind CSS 3, React Router, Axios, Lucide, Recharts · Node, Express, MongoDB, Mongoose, JWT, bcryptjs

## Setup
Requires Node 18+ and MongoDB (local or Atlas).

```bash
# Backend
cd server
cp .env.example .env     # set MONGO_URI and a strong JWT_SECRET
npm install
npm run dev              # http://localhost:5000

# Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

### Environment variables
| File | Variable | Purpose |
|---|---|---|
| server/.env | PORT | API port (5000) |
| | MONGO_URI | MongoDB connection string |
| | JWT_SECRET | Token signing secret |
| | JWT_EXPIRES_IN | Token lifetime (7d) |
| | CLIENT_URL | Allowed CORS origin |
| client/.env | VITE_API_URL | API base URL (http://localhost:5000/api) |

## Design notes
- **Token numbers:** `Queue.nextTokenNumber` is incremented with an atomic `findOneAndUpdate($inc)`, and a unique index on `(queue, tokenNumber)` backs it up. Works on standalone MongoDB (no transactions required).
- **Ordering:** each token has a `position` sort key (initially its token number). Moving swaps keys with the adjacent waiting token. The API returns a computed `queuePosition` (1, 2, 3…).
- **Serving:** one atomic `findOneAndUpdate` on the lowest-position waiting token, so two simultaneous requests cannot serve the same person.
- **Authorization:** every queue/token route resolves the queue with `{ _id, manager: req.user._id }`; other managers get 404.

## API
All responses: `{ success, data | message }`. Everything except register/login needs `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | `{name,email,password}` |
| POST | /api/auth/login | `{email,password}` |
| GET | /api/auth/me | Current manager |
| POST/GET | /api/queues | Create / list (with waitingCount) |
| GET/PUT/DELETE | /api/queues/:id | Read / rename / delete |
| POST | /api/queues/:id/tokens | `{personName}` |
| GET | /api/queues/:id/tokens | `{waiting, history}` |
| PATCH | /api/queues/:id/tokens/:tokenId/move | `{direction:"up"\|"down"}` |
| PATCH | /api/queues/:id/serve | Serve first waiting token |
| PATCH | /api/queues/:id/tokens/:tokenId/cancel | Cancel waiting token |
| GET | /api/analytics/overview | Totals, avg wait, recent lists |
| GET | /api/analytics/queues | Per-queue stats |
| GET | /api/analytics/trends?days=7 | Daily arrivals/served/cancelled |

## Deployment
- **API:** Render/Railway/Fly — root `server`, start `npm start`, set the server env vars (MongoDB Atlas URI, `CLIENT_URL` = your frontend URL).
- **Client:** Vercel/Netlify — root `client`, build `npm run build`, output `dist`, set `VITE_API_URL` to your API URL. Add an SPA rewrite of all paths to `/index.html`.

## GitHub
```bash
git init && git add . && git commit -m "Initial commit: QueueFlow"
git branch -M main
git remote add origin https://github.com/<you>/queueflow.git
git push -u origin main
```

## Screenshots
Add images to `docs/` and link them here (login, overview, queue management, analytics, mobile).
