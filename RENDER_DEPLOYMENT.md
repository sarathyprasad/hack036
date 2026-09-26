# 🚀 Render Deployment Guide

This project is fully configured and ready for 1-click or step-by-step deployment on [Render](https://render.com).

---

## ⚡ Option 1: 1-Click Blueprint Deployment (Recommended)

Render Blueprints use the included [`render.yaml`](./render.yaml) file to automatically provision and configure all services and the database with a single click.

### Steps:
1. Push your code to your GitHub / GitLab repository:
   ```bash
   git add .
   git commit -m "Configure project for Render deployment"
   git push origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click the **"New +"** button at the top right and select **"Blueprint"**.
4. Connect your repository (`hack036`).
5. Render will automatically detect [`render.yaml`](./render.yaml) and display:
   - **`legal-metrology-backend`** (FastAPI Web Service)
   - **`legal-metrology-frontend`** (Next.js Web Service)
   - **`legal-metrology-db`** (Managed PostgreSQL Database)
6. Click **"Apply"**.
7. Render will build and deploy the entire platform automatically!

---

## 🛠 Option 2: Manual Dashboard Deployment

If you prefer to configure each service manually in the Render dashboard:

### 1. Database (PostgreSQL)
1. In Render, click **New +** > **PostgreSQL**.
2. **Name**: `legal-metrology-db`
3. **Database**: `legal_metrology`
4. **User**: `lm_user`
5. **Plan**: Free (or Starter)
6. Click **Create Database**.
7. Once created, copy the **Internal Database URL** (e.g. `postgres://lm_user:...@dpg-...:5432/legal_metrology`).

---

### 2. Backend (FastAPI Web Service)
1. In Render, click **New +** > **Web Service**.
2. Connect your repository.
3. Configure the service settings:
   - **Name**: `legal-metrology-backend`
   - **Region**: Oregon (or your chosen region, same as DB)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
4. Add **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `DATABASE_URL` | *Paste your Internal Database URL* | Render automatically connects to PostgreSQL |
   | `CORS_ORIGINS` | `*` or your frontend URL | Allows frontend communication |
   | `SECRET_KEY` | *(Click "Generate" or enter random string)* | Used for JWT authentication |
   | `ALGORITHM` | `HS256` | JWT algorithm |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `120` | Token validity |
   | `PYTHON_VERSION` | `3.11.10` | Python runtime version |
5. Click **Create Web Service**.
6. Once deployed, note down your backend URL (e.g., `https://legal-metrology-backend.onrender.com`).

---

### 3. Frontend (Next.js Web Service)
1. In Render, click **New +** > **Web Service**.
2. Connect your repository.
3. Configure the service settings:
   - **Name**: `legal-metrology-frontend`
   - **Region**: Same as backend
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free
4. Add **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | `https://legal-metrology-backend.onrender.com` | Your backend URL from step 2 |
   | `NODE_VERSION` | `20.18.0` | Node.js version |
5. Click **Create Web Service**.
6. Open your live frontend URL once deployment completes!

---

## 🔑 Pre-Configured Demo Accounts

The database seeds automatically on startup with the following test credentials:

| Role | Email | Password |
|---|---|---|
| **Trader** | `apex.logistics@trader.com` | `Trader@12345` |
| **State LMO** | `lmo.delhi@legalmetrology.gov.in` | `Lmo@12345` |
| **GATC Center** | `gatc.north@gatc.gov.in` | `Gatc@12345` |
| **Admin** | `admin@legalmetrology.gov.in` | `Admin@123` |

---

## 💡 Troubleshooting & Notes

- **Spin-down on Inactivity (Free Tier)**: Free Render web services spin down after 15 minutes of inactivity. The first request may take 30–50 seconds to wake up.
- **Dynamic Origin QR Code**: Digital certificates and QR codes automatically use the deployed site URL so QR code scans from smartphones work seamlessly.
- **Database Fallback**: If `DATABASE_URL` is omitted, the backend automatically defaults to local SQLite for instant testing without provisioning a database.
