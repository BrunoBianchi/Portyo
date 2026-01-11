import axios from "axios";
import { AppDataSource } from "../../database/datasource";
import { IntegrationEntity } from "../../database/entity/integration-entity";
import { BioEntity } from "../../database/entity/bio-entity";

const integrationRepository = AppDataSource.getRepository(IntegrationEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

const googleTokenUrl = "https://oauth2.googleapis.com/token";
const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";

import { env } from "../../config/env";

export const getGoogleAnalyticsAuthUrl = (bioId: string) => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: "http://localhost:3000/api/google-analytics/callback",
    response_type: "code",
    scope: "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics https://www.googleapis.com/auth/analytics.edit",
    access_type: "offline",
    prompt: "consent",
    state: bioId // Pass bioId in state to link it back
  });
  const url = `${googleAuthUrl}?${params.toString()}`;

  return url;
};

export const parseGoogleAnalyticsCallback = async (code: string, bioId: string) => {

  const response = await axios.post(
    googleTokenUrl,
    new URLSearchParams({
      code: code.trim(),
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: "http://localhost:3000/api/google-analytics/callback",
      grant_type: "authorization_code",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token, refresh_token } = response.data;


  // Fetch user's analytics accounts to get the ID (optional, or just store tokens)
  // For now, we just store the tokens. 
  // We might need to ask the user to select a property later.
  
  const bio = await bioRepository.findOneBy({ id: bioId });
  if (!bio) throw new Error("Bio not found");

  const integration = new IntegrationEntity();
  integration.name = "google-analytics";
  integration.provider = "google-analytics";
  integration.accessToken = access_token;
  integration.refreshToken = refresh_token;
  integration.account_id = "pending"; // User needs to select property
  integration.bio = bio;

  await integrationRepository.save(integration);


  // Try to fetch properties and auto-select or create the correct one
  try {
      const properties = await getAnalyticsProperties(integration.id);
      
      const targetName = `Portyo - ${bio.sufix}`;
      let targetProperty = null;

      // Search for existing property
      if (properties) {
          for (const account of properties) {
              if (account.propertySummaries) {
                  const found = account.propertySummaries.find((p: any) => p.displayName === targetName);
                  if (found) {
                      targetProperty = found;
                      break;
                  }
              }
          }
      }

      if (targetProperty) {

          integration.account_id = targetProperty.property;
          await integrationRepository.save(integration);

          // Get or Create Data Stream
          let measurementId = await getMeasurementId(integration.accessToken!, targetProperty.property);
          
          if (!measurementId) {

              measurementId = await createDataStream(integration.accessToken!, targetProperty.property, bio.sufix);
          }

          if (measurementId) {
              bio.googleAnalyticsId = measurementId;
              await bioRepository.save(bio);

          }
      } else {

          const newProperty = await createAnalyticsProperty(integration.accessToken!, bio.sufix);
          
          if (newProperty) {
              integration.account_id = newProperty.propertyId;
              await integrationRepository.save(integration);
              
              bio.googleAnalyticsId = newProperty.measurementId;
              await bioRepository.save(bio);

          }
      }
  } catch (error: any) {
      console.error("Failed to auto-configure Google Analytics property");
      if (error.response) {
          console.error("Google API Error:", JSON.stringify(error.response.data, null, 2));
      } else {
          console.error(error);
      }
  }

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
        console.error("Failed to refresh token:", error.response?.data || error.message);
        throw new Error("Failed to refresh access token");
    }
};

const getMeasurementId = async (accessToken: string, propertyId: string) => {
    try {
        // propertyId is like "properties/123456"
        const response = await axios.get(`https://analyticsadmin.googleapis.com/v1beta/${propertyId}/dataStreams`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        
        const streams = response.data.dataStreams;
        if (streams && streams.length > 0) {
            // Look for a web stream
            const webStream = streams.find((s: any) => s.type === "WEB_DATA_STREAM");
            if (webStream && webStream.webStreamData) {
                return webStream.webStreamData.measurementId; // G-XXXXXXX
            }
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch data streams", error);
        return null;
    }
}

const createDataStream = async (accessToken: string, propertyId: string, bioName: string) => {
    try {
        const streamResponse = await axios.post(
            `https://analyticsadmin.googleapis.com/v1beta/${propertyId}/dataStreams`,
            {
                displayName: "Web Stream",
                type: "WEB_DATA_STREAM",
                webStreamData: {
                    defaultUri: `http://${bioName}.localhost`
                }
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const measurementId = streamResponse.data.webStreamData.measurementId;

        return measurementId;
    } catch (error: any) {
        console.error("Failed to create data stream", error.response?.data || error);
        return null;
    }
}

const createAnalyticsProperty = async (accessToken: string, bioName: string) => {
    try {
        // 1. List Accounts to find the account ID
        const accountsResponse = await axios.get("https://analyticsadmin.googleapis.com/v1beta/accounts", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        let accountId = "";
        if (accountsResponse.data.accounts && accountsResponse.data.accounts.length > 0) {
            accountId = accountsResponse.data.accounts[0].name; // e.g., "accounts/123456"
        } else {
            console.error("No Google Analytics account found to create property in.");
            return null;
        }

        // 2. Create Property

        const propertyResponse = await axios.post(
            `https://analyticsadmin.googleapis.com/v1beta/properties`,
            {
                parent: accountId,
                displayName: `Portyo -- ${bioName}`,
                timeZone: "America/New_York",
                currencyCode: "USD"
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        const propertyName = propertyResponse.data.name; // "properties/123456"


        // 3. Create Data Stream
        const measurementId = await createDataStream(accessToken, propertyName, bioName);

        return {
            propertyId: propertyName,
            measurementId: measurementId
        };

    } catch (error: any) {
        console.error("Failed to create analytics property/stream", error.response?.data || error);
        return null;
    }
}

export const getAnalyticsProperties = async (integrationId: string) => {
    const integration = await integrationRepository.findOneBy({ id: integrationId });
    if (!integration) throw new Error("Integration not found");

    try {
        const response = await axios.get("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", {
            headers: {
                Authorization: `Bearer ${integration.accessToken}`
            }
        });
        return response.data.accountSummaries;
    } catch (error: any) {
        if (error.response?.status === 401) {

            const newAccessToken = await refreshAccessToken(integration);
            
            const retryResponse = await axios.get("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", {
                headers: {
                    Authorization: `Bearer ${newAccessToken}`
                }
            });
            return retryResponse.data.accountSummaries;
        }
        throw error;
    }
}

export const saveAnalyticsProperty = async (integrationId: string, propertyId: string) => {
    const integration = await integrationRepository.findOneBy({ id: integrationId });
    if (!integration) throw new Error("Integration not found");
    
    integration.account_id = propertyId;
    await integrationRepository.save(integration);
    return integration;
}

export const getAnalyticsData = async (integrationId: string, startDate: string, endDate: string) => {
    const integration = await integrationRepository.findOneBy({ id: integrationId });
    if (!integration || !integration.account_id) throw new Error("Integration or Property ID not found");

    const propertyId = integration.account_id;
    
    const fetchData = async (accessToken: string) => {
        const overviewPromise = axios.post(
            `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
            {
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: "date" }],
                metrics: [
                    { name: "activeUsers" }, 
                    { name: "screenPageViews" },
                    { name: "userEngagementDuration" }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const eventsPromise = axios.post(
            `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
            {
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: "eventName" }],
                metrics: [{ name: "eventCount" }]
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const [overviewResponse, eventsResponse] = await Promise.all([overviewPromise, eventsPromise]);

        return {
            overview: overviewResponse.data,
            events: eventsResponse.data
        };
    };

    try {
        return await fetchData(integration.accessToken!);
    } catch (error: any) {
        if (error.response?.status === 401) {

            const newAccessToken = await refreshAccessToken(integration);
            return await fetchData(newAccessToken);
        }
        throw error;
    }
}
