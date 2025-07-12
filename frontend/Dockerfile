FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Development mode - will be overridden by docker-compose command
CMD ["npm", "start"]