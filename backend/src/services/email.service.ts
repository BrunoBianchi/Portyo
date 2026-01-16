import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { env } from '../config/env';

// Initialize Mailgun client
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
    username: 'api',
    key: env.MAILGUN_API_SECRET || '',
});

interface SendPaymentLinkEmailParams {
    to: string;
    companyName: string;
    slotName: string;
    price: number;
    duration: number;
    paymentLink: string;
    expiresAt: Date;
}

export async function sendPaymentLinkEmail(params: SendPaymentLinkEmailParams): Promise<void> {
    const { to, companyName, slotName, price, duration, paymentLink, expiresAt } = params;

    // App base URL
    const APP_URL = 'https://portyo.me';
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Payment</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.5; color: #1f2937; margin: 0; padding: 0; background-color: #ffffff; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { margin-bottom: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; }
        .logo { font-size: 24px; font-weight: bold; color: #000000; text-decoration: none; letter-spacing: -0.5px; }
        .h1 { font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 24px; }
        .text { font-size: 16px; color: #374151; margin: 0 0 16px; }
        .button { display: inline-block; padding: 14px 32px; background-color: #D7F000; color: #000000; text-decoration: none; font-weight: 700; border-radius: 12px; margin: 24px 0; }
        .details { background-color: #f9fafb; padding: 24px; border-radius: 12px; margin: 24px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-size: 14px; color: #6b7280; }
        .detail-value { font-size: 14px; font-weight: 600; color: #1f2937; }
        .price { font-size: 20px; font-weight: 700; color: #111827; }
        .subtext { font-size: 14px; color: #6b7280; margin-top: 24px; }
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
        
        <h1 class="h1">Complete your payment</h1>
        
        <p class="text">Hi ${companyName},</p>
        
        <p class="text">Your advertising proposal has been accepted! Complete your payment to activate your campaign.</p>
        
        <div class="details">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Slot</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; font-weight: 600; color: #1f2937;">${slotName}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Duration</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; font-weight: 600; color: #1f2937;">${duration} days</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0;">
                        <span style="font-size: 14px; color: #6b7280;">Total</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                        <span style="font-size: 20px; font-weight: 700; color: #111827;">$${price.toFixed(2)}</span>
                    </td>
                </tr>
            </table>
        </div>
        
        <a href="${paymentLink}" class="button">Pay Now</a>
        
        <p class="subtext">This link expires on ${expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${expiresAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.</p>
        
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

    await mg.messages.create(env.MAILGUN_DOMAIN || '', {
        from: env.MAILGUN_FROM_EMAIL || 'Portyo Marketing <no-reply@portyo.me>',
        to: [to],
        subject: `Payment Link for ${slotName} - Advertising Proposal Accepted`,
        html: htmlContent,
    });
}
