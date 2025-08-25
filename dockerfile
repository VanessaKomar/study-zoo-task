# Uses node version v20.17.0 as out base image
FROM node:20

# Goes to the app directory
WORKDIR /app

# Install server deps first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest into the container
COPY . .

# Add a tiny entrypoint that launches ngrok + your app
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose the port your app listens on (Slack events)
EXPOSE 80

# Launch both ngrok and the node app
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]