# Medcore Hospital Management System

Medcore is a modern, comprehensive hospital management platform that digitizes operations across different hospital modules including Patient Management, Appointments, Pharmacy, and Billing.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Vite, Redux Toolkit
- **Backend**: Node.js, Express, MongoDB
- **Docs**: Swagger UI
- **Testing**: Jest, Supertest

## Features
- Role-based Access Control (Super Admin, Admin, Doctor, Nurse, Receptionist, Pharmacist, Patient)
- Real-time Analytics Dashboard with Recharts
- Secure OTP-based authentication and JWT tokens
- Pharmacy Inventory and Dispensing
- Doctor Appointments and Encounters
- Billing and Payments integration (Razorpay)

## Quick Start

### 1. Backend Setup
1. Navigate to the `Backend` folder:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` (or setup your environment variables):
   - `MONGO_URI`
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`
   - `CLOUDINARY_URL`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
4. Run the seed script to populate demo data (Super Admin & Admin):
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `Frontend` folder:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Default Credentials (after seeding)
- **Super Admin:** `superadmin@medcore.com` / `Admin@123`
- **Hospital Admin:** `admin@medcore.com` / `Admin@123`

## API Documentation
Once the backend is running, visit the Swagger documentation at:
http://localhost:3000/api-docs

## Running Tests
Run integration tests in the backend:
```bash
npm run test
```
