FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --production

# Copy all backend files
COPY backend/ ./

# Expose port (Railway sets PORT automatically)
EXPOSE ${PORT:-4000}

# Start the application
CMD ["node", "src/index.js"]

