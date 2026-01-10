# JWT Secret Configuration

To ensure your JWT tokens are secure, you need to set a strong `JWT_SECRET` in your `.env` file.

## Generating a Secure JWT_SECRET

The `JWT_SECRET` must be at least 32 characters long. Here are several ways to generate a secure secret:

### Option 1: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Option 2: Using OpenSSL
```bash
openssl rand -hex 64
```

### Option 3: Using Python
```bash
python -c "import secrets; print(secrets.token_hex(64))"
```

### Option 4: Online Generator
Visit: https://www.random.org/strings/ and generate a 64-character string using alphanumeric characters.

## Setting Up Your .env File

1. Create or edit your `.env` file in the `backend` directory
2. Add the following line with your generated secret:

```env
# Required: At least 32 characters
JWT_SECRET=your_generated_secret_here_minimum_32_characters_required

# Example (DO NOT USE THIS IN PRODUCTION):
# JWT_SECRET=8f7a9b2c5d1e4f6a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2
```

3. Restart your backend server for changes to take effect

## Security Best Practices

✅ **DO:**
- Use a randomly generated string
- Keep it at least 32 characters (64+ recommended)
- Never commit `.env` file to version control
- Use different secrets for development and production
- Rotate secrets periodically in production

❌ **DON'T:**
- Use "secret", "password", or other obvious values
- Share the secret publicly
- Use the same secret across multiple applications
- Use short or predictable secrets

## Current Implementation

Your Portyo backend now requires:
- `JWT_SECRET`: Minimum 32 characters (enforced)
- `SESSION_SECRET`: Minimum 1 character (required)

If these are not set correctly, the application will fail to start with a clear error message.

## Verification

After setting your JWT_SECRET, verify it works:

1. Start the backend:
```bash
cd backend
npm run dev
```

2. Check logs for any JWT_SECRET errors
3. Try logging in to verify JWT generation and verification work correctly

## Troubleshooting

**Error: "JWT_SECRET must be at least 32 characters for security"**
- Generate a new secret using one of the methods above
- Ensure the `.env` file is in the correct location (`backend/.env`)

**Error: "Invalid token signature - token may have been tampered with"**
- This is expected if you changed the JWT_SECRET after tokens were issued
- Users will need to log in again to get new tokens with the new secret
- This is a security feature - old tokens are invalidated when the secret changes

## Example .env Template

```env
# Backend Configuration
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_DATABASE=portyo
DB_SSL=false

# Security - REQUIRED
SESSION_SECRET=your_session_secret_here
JWT_SECRET=your_generated_jwt_secret_minimum_32_characters_required

# CORS
CORS_ORIGIN=http://localhost:5173

# Frontend
FRONTEND_URL=http://localhost:5173

# Optional: External Services
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MAILGUN_API_SECRET=
STRIPE_SECRET_KEY=
```

Save this configuration in `backend/.env` and keep it secure!
