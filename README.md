# Maintenance Wizard — Industrial Dashboard

A full-stack predictive maintenance dashboard for industrial facilities, built with React (Vite), TailwindCSS, Express, MongoDB, and Gemini AI.

## Features
- **Fleet Overview**: High-level KPIs and real-time donut charts of equipment health
- **Equipment Explorer**: Interactive table with multi-select filters and pagination
- **Equipment Detail**: Deep-dive into specific assets with time-series charts and AI anomaly detection
- **AI Assistant**: Specialized industrial AI powered by Gemini 1.5 Flash
- **Data Quality Dashboard**: Heatmaps and data ingestion logs
- **Secure Authentication**: JWT-based login and registration

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

**Edit your `.env` file:**
- Set `MONGO_URI` to your MongoDB instance (e.g., `mongodb://localhost:27017/maintenance-wizard`)
- Set `GEMINI_API_KEY` to your Gemini API key from Google AI Studio.
- Change `JWT_SECRET` to a secure random string.

**Start the backend:**
```bash
npm run dev
```
*(Runs on port 5000 by default)*

### 3. Frontend Setup
```bash
cd frontend
npm install
```
**Start the frontend:**
```bash
npm run dev
```
*(Runs on port 5173 by default)*

---

## 🌍 Deployment Guide

To deploy this application to production, you will need to host the backend (Node/Express), frontend (React/Vite), and database (MongoDB).

### 1. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Network Access** and whitelist your IP or allow access from anywhere (`0.0.0.0/0`).
3. Get the connection string from the **Connect** button (choose "Connect your application").
4. Replace `<username>` and `<password>` with your database user credentials.

### 2. Backend (Render / Heroku)
We recommend using [Render](https://render.com/) for easy Node.js hosting.
1. Connect your GitHub repository to Render and create a new **Web Service**.
2. **Build Command:** `npm install` (Make sure the Root Directory is set to `backend`).
3. **Start Command:** `node server.js`
4. Add the following **Environment Variables**:
   - `MONGO_URI` (Your Atlas connection string)
   - `GEMINI_API_KEY` (Your Google API key)
   - `JWT_SECRET` (A secure random string)
   - `FRONTEND_ORIGIN` (The URL where your frontend will be deployed, e.g., `https://my-app.vercel.app`)

### 3. Frontend (Vercel / Netlify)
We recommend [Vercel](https://vercel.com/) for fast React/Vite deployment.
1. Import your GitHub repository to Vercel.
2. Set the **Framework Preset** to `Vite`.
3. Set the **Root Directory** to `frontend`.
4. **Environment Variables**:
   - No sensitive variables are strictly required on the frontend, but if your API URL is dynamic, you might need to configure the proxy or set an API base URL (currently it defaults to `/api` via Vite's proxy, but in production you should configure your API requests to point to the Render backend URL).

*(Note: To make the frontend talk to the production backend on Vercel, you should update `api.js` to use your deployed backend URL instead of relying solely on Vite's local proxy, or set up a rewrite rule in a `vercel.json` file).*

**Example `vercel.json` (place in `/frontend`):**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
