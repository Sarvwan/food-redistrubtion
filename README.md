<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/heart-handshake.svg" width="80" alt="Logo">
  <h1>Sarvwan Food Relief Platform</h1>
  <p>A full-stack MERN application connecting food donors with verified NGOs to minimize food waste, track logistics, and support communities.</p>
  
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  </p>
</div>

<br />

## ✨ Features
- **🌍 Real-Time Geospatial Matching:** Donors are matched with NGOs within a 15km radius using MongoDB 2dsphere indexes.
- **🔐 Secure Authentication:** JWT-based secure sessions with role-based access control (Admin, NGO, Donor).
- **📱 Premium UI/UX:** Built with React, Tailwind CSS v4, and Shadcn UI for a stunning, responsive, and accessible user experience.
- **🛡️ NGO Verification System:** Admin dashboard to approve and manage registered NGOs.
- **📸 Delivery Proof Upload:** NGOs can upload delivery proof photos to maintain transparency and trust.

## 🛠️ Tech Stack

**Frontend**
- React 18 (Vite)
- Tailwind CSS v4
- Shadcn UI (Radix Primitives)
- React Router DOM
- Zustand (State Management)
- Sonner (Toast Notifications)

**Backend**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcryptjs
- Helmet.js & express-rate-limit (Security)
- Nodemailer (Email Alerts)

---

## 🚀 Setup & Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) and [MongoDB](https://www.mongodb.com/) installed on your machine.

### 2. Clone the Repository
```bash
git clone https://github.com/Sarvwan/food-redistrubtion.git
cd food-redistrubtion
```

### 3. Backend Setup
```bash
# Install backend dependencies
npm install

# Create a .env file based on the environment variables section
touch .env

# Start the development server (runs on http://localhost:5000)
npm run dev
```

### 4. Frontend Setup
Open a new terminal window.
```bash
# Navigate to the client directory
cd client

# Install frontend dependencies
npm install

# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 🔐 Environment Variables (`.env`)

Create a `.env` file in the root backend directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/food-relief
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Twilio SMS Config (Mocked)
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_PHONE=+1234567890

# Client Configuration
CLIENT_URL=http://localhost:5173
```

---

## 📡 API Reference

### Public
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and server uptime |
| `GET` | `/api/stats` | Public landing page statistics |
| `POST` | `/api/auth/register` | Register a new Donor or NGO |
| `POST` | `/api/auth/login` | Authenticate and return JWT |
| `GET` | `/api/auth/me` | Return current user profile |

### Donor
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/donor/post` | Create a new food donation |
| `GET` | `/api/donor/my-donations` | List donor's posted donations |
| `GET` | `/api/donor/donation/:id` | Get donation details (and proof) |
| `PATCH` | `/api/donor/donation/:id/cancel`| Cancel an open donation |

### NGO
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ngo/available-donations` | Get nearby (15km) open donations |
| `GET` | `/api/ngo/my-claims` | Get donations claimed by the NGO |
| `POST` | `/api/ngo/claim/:donationId` | Claim an open donation |
| `PATCH` | `/api/ngo/collect/:donationId` | Mark a claimed donation as collected |
| `POST` | `/api/ngo/proof/:donationId` | Upload delivery proof photos |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/pending-ngos` | List NGOs awaiting approval |
| `PATCH` | `/api/admin/approve-ngo/:id` | Approve an NGO account |
| `PATCH` | `/api/admin/reject-ngo/:id` | Reject an NGO account |
| `GET` | `/api/admin/all-donations` | View filtered donation history |
| `GET` | `/api/admin/stats` | Get comprehensive platform stats |

---
<div align="center">
  <i>Built with ❤️ to reduce food waste.</i>
</div>
