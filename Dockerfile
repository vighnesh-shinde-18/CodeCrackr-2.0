# ==========================================
# STAGE 1: Build the Frontend (React/Vite)
# ==========================================
# Fixed: Capitalized 'AS' to silence warning
FROM node:20-alpine AS frontend_build

WORKDIR /app/client

# Copy frontend package.json
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY client/ ./

# Build the project
RUN npm run build


# ==========================================
# STAGE 2: Setup the Backend (Node/Express)
# ==========================================
FROM node:20-alpine

WORKDIR /app

# Copy backend package.json into a 'server' folder inside container
COPY server/package*.json ./server/

# --- ERROR WAS HERE ---
# Fixed: Added 'RUN' before the command
RUN cd server && npm install

# Copy the backend source code
COPY server/ ./server

# ==========================================
# STAGE 3: Merge and Run
# ==========================================
# Copy the built frontend assets from Stage 1 into the backend structure
COPY --from=frontend_build /app/client/dist ./client/dist

# Set the working directory to the server folder where index.js lives
WORKDIR /app/server

# Expose the port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]