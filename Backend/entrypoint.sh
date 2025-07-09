#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 3306; do
  sleep 0.1
done
echo "Database available"

# Run migrations
python manage.py migrate

# Start development server
exec python manage.py runserver 0.0.0.0:8000