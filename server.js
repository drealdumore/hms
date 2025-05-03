import dotenv from "dotenv";
import mongoose from "mongoose";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 😥😥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config();

import app from "./app.js";

const DB =
  process.env.NODE_ENV === "development" ? process.env.LOCALDB : process.env.DB;

mongoose
  .connect(DB)
  .then(() => {
    console.log("\x1b[6;30;42mDB connection successful!!\x1b[0m");
  })
  .catch((err) => {
    console.error("\x1b[1;37;41mDB connection failed!\x1b[0m", {err});
  });

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`Running ${process.env.NODE_ENV} server on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 😥 Shutting down...");
  console.log({ error: err.name, message: err.message });
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED!!. Shutting down gracefully!");
  server.close(() => console.log("💥 Process terminated!"));
});
