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
- **socket.io** - Real-time bidirectional communication
- **nodemailer** - Email sending
- **stripe** - Payment processing
- **nodemon** - Auto-reload during development

### Step 3: Create Environment Variables File

Create a `.env` file in the `server` directory with the following content:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fullstack-app
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
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

## Stripe Payment Integration

Stripe is configured for processing payments, subscriptions, and refunds. The integration is set up in `config/stripe.js`.

### Setup Stripe

#### Step 1: Get Stripe API Keys

1. Sign up for a free account at [https://stripe.com](https://stripe.com)
2. Go to **Dashboard** → **API Keys**
3. Copy your **Publishable Key** (pk_test_...) and **Secret Key** (sk_test_...)
4. Add them to your `.env` file:

```env
STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

#### Step 2: Setup Webhook (Optional but Recommended)

For handling payment events (success, failure, etc.):

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint: `http://localhost:5000/api/webhooks/stripe`
4. Select events: `payment_intent.succeeded`, `payment_intent.failed`, `charge.refunded`
5. Copy the **Signing Secret** (whsec_...) and add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret
```

### Stripe Configuration File

The `config/stripe.js` includes all necessary functions:

```javascript
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Functions available:
- createPaymentIntent(amount, currency, metadata)
- getPaymentIntent(paymentIntentId)
- createCustomer(email, name, metadata)
- createSubscription(customerId, priceId)
- refundPayment(paymentIntentId, amount)
- verifyWebhookSignature(body, signature)
```

### Payment Implementation Examples

#### Example 1: One-Time Payment

**Backend Route** (`routes/paymentRouter.js`):

```javascript
const express = require("express");
const { createPaymentIntent } = require("../config/stripe");
const router = express.Router();

// Create payment intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, description } = req.body;

    const result = await createPaymentIntent(
      amount,
      "usd",
      { description, userId: req.user._id }
    );

    if (result.success) {
      res.json({
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

**Frontend** (`src/components/PaymentForm.jsx`):

```javascript
import { useState } from "react";
import { loadStripe } from "@stripe/js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create payment intent on backend
      const response = await fetch("/api/payment/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 29.99, description: "Product Purchase" }),
      });

      const { clientSecret } = await response.json();

      // 2. Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: "John Doe" },
        },
      });

      if (result.paymentIntent.status === "succeeded") {
        setSuccess(true);
      } else {
        setError("Payment failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit" disabled={!stripe || loading}>
          {loading ? "Processing..." : "Pay $29.99"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>Payment successful!</p>}
      </form>
    </Elements>
  );
}

export default PaymentForm;
```

#### Example 2: Subscription Payment

**Backend Route**:

```javascript
const { createCustomer, createSubscription } = require("../config/stripe");

router.post("/create-subscription", async (req, res) => {
  try {
    const { email, priceId } = req.body;

    // 1. Create customer
    const customerResult = await createCustomer(email, "John Doe");
    if (!customerResult.success) throw new Error(customerResult.error);

    // 2. Create subscription
    const subscriptionResult = await createSubscription(
      customerResult.customerId,
      priceId
    );

    if (subscriptionResult.success) {
      res.json({
        clientSecret: subscriptionResult.clientSecret,
        subscriptionId: subscriptionResult.subscriptionId,
      });
    } else {
      res.status(400).json({ error: subscriptionResult.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Example 3: Handle Refunds

```javascript
const { refundPayment } = require("../config/stripe");

router.post("/refund", async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;

    // Full or partial refund
    const result = await refundPayment(paymentIntentId, amount);

    if (result.success) {
      res.json({
        message: "Refund processed",
        refundId: result.refundId,
        status: result.status,
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Example 4: Webhook Handler

**Backend Webhook Route** (`routes/webhookRouter.js`):

```javascript
const express = require("express");
const { verifyWebhookSignature } = require("../config/stripe");
const router = express.Router();

router.post("/stripe", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["stripe-signature"];
  const result = verifyWebhookSignature(req.body, signature);

  if (!result.success) {
    return res.status(400).send(`Webhook Error: ${result.error}`);
  }

  const event = result.event;

  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("Payment succeeded:", event.data.object.id);
      // Update database, send confirmation email, etc.
      break;

    case "payment_intent.failed":
      console.log("Payment failed:", event.data.object.id);
      // Handle payment failure
      break;

    case "charge.refunded":
      console.log("Refund processed:", event.data.object.id);
      // Update database for refund
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
```

### Frontend Setup

#### Install Stripe React Libraries

```bash
cd kaka
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### Create Environment Variable

In `kaka/.env`:

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
```

#### Basic Payment Component Example

```javascript
import { loadStripe } from "@stripe/js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    // Get client secret from backend
    const response = await fetch("/api/payment/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 99.99, description: "Premium Plan" }),
    });

    const { clientSecret } = await response.json();

    // Confirm payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: "Test User" },
      },
    });

    if (error) {
      setMessage(`Payment failed: ${error.message}`);
    } else if (paymentIntent.status === "succeeded") {
      setMessage("Payment successful!");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default CheckoutPage;
```

### Testing Stripe in Development

Use Stripe's test card numbers:

| Card Number | Description |
|------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0025 0000 3155 | Requires authentication |
| 378282246310005 | American Express |

Use any future expiration date and any 3-digit CVC.

### Troubleshooting Stripe

| Issue | Solution |
|-------|----------|
| **Keys not found** | Verify STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY in `.env` |
| **Payment intent creation fails** | Check API keys are correct, ensure amount is in cents (multiply by 100) |
| **Webhook signature verification fails** | Verify STRIPE_WEBHOOK_SECRET is correct from Stripe dashboard |
| **Card element not rendering** | Install `@stripe/react-stripe-js` and wrap with `Elements` provider |
| **CORS error with Stripe** | Stripe doesn't require CORS, error likely from backend URL mismatch |

---

## Nodemailer Email Configuration

Nodemailer is configured for sending emails from your backend. It supports various email services (Gmail, Outlook, custom SMTP, etc.).

### Setup Nodemailer

The nodemailer configuration is already set up in `config/nodemailer.js`:

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, html, text = "") => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
```

### Environment Variables for Email

Update your `.env` file with email configuration:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
```

### Getting Email Credentials

#### For Gmail:
1. Enable **2-Factor Authentication** on your Google Account
2. Generate an **App Password**:
   - Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Copy and paste this as `EMAIL_PASSWORD` in `.env`
3. Set `EMAIL_SERVICE=gmail` in `.env`

#### For Other Email Services (Outlook, Yahoo, Custom SMTP):
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your_email@outlook.com
EMAIL_PASSWORD=your_password

# OR for custom SMTP:
EMAIL_SERVICE=custom
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=your_email@yourdomain.com
EMAIL_PASSWORD=your_password
```

### Using Nodemailer in Routes

#### Example 1: Send Welcome Email on Signup

Update your `routes/authrouter.js` or `controllers/authcontroller.js`:

```javascript
const { sendEmail } = require("../config/nodemailer");

// In your signup controller
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ... create user logic ...
    
    // Send welcome email
    const emailResult = await sendEmail(
      email,
      "Welcome to Our App!",
      `<h1>Welcome!</h1><p>Your account has been created successfully.</p>`,
      "Welcome to Our App!"
    );
    
    if (!emailResult.success) {
      console.log("Email sending failed:", emailResult.error);
    }
    
    res.json({ message: "User created", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### Example 2: Send Password Reset Email

```javascript
const { sendEmail } = require("../config/nodemailer");

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Generate reset token (you can use JWT or a random token)
    const resetToken = generateResetToken(); // implement this
    
    // Send reset email
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    const emailResult = await sendEmail(
      email,
      "Password Reset Request",
      `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
      "Click the link to reset your password"
    );
    
    res.json({ message: "Reset email sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### Example 3: Send Notification Email

```javascript
const { sendEmail } = require("../config/nodemailer");

// Send to multiple users
const sendNotificationToUsers = async (userEmails, title, message) => {
  try {
    for (const email of userEmails) {
      await sendEmail(
        email,
        title,
        `<h2>${title}</h2><p>${message}</p>`,
        message
      );
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

### Email Templates

For better emails, use HTML templates:

```javascript
const verificationEmailTemplate = (userName, verificationLink) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome, ${userName}!</h2>
        <p>Please verify your email to activate your account:</p>
        <a href="${verificationLink}" class="button">Verify Email</a>
        <p>If you didn't sign up, ignore this email.</p>
      </div>
    </body>
  </html>
`;

// Usage
const { sendEmail } = require("../config/nodemailer");
const emailHtml = verificationEmailTemplate("John", "http://localhost:5173/verify?token=abc123");
await sendEmail("john@example.com", "Verify Your Email", emailHtml);
```

### Troubleshooting Nodemailer

| Issue | Solution |
|-------|----------|
| **Authentication failed** | Check EMAIL_USER and EMAIL_PASSWORD in `.env`, use Gmail App Password, not your regular password |
| **Email not being sent** | Verify EMAIL_SERVICE is correct, check if 2FA is enabled on Gmail, ensure .env variables are loaded |
| **"Less secure app access"** | Enable 2FA on Gmail and use App Password instead of regular password |
| **Connection timeout** | Check if EMAIL_HOST and EMAIL_PORT are correct for custom SMTP, verify firewall settings |
| **Email going to spam** | Add proper headers, use verified email address, configure SPF/DKIM records |

---

## Socket.io Real-Time Communication

Socket.io is integrated into the server for real-time, bidirectional communication between the server and clients.

### How Socket.io Works

Socket.io enables real-time communication using WebSockets. The server and clients can send and receive events instantly, making it perfect for notifications, live updates, and interactive features.

### Server Setup (Already Configured)

The server is already configured in `server.js`:

```javascript
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Wrap express with HTTP server

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
  },
});

// Handle client connections
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  // Listen for custom events from client
  socket.on("send_notification", (data) => {
    console.log("Notification data:", data);
    
    // Emit event to all connected clients
    io.emit("receive_notification", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});

// Start server on HTTP (not just Express)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Frontend Setup (Client Side)

#### Step 1: Install Socket.io Client
```bash
cd kaka
npm install socket.io-client
```

#### Step 2: Create Socket Connection Service

Create a file `src/api/socket.js`:

```javascript
import io from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const socket = io(SOCKET_SERVER_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

export default socket;
```

#### Step 3: Use Socket in Components

**Example - Sending a Notification:**

```javascript
import { useEffect, useState } from 'react';
import socket from '../api/socket';

function NotificationComponent() {
  const [notifications, setNotifications] = useState([]);

  // Listen for notifications from server
  useEffect(() => {
    socket.on('receive_notification', (data) => {
      console.log('Received notification:', data);
      setNotifications((prev) => [...prev, data]);
    });

    // Cleanup listener on unmount
    return () => {
      socket.off('receive_notification');
    };
  }, []);

  // Send notification to server (which broadcasts to all clients)
  const sendNotification = (message) => {
    socket.emit('send_notification', {
      message,
      timestamp: new Date(),
      sender: 'user@example.com'
    });
  };

  return (
    <div>
      <button onClick={() => sendNotification('Hello everyone!')}>
        Send Notification
      </button>
      <div>
        {notifications.map((notif, idx) => (
          <p key={idx}>{notif.message} - {notif.timestamp}</p>
        ))}
      </div>
    </div>
  );
}

export default NotificationComponent;
```

### Socket.io Events Reference

#### Server Emits To Client:
- **`receive_notification`** - Broadcasting notifications to all connected clients
  ```javascript
  io.emit('receive_notification', {
    message: string,
    timestamp: Date,
    sender: string
  });
  ```

#### Client Emits To Server:
- **`send_notification`** - Client sends notification data to server
  ```javascript
  socket.emit('send_notification', {
    message: string,
    timestamp: Date,
    sender: string
  });
  ```

### Advanced Socket.io Patterns

#### 1. Emit to Specific User (One-to-One)
```javascript
// Server side
io.to(socketId).emit('receive_notification', data);
```

#### 2. Emit to All Except Sender (Broadcasting)
```javascript
// Server side
socket.broadcast.emit('receive_notification', data);
```

#### 3. Create Rooms for Group Communication
```javascript
// Server - Client joins a room
socket.on('join_room', (roomId) => {
  socket.join(roomId);
});

// Server - Emit to specific room
io.to(roomId).emit('receive_notification', data);
```

### Troubleshooting Socket.io

| Issue | Solution |
|-------|----------|
| **Socket not connecting** | Check CORS origin matches frontend URL and server is running |
| **Client can't find socket.io-client** | Run `npm install socket.io-client` in frontend directory |
| **Events not being received** | Verify event names match exactly on server and client |
| **CORS errors with Socket.io** | Update CORS origin in server `io` configuration to match frontend URL |
| **Multiple connections detected** | Ensure `socket.off()` is called in useEffect cleanup to prevent duplicate listeners |

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
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
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
│   │   ├── db.js
│   │   ├── nodemailer.js
│   │   ├── stripe.js
│   │   └── cloudnary.js
│   ├── controllers/
│   │   └── authcontroller.js
│   ├── middleware/
│   │   ├── authmiddelware.js
│   │   └── multer.js
│   ├── models/
│   │   └── User.js
│   └── routes/
│       ├── authrouter.js
│       └── uploadRoutes.js
│
└── kaka/                   (Frontend - React/Vite)
    ├── src/
    │   ├── api/
    │   │   ├── axios.jsx
    │   │   └── socket.js
    │   ├── pages/
    │   ├── component/
    │   ├── utils/
    │   ├── assets/
    │   ├── App.jsx
    │   └── main.jsx
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
- [Stripe Docs](https://stripe.com/docs)
- [Socket.io Docs](https://socket.io/docs/)
- [Nodemailer Docs](https://nodemailer.com/)

---

## Support

If you encounter any issues:
1. Check the error message carefully
2. Review the Troubleshooting section
3. Ensure all environment variables are set correctly
4. Verify all dependencies are installed with `npm install`
5. Make sure both frontend and backend are running on the correct ports

Happy Coding! 🚀
