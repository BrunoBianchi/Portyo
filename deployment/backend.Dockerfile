FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source code
COPY . .

# Build the application
# Using npx tsc because there is no build script in package.json
RUN npx tsc

# Expose the API port
EXPOSE 8000

# Start the application
CMD ["node", "dist/main.js"]
