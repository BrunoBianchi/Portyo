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

// Shared email styles matching Portyo brand
const emailStyles = {
    wrapper: 'margin:0; padding:0; background-color:#fef9f3; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
    container: 'max-width:560px; margin:0 auto; padding:40px 20px;',
    card: 'background:white; border-radius:24px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);',
    headerPending: 'background:linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding:40px 32px; text-align:center;',
    headerConfirmed: 'background:linear-gradient(135deg, #059669 0%, #10b981 100%); padding:40px 32px; text-align:center;',
    headerTitle: 'margin:0; color:white; font-size:26px; font-weight:700; letter-spacing:-0.5px;',
    content: 'padding:32px;',
    greeting: 'color:#374151; font-size:16px; margin:0 0 20px; line-height:1.6;',
    detailsCard: 'background:#fef9f3; border-radius:16px; padding:24px; margin:24px 0;',
    detailRow: 'display:flex; align-items:center; margin-bottom:16px;',
    detailRowLast: 'display:flex; align-items:center;',
    detailIcon: 'width:44px; height:44px; background:white; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-right:16px; box-shadow:0 2px 8px rgba(0,0,0,0.06);',
    detailLabel: 'margin:0; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600;',
    detailValue: 'margin:4px 0 0; color:#111827; font-size:17px; font-weight:700;',
    button: 'display:inline-block; background:linear-gradient(135deg, #059669 0%, #10b981 100%); color:white; text-decoration:none; padding:16px 48px; border-radius:14px; font-weight:700; font-size:16px; box-shadow:0 4px 14px rgba(16,185,129,0.35);',
    buttonSecondary: 'display:inline-block; background:#1e3a5f; color:white; text-decoration:none; padding:16px 48px; border-radius:14px; font-weight:700; font-size:16px; box-shadow:0 4px 14px rgba(30,58,95,0.25);',
    link: 'color:#1e3a5f; font-weight:600; text-decoration:underline;',
    footer: 'color:#9ca3af; font-size:12px; text-align:center; margin-top:24px;',
    footerLink: 'color:#6b7280; text-decoration:none;',
    divider: 'border:none; border-top:1px solid #e5e7eb; margin:24px 0;',
    muted: 'color:#9ca3af; font-size:13px; text-align:center; margin:0;',
};

/**
 * Send booking confirmation email with confirm/cancel links
 */
export const sendBookingConfirmationEmail = async (data: BookingEmailData) => {
    const { customerName, customerEmail, bookingDate, token, bioName } = data;
    
    const managementLink = `${APP_URL}/bookings/manage?token=${token}`;
    const confirmLink = `${APP_URL}/bookings/manage?token=${token}`;
    const formattedDate = format(new Date(bookingDate), 'EEEE, MMMM do, yyyy');
    const formattedTime = format(new Date(bookingDate), 'h:mm a');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Booking</title>
    </head>
    <body style="${emailStyles.wrapper}">
        <div style="${emailStyles.container}">
            <div style="${emailStyles.card}">
                <!-- Header -->
                <div style="${emailStyles.headerPending}">
                    <h1 style="${emailStyles.headerTitle}">Confirm Your Booking</h1>
                </div>
                
                <!-- Content -->
                <div style="${emailStyles.content}">
                    <p style="${emailStyles.greeting}">
                        Hi <strong>${customerName}</strong>,
                    </p>
                    
                    <p style="${emailStyles.greeting}">
                        You've requested a booking with <strong>${bioName}</strong>. Please confirm your appointment:
                    </p>
                    
                    <!-- Booking Details Card -->
                    <div style="${emailStyles.detailsCard}">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td style="padding-bottom:16px;">
                                    <table cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="width:44px; height:44px; background:white; border-radius:12px; text-align:center; vertical-align:middle; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                                                📅
                                            </td>
                                            <td style="padding-left:16px;">
                                                <p style="${emailStyles.detailLabel}">Date</p>
                                                <p style="${emailStyles.detailValue}">${formattedDate}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <table cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="width:44px; height:44px; background:white; border-radius:12px; text-align:center; vertical-align:middle; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                                                ⏰
                                            </td>
                                            <td style="padding-left:16px;">
                                                <p style="${emailStyles.detailLabel}">Time</p>
                                                <p style="${emailStyles.detailValue}">${formattedTime}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align:center; margin:32px 0;">
                        <a href="${confirmLink}" style="${emailStyles.button}">
                            Confirm Booking
                        </a>
                    </div>
                    
                    <p style="color:#6b7280; font-size:14px; text-align:center; margin:0 0 16px;">
                        Need to cancel or reschedule? <a href="${managementLink}" style="${emailStyles.link}">Manage your booking</a>
                    </p>
                    
                    <hr style="${emailStyles.divider}" />
                    
                    <p style="${emailStyles.muted}">
                        If you didn't request this booking, you can safely ignore this email.
                    </p>
                </div>
            </div>
            
            <p style="${emailStyles.footer}">
                Sent via <a href="https://portyo.me" style="${emailStyles.footerLink}">Portyo</a>
            </p>
        </div>
    </body>
    </html>
    `;

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

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed</title>
    </head>
    <body style="${emailStyles.wrapper}">
        <div style="${emailStyles.container}">
            <div style="${emailStyles.card}">
                <!-- Header -->
                <div style="${emailStyles.headerConfirmed}">
                    <div style="width:64px; height:64px; background:rgba(255,255,255,0.2); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
                        <span style="font-size:32px;">✓</span>
                    </div>
                    <h1 style="${emailStyles.headerTitle}">Booking Confirmed!</h1>
                </div>
                
                <!-- Content -->
                <div style="${emailStyles.content}">
                    <p style="${emailStyles.greeting}">
                        Hi <strong>${customerName}</strong>,
                    </p>
                    
                    <p style="${emailStyles.greeting}">
                        Great news! Your booking with <strong>${bioName}</strong> has been confirmed.
                    </p>
                    
                    <!-- Booking Details Card -->
                    <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:16px; padding:24px; margin:24px 0;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td style="padding-bottom:16px;">
                                    <table cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="width:44px; height:44px; background:white; border-radius:12px; text-align:center; vertical-align:middle;">
                                                📅
                                            </td>
                                            <td style="padding-left:16px;">
                                                <p style="${emailStyles.detailLabel}">Date</p>
                                                <p style="${emailStyles.detailValue}">${formattedDate}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <table cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="width:44px; height:44px; background:white; border-radius:12px; text-align:center; vertical-align:middle;">
                                                ⏰
                                            </td>
                                            <td style="padding-left:16px;">
                                                <p style="${emailStyles.detailLabel}">Time</p>
                                                <p style="${emailStyles.detailValue}">${formattedTime}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="color:#6b7280; font-size:14px; text-align:center; margin:0;">
                        Need to reschedule or cancel? <a href="${managementLink}" style="${emailStyles.link}">Manage your booking</a>
                    </p>
                </div>
            </div>
            
            <p style="${emailStyles.footer}">
                Sent via <a href="https://portyo.me" style="${emailStyles.footerLink}">Portyo</a>
            </p>
        </div>
    </body>
    </html>
    `;

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
