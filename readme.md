
# Node.js Boilerplate

A Node.js boilerplate with security, rate limiting, data sanitization, and error handling using Express.js. This setup is ideal for building scalable and secure RESTful APIs.

## Features

- **Express** for routing
- **Helmet** for setting security HTTP headers
- **CORS** for Cross-Origin Resource Sharing
- **Express-Rate-Limit** to limit repeated requests to public APIs
- **Express-Mongo-Sanitize** to prevent NoSQL injection attacks
- **xss-clean** to sanitize user input to prevent XSS attacks
- **hpp** to prevent HTTP parameter pollution
- **Error Handling** using a global error handler and custom `AppError` class
- **Cookie Parsing** with `cookie-parser`

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/en/) (v14.x or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/drealdumore/nodeJs-boilerplate.git
   cd yourrepo
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file at the root of your project and set the following environment variables:
   ```bash
   NODE_ENV=development
   PORT=8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The app should now be running at `http://localhost:8000`.

### Folder Structure

```bash
.
├── controllers
│   └── errorController.js   # Handles global error responses
├── appError.js              # Custom AppError class for error handling
├── app.js                   # Express app configuration
└── server.js                # Server entry point
```

## Usage

### API Routes

- **`GET /api`**: A simple test route that returns a success message.
  
  Example response:
  ```json
  {
    "status": "success",
    "message": "Api works👍✅✅"
  }
  ```

- **`GET /`**: The root route that returns a welcome message.

  Example response:
  ```json
  {
    "status": "success",
    "message": "Welcome to the API! 🎉"
  }
  ```

### Error Handling

- Any undefined routes will result in a `404` error response.
  
  Example response:
  ```json
  {
    "status": "error",
    "message": "Can't find [URL] on this server!"
  }
  ```

### Global Error Handling

The app includes a global error handler to catch all operational errors and return meaningful messages.

## Scripts

- **`npm run dev`**: Starts the development server with nodemon for live reloading.
- **`npm start`**: Starts the production server.

## Security

This boilerplate includes several security features:

- **Helmet**: Adds various security headers.
- **Rate Limiting**: Limits the number of requests per IP to prevent brute-force attacks.
- **MongoDB Sanitization**: Prevents NoSQL query injection by filtering request data.
- **XSS Protection**: Cleans user input to prevent cross-site scripting attacks.
- **HPP**: Protects against HTTP parameter pollution.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
