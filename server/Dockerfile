# Use Node.js 20 LTS based on Alpine Linux for a smaller image size
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install production dependencies
# Using npm ci for cleaner installs in CI/CD/Docker environments
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose port 3000 for the application
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]
