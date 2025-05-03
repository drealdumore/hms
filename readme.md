# HMS (Hostel Management System)

## Overview
HMS is a web-based application designed to manage hostels, rooms, and users efficiently. It provides features for user authentication, room booking, hostel management, and email notifications.

## Features
- **User Management**: Sign up, log in, update profile, and manage user accounts.
- **Hostel Management**: Create, update, and delete hostels.
- **Room Management**: Create, update, delete rooms, and manage room occupancy.
- **Authentication**: Secure user authentication with JWT and refresh tokens.
- **Email Notifications**: Send emails for account verification, password reset, and OTP requests.
- **Error Handling**: Centralized error handling for API responses.

## Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Templating Engine**: Pug
- **Email Service**: Nodemailer
- **Security**: Helmet, express-rate-limit, xss-clean, express-mongo-sanitize

## Project Structure
```
HMS/
├── app.js                # Main application file
├── server.js             # Server setup
├── package.json          # Project dependencies and scripts
├── controllers/          # Application controllers
├── models/               # Mongoose models
├── routes/               # API routes
├── utilities/            # Utility functions and classes
├── views/                # Email templates
└── .gitignore            # Ignored files and folders
```

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd HMS
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and configure the following environment variables:
   ```env
   NODE_ENV=development
   PORT=8000
   LOCALDB=<your-local-mongodb-uri>
   DB=<your-production-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   JWT_EXPIRES_IN=<jwt-expiration-time>
   JWT_REFRESH_SECRET=<your-refresh-token-secret>
   JWT_REFRESH_SECRET_EXPIRES_IN=<refresh-token-expiration-time>
   JWT_COOKIE_EXPIRES_IN=<jwt-cookie-expiration-time>
   JWT_REFRESH_COOKIE_EXPIRES_IN=<refresh-cookie-expiration-time>
   GOOGLE_USERNAME=<your-gmail-username>
   GOOGLE_PASSCODE=<your-gmail-passcode>
   ETHEREAL_USERNAME=<your-ethereal-username>
   ETHEREAL_PASSWORD=<your-ethereal-password>
   FROM=<email-sender-name>
   ```

## Usage
1. Start the development server:
   ```bash
   npm start
   ```
2. For production:
   ```bash
   npm run prod
   ```
3. Access the application at `http://localhost:8000`.

## API Endpoints
### User Routes
- `POST /api/users/signup`: Sign up a new user.
- `POST /api/users/login`: Log in a user.
- `POST /api/users/forgotPassword`: Request a password reset.
- `PATCH /api/users/resetPassword/:token`: Reset password.
- `POST /api/users/sendEmailVerificationCode`: Send email verification code.
- `POST /api/users/verifyEmailCode`: Verify email code.
- `POST /api/users/refreshToken`: Refresh access token.

### Admin Routes
- `POST /api/admin/login`: Admin login.
- `GET /api/admin/getAllUsers`: Get all active users.
- `PATCH /api/admin/updateUser/:id`: Update user details.
- `DELETE /api/admin/deleteUser/:id`: Delete a user.

### Hostel Routes
- `POST /api/hostel/createHostel`: Create a new hostel.
- `GET /api/hostel/getAllHostel`: Get all hostels.
- `PATCH /api/hostel/updateHostel/:id`: Update hostel details.
- `DELETE /api/hostel/deleteHostel/:id`: Delete a hostel.

### Room Routes
- `POST /api/room/createRoom`: Create a new room.
- `GET /api/room/getAllRooms`: Get all rooms.
- `PATCH /api/room/updateRoom/:id`: Update room details.
- `DELETE /api/room/deleteRoom/:id`: Delete a room.

## License
This project is licensed under the ISC License.

## Author
Samuel Isah