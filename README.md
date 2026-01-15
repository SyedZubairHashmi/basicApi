# Full Stack Application - Server & Frontend Setup Guide

This is a full-stack application with an Express.js backend and React frontend. It includes user authentication with JWT and password hashing using bcryptjs, with MongoDB as the database.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Installation](#server-installation)
3. [Frontend (Kaka) Installation](#frontend-kaka-installation)
4. [Integration Steps](#integration-steps)
5. [Running the Application](#running-the-application)
6. [API Endpoints](#api-endpoints)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js** (v14 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - Either local installation or MongoDB Atlas account for cloud database
- **Git** (optional, for cloning repositories)
- A code editor like **VS Code**

### Verify Installation
```bash
node --version
npm --version
```

---

## Server Installation

### Step 1: Navigate to Server Directory
```bash
cd server
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs all required packages:
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Enable cross-origin requests
- **dotenv** - Environment variables management
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemon** - Auto-reload during development

### Step 3: Create Environment Variables File

Create a `.env` file in the `server` directory with the following content:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fullstack-app
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
```

**Important Notes:**
- Replace `your_jwt_secret_key_here_change_this_in_production` with a strong secret key
- For MongoDB:
  - **Local MongoDB**: Use `mongodb://localhost:27017/fullstack-app`
  - **MongoDB Atlas** (Cloud): Get connection string from your MongoDB Atlas dashboard and replace the MONGO_URI

### Step 4: Verify Server Setup

Ensure these files exist in the server directory:
```
server/
├── server.js              (Main server file)
├── package.json           (Dependencies)
├── .env                   (Environment variables - you create this)
├── config/
│   └── db.js             (Database connection)
├── controllers/
│   └── authcontroller.js (Authentication logic)
├── middleware/
│   └── authmiddelware.js (Auth middleware)
├── models/
│   └── User.js           (User database schema)
└── routes/
    └── authrouter.js     (Auth routes)
```

### Step 5: Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

✅ Success message: `server running on port 5000`

---

## Frontend (Kaka) Installation

### Step 1: Navigate to Frontend Directory
```bash
cd kaka
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- **react** - Frontend framework
- **react-dom** - React DOM rendering
- **axios** - HTTP client for API calls
- **vite** - Build tool and dev server

### Step 3: Create Environment Variables File

Create a `.env` file in the `kaka` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

This tells your frontend where the backend API is located.

### Step 4: Verify Frontend Setup

Ensure the directory structure looks like:
```
kaka/
├── package.json          (Dependencies)
├── vite.config.js        (Vite configuration)
├── index.html            (Main HTML file)
├── .env                  (Environment variables - you create this)
├── src/
│   ├── main.jsx          (Entry point)
│   ├── App.jsx           (Main component)
│   ├── App.css           (Styles)
│   ├── index.css         (Global styles)
│   ├── api/
│   │   └── axios.jsx     (Axios instance configuration)
│   ├── pages/
│   │   ├── home.jsx      (Home page)
│   │   ├── login.jsx     (Login page)
│   │   └── signup.jsx    (Signup page)
│   ├── component/        (Reusable components)
│   ├── routers/          (Route definitions)
│   ├── utils/            (Utility functions)
│   │   └── auth.js       (Auth utilities)
│   └── assets/           (Images, fonts, etc.)
└── public/               (Static files)
```

### Step 5: Configure Axios Instance

Update `src/api/axios.jsx` to use the environment variable:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

export default api;
```

### Step 6: Start the Frontend

**Development Mode**:
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

**Build for Production**:
```bash
npm run build
```

---

## Integration Steps

### Step 1: Configure Axios in Frontend

Make sure your `src/api/axios.jsx` points to the correct backend URL:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Step 2: Connect Login/Signup Pages to Backend

In your `src/pages/signup.jsx`:

```javascript
import api from '../api/axios';

const handleSignup = async (email, password) => {
  try {
    const response = await api.post('/auth/signup', {
      email,
      password
    });
    localStorage.setItem('token', response.data.token);
    // Redirect to home or login
  } catch (error) {
    console.error('Signup failed:', error);
  }
};
```

In your `src/pages/login.jsx`:

```javascript
import api from '../api/axios';

const handleLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    localStorage.setItem('token', response.data.token);
    // Redirect to home
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Step 3: Set Up Routes

In your `src/routers/` directory, set up your routing logic to protect routes:

```javascript
// Example route setup with protected routes
import { useEffect, useState } from 'react';
import api from '../api/axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
```

### Step 4: Enable CORS on Backend

The server already has CORS enabled in `server.js`, but verify it:

```javascript
const cors = require("cors");
app.use(cors());
```

If you need to restrict CORS to only your frontend:

```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## Running the Application

### Option 1: Terminal Windows (Recommended for Development)

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd kaka
npm run dev
```

### Option 2: Single Terminal (Using npm concurrently)

Install concurrently in root:
```bash
npm install -D concurrently
```

Create `package.json` in root directory:
```json
{
  "scripts": {
    "dev": "concurrently \"cd server && npm run dev\" \"cd kaka && npm run dev\""
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

Then run:
```bash
npm run dev
```

---

## API Endpoints

### Authentication Endpoints

**Base URL:** `http://localhost:5000/api/auth`

#### 1. Sign Up
- **Method:** `POST`
- **Endpoint:** `/signup`
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
- **Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "userId",
    "email": "user@example.com"
  }
}
```

#### 2. Login
- **Method:** `POST`
- **Endpoint:** `/login`
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
- **Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "userId",
    "email": "user@example.com"
  }
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 5000 already in use** | Change PORT in `.env` file or kill the process using the port |
| **MongoDB connection fails** | Check MONGO_URI in `.env`, ensure MongoDB is running locally or Atlas credentials are correct |
| **CORS errors** | Verify CORS is enabled on backend and frontend URL matches in cors options |
| **npm install fails** | Delete `node_modules` and `package-lock.json`, run `npm install` again |
| **Frontend can't reach backend** | Check VITE_API_BASE_URL in `.env` and ensure server is running |
| **401 Unauthorized errors** | Check JWT token is stored in localStorage and being sent in Authorization header |

---

## Environment Variables Summary

### Server (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fullstack-app
JWT_SECRET=your_secure_secret_key
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## Project Structure Overview

```
fullstackpractivce/
├── server/                 (Backend - Node.js/Express)
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
│
└── kaka/                   (Frontend - React/Vite)
    ├── src/
    ├── public/
    ├── package.json
    ├── .env
    ├── vite.config.js
    └── index.html
```

---

## Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vite.dev/)
- [JWT.io](https://jwt.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## Support

If you encounter any issues:
1. Check the error message carefully
2. Review the Troubleshooting section
3. Ensure all environment variables are set correctly
4. Verify all dependencies are installed with `npm install`
5. Make sure both frontend and backend are running on the correct ports

Happy Coding! 🚀
