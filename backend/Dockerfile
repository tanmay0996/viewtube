# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create .env file if needed (you can also mount it as a volume)
# ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD ["npm", "start"]
