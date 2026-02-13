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
    <div style="margin-top:28px; padding-top:20px; border-top:1px solid #e2e8f0; text-align:center;">
        <div style="margin-bottom:12px; font-size:12px; line-height:1.6;">
            <a href="${APP_URL}/terms-of-service" style="color:#64748b;text-decoration:underline;margin:0 8px;">Terms of Service</a>
            <a href="${APP_URL}/privacy-policy" style="color:#64748b;text-decoration:underline;margin:0 8px;">Privacy Policy</a>
            <a href="${APP_URL}/" style="color:#64748b;text-decoration:underline;margin:0 8px;">Home</a>
        </div>
        <div style="font-size:12px; color:#94a3b8;">&copy; ${new Date().getFullYear()} Portyo. All rights reserved.</div>
    </div>
`;

const DEFAULT_FROM = env.MAILGUN_FROM_EMAIL || "no-reply@portyo.me";
const formatFrom = (value?: string) => {
    const from = value || DEFAULT_FROM;
    return from.includes("<") ? from : `Portyo <${from}>`;
};

const escapeHtml = (value: unknown): string =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const getFirstName = (fullname: string): string => {
    const name = (fullname || "").trim();
    if (!name) return "there";
    return name.split(/\s+/)[0] || "there";
};

const renderBrandedEmail = (params: {
    title: string;
    preheader?: string;
    tag?: string;
    greeting?: string;
    intro?: string;
    bodyHtml?: string;
    highlight?: string;
    ctaText?: string;
    ctaUrl?: string;
    secondaryCtaText?: string;
    secondaryCtaUrl?: string;
    closing?: string;
}) => {
    const {
        title,
        preheader,
        tag,
        greeting,
        intro,
        bodyHtml,
        highlight,
        ctaText,
        ctaUrl,
        secondaryCtaText,
        secondaryCtaUrl,
        closing,
    } = params;

    const hiddenPreheader = preheader || title;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        body { margin:0; padding:0; background:#f1f5f9; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; color:#0f172a; }
        .wrapper { max-width:640px; margin:0 auto; padding:32px 16px; }
        .card { background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; overflow:hidden; box-shadow:0 10px 28px rgba(15,23,42,0.08); }
        .header { background:linear-gradient(135deg,#020617 0%,#0f172a 45%,#1e293b 100%); padding:24px 24px 20px; color:#fff; }
        .brand { margin:0; font-size:24px; font-weight:800; letter-spacing:-0.4px; }
        .tag { display:inline-block; margin-top:10px; padding:5px 10px; border-radius:999px; background:rgba(215,240,0,0.14); color:#d7f000; font-size:11px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; }
        .content { padding:26px 24px 22px; }
        .title { margin:0 0 16px; font-size:34px; line-height:1.1; letter-spacing:-0.03em; color:#0f172a; font-weight:900; }
        .text { margin:0 0 13px; font-size:16px; line-height:1.65; color:#334155; }
        .highlight { margin:18px 0 6px; padding:14px 15px; border-radius:12px; border:1px solid #dbeafe; background:#f8fbff; color:#475569; font-size:14px; line-height:1.55; }
        .cta { display:inline-block; margin-top:18px; padding:14px 24px; border-radius:12px; text-decoration:none; font-size:15px; font-weight:800; }
        .cta-primary { background:#111827; color:#ffffff !important; }
        .cta-secondary { background:#f8fafc; color:#111827 !important; border:1px solid #d1d5db; margin-left:10px; }
        .closing { margin-top:18px; color:#475569; font-size:15px; line-height:1.6; }
        .body-content p { margin:0 0 13px; font-size:16px; line-height:1.65; color:#334155; }
    </style>
</head>
<body>
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(hiddenPreheader)}</div>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                <p class="brand">Portyo</p>
                ${tag ? `<span class="tag">${escapeHtml(tag)}</span>` : ""}
            </div>
            <div class="content">
                <h1 class="title">${escapeHtml(title)}</h1>
                ${greeting ? `<p class="text">${escapeHtml(greeting)}</p>` : ""}
                ${intro ? `<p class="text">${intro}</p>` : ""}
                ${bodyHtml ? `<div class="body-content">${bodyHtml}</div>` : ""}
                ${highlight ? `<div class="highlight">${highlight}</div>` : ""}
                ${ctaText && ctaUrl ? `<a href="${ctaUrl}" class="cta cta-primary">${escapeHtml(ctaText)}</a>` : ""}
                ${secondaryCtaText && secondaryCtaUrl ? `<a href="${secondaryCtaUrl}" class="cta cta-secondary">${escapeHtml(secondaryCtaText)}</a>` : ""}
                ${closing ? `<p class="closing">${closing}</p>` : ""}
                ${FOOTER_HTML}
            </div>
        </div>
    </div>
</body>
</html>
    `;
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
        const firstName = getFirstName(fullname);
        const html = renderBrandedEmail({
            title: "Your verification code",
            preheader: "Use this code to verify your Portyo account",
            tag: "Security",
            greeting: `Hi ${firstName},`,
            intro: "Copy and paste this code to verify your email address:",
            bodyHtml: `<div style="margin:16px 0 8px; padding:16px; text-align:center; font-size:34px; font-weight:900; letter-spacing:8px; color:#020617; border-radius:12px; border:1px solid #e2e8f0; background:#f8fafc;">${escapeHtml(code)}</div>`,
            highlight: "If you didn’t request this code, you can safely ignore this email.",
            closing: "Thanks,<br>Portyo Team",
        });

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
        const firstName = getFirstName(fullname);
        const html = renderBrandedEmail({
            title: "Reset your password",
            preheader: "Secure your account by creating a new password",
            tag: "Account",
            greeting: `Hi ${firstName},`,
            intro: "We received a request to reset your password. Click below to create a new password:",
            ctaText: "Reset password",
            ctaUrl: resetUrl,
            bodyHtml: `<p style="margin:14px 0 0; font-size:13px; color:#64748b; word-break:break-all;">If the button doesn’t work, copy and paste this link:<br><a href="${resetUrl}" style="color:#0f172a; text-decoration:underline;">${resetUrl}</a></p>`,
            highlight: "This link expires in 1 hour. If you didn’t request a reset, you can ignore this email.",
            closing: "Thanks,<br>Portyo Team",
        });

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
        const firstName = getFirstName(fullname);
        const ctaUrl = `${APP_URL}/onboarding`;
        const html = renderBrandedEmail({
            title: "Your bio is waiting",
            preheader: "Publish your bio and start getting clicks",
            tag: "Onboarding",
            greeting: `Hi ${firstName},`,
            intro: "You created your Portyo account recently, but your bio is still empty. That means missed visitors, clicks, and opportunities.",
            highlight: "Take 2 minutes to publish your bio and start getting noticed.",
            ctaText: "Create my bio",
            ctaUrl,
            closing: "If you already finished it, you can ignore this email.<br><br>— Portyo Team",
        });

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
        const html = renderBrandedEmail({
            title: "Proposal sent successfully",
            preheader: `Your proposal for ${slotName} was delivered`,
            tag: "Sponsorship",
            intro: `Your proposal for <strong>${escapeHtml(slotName)}</strong> has been sent successfully.`,
            bodyHtml: `
                <div style="margin:14px 0 4px; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
                    <div style="display:flex; justify-content:space-between; gap:16px; padding:12px 14px; border-bottom:1px solid #eef2f7;"><span style="color:#64748b; font-weight:600;">Price offered</span><span style="color:#0f172a; font-weight:800;">$${escapeHtml(proposal?.proposedPrice)}</span></div>
                    <div style="display:flex; justify-content:space-between; gap:16px; padding:12px 14px; border-bottom:1px solid #eef2f7;"><span style="color:#64748b; font-weight:600;">Title</span><span style="color:#0f172a; font-weight:700; text-align:right;">${escapeHtml(proposal?.content?.title)}</span></div>
                    <div style="display:flex; justify-content:space-between; gap:16px; padding:12px 14px;"><span style="color:#64748b; font-weight:600;">Link</span><span style="color:#0f172a; font-weight:700; text-align:right; word-break:break-all;">${escapeHtml(proposal?.content?.linkUrl)}</span></div>
                </div>
            `,
            highlight: "We’ll notify you as soon as the owner reviews your proposal.",
            closing: "Thanks,<br>Portyo Team",
        });

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
        const html = renderBrandedEmail({
            title: "Proposal accepted!",
            preheader: `Complete payment to activate your ${slotName} campaign`,
            tag: "Sponsorship",
            intro: `Great news! Your proposal for <strong>${escapeHtml(slotName)}</strong> has been accepted.`,
            highlight: `To activate your ad, complete payment of <strong>$${escapeHtml(proposal?.proposedPrice)}</strong>.`,
            ctaText: "Pay now",
            ctaUrl: paymentLink,
            secondaryCtaText: "Edit proposal",
            secondaryCtaUrl: editLink,
            closing: "Thanks,<br>Portyo Team",
        });

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
        const html = renderBrandedEmail({
            title: "Verify your identity",
            preheader: `Your access code for ${slotName}`,
            tag: "Security",
            intro: `Use the code below to access your ad settings for <strong>${escapeHtml(slotName)}</strong>:`,
            bodyHtml: `<div style="margin:16px 0 8px; padding:16px; text-align:center; font-size:34px; font-weight:900; letter-spacing:8px; color:#020617; border-radius:12px; border:1px solid #e2e8f0; background:#f8fafc;">${escapeHtml(code)}</div>`,
            highlight: "This code expires in 15 minutes.",
            closing: "Thanks,<br>Portyo Team",
        });

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
                from: formatFrom(env.MAILGUN_FROM_EMAIL),
                to: email,
                subject,
                html
            });
        } catch (error) {
            console.error("Error sending access code email:", error);
        }
    }
    static async sendPlanExpirationEmail(email: string, fullname: string, daysRemaining: number, isTrial: boolean, isExpired: boolean = false) {
        const firstName = getFirstName(fullname);
        const title = isExpired
            ? (isTrial ? "Your trial period has ended" : "Your subscription has expired")
            : (isTrial ? "Your free trial is ending soon" : "Your subscription is ending soon");

        const subject = isExpired
            ? (isTrial ? "Your Portyo trial has ended" : "Your Portyo subscription has expired")
            : (isTrial ? `${daysRemaining} day(s) left in your trial` : `Your subscription renews in ${daysRemaining} day(s)`);

        const messageBody = isExpired
            ? (isTrial
                     ? `<p>Your trial period has ended. Some premium customization and visibility features are now unavailable on your page.</p>
                         <p>Keep your growth moving. Upgrade now to restore full access and continue building momentum.</p>`
                     : `<p>Your subscription expired today. Renew now to avoid interruptions and keep your profile and analytics active.</p>`)
            : (isTrial
                     ? `<p>You have <strong>${daysRemaining} day(s)</strong> left in your free trial.</p>
                         <p>After the trial ends, your subscription will be charged automatically.</p>
                         <p>You can cancel at any time before the billing date from your billing settings.</p>`
                     : `<p>Your subscription renews in ${daysRemaining} day(s). Please confirm your payment details to ensure uninterrupted service.</p>`);

        const ctaText = isExpired ? "Reactivate now" : (isTrial ? "Upgrade now" : "Manage subscription");
        const ctaUrl = `${APP_URL}/dashboard/settings/billing`;

        const html = renderBrandedEmail({
            title,
            preheader: subject,
            tag: "Billing update",
            greeting: `Hi ${firstName},`,
            bodyHtml: messageBody,
            highlight: "Keep your account active to maintain access to your tools, audience visibility, and performance insights.",
            ctaText,
            ctaUrl,
            closing: "Thanks,<br>Portyo Team",
        });

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
