# We-Talk

First Major Project. Real Time Chatting App WE-TALK made through MERN, DaisyUI. Has 33 different Themes, Web Socket Implementation for Real Time Updates and A secure Authentication System.

---

## 1. About

We-Talk is a real-time chat application built with the MERN stack (MongoDB, Express, React, Node) and styled with Tailwind + DaisyUI. It provides secure authentication, profile management with image uploads, friend management, and real-time messaging using Socket.IO. The app supports message replies, image attachments, message editing and soft-deletion, and includes multiple themes for a customizable UI.

---

## 2. Features

- Real-time one-to-one chat using Socket.IO
- Secure authentication (signup/login/logout) with hashed passwords
- JWT-based session token generation (set in server response)
- Profile management and profile picture upload (Cloudinary)
- Friend system (send/receive friend requests)
- Message features:
  - Text messages
  - Image attachments (Cloudinary)
  - Reply-to a message (threaded reply)
  - Edit message (marks as edited)
  - Soft delete (message remains in DB but hidden)
- Online users presence broadcasting
- 33 UI themes (DaisyUI + Tailwind)
- Production-ready build: backend serves frontend static files when NODE_ENV=production
- Client-side state management using Zustand

---

## 3. Tech Stack

- Frontend:
  - React (via Vite)
  - Tailwind CSS + DaisyUI
  - Zustand (state management)
  - react-router-dom
  - socket.io-client
  - axios
  - lucide-react, FontAwesome icons
- Backend:
  - Node.js + Express
  - Socket.IO
  - MongoDB via Mongoose
  - JSON Web Tokens (JWT)
  - bcryptjs (password hashing)
  - cloudinary (image uploads)
  - cookie-parser, cors, dotenv
- Dev tools:
  - Vite (frontend dev/build)
  - nodemon (backend dev)
  - ESLint

---

## 4. Architecture

High-level components and flow:

- Client (frontend)
  - React app served by Vite in development.
  - Connects to backend HTTP API for auth, profile, friends and messages.
  - Connects to Socket.IO server for real-time updates (new message, presence, edits, deletions).
  - Uses Zustand for app state (current user, open chat, messages).

- Server (backend)
  - Express app exposes REST API:
    - /api/auth/* — signup, login, logout, update-profile, check
    - /api/messages/* — sidebar users, fetch messages, send, delete, edit
    - /api/friends/* — friend-related endpoints
  - Socket.IO server (same Node process) handles real-time events and stores a mapping of online users to socket IDs.
  - MongoDB + Mongoose stores users and messages:
    - User model: email, fullName, password (hashed), profilePic, friends, friendRequestsSent/Received
    - Message model: senderId, receiverId, text, image, replyTo (ref Message), isDeleted, isEdited
  - Cloudinary used for storing uploaded user/profile images and message images.
  - JWTs used for authentication; tokens are issued on signup/login and cleared on logout.

Notes:
- Backend expects the frontend to be served from http://localhost:5173 during development (CORS and Socket.IO origin configured accordingly).
- In production the backend serves the compiled frontend from `frontend/dist`.

---

## 5. Getting started

Below are instructions to configure, build and run the project locally.

Project layout (top-level):
- frontend/ — React + Vite app
- backend/ — Express + Socket.IO server
- package.json (root) exposes convenience scripts

Prerequisites:
- Node.js (recommended 18+)
- npm (or yarn)
- MongoDB instance (local or remote)
- Cloudinary account for image uploads (optional but recommended)

Environment variables (backend/.env)
Create a `.env` file in `backend/` with the following variables (example):
