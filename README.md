# Splitify

A full-stack expense-splitting app (like Splitwise) with UPI payment integration for seamless debt settlement in India.

Live: [https://splitify-pi.vercel.app](https://splitify-pi.vercel.app)

---

## Features

- **Authentication** — Email/password signup with email verification, Google OAuth
- **Groups** — Create groups, invite members by email or share link
- **Expenses** — Add expenses with custom splits (equal or by amount), track who paid
- **Balances** — Automatic balance calculation across all group members
- **UPI Payments** — Settle debts directly via UPI deep links (GPay, PhonePe, BHIM, Paytm)
- **Requests** — Send and receive join requests for groups
- **Transactional Email** — Verification emails and invite notifications via Resend

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, React Router v7 |
| Backend | Express 5, Mongoose, MongoDB Atlas |
| Auth | JWT (HTTP-only cookies) + Google OAuth 2.0 |
| Email | Resend |
| Payments | UPI deep-link integration |
| Deployment | Vercel (frontend), Railway / any Node host (backend) |

---

## Project Structure

```
splitify/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── .env.example
│   └── package.json
└── backend/           # Express API server
    ├── models/        # Mongoose models (User, Group, Expense, Request)
    ├── routes/        # API routes (auth, groups, expenses)
    ├── middleware/
    ├── .env.example
    ├── server.js
    └── package.json
```

---

## Local Development

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A [Resend](https://resend.com) account (free tier works)
- A [Google Cloud Console](https://console.cloud.google.com) project with OAuth 2.0 credentials

### 1. Clone the repo

```bash
git clone https://github.com/your-username/splitify.git
cd splitify
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and fill in your values (see [Environment Variables](#environment-variables)).

```bash
node server.js
# Server starts on http://localhost:5666
```

### 3. Set up the frontend

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:5666/api
VITE_APP_URL=http://localhost:5173
```

```bash
npm run dev
# App starts on http://localhost:5173
```

---

## Environment Variables

### Backend — `backend/.env`

See [`backend/.env.example`](./backend/.env.example) for the full template.

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs (use a long random string) |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) |
| `EMAIL_FROM` | Verified sender email for Resend (e.g. `noreply@yourdomain.com`) |
| `FRONTEND_URL` | Full URL of the deployed frontend |
| `BACKEND_URL` | Full URL of the deployed backend |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID from Google Cloud Console |
| `PORT` | Server port (defaults to `5666`) |

### Frontend — `frontend/.env`

See [`frontend/.env.example`](./frontend/.env.example) for the full template.

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Full URL of the backend API (include `/api` at the end) |
| `VITE_APP_URL` | Full URL of this frontend app (used for share links) |

---

## Deployment

### Frontend (Vercel)

1. Import the repo in [Vercel](https://vercel.com).
2. Set the root directory to `frontend`.
3. Add the environment variables from `frontend/.env.example`.
4. Deploy. Vercel auto-deploys on every push to `main`.

### Backend (Railway / Render / Fly.io)

1. Create a new project pointing to the `backend` directory.
2. Set all environment variables from `backend/.env.example`.
3. The start command is `node server.js`.
4. Note the deployed URL and set it as `BACKEND_URL` in the backend env, and as `VITE_API_BASE_URL` (with `/api` appended) in the frontend env.

### Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID (Web application).
3. Add your frontend URL to **Authorized JavaScript origins**.
4. Copy the Client ID to `GOOGLE_CLIENT_ID`.

---

## How UPI Payments Work

When a user wants to settle a debt, Splitify constructs a standard UPI deep link:

```
upi://pay?pa=<upi-id>&pn=<name>&am=<amount>&cu=INR&tn=<note>&tr=<ref>
```

Tapping the link opens the user's installed UPI app (GPay, PhonePe, BHIM, Paytm, etc.) with the payment pre-filled. No API keys or bank integrations are required — settlement happens directly between users inside their UPI app.

---

## License

MIT
