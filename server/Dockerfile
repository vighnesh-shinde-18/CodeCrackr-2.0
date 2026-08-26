# Stage 1: Build the application
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install ALL dependencies (including devDependencies like nodemon/types)
RUN npm install

# Copy the rest of the application code
COPY . .

# (Optional) If you have a build step (like TypeScript), run it here
# RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine

WORKDIR /app

# Copy package files again for production install
COPY package*.json ./

# Install ONLY production dependencies (skips devDependencies to save space)
RUN npm install --only=production

# Copy the source code from the builder stage
# If you have a 'dist' folder from TS, copy that instead of '.'
COPY --from=builder /app ./

# Expose the port your app runs on
EXPOSE 8080

# Command to start the application
CMD ["node", "index.js"]