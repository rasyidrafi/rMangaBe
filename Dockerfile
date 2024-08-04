FROM node:16

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    libasound2 \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install your Node.js dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Set environment variables, if any
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start your application
CMD ["node", "index.js"]
