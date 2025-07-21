#!/bin/bash

echo "Running database migrations..."
uv run python manage.py migrate

echo "Collecting static files..."
uv run python manage.py collectstatic --noinput

echo "Starting Gunicorn server..."
exec uv run gunicorn config.wsgi:application --bind 0.0.0.0:8000
