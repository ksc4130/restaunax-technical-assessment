#!/bin/sh

ENV_FILE=".env"
VITE_API_BASE_URL='http://localhost:8081/rest'

if [ ! -f "$ENV_FILE" ]; then
  echo "Creating $ENV_FILE..."
  echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > "$ENV_FILE"
  echo "$ENV_FILE created with VITE_API_BASE_URL"
else
  echo "$ENV_FILE already exists. Skipping creation."
fi
