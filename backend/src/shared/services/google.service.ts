import axios from "axios"
import { createUser, findUserByEmail } from "./user.service"
import { generateToken } from "./jwt.service"
import { env } from "../../config/env"
import { logger } from "../utils/logger"
import { ApiError, APIErrors } from "../errors/api-error"
import { BillingService } from "../../services/billing.service"

const googleTokenUrl = "https://oauth2.googleapis.com/token"
const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth"

export const getGoogleAuthUrl = () => {
  if (!env.GOOGLE_CLIENT_ID) {
      throw new ApiError(APIErrors.internalServerError, "Google Client ID not configured", 500);
  }
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${env.BACKEND_URL}/api/google/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
    access_type: "offline",
    prompt: "consent",
  })
  return `${googleAuthUrl}?${params.toString()}`
}

export const parseGoogleCallbackCode = async (code: string) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new ApiError(APIErrors.internalServerError, "Google credentials not configured", 500);
  }
  try {
    const response = await axios.post(
        googleTokenUrl,
        new URLSearchParams({
        code: code.trim(),
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${env.BACKEND_URL}/api/google/callback`,
        grant_type: "authorization_code",
        }),
        {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        }
    )
    return response.data
  } catch (error: any) {
      logger.error("Error parsing Google callback code", error.response?.data || error.message);
      throw new ApiError(APIErrors.badRequestError, "Failed to exchange Google code", 400);
  }
}

export const parseGoogleAccessToken = async (accessToken: string) => {
  try {
    let response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
        Authorization: `Bearer ${accessToken}`
        }
    })
    const data = response.data
    
  let user = await findUserByEmail(data.email);

  if (!user) {
    user = await createUser({
      email: data.email,
      provider: "gmail",
      fullName: data.name,
      verified: true,
      password: ""
    });
  }

  // Ensure the 7-day Standard trial exists for Gmail signups
  await BillingService.ensureStandardTrial(user.id, 7);
  const activePlan = await BillingService.getActivePlan(user.id);

  const payload = {
    id: user.id,
    email: user.email,
    fullname: user.fullName,
    verified: true,
    provider: user.provider,
    createdAt: user.createdAt,
    plan: activePlan,
    onboardingCompleted: user.onboardingCompleted
  } 

  return {
    token: await generateToken({ ...payload }),
    user: payload
  }
  } catch (error: any) {
      if (error.response?.status === 401) {
          logger.warn("Invalid Google Access Token provided");
          throw new ApiError(APIErrors.unauthorizedError, "Invalid Google Access Token", 401);
      }
      logger.error("Error fetching Google user info", error.response?.data || error.message);
      throw new ApiError(APIErrors.internalServerError, "Failed to fetch Google user info", 500);
  }
}


