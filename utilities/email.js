import nodemailer from "nodemailer";
import pug from "pug";
import { fileURLToPath } from "url";
import { dirname } from "path";

class Email {
  constructor(user, payload) {
    this.from = process.env.FROM || "HMS";
    this.to = user.email;
    this.firstName = user.firstName;
    this.payload = payload;
  }

  async newTransport() {
    const isProduction = process.env.NODE_ENV === "production";

    return nodemailer.createTransport({
      host: isProduction ? "smtp.gmail.com" : "smtp.ethereal.email",
      port: 587,
      secure: isProduction,
      auth: {
        user: isProduction
          ? process.env.GOOGLE_USERNAME
          : process.env.ETHEREAL_USERNAME,
        pass: isProduction
          ? process.env.GOOGLE_PASSCODE
          : process.env.ETHEREAL_PASSWORD,
      },
      tls: isProduction ? { rejectUnauthorized: false } : undefined,
    });
  }

  async sendEmail(template, subject) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      payload: this.payload,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };

    const transporter = await this.newTransport();
    await transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail() {
    await this.sendEmail("welcome", "Welcome to HMS! 👋");
  }

  async sendForgotPassword() {
    await this.sendEmail(
      "forgotPassword",
      "Your password reset token (valid for only 10 minutes)"
    );
  }

  async sendOTPRequest() {
    await this.sendEmail("otpRequest", "Your OTP Request");
  }

  async sendEmailVerificationCode() {
    await this.sendEmail("emailVerification", "Email Verification Code");
  }
}

export default Email;
