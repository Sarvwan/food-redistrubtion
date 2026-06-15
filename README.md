<div align="center">
  <h1>SARVWAN</h1>
  <p><strong>Food Redistribution Logistics Platform</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-000000?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Node.js-000000?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-000000?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  </p>
</div>

<br />

## OVERVIEW

Sarvwan is a high-performance logistics and redistribution platform designed to bridge the gap between food surplus entities and verified Non-Governmental Organizations (NGOs). By leveraging geospatial indexing and real-time data, the architecture ensures rapid, traceable, and secure food allocation.

## ARCHITECTURE & STACK

The platform is engineered using a decoupled client-server model, ensuring scalability and strict separation of concerns.

**Client Application**
- **Framework:** React 18 (Vite build system)
- **Styling:** Tailwind CSS v4, Shadcn UI (Radix Primitives)
- **State & Routing:** Zustand, React Router DOM
- **Typography:** Plus Jakarta Sans

**Server Application**
- **Runtime:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM) with 2dsphere geospatial indexing
- **Security:** JSON Web Tokens (JWT), bcrypt, Helmet.js, express-rate-limit
- **Services:** Nodemailer (SMTP abstraction)

## DEPLOYMENT INSTRUCTIONS

### Prerequisites
- Node.js v18.0.0 or higher
- MongoDB instance (Local or Atlas)

### 1. Backend Initialization

Navigate to the root directory and install core dependencies.

```bash
npm install
```

Construct the local environment file (`.env`):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/food-relief
JWT_SECRET=your_secure_cryptographic_key

# SMTP Configuration
EMAIL_USER=your_service_account@domain.com
EMAIL_PASS=your_app_specific_password

# Client Origin Reference
CLIENT_URL=http://localhost:5173
```

Execute the server instance:

```bash
npm run dev
```

### 2. Client Initialization

In a separate terminal instance, navigate to the client workspace.

```bash
cd client
npm install
npm run dev
```

The application client will securely connect to the local API gateway.

## API REFERENCE

All endpoints expect and return `application/json` payloads. Authenticated routes require a standard Bearer token in the Authorization header.

### Authentication & Identity
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Provision new entity | Public |
| `POST` | `/api/auth/login` | Authenticate and retrieve JWT | Public |
| `GET` | `/api/auth/me` | Retrieve entity profile | Restricted |

### Donor Operations
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/donor/post` | Initialize surplus record | Donor |
| `GET` | `/api/donor/my-donations` | Fetch historical records | Donor |
| `GET` | `/api/donor/donation/:id` | Fetch specific manifest | Donor |
| `PATCH` | `/api/donor/donation/:id/cancel`| Abort surplus allocation | Donor |

### NGO Operations
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/ngo/available-donations` | Geospatial fetch (15km radius) | NGO |
| `GET` | `/api/ngo/my-claims` | Fetch claimed manifests | NGO |
| `POST` | `/api/ngo/claim/:donationId` | Lock surplus allocation | NGO |
| `PATCH` | `/api/ngo/collect/:donationId` | Finalize collection | NGO |
| `POST` | `/api/ngo/proof/:donationId` | Upload audit documentation | NGO |

### Administrative Controls
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/pending-ngos` | Audit unverified NGOs | Admin |
| `PATCH` | `/api/admin/approve-ngo/:id` | Authorize NGO entity | Admin |
| `PATCH` | `/api/admin/reject-ngo/:id` | Terminate NGO entity | Admin |
| `GET` | `/api/admin/all-donations` | Global manifest view | Admin |
| `GET` | `/api/admin/stats` | System metrics retrieval | Admin |

<br />
<div align="center">
  <small>&copy; Sarvwan Organization. All Rights Reserved.</small>
</div>
