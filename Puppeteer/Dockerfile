FROM node:lts-slim

# Install Chromium & dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libxss1 \
    wget \
    ca-certificates \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Let puppeteer know where Chromium is
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose port for service (change if your app uses a different one)
EXPOSE 8765

# Run your dev script (update this if you have something else)
CMD ["npm", "start"]
