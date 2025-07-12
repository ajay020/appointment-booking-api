# Appointment Booking System API Documentation

## Overview
This is a comprehensive appointment booking system built with Express.js, MongoDB, and JWT authentication. The system includes user management, booking functionality, admin features, email notifications, and rate limiting.

## Features
- 🔐 JWT Authentication with refresh tokens
- 👥 User profile management
- 📅 Slot creation and booking system
- 🔧 Admin dashboard and management
- 📧 Email notifications
- 🚦 Rate limiting for security
- 📊 Analytics and reporting
- ⏰ Automated cron jobs

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/auth/refresh-token
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

### POST /api/auth/logout
Logout and invalidate refresh token.

**Headers:** `Authorization: Bearer <token>`

### GET /api/auth/profile
Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/auth/profile
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

### PUT /api/auth/change-password
Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## Slot Management Endpoints

### POST /api/slots
Create a new slot (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "date": "2024-01-15",
  "time": "10:00"
}
```

### GET /api/slots
Get all slots with pagination and filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `date` (optional): Filter by specific date

### PUT /api/slots/:id
Update slot status (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "available|booked|cancelled|completed"
}
```

### DELETE /api/slots/:id
Delete a slot (Admin only).

**Headers:** `Authorization: Bearer <token>`

## Booking Endpoints

### GET /api/bookings/available
Get all available slots.

**Headers:** `Authorization: Bearer <token>`

### POST /api/bookings/:id
Book a slot by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "msg": "Slot booked successfully",
  "slot": {
    "id": "slot-id",
    "date": "2024-01-15",
    "time": "10:00",
    "status": "booked",
    "bookedBy": "user-id"
  }
}
```

### PATCH /api/bookings/:id
Cancel a booking.

**Headers:** `Authorization: Bearer <token>`

### GET /api/bookings/my
Get current user's bookings.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

## Admin Endpoints

### GET /api/admin/dashboard
Admin dashboard overview.

**Headers:** `Authorization: Bearer <token>` (Admin only)

### POST /api/admin/promote/:id
Promote a user to admin.

**Headers:** `Authorization: Bearer <token>` (Admin only)

### GET /api/admin/bookings
Get all bookings with filtering.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**
- `status` (optional): Filter by booking status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `from` (optional): Filter bookings from date
- `to` (optional): Filter bookings to date

### GET /api/admin/summary
Get system statistics.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:**
```json
{
  "users": 150,
  "slots": {
    "total": 500,
    "booked": 300,
    "available": 150,
    "cancelled": 30,
    "completed": 20
  }
}
```

### GET /api/admin/active-users
Get top 5 most active users.

**Headers:** `Authorization: Bearer <token>` (Admin only)

### GET /api/admin/users
Get all users with pagination and search.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email
- `role` (optional): Filter by user role

### DELETE /api/admin/users/:id
Delete a user and cancel their bookings.

**Headers:** `Authorization: Bearer <token>` (Admin only)

### POST /api/admin/bulk-slots
Create multiple slots at once.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "date": "2024-01-15",
  "times": ["09:00", "10:00", "11:00", "14:00", "15:00"]
}
```

### GET /api/admin/analytics
Get advanced analytics.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**
- `period` (optional): Analytics period (7d, 30d, 90d, default: 7d)

## Rate Limiting
The API implements rate limiting to prevent abuse:

- **General**: 100 requests per 15 minutes
- **Authentication**: 5 login attempts per 15 minutes
- **Booking**: 20 booking attempts per hour
- **Admin**: 200 requests per 15 minutes

## Email Notifications
The system sends automatic email notifications for:
- ✅ Booking confirmations
- ❌ Booking cancellations
- ⏰ Appointment reminders (sent daily at 9:00 AM for next day appointments)

## Cron Jobs
Automated tasks that run in the background:
- **Slot Cleanup**: Cancels old unbooked slots daily at midnight
- **Booking Reminders**: Sends email reminders daily at 9:00 AM

## Environment Variables
Copy `.env.example` to `.env` and configure the following:

```env
# Database
MONGO_URI=mongodb://localhost:27017/appointment-booking

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com
ADMIN_EMAIL=admin@yourapp.com
```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Error Handling
The API uses consistent error responses:

```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Security Features
- 🔒 JWT token authentication
- 🔄 Refresh token rotation
- 🚦 Rate limiting
- 🛡️ Input validation
- 🔐 Password hashing with bcrypt
- 🚫 CORS protection

## Testing
Use tools like Postman or curl to test the endpoints. Make sure to include the Authorization header for protected routes:

```bash
curl -H "Authorization: Bearer <your-token>" http://localhost:5000/api/auth/profile
```

## Future Enhancements
- 📱 Push notifications
- 📊 Advanced analytics dashboard
- 🗓️ Recurring appointments
- 💰 Payment integration
- 🔔 SMS notifications
- 📱 Mobile app integration