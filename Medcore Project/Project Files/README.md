# MedCore Hospital Management System (HMS)

MedCore HMS is a comprehensive, full-stack Hospital Management System designed to streamline hospital operations, patient management, and inter-departmental communication.

## Key Features

*   **Multi-Role Access Control:** Dedicated portals and dashboards for Super Admins, Hospital Admins, Doctors, and Patients.
*   **Real-time Notifications:** Instant WebSocket-based updates for appointments, lab results, and patient status.
*   **Complete Patient Lifecycle:** From registration and appointment booking to IPD/OPD management, prescriptions, and billing.
*   **Analytics Dashboard:** Visual insights into hospital operations, revenue, and patient demographics.
*   **Stateless Security Architecture:** Implements industry-standard XSS-proof `HttpOnly` secure cookies for authentication, completely avoiding vulnerable `localStorage` JWT storage.

## Security Highlights

*   **HttpOnly Cookies:** Both `accessToken` and `refreshToken` are stored as secure, HttpOnly cookies, rendering them inaccessible to XSS attacks.
*   **Real-Time Secure Sockets:** Socket.io connections are authenticated dynamically via cookie parsing at the handshake level.
*   **Automated Session Management:** API interceptors automatically handle silent token refreshes and background session cleanups.

## Technology Stack

*   **Frontend:** React.js, Vite, Tailwind CSS, Redux Toolkit, Socket.io-client
*   **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT
*   **Tools:** Swagger UI (API Documentation), Axios

## Project Structure

*   `Frontend/`: Contains the React.js client application.
*   `Backend/`: Contains the Node.js/Express REST API and WebSocket server.

## Local Setup

1.  Clone the repository.
2.  Install dependencies for both folders:
    ```bash
    cd Backend && npm install
    cd ../Frontend && npm install
    ```
3.  Set up environment variables (`.env`) for the Backend (MongoDB URI, JWT Secret).
4.  Start the development servers:
    *   Backend: `npm run dev`
    *   Frontend: `npm run dev`
