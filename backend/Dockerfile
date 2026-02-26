FROM node:18-alpine AS deps

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

FROM node:18-alpine

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY package*.json ./

COPY . .

EXPOSE 8000

CMD ["npm", "start"]