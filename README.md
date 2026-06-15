<div align="center">
  <br />
  <h3>SARVWAN FOOD RELIEF</h3>
  <p>An enterprise-grade logistics and coordination platform designed to eliminate food waste through precise, real-time NGO matchmaking.</p>
</div>

<br />

## OVERVIEW

Sarvwan is a full-stack distributed system built to seamlessly bridge the gap between food donors and verified non-governmental organizations (NGOs). By leveraging geospatial indexing and role-based authentication, the platform ensures rapid, secure, and transparent reallocation of surplus resources to communities in need.

<br />

## ARCHITECTURE & STACK

The platform is engineered on a modern, high-performance stack prioritizing scalability, security, and exceptional user experience.

### Client
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS v4, Radix UI Primitives
- **State Management:** Zustand
- **Typography:** Plus Jakarta Sans

### Server
- **Runtime:** Node.js, Express.js
- **Database:** MongoDB (Mongoose) with 2dsphere indexes
- **Security:** JWT, bcrypt, Helmet.js, express-rate-limit
- **Communications:** Nodemailer

<br />

## CORE CAPABILITIES

- **Geospatial Intelligence:** Proprietary algorithms match donors with NGOs within an exact 15km radius using MongoDB spatial queries.
- **Role-Based Access Control:** Distinct, isolated environments for Donors, NGOs, and System Administrators.
- **End-to-End Transparency:** Mandatory cryptographic proof-of-delivery uploads to maintain a verifiable audit trail.
- **Asynchronous Communications:** Automated email alerting systems for immediate dispatch notifications.

<br />

## SYSTEM DEPLOYMENT

### Prerequisites
Node.js (v18.0.0 or higher) and MongoDB (v6.0 or higher) are required for local instantiation.

### 1. Backend Initialization
```bash
git clone https://github.com/Sarvwan/food-redistrubtion.git
cd food-redistrubtion

npm install
npm run dev
```

### 2. Frontend Initialization
```bash
cd client

npm install
npm run dev
```

<br />

## ENVIRONMENT CONFIGURATION

A `.env` file must be provisioned in the root directory prior to server initialization:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/food-relief
JWT_SECRET=your_cryptographic_secret

# SMTP Configuration
EMAIL_USER=system@yourdomain.com
EMAIL_PASS=your_smtp_password

# Client Routing
CLIENT_URL=http://localhost:5173
```

<br />

## API SPECIFICATION

The system exposes a secure RESTful API. Below is the endpoint architecture:

### Authentication & Identity
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Provision new Donor or NGO identity |
| `POST` | `/api/auth/login` | Authenticate and issue session token |
| `GET` | `/api/auth/me` | Retrieve verified identity payload |

### Donor Operations
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/donor/post` | Initialize a resource donation |
| `GET` | `/api/donor/my-donations` | Query active and historical donations |
| `GET` | `/api/donor/donation/:id` | Fetch specific asset tracking data |
| `PATCH` | `/api/donor/donation/:id/cancel`| Terminate an active donation cycle |

### NGO Operations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ngo/available-donations` | Query proximate open resources |
| `POST` | `/api/ngo/claim/:donationId` | Lock and claim a target resource |
| `PATCH` | `/api/ngo/collect/:donationId` | Update chain-of-custody status |
| `POST` | `/api/ngo/proof/:donationId` | Upload delivery verification artifacts |

### Administrative Controls
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/pending-ngos` | Queue of unverified organizations |
| `PATCH` | `/api/admin/approve-ngo/:id` | Authorize organization access |
| `GET` | `/api/admin/stats` | System-wide telemetry and analytics |

<br />

<div align="center">
  <p>Sarvwan Engineering</p>
</div>
