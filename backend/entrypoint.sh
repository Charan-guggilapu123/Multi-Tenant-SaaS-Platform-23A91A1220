#!/bin/sh

echo "🚀 Starting backend service..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "✅ Database is ready!"

# Wait a bit more to ensure database is fully initialized
sleep 2

echo "🔄 Starting application (migrations and seeding will run automatically)..."

# Start the application (migrations and seeding are handled in server.js)
exec node src/server.js
