<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/activity.svg" width="80" alt="Medcore Logo" />
  <h1>MedCore Hospital Management System (HMS)</h1>
  <p><strong>A Modern, Multi-Tenant SaaS Healthcare Platform</strong></p>
  
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
  [![Swagger](https://img.shields.io/badge/Swagger-API_Docs-85EA2D.svg)](https://swagger.io/)
</div>

---

## 🏥 Overview

**MedCore HMS** is a robust, full-stack healthcare platform designed to digitize and streamline hospital operations. Built as a scalable, cloud-deployed SaaS, it manages everything from patient registrations and doctor encounters to complex pharmacy inventory, laboratory workflows, and billing operations.

🌐 **Live Demo (Frontend):** [https://medcore-hms-theta.vercel.app/](https://medcore-hms-theta.vercel.app/)
⚙️ **Live API Docs (Swagger):** [https://medcore-backend-iftk.onrender.com/api-docs/](https://medcore-backend-iftk.onrender.com/api-docs/)

*(Note: Use `admin@cityhospital.com` / `Admin@1234` for Admin Portal, or `aarav.test@example.com` / `Patient@123` for Patient Portal).*

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React (Vite)
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS (Dark Mode supported)
- **Routing:** React Router v6
- **Data Visualization:** Recharts
- **Hosting:** Vercel Global Edge Network

### Backend
- **Runtime:** Node.js (Express.js)
- **Database:** MongoDB (Mongoose ODM)
- **Real-time:** Socket.IO (WebSockets)
- **Authentication:** JWT (JSON Web Tokens) with HTTP-only Cookies & Header Fallbacks
- **Documentation:** Swagger UI (OpenAPI 3.0)
- **Payment Gateway:** Razorpay Integration

### DevOps & Cloud Infrastructure
- **Frontend Hosting:** Vercel Global Edge Network
- **Backend Hosting:** Render Cloud Platform
- **Security:** Managed SSL/TLS Certificates, HSTS (Strict-Transport-Security)
- **Deployment:** Continuous Integration/Continuous Deployment (CI/CD) via GitHub

---

## 🏗️ Architecture & Engineering Decisions

### 1. Scalable Role-Based Access Control (RBAC)
The system is built on a modular RBAC foundation supporting dynamic roles (Super Admin, Hospital Admin, Doctor, Patient). 
> **MVP Strategic Consolidation:** To ensure a robust, end-to-end functional flow within the initial deployment timeframe, granular operational roles (Nurse, Pharmacist, Lab Technician, Receptionist) were consolidated into the `Hospital Admin` scope. This Agile trade-off allowed for rigorous testing of core workflows (Registration → Triage → Encounter → Lab/Pharmacy → Billing) before breaking the UI into isolated workspaces in V2. The underlying database schema remains highly normalized and fully supports seamless role expansion.

### 2. Multi-Tenant SaaS Capability
Designed to support multiple hospitals on a single platform. The `Super Admin` manages onboarding and subscription billing for entire hospital entities, while the `Hospital Admin` manages their specific internal departments, staff, and analytics.

### 3. Advanced Security Posture
- **Cross-Origin Authentication:** Implemented a secure authentication flow handling strict `SameSite=None; Secure` cookies across different hosting domains (Vercel Frontend & AWS Backend). Added an `Authorization` header fallback for robust session persistence.
- **Data Protection:** Passwords securely hashed via `bcrypt`. 
- **Network Security:** Vercel and Render native Edge networks providing automatic SSL termination, DDoS protection, and secure routing without exposing internal ports.

### 4. Real-Time Capabilities
Integrated **Socket.IO** for real-time WebSocket communication, powering instant notifications, live appointment tracking, and real-time dashboard updates without polling overhead.

---

## 🚀 Key Modules & Features

- **Dashboard & Analytics:** Real-time metrics visualization (Revenue, Patient Flow, Department efficiency) using Recharts.
- **Patient Management (EMR):** Comprehensive Electronic Medical Records, history tracking, and patient portals.
- **Doctor Encounters:** Dedicated doctor workflows for writing prescriptions, ordering lab tests, and managing availability calendars.
- **Pharmacy & Inventory:** Medication dispensing, automated stock tracking, and low-inventory alerts.
- **Laboratory Module:** Test order tracking, result uploads, and secure PDF report generation.
- **Financial Billing:** Automated invoice generation, payment reconciliation, and Razorpay integration.

---

## 💻 Local Development Setup

### 1. Backend Setup
```bash
cd Backend
npm install

# Setup Environment Variables (Create a .env file)
# MONGO_URI=mongodb://localhost:27017/medcore
# JWT_SECRET=your_secret
# JWT_REFRESH_SECRET=your_refresh_secret
# PORT=8000

# Seed the database with initial Admin & Doctor accounts
npm run seed

# Start the server (Dev Mode)
npm run dev
```

### 2. Frontend Setup
```bash
cd Frontend
npm install

# Setup Environment Variables (Create a .env file)
# VITE_API_URL=http://localhost:8000/api

# Start Vite Development Server
npm run dev
```



## 📝 API Documentation
Fully documented REST APIs available via Swagger UI. Once the backend is running locally, access it at:
`http://localhost:8000/api-docs`

---
*Designed and Developed as a comprehensive Software Engineering Internship Project.*
