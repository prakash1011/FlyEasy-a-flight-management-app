# FlyEasy API

A comprehensive Express.js backend for the FlyEasy flight booking system with JWT authentication, role-based access control, MongoDB integration, and full CRUD operations.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (admin and user roles)
  - Password hashing with bcrypt

- **Data Models**
  - User: With preferences (default dark theme), flight history
  - Flight: Complete flight details with seat availability tracking
  - Route: Origin and destination with active flights
  - Booking: Full booking system with automatic discount application
  - Payment: Mock payment processing system (ready for Stripe integration)

- **Booking Features**
  - Automatic 20% discount for users who flew within the last 20 days
  - Seat class options (economy, business)
  - Booking cancellation and reschedule functionality
  - Refund eligibility checks

- **Flight Management**
  - Flight status tracking (scheduled, boarding, in-air, landed, cancelled)
  - Recurring flight schedule creation
  - Route management with distance and duration calculation

- **API Security**
  - Input validation using express-validator
  - Protected routes with JWT verification
  - Role-based access restrictions

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation
- cors for Cross-Origin Resource Sharing
- dotenv for environment variable management
- morgan for HTTP request logging

## Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd flyeasy-backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/flyeasy
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. Start the server
   ```
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and get token
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get single route
- `POST /api/routes` - Create new route (admin only)
- `PUT /api/routes/:id` - Update route (admin only)
- `DELETE /api/routes/:id` - Delete route (admin only)

### Flights
- `GET /api/flights` - Get all flights
- `GET /api/flights/:id` - Get single flight
- `GET /api/flights/status/:code` - Get flight status
- `POST /api/flights` - Create new flight (admin only)
- `PUT /api/flights/:id` - Update flight (admin only)
- `PUT /api/flights/:id/status` - Update flight status (admin only)
- `DELETE /api/flights/:id` - Delete flight (admin only)

### Schedules
- `GET /api/schedules` - Get all flight schedules
- `GET /api/schedules/:id` - Get single schedule
- `POST /api/schedules` - Create new schedule with optional recurring flights (admin only)
- `PUT /api/schedules/:id` - Update schedule (admin only)
- `DELETE /api/schedules/:id` - Delete schedule (admin only)

### Bookings
- `GET /api/bookings` - Get all bookings (for admin) or user's bookings (for regular users)
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/reschedule` - Reschedule booking

### Payments
- `POST /api/payments/checkout/:bookingId` - Create checkout session
- `GET /api/payments/success` - Handle successful payment
- `GET /api/payments/cancel` - Handle cancelled payment
- `POST /api/payments/webhook` - Process payment webhook (for integration with Stripe)

## Query Parameters

Many endpoints support filtering through query parameters:

### Flights
- `status`: Filter by flight status
- `route`: Filter by route ID
- `from` & `to`: Filter by departure time range

### Routes
- `origin`: Filter by origin airport code
- `destination`: Filter by destination airport code
- `active`: Filter by active status

### Bookings
- `status`: Filter by booking status
- `from` & `to`: Filter by flight date range
- `user`: Filter by user ID (admin only)

## User Interface Theme

The application uses a dark theme across all interfaces, featuring:
- Dark backgrounds
- Light text
- Blue accent colors
- Consistent visual hierarchy

## License

[MIT](LICENSE)

## Author

FlyEasy Development Team
