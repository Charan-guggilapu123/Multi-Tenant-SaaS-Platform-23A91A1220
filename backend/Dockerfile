FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Run migrations and start server
# We would typically use a script for this, but for now we'll assumes start does it or we add a command
EXPOSE 5000

# Install curl for healthcheck
RUN apk --no-cache add curl

CMD ["npm", "start"]
