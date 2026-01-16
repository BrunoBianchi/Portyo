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

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Link - Portyo</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Portyo</h1>
                                    <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Marketing Proposal Accepted</p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Great News, ${companyName}!</h2>
                                    
                                    <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                        Your advertising proposal has been accepted! 🎉
                                    </p>
                                    
                                    <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Advertising Slot Details</h3>
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Slot Name:</td>
                                                <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${slotName}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Price:</td>
                                                <td style="color: #10b981; font-size: 18px; font-weight: 700; text-align: right;">$${price.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Duration:</td>
                                                <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${duration} days</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <p style="margin: 30px 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                        To complete your advertising campaign, please proceed with the payment using the secure link below:
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="${paymentLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                                    Complete Payment
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 14px; text-align: center;">
                                        This payment link expires on ${expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    
                                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                                    
                                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                        If you have any questions, please don't hesitate to reach out to us.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                        © ${new Date().getFullYear()} Portyo. All rights reserved.
                                    </p>
                                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                        This is an automated email. Please do not reply to this message.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
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
