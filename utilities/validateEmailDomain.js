import fs from "fs";
import AppError from "./appError.js";

export const validateEmailDomain = (email, next) => {
  const emailDomain = email.split("@")[1];
  const invalidDomains = JSON.parse(fs.readFileSync("./domains.json"));

  if (invalidDomains.includes(emailDomain)) {
    return next(new AppError("Invalid email domain!", 401));
  }

  next()
};