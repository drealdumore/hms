import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import ExpressMongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import globalErrorHandler from "./controllers/errorController.js";
import AppError from "./utilities/appError.js";
import compression from "compression";

const app = express();

// Parse incoming request data as JSON
app.use(express.json());

// CORS
app.use(cors(""));

// Set security HTTP headers
app.use(helmet());

// Log requests to the console in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 req per windowMs
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

// Body parser, reading data from body into req.body
// Parse incoming request data as URL-encoded && JSON
app.use(express.urlencoded({ extended: true }));

// Cookie parser, reading data from cookies into req.cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// filters out mongoDB operators like $gt, $lt, etc. in req body
// and req query
app.use(ExpressMongoSanitize());

// Data sanitization against XSS
// cleans user input from malicious HTML code
// and scripts
app.use(xss());

// Prevent parameter pollution
// protects against HTTP parameter pollution attacks
// by removing duplicate query parameters
// and keeping the first one
// whitelist is used to allow certain query parameters
// to be duplicated
// for example, sort=price,sort=name
// will be allowed
app.use(
  hpp({
    whitelist: ["sort", "page", "limit"],
  })
);

// Compress all HTTP responses
// to reduce the size of the response body
// and improve performance
// by using gzip compression
app.use(compression());

// TO Test Api
app.use((req, res, next) => {
  // req.requestTime = new Date().toISOString();
  // console.log("cookies: ", req.cookies);

  // console.log(process.env.JWT_EXPIRES_IN);
  next();
});

app.get("/ip", (req, res) => res.send(req.ip));

// HANDLE UNDEFINED ERRORS
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
