FROM node:20-alpine

WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache bash git python3 make g++

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose Expo ports
EXPOSE 19006 19000 8081

# Env variables for Expo
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV EXPO_WEB_HOST=0.0.0.0
ENV BROWSER=none

# Start Expo web
CMD ["npx", "expo", "start", "--web"]
