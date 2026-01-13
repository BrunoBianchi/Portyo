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
RUN pnpm run build

# Expose the frontend port
EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start"]
