# Smart Doctor Queue & Appointment Management System

This is a comprehensive Doctor Queue & Appointment Management System built with a React frontend and a Node.js/Express backend.

## Project Structure

- `frontend/` - React application built with Vite.
- `backend/` - Node.js/Express application with MongoDB/Socket.io.

## Features

- Doctor appointment scheduling and booking.
- Real-time queue status and updates using Socket.io.
- Doctor dashboard for managing queues and patient flow.
- Patient dashboard for viewing appointment history and real-time waiting times.

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository.
2. Setup the backend:
   ```bash
   cd backend
   npm install
   # Create a .env file and fill in required environment variables (see .env.example)
   npm start
   ```
3. Setup the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
