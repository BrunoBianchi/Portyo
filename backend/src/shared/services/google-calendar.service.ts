import axios from "axios";
import { AppDataSource } from "../../database/datasource";
import { IntegrationEntity } from "../../database/entity/integration-entity";
import { BioEntity } from "../../database/entity/bio-entity";
import { BookingEntity } from "../../database/entity/booking-entity";
import { addMinutes } from "date-fns";

const integrationRepository = AppDataSource.getRepository(IntegrationEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

const googleTokenUrl = "https://oauth2.googleapis.com/token";
const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";

import { env } from "../../config/env";

export const getGoogleCalendarAuthUrl = (bioId: string) => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${env.BACKEND_URL}/api/google-calendar/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent", // Force consent to ensure refresh token
    state: bioId 
  });
  return `${googleAuthUrl}?${params.toString()}`;
};

export const parseGoogleCalendarCallback = async (code: string, bioId: string) => {
  const response = await axios.post(
    googleTokenUrl,
    new URLSearchParams({
      code: code.trim(),
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${env.BACKEND_URL}/api/google-calendar/callback`,
      grant_type: "authorization_code",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token, refresh_token } = response.data;
  
  const bio = await bioRepository.findOne({ where: { id: bioId } });
  if (!bio) throw new Error("Bio not found");

  // Check if integration already exists
  let integration = await integrationRepository.findOne({
      where: { bio: { id: bioId }, name: "google-calendar" }
  });

  if (!integration) {
      integration = new IntegrationEntity();
      integration.name = "google-calendar";
      integration.provider = "google-calendar";
      integration.account_id = "primary"; // Default for calendar
      integration.bio = bio;
  }

  integration.accessToken = access_token;
  if (refresh_token) {
      integration.refreshToken = refresh_token;
  }

  await integrationRepository.save(integration);
  return integration;
};

const refreshAccessToken = async (integration: IntegrationEntity) => {
    try {
        if (!integration.refreshToken) {
            throw new Error("No refresh token available");
        }

        const response = await axios.post(
            googleTokenUrl,
            new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                refresh_token: integration.refreshToken,
                grant_type: "refresh_token",
            }),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        const { access_token, refresh_token } = response.data;
        
        integration.accessToken = access_token;
        if (refresh_token) {
            integration.refreshToken = refresh_token;
        }
        
        await integrationRepository.save(integration);
        return access_token;
    } catch (error: any) {
        console.error("Failed to refresh calendar token:", error);
        throw new Error("Failed to refresh access token");
    }
};

export const createGoogleCalendarEvent = async (bioId: string, booking: BookingEntity, durationMinutes: number = 30) => {
    // Find Integration using QueryBuilder or Relation
    const integration = await integrationRepository.findOne({
        where: { bio: { id: bioId }, name: "google-calendar" },
        relations: ['bio', 'bio.user']
    });

    if (!integration || !integration.accessToken) {

        return null;
    }

    const { accessToken } = integration;
    
    // Calculate End Time
    const startTime = new Date(booking.bookingDate);
    const endTime = addMinutes(startTime, durationMinutes);

    const eventDetails = {
        summary: `Booking for ${integration.bio.sufix || 'Portyo'} - ${booking.customerName}`,
        description: `Booking with ${booking.customerName} (${booking.customerEmail})\nPhone: ${booking.customerPhone || 'N/A'}\n\nManaged by Portyo.`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        attendees: [
            { email: booking.customerEmail },
            { email: integration.bio.user.email } // Add Bio Owner
        ],
        conferenceData: {
            createRequest: {
                requestId: booking.confirmationToken // meaningful random string
            }
        }
    };

    const attemptCreate = async (token: string) => {
        return await axios.post(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`,
            eventDetails,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
    };

    try {
        const response = await attemptCreate(accessToken);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {

            const newToken = await refreshAccessToken(integration);
            const response = await attemptCreate(newToken);
            return response.data;
        }
        console.error("Failed to create calendar event:", error.response?.data || error);
        throw error; // Rethrow or suppress? Better to log and suppress so booking doesn't fail?
        // User asked to "manage when happen", implying feature. If it fails, we should probably just log error but not fail the confirmation?
        // Let's log and return null.
        return null;
    }
};

export const deleteGoogleCalendarEvent = async (bioId: string, eventId: string) => {
    const integration = await integrationRepository.findOne({
        where: { bio: { id: bioId }, name: "google-calendar" }
    });

    if (!integration || !integration.accessToken) {

        return;
    }

    const attemptDelete = async (token: string) => {
        return await axios.delete(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
    };

    try {
        await attemptDelete(integration.accessToken);

    } catch (error: any) {
         if (error.response?.status === 401) {

            try {
                const newToken = await refreshAccessToken(integration);
                await attemptDelete(newToken);

            } catch (retryError) {
                console.error("Failed to delete event even after refresh:", retryError);
            }
        } else if (error.response?.status === 410 || error.response?.status === 404) {

        } else {
            console.error("Failed to delete calendar event:", error.response?.data || error);
        }
    }
};
