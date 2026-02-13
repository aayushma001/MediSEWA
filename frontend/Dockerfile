# Step 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Build the app
RUN npm run build

# Step 2: Serve the build with 'serve'
FROM node:18-alpine

WORKDIR /app

# Install 'serve' to serve the build folder
RUN npm install -g serve

# Copy build artifacts from the build stage
COPY --from=build /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Command to run the app
CMD ["serve", "-s", "dist", "-l", "3000"]
