# Multi-stage Dockerfile for smaller production image
FROM node:lts-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
# Install devDependencies required for build (babel) then build
RUN npm ci --silent
COPY . .
RUN npm run build

FROM node:lts-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /usr/src/app
# Copy only production dependencies from build stage
COPY package*.json ./
RUN npm ci --production --silent
# Copy built files and necessary assets
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src ./src
# Copy other runtime files (like .env.example) if needed
EXPOSE 3000
RUN chown -R node /usr/src/app || true
USER node
CMD ["npm", "start"]
