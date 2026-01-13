import nodemailer from 'nodemailer';
import { env } from '../../config/env';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com', // Fallback or use Env
    port: parseInt(env.SMTP_PORT || '587'),
    secure: env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export class MailService {
    static async sendVerificationEmail(email: string, code: string, fullname: string) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Portyo account</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background-color: #000000; padding: 30px; text-align: center; }
        .logo { color: #ffffff; font-size: 24px; font-weight: bold; text-decoration: none; }
        .content { padding: 40px 30px; text-align: center; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #111827; }
        .text { color: #4b5563; margin-bottom: 24px; font-size: 16px; }
        .code-container { background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 30px 0; border: 2px dashed #e5e7eb; }
        .code { font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000000; }
        .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; }
        .button { display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="logo">Portyo</span>
        </div>
        <div class="content">
            <h1 class="title">Verify your email address</h1>
            <p class="text">Hi ${fullname},</p>
            <p class="text">Welcome to Portyo! To complete your registration and verify your account, please enter the code below:</p>
            
            <div class="code-container">
                <div class="code">${code}</div>
            </div>
            
            <p class="text">This code will expire in 15 minutes.</p>
            <p class="text">If you didn't create an account with Portyo, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Portyo. All rights reserved.
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: '"Portyo" <no-reply@portyo.me>', // Update with actual sender
            to: email,
            subject: 'Verify your Portyo account',
            html: html,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Message sent: %s", info.messageId);
            return info;
        } catch (error) {
            console.error("Error sending email:", error);
            // Don't throw here to prevent blocking the signup flow if email fails, 
            // but in a strict verification flow, maybe we should.
            // For now just log it.
        }
    }
}
