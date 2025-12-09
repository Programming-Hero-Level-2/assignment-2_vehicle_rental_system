# **Vehicle Rental System – Backend Application**

### **Live API Base URL:** [_deployed URL here_](https://vechile-booking-app.vercel.app/api/v1)

---

## **Overview**

The **Vehicle Booking System Backend** provides secure REST APIs for handling vehicle management, user authentication, bookings, and role-based access control.
Built with **Node.js, Express, PostgreSQL**, and secured using **JWT & Bcrypt**.

---

## **Features**

### **Authentication**

- User registration & login
- Password hashing using **bcrypt**
- JWT access token authentication
- Role-based access (Admin, Customer)

### **Vehicle Management**

- Admin can add, update, delete vehicles
- Vehicles list (public)
- Manage vehicle availability statuses:

  - `available`
  - `booked`
  - `returned`

### **Booking Management**

- Customers can create bookings
- Customers can view only their own bookings
- Admin can see all bookings
- Admin can mark bookings as **returned**
- Customers can cancel bookings (before start date)

### **System Utilities**

- Centralized error handling
- PostgreSQL relational schema
- Clean controller-service architecture
- Environment variable-based configuration

---

## **Technology Stack**

### **Backend**

- Node.js
- Express.js
- PostgreSQL
- pg / pg-pool
- JWT
- bcrypt
- REST API

---

## **Setup & Installation**

### **1. Clone the Repository**

```bash
git clone https://github.com/Programming-Hero-Level-2/assignment-2_vehicle_rental_system
cd assignment-2_vehicle_rental_system
```

### **2. Install Dependencies**

```bash
npm install or pnpm install
```

### **3. Create Environment Variables**

Inside `.env`:

```bash
DB_CONNECTION_STRING='postgresql://neondb_owner:npg_7NmAfyg1lMkq@ep-hidden-frog-aheo2rs0-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
PORT=5000
NODE_ENV='development'
ACCESS_TOKEN_SECRET=your_jwt_secret
JWT_EXPIRES_IN=86400
```

### **4. Start Development Server**

```bash
npm run dev or pnpm run dev
```

### **5. Production Start**

```bash
npm start
```

---

## **API Endpoints (Summary)**

### Authentication

| Method | Endpoint              | Access | Description                 |
| ------ | --------------------- | ------ | --------------------------- |
| POST   | `/api/v1/auth/signup` | Public | Register new user account   |
| POST   | `/api/v1/auth/signin` | Public | Login and receive JWT token |

---

### Vehicles

| Method | Endpoint                      | Access     | Description                                                                             |
| ------ | ----------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| POST   | `/api/v1/vehicles`            | Admin only | Add new vehicle with name, type, registration, daily rent price and availability status |
| GET    | `/api/v1/vehicles`            | Public     | View all vehicles in the system                                                         |
| GET    | `/api/v1/vehicles/:vehicleId` | Public     | View specific vehicle details                                                           |
| PUT    | `/api/v1/vehicles/:vehicleId` | Admin only | Update vehicle details, daily rent price or availability status                         |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin only | Delete vehicle (only if no active bookings exist)                                       |

---

### Users

| Method | Endpoint                | Access       | Description                                                                   |
| ------ | ----------------------- | ------------ | ----------------------------------------------------------------------------- |
| GET    | `/api/v1/users`         | Admin only   | View all users in the system                                                  |
| PUT    | `/api/v1/users/:userId` | Admin or Own | Admin: Update any user's role or details<br>Customer: Update own profile only |
| DELETE | `/api/v1/users/:userId` | Admin only   | Delete user (only if no active bookings exist)                                |

---

### Bookings

| Method | Endpoint                      | Access            | Description                                                                                                                                                         |
| ------ | ----------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/v1/bookings`            | Customer or Admin | Create booking with start/end dates<br>• Validates vehicle availability<br>• Calculates total price (daily rate × duration)<br>• Updates vehicle status to "booked" |
| GET    | `/api/v1/bookings`            | Role-based        | Admin: View all bookings<br>Customer: View own bookings only                                                                                                        |
| PUT    | `/api/v1/bookings/:bookingId` | Role-based        | Customer: Cancel booking (before start date only)<br>Admin: Mark as "returned" (updates vehicle to "available")<br>System: Auto-mark as "returned" when period ends |

---
