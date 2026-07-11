# Smart Doctor Queue & Appointment Management System

A premium, modern, real-time platform designed to streamline doctor appointments, minimize waiting room congestion, and sync queue status live using Socket.io and MySQL database.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework:** React 19 (bundled with [Vite](https://vite.dev/))
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) for fluid, responsive UI
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for micro-interactions and transitions
- **Real-Time Client:** Socket.io-Client
- **Form Handling:** React Hook Form
- **Toasts & Modals:** SweetAlert2 & React Hot Toast
- **Icons:** Lucide React

### Backend
- **Framework:** Node.js & Express
- **Database:** **MySQL** managed via **Sequelize ORM**
- **Real-Time Communication:** Socket.io for live queue tracking
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs (password hashing)
- **File Uploads:** Multer (handling profile picture updates)
- **Mailing Service:** Nodemailer (with custom Ethereal/SMTP configuration)
- **Validation:** Express Validator

---

## ✨ Features

### 👤 Patient Portal
- **Onboarding & Authentication:** Secure Signup/Login with password hashing.
- **Profile Management:** View and edit personal details.
- **Book Appointments:** Browse available doctors, view schedule slots, and schedule visits.
- **Live Queue Tracking:** View real-time queue position, token state updates, and dynamic waiting time estimations.
- **History Logs:** Access past appointment history, cancellations, and status logs.

### 🥼 Doctor Dashboard
- **Consultation Dashboard:** Real-time analytics showing total appointments today, active queue length, and completed consultations.
- **Queue Control Panel:** Proactively call the next patient, check-in, mark completed, skip, or modify wait intervals.
- **Profile Setup:** Update specialty details, consulting fees, schedule availability, and upload profile pictures.

### 🔑 Admin Dashboard
- **System Metrics:** Complete breakdown of global system stats, active users, doctor metrics, and total appointment counts.
- **Doctor & Patient Management:** Verify, deactivate, or delete profiles/user accounts.
- **Availability Controls:** Force-toggle doctor availability statuses globally.

### ⚡ Real-Time Engine
- **Live Updates:** Real-time synchronization of queue numbers to waiting patients' screens when a doctor updates status.
- **In-App Notifications:** Real-time push alerts for appointment updates, status changes, and general notifications.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0+)
- [MySQL](https://www.mysql.com/) database server (v8.0+)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the `backend` directory based on the `.env.example` file:
   ```env
   PORT=5000
   NODE_ENV=development
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=smart_doctor_queue
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```
4. Run the seed script to populate test data (optional):
   ```bash
   npm run seed # or node seed.js
   ```
5. Start the development server (the database schema will automatically sync via Sequelize):
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.
