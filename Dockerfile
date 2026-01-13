# Stage 1: Build the Vue application
FROM node:20-alpine as build-stage

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set API base URL for production build to use relative path (proxied by Nginx)
ENV VITE_API_BASE_URL=/api

# Build the application
RUN npm run build-only

# Stage 2: Serve the application with Nginx
FROM nginx:alpine as production-stage

# Copy the built artifacts from the build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
