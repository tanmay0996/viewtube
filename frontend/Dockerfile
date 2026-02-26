FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Install a lightweight static server
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]