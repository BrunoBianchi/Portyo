import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

// Mailgun client for sending emails
const mailgun = new Mailgun(FormData);
const mg = env.MAILGUN_API_SECRET ? mailgun.client({
    username: "api",
    key: env.MAILGUN_API_SECRET,
    url: env.MAILGUN_BASE_URL || "https://api.mailgun.net",
}) : null;

// App base URL
const APP_URL = env.FRONTEND_URL || 'http://localhost:5173';

// Create reusable transporter object using the default SMTP transport
const transporterConfig: any = {
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(env.SMTP_PORT || '587'),
    secure: env.SMTP_SECURE === 'true', // true for 465, false for other ports
};

if (env.SMTP_USER && env.SMTP_PASS) {
    transporterConfig.auth = {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    };
}

const transporter = nodemailer.createTransport(transporterConfig);

export class MailService {
    static async sendVerificationEmail(email: string, code: string, fullname: string) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your verification code</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.5; color: #1f2937; margin: 0; padding: 0; background-color: #ffffff; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { margin-bottom: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; }
        .logo { font-size: 24px; font-weight: bold; color: #000000; text-decoration: none; letter-spacing: -0.5px; }
        .h1 { font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 24px; }
        .text { font-size: 16px; color: #374151; margin: 0 0 16px; }
        .code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #000000; margin: 32px 0; }
        .subtext { font-size: 14px; color: #6b7280; margin-top: 32px; }
        .footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; }
        .footer-links { margin-bottom: 12px; }
        .footer-link { color: #6b7280; text-decoration: underline; margin: 0 8px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <span class="logo">Portyo</span>
        </div>
        
        <h1 class="h1">Your verification code</h1>
        
        <p class="text">Hi ${fullname.split(' ')[0]},</p>
        
        <p class="text">Copy and paste this code to verify your email address:</p>
        
        <div class="code">${code}</div>
        
        <p class="subtext">If you didn't request a verification code, please ignore this email.</p>
        
        <p class="text" style="margin-top: 32px;">
            Thanks,<br>
            Portyo Team
        </p>

        <div class="footer">
            <div class="footer-links">
                <a href="${APP_URL}/help" class="footer-link">Help</a>
                <a href="${APP_URL}/terms" class="footer-link">Terms</a>
                <a href="${APP_URL}/privacy" class="footer-link">Privacy</a>
            </div>
            &copy; ${new Date().getFullYear()} Portyo. All rights reserved.
        </div>
    </div>
</body>
</html>
        `;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                const msg = await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: env.MAILGUN_FROM_EMAIL || "Portyo <noreply@portyo.me>",
                    to: [email],
                    subject: "Verify your Portyo account",
                    html: html
                });
                console.log("Message sent via Mailgun:", msg);
                return msg;
            } catch (error) {
                 console.error("Error sending email via Mailgun:", error);
                 // Fallback to SMTP? Or just throw.
            }
        }

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

    static async sendPasswordResetEmail(email: string, resetToken: string, fullname: string) {
        const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.5; color: #1f2937; margin: 0; padding: 0; background-color: #ffffff; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { margin-bottom: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; }
        .logo { font-size: 24px; font-weight: bold; color: #000000; text-decoration: none; letter-spacing: -0.5px; }
        .h1 { font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 24px; }
        .text { font-size: 16px; color: #374151; margin: 0 0 16px; }
        .button { display: inline-block; padding: 14px 32px; background-color: #D7F000; color: #000000; text-decoration: none; font-weight: 700; border-radius: 12px; margin: 24px 0; }
        .button:hover { background-color: #c5dd00; }
        .subtext { font-size: 14px; color: #6b7280; margin-top: 32px; }
        .link-text { font-size: 12px; color: #9ca3af; word-break: break-all; margin-top: 16px; }
        .footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; }
        .footer-links { margin-bottom: 12px; }
        .footer-link { color: #6b7280; text-decoration: underline; margin: 0 8px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <span class="logo">Portyo</span>
        </div>
        
        <h1 class="h1">Reset your password</h1>
        
        <p class="text">Hi ${fullname.split(' ')[0]},</p>
        
        <p class="text">We received a request to reset your password. Click the button below to create a new password:</p>
        
        <a href="${resetUrl}" class="button">Reset Password</a>
        
        <p class="subtext">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        
        <p class="link-text">If the button doesn't work, copy and paste this link: ${resetUrl}</p>
        
        <p class="text" style="margin-top: 32px;">
            Thanks,<br>
            Portyo Team
        </p>

        <div class="footer">
            <div class="footer-links">
                <a href="${APP_URL}/help" class="footer-link">Help</a>
                <a href="${APP_URL}/terms" class="footer-link">Terms</a>
                <a href="${APP_URL}/privacy" class="footer-link">Privacy</a>
            </div>
            &copy; ${new Date().getFullYear()} Portyo. All rights reserved.
        </div>
    </div>
</body>
</html>
        `;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                const msg = await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: env.MAILGUN_FROM_EMAIL || "Portyo <noreply@portyo.me>",
                    to: [email],
                    subject: "Reset your Portyo password",
                    html: html
                });
                console.log("Password reset email sent via Mailgun:", msg);
                return msg;
            } catch (error) {
                 console.error("Error sending password reset email via Mailgun:", error);
            }
        }

        const mailOptions = {
            from: '"Portyo" <no-reply@portyo.me>',
            to: email,
            subject: 'Reset your Portyo password',
            html: html,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Password reset email sent: %s", info.messageId);
            return info;
        } catch (error) {
            console.error("Error sending password reset email:", error);
            throw error;
        }
    }

    static async sendProposalSentEmail(email: string, proposal: any, slotName: string) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposal Sent</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.5; color: #1f2937; margin: 0; padding: 0; background-color: #ffffff; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { margin-bottom: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; }
        .logo { font-size: 24px; font-weight: bold; color: #000000; text-decoration: none; letter-spacing: -0.5px; }
        .h1 { font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 24px; }
        .text { font-size: 16px; color: #374151; margin: 0 0 16px; }
        .footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; }
        .proposal-details { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .detail-label { font-weight: 600; color: #4b5563; }
        .detail-value { color: #1f2937; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <span class="logo">Portyo</span>
        </div>
        
        <h1 class="h1">Proposal Sent Successfully</h1>
        
        <p class="text">Your proposal for <strong>${slotName}</strong> has been sent successfully.</p>
        
        <div class="proposal-details">
            <div class="detail-row">
                <span class="detail-label">Price Offered:</span>
                <span class="detail-value">$${proposal.proposedPrice}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Title:</span>
                <span class="detail-value">${proposal.content.title}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Link:</span>
                <span class="detail-value">${proposal.content.linkUrl}</span>
            </div>
        </div>

        <p class="text">We'll notify you once the owner reviews your proposal.</p>
        
        <p class="text" style="margin-top: 32px;">
            Thanks,<br>
            Portyo Team
        </p>

        <div class="footer">
            &copy; ${new Date().getFullYear()} Portyo. All rights reserved.
        </div>
    </div>
</body>
</html>
        `;

        const subject = `Proposal Sent for ${slotName}`;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                return await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: env.MAILGUN_FROM_EMAIL || "Portyo <noreply@portyo.me>",
                    to: [email],
                    subject,
                    html
                });
            } catch (error) {
                console.error("Error sending proposal email via Mailgun:", error);
            }
        }

        try {
            return await transporter.sendMail({
                from: '"Portyo" <no-reply@portyo.me>',
                to: email,
                subject,
                html
            });
        } catch (error) {
            console.error("Error sending proposal email:", error);
        }
    }

    static async sendProposalAcceptedEmail(email: string, proposal: any, slotName: string, paymentLink: string, editLink: string) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposal Accepted</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.5; color: #1f2937; margin: 0; padding: 0; background-color: #ffffff; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { margin-bottom: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; }
        .logo { font-size: 24px; font-weight: bold; color: #000000; text-decoration: none; letter-spacing: -0.5px; }
        .h1 { font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 24px; }
        .text { font-size: 16px; color: #374151; margin: 0 0 16px; }
        .button { display: inline-block; padding: 14px 32px; background-color: #D7F000; color: #000000; text-decoration: none; font-weight: 700; border-radius: 12px; margin: 12px 0; width: 100%; box-sizing: border-box; text-align: center; }
        .button.secondary { background-color: #f3f4f6; color: #1f2937; }
        .button:hover { opacity: 0.9; }
        .footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <span class="logo">Portyo</span>
        </div>
        
        <h1 class="h1">Proposal Accepted!</h1>
        
        <p class="text">Great news! Your proposal for <strong>${slotName}</strong> has been accepted.</p>
        
        <p class="text">To activate your ad, please complete the payment:</p>
        
        <a href="${paymentLink}" class="button">Pay Now ($${proposal.proposedPrice})</a>
        
        <p class="text" style="margin-top: 24px;">You can also edit your ad content here:</p>
        
        <a href="${editLink}" class="button secondary">Edit Proposal Content</a>
        
        <p class="text" style="margin-top: 32px;">
            Thanks,<br>
            Portyo Team
        </p>

        <div class="footer">
            &copy; ${new Date().getFullYear()} Portyo. All rights reserved.
        </div>
    </div>
</body>
</html>
        `;

        const subject = `Proposal Accepted: ${slotName}`;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                return await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: env.MAILGUN_FROM_EMAIL || "Portyo <noreply@portyo.me>",
                    to: [email],
                    subject,
                    html
                });
            } catch (error) {
                console.error("Error sending proposal accepted email via Mailgun:", error);
            }
        }

        try {
            return await transporter.sendMail({
                from: '"Portyo" <no-reply@portyo.me>',
                to: email,
                subject,
                html
            });
        } catch (error) {
            console.error("Error sending proposal accepted email:", error);
        }
    }
    static async sendAccessCodeEmail(email: string, code: string, slotName: string) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Access Code</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.5; color: #1f2937; margin: 0; padding: 0; background-color: #ffffff; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { margin-bottom: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; }
        .logo { font-size: 24px; font-weight: bold; color: #000000; text-decoration: none; letter-spacing: -0.5px; }
        .h1 { font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 24px; }
        .text { font-size: 16px; color: #374151; margin: 0 0 16px; }
        .code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #000000; margin: 32px 0; text-align: center; background: #f9fafb; padding: 24px; border-radius: 12px; }
        .footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <span class="logo">Portyo</span>
        </div>
        
        <h1 class="h1">Verify your identity</h1>
        
        <p class="text">Use the code below to access your ad settings for <strong>${slotName}</strong>:</p>
        
        <div class="code">${code}</div>
        
        <p class="text">This code will expire in 15 minutes.</p>
        
        <p class="text" style="margin-top: 32px;">
            Thanks,<br>
            Portyo Team
        </p>

        <div class="footer">
            &copy; ${new Date().getFullYear()} Portyo. All rights reserved.
        </div>
    </div>
</body>
</html>
        `;

        const subject = `Your Access Code for ${slotName}`;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                return await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: env.MAILGUN_FROM_EMAIL || "Portyo <noreply@portyo.me>",
                    to: [email],
                    subject,
                    html
                });
            } catch (error) {
                console.error("Error sending access code email via Mailgun:", error);
            }
        }

        try {
            return await transporter.sendMail({
                from: '"Portyo" <no-reply@portyo.me>',
                to: email,
                subject,
                html
            });
        } catch (error) {
            console.error("Error sending access code email:", error);
        }
    }
}
