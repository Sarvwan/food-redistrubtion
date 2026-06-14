# Food Relief Platform

A full-stack Node.js and MongoDB application connecting food donors with verified NGOs to minimize food waste and support communities.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose) with 2dsphere geospatial indexing
- **Security**: JWT Authentication, Helmet.js, express-rate-limit, express-mongo-sanitize, bcryptjs
- **Frontend**: Plain HTML, CSS, Vanilla JavaScript
- **Integrations**: Google Maps JS API, Nodemailer (Email), Twilio (SMS mock)

## Setup Instructions

1. Clone the repository and navigate to the project directory.
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory (see variables below).
4. Start the server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5000`.

## Environment Variables (`.env`)

You need the following variables in your `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/food-relief
JWT_SECRET=your_jwt_secret_key_here

# Email Config (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Twilio SMS Config (Mocked)
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_PHONE=+1234567890

# Client Configuration
CLIENT_URL=http://localhost:5000
GOOGLE_MAPS_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

*(Note: Don't forget to also replace `YOUR_GOOGLE_MAPS_API_KEY` in `client/dashboard-ngo.html`!)*

## API Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/health` | GET | Public | Health check and server uptime |
| `/api/stats` | GET | Public | Public landing page statistics |
| `/api/auth/register` | POST | Public | Register a new User or NGO (Rate limited) |
| `/api/auth/login` | POST | Public | Authenticate and return JWT (Rate limited) |
| `/api/auth/me` | GET | Private | Return current user profile |
| `/api/donor/post` | POST | Donor | Create a new food donation |
| `/api/donor/my-donations` | GET | Donor | List donor's posted donations |
| `/api/donor/donation/:id` | GET | Donor | Get donation details (and proof) |
| `/api/donor/donation/:id/cancel`| PATCH | Donor | Cancel an open donation |
| `/api/ngo/available-donations` | GET | NGO | Get nearby (15km) open donations |
| `/api/ngo/my-claims` | GET | NGO | Get donations claimed by the NGO |
| `/api/ngo/claim/:donationId` | POST | NGO | Claim an open donation |
| `/api/ngo/collect/:donationId` | PATCH | NGO | Mark a claimed donation as collected |
| `/api/ngo/proof/:donationId` | POST | NGO | Upload delivery proof photos |
| `/api/admin/pending-ngos` | GET | Admin | List NGOs awaiting approval |
| `/api/admin/approve-ngo/:id` | PATCH | Admin | Approve an NGO account |
| `/api/admin/reject-ngo/:id` | PATCH | Admin | Reject an NGO account |
| `/api/admin/all-donations` | GET | Admin | View filtered donation history |
| `/api/admin/stats` | GET | Admin | Get comprehensive platform stats |
