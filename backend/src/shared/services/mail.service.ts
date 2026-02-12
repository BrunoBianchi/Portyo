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

const FOOTER_HTML = `
        <div class="footer">
            <div style="margin-bottom:12px;">
                <a href="${APP_URL}/terms-of-service" style="color:#6b7280;text-decoration:underline;margin:0 8px;">Terms of Service</a>
                <a href="${APP_URL}/privacy-policy" style="color:#6b7280;text-decoration:underline;margin:0 8px;">Privacy Policy</a>
                <a href="${APP_URL}/" style="color:#6b7280;text-decoration:underline;margin:0 8px;">Home</a>
            </div>
            &copy; ${new Date().getFullYear()} Portyo. All rights reserved.
        </div>
`;

const DEFAULT_FROM = env.MAILGUN_FROM_EMAIL || "no-reply@portyo.me";
const formatFrom = (value?: string) => {
    const from = value || DEFAULT_FROM;
    return from.includes("<") ? from : `Portyo <${from}>`;
};

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

        ${FOOTER_HTML}
    </div>
</body>
</html>
        `;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                const msg = await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: formatFrom(env.MAILGUN_FROM_EMAIL),
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
            from: formatFrom(env.MAILGUN_FROM_EMAIL),
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

        ${FOOTER_HTML}
    </div>
</body>
</html>
        `;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                const msg = await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: formatFrom(env.MAILGUN_FROM_EMAIL),
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
            from: formatFrom(env.MAILGUN_FROM_EMAIL),
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

    static async sendOnboardingNudgeEmail(email: string, fullname: string) {
        const firstName = fullname.split(' ')[0] || 'there';
        const ctaUrl = `${APP_URL}/onboarding`;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your bio is waiting</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background-color: #ffffff; }
        .wrapper { max-width: 640px; margin: 0 auto; padding: 48px 24px; }
        .header { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
        .logo { font-size: 22px; font-weight: 700; letter-spacing: -0.4px; }
        .title { font-size: 26px; font-weight: 700; margin: 0 0 12px; }
        .text { font-size: 16px; color: #374151; margin: 0 0 14px; }
        .card { border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; background: #F9FAFB; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 22px; background-color: #ffffff; color: #111111; text-decoration: none; font-weight: 600; border-radius: 12px; border: 1px solid #111111; }
        .button:hover { background-color: #f3f4f6; }
        .muted { font-size: 12px; color: #9CA3AF; margin-top: 28px; }
        .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #F3F4F6; font-size: 12px; color: #9CA3AF; }
        .footer a { color: #6B7280; text-decoration: underline; margin-right: 12px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <span class="logo">Portyo</span>
        </div>

        <h1 class="title">We’re a little sad we haven’t seen your bio yet.</h1>
        <p class="text">Hi ${firstName},</p>
        <p class="text">You created your Portyo account 12 hours ago, but your bio is still empty. That means you’re missing out on visitors, clicks, and opportunities you could already be getting.</p>

        <div class="card">
            <p class="text" style="margin:0;">Every hour without a bio is time you could be growing your audience.</p>
        </div>

        <p class="text">Take 2 minutes to publish your bio and start getting noticed.</p>
        <a href="${ctaUrl}" class="button">Create my bio</a>

        <p class="muted">If you already finished it, you can ignore this email.</p>

        ${FOOTER_HTML}
    </div>
</body>
</html>
        `;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                const msg = await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: formatFrom(env.MAILGUN_FROM_EMAIL),
                    to: [email],
                    subject: "Your bio is still empty",
                    html: html
                });
                console.log("Onboarding nudge sent via Mailgun:", msg);
                return msg;
            } catch (error) {
                console.error("Error sending onboarding nudge via Mailgun:", error);
            }
        }

        const mailOptions = {
            from: formatFrom(env.MAILGUN_FROM_EMAIL),
            to: email,
            subject: 'Your bio is still empty',
            html: html,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Onboarding nudge sent:", info.messageId);
            return info;
        } catch (error) {
            console.error("Error sending onboarding nudge:", error);
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

        ${FOOTER_HTML}
    </div>
</body>
</html>
        `;

        const subject = `Proposal Sent for ${slotName}`;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                return await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: formatFrom(env.MAILGUN_FROM_EMAIL),
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
                from: formatFrom(env.MAILGUN_FROM_EMAIL),
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

        ${FOOTER_HTML}
    </div>
</body>
</html>
        `;

        const subject = `Proposal Accepted: ${slotName}`;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                return await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: formatFrom(env.MAILGUN_FROM_EMAIL),
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
                from: formatFrom(env.MAILGUN_FROM_EMAIL),
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

        ${FOOTER_HTML}
    </div>
</body>
</html>
        `;

        const subject = `Your Access Code for ${slotName}`;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                return await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: formatFrom(env.MAILGUN_FROM_EMAIL),
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
    static async sendPlanExpirationEmail(email: string, fullname: string, daysRemaining: number, isTrial: boolean, isExpired: boolean = false) {
        const title = isExpired
            ? (isTrial ? "Your trial period has ended" : "Your subscription has expired")
            : (isTrial ? "Your free trial is ending soon" : "Your subscription is ending soon");

        const subject = isExpired
            ? (isTrial ? "Your Portyo trial has ended" : "Your Portyo subscription has expired")
            : (isTrial ? `${daysRemaining} day(s) left in your trial` : `Your subscription renews in ${daysRemaining} day(s)`);

        const messageBody = isExpired
            ? (isTrial
                ? `<p class="text">Your trial period has ended. Some premium customization and visibility features are now unavailable on your page.</p>
                   <p class="text">Keep your growth moving. Upgrade now to restore full access and continue building momentum.</p>`
                : `<p class="text">Your subscription expired today. Renew now to avoid interruptions and keep your profile and analytics active.</p>`)
            : (isTrial
                ? `<p class="text">You have <strong>${daysRemaining} day(s)</strong> left in your free trial.</p>
                   <p class="text">After that, premium themes, advanced analytics, and growth tools will be limited.</p>
                   <p class="text">Upgrade now to keep everything running without interruption.</p>`
                : `<p class="text">Your subscription renews in ${daysRemaining} day(s). Please confirm your payment details to ensure uninterrupted service.</p>`);

        const ctaText = isExpired ? "Reactivate now" : (isTrial ? "Upgrade now" : "Manage subscription");
        const ctaUrl = `${APP_URL}/dashboard/settings/billing`;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #0f172a; margin: 0; padding: 0; background: #f1f5f9; }
        .wrapper { max-width: 640px; margin: 0 auto; padding: 36px 18px; }
        .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); overflow: hidden; }
        .top { background: linear-gradient(135deg, #0f172a, #1e293b); color: #ffffff; padding: 28px 28px 22px; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.4px; margin: 0; }
        .label { display: inline-block; margin-top: 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #cbd5e1; }
        .content { padding: 28px; }
        .h1 { font-size: 28px; line-height: 1.2; font-weight: 800; color: #0f172a; margin: 0 0 20px; }
        .text { font-size: 16px; color: #334155; margin: 0 0 14px; }
        .highlight { margin: 22px 0; padding: 14px 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 14px; color: #475569; }
        .button { display: inline-block; padding: 14px 26px; background: #111827; color: #ffffff !important; text-decoration: none; font-weight: 700; border-radius: 10px; margin: 18px 0 8px; }
        .button:hover { background: #1f2937; }
        .signature { margin-top: 18px; font-size: 15px; color: #475569; }
        .footer-wrap { padding: 0 28px 28px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="top">
                <p class="logo">Portyo</p>
                <span class="label">Billing update</span>
            </div>

            <div class="content">
                <h1 class="h1">${title}</h1>

                <p class="text">Hi ${fullname.split(' ')[0]},</p>

                ${messageBody}

                <div class="highlight">
                    Keep your account active to maintain access to your tools, audience visibility, and performance insights.
                </div>

                <a href="${ctaUrl}" class="button">${ctaText}</a>

                <p class="signature">Thanks,<br>Portyo Team</p>
            </div>

            <div class="footer-wrap">
                ${FOOTER_HTML}
            </div>
        </div>
    </div>
</body>
</html>
        `;

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                return await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: formatFrom(env.MAILGUN_FROM_EMAIL),
                    to: [email],
                    subject,
                    html
                });
            } catch (error) {
                console.error("Error sending expiration email via Mailgun:", error);
            }
        }

        try {
            return await transporter.sendMail({
                from: formatFrom(env.MAILGUN_FROM_EMAIL),
                to: email,
                subject,
                html
            });
        } catch (error) {
            console.error("Error sending expiration email:", error);
        }
    }

    /**
     * Send a newsletter email. Uses Mailgun primary with SMTP fallback.
     * The HTML is pre-built from newsletter templates.
     */
    static async sendNewsletter(email: string, subject: string, html: string) {
        const from = formatFrom("Portyo Newsletter <newsletter@portyo.me>");

        if (mg && env.MAILGUN_DOMAIN) {
            try {
                const msg = await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from,
                    to: [email],
                    subject,
                    html,
                    "o:tag": ["newsletter"],
                });
                return msg;
            } catch (error) {
                console.error("Error sending newsletter via Mailgun:", error);
            }
        }

        try {
            return await transporter.sendMail({
                from,
                to: email,
                subject,
                html,
            });
        } catch (error) {
            console.error("Error sending newsletter via SMTP:", error);
            throw error;
        }
    }
}
