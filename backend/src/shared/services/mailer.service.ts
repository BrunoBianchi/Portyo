import { format } from 'date-fns';
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

// Dev mode logger
const logDevEmail = (to: string, subject: string, link: string) => {
    console.log('\n' + '='.repeat(60));
    console.log('[MAILER DEV MODE] Email would be sent:');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Management Link: ${link}`);
    console.log('='.repeat(60) + '\n');
};

interface BookingEmailData {
    customerName: string;
    customerEmail: string;
    bookingDate: Date;
    token: string;
    bioName: string;
}

// Minimalist email template helper
const getMinimalistEmailTemplate = (content: string, footerLinks = true) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portyo</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.5; color: #1f2937; margin: 0; padding: 0; background-color: #ffffff; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { margin-bottom: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; }
        .logo { font-size: 24px; font-weight: bold; color: #000000; text-decoration: none; letter-spacing: -0.5px; }
        .h1 { font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 24px; }
        .text { font-size: 16px; color: #374151; margin: 0 0 16px; }
        .button { display: inline-block; padding: 14px 32px; background-color: #D7F000; color: #000000; text-decoration: none; font-weight: 700; border-radius: 12px; margin: 24px 0; }
        .button-secondary { display: inline-block; padding: 14px 32px; background-color: #f3f4f6; color: #1f2937; text-decoration: none; font-weight: 700; border-radius: 12px; margin: 8px 0; }
        .details { background-color: #f9fafb; padding: 24px; border-radius: 12px; margin: 24px 0; }
        .subtext { font-size: 14px; color: #6b7280; margin-top: 24px; }
        .footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; }
        .footer-links { margin-bottom: 12px; }
        .footer-link { color: #6b7280; text-decoration: underline; margin: 0 8px; }
        .link { color: #1f2937; font-weight: 600; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <span class="logo">Portyo</span>
        </div>
        
        ${content}

        ${footerLinks ? `
        <div class="footer">
            <div class="footer-links">
                <a href="${APP_URL}/help" class="footer-link">Help</a>
                <a href="${APP_URL}/terms" class="footer-link">Terms</a>
                <a href="${APP_URL}/privacy" class="footer-link">Privacy</a>
            </div>
            &copy; ${new Date().getFullYear()} Portyo. All rights reserved.
        </div>
        ` : `
        <div class="footer">
            &copy; ${new Date().getFullYear()} Portyo. All rights reserved.
        </div>
        `}
    </div>
</body>
</html>
`;

/**
 * Send booking confirmation email with confirm/cancel links
 */
export const sendBookingConfirmationEmail = async (data: BookingEmailData) => {
    const { customerName, customerEmail, bookingDate, token, bioName } = data;
    
    const managementLink = `${APP_URL}/bookings/manage?token=${token}`;
    const confirmLink = `${APP_URL}/bookings/manage?token=${token}`;
    const formattedDate = format(new Date(bookingDate), 'EEEE, MMMM do, yyyy');
    const formattedTime = format(new Date(bookingDate), 'h:mm a');

    const content = `
        <h1 class="h1">Confirm your booking</h1>
        
        <p class="text">Hi ${customerName},</p>
        
        <p class="text">You've requested a booking with <strong>${bioName}</strong>. Please confirm your appointment.</p>
        
        <div class="details">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Date</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; font-weight: 600; color: #1f2937;">${formattedDate}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="font-size: 14px; color: #6b7280;">Time</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                        <span style="font-size: 14px; font-weight: 600; color: #1f2937;">${formattedTime}</span>
                    </td>
                </tr>
            </table>
        </div>
        
        <a href="${confirmLink}" class="button">Confirm Booking</a>
        
        <p class="subtext">Need to cancel or reschedule? <a href="${managementLink}" class="link">Manage your booking</a></p>
        
        <p class="text" style="margin-top: 32px;">
            Thanks,<br>
            Portyo Team
        </p>
    `;

    const html = getMinimalistEmailTemplate(content);

    // Dev mode - just log to console
    if (!mg) {
        logDevEmail(customerEmail, `Confirm your booking with ${bioName}`, managementLink);
        return null;
    }

    try {
        const result = await mg.messages.create(env.MAILGUN_DOMAIN, {
            from: env.MAILGUN_FROM_EMAIL,
            to: [customerEmail],
            subject: `Confirm your booking with ${bioName}`,
            html
        });
        
        console.log('[MAILER] Confirmation email sent via Mailgun:', result.id);
        return result;
    } catch (error) {
        console.error('[MAILER] Failed to send confirmation email:', error);
        return null;
    }
};

/**
 * Send booking confirmed notification to customer
 */
export const sendBookingConfirmedEmail = async (data: BookingEmailData) => {
    const { customerName, customerEmail, bookingDate, token, bioName } = data;
    
    const managementLink = `${APP_URL}/bookings/manage?token=${token}`;
    const formattedDate = format(new Date(bookingDate), 'EEEE, MMMM do, yyyy');
    const formattedTime = format(new Date(bookingDate), 'h:mm a');

    const content = `
        <h1 class="h1">Booking confirmed!</h1>
        
        <p class="text">Hi ${customerName},</p>
        
        <p class="text">Great news! Your booking with <strong>${bioName}</strong> has been confirmed.</p>
        
        <div class="details">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Date</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; font-weight: 600; color: #1f2937;">${formattedDate}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="font-size: 14px; color: #6b7280;">Time</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                        <span style="font-size: 14px; font-weight: 600; color: #1f2937;">${formattedTime}</span>
                    </td>
                </tr>
            </table>
        </div>
        
        <p class="subtext">Need to reschedule or cancel? <a href="${managementLink}" class="link">Manage your booking</a></p>
        
        <p class="text" style="margin-top: 32px;">
            Thanks,<br>
            Portyo Team
        </p>
    `;

    const html = getMinimalistEmailTemplate(content);

    // Dev mode - just log to console
    if (!mg) {
        logDevEmail(customerEmail, `Booking confirmed with ${bioName}`, managementLink);
        return null;
    }

    try {
        const result = await mg.messages.create(env.MAILGUN_DOMAIN, {
            from: env.MAILGUN_FROM_EMAIL,
            to: [customerEmail],
            subject: `Booking confirmed with ${bioName} ✓`,
            html
        });
        
        console.log('[MAILER] Confirmed email sent via Mailgun:', result.id);
        return result;
    } catch (error) {
        console.error('[MAILER] Failed to send confirmed email:', error);
        return null;
    }
};
