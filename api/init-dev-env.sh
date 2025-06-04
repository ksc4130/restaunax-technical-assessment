#!/bin/sh

ENV_FILE=".env"
DATABASE_URL='postgresql://postgres:postgres@postgres:5432/restaunax?schema=public'

if [ ! -f "$ENV_FILE" ]; then
  echo "Creating $ENV_FILE..."
  echo "DATABASE_URL=\"$DATABASE_URL\"" > "$ENV_FILE"
  echo "$ENV_FILE created with DATABASE_URL"
else
  echo "$ENV_FILE already exists. Skipping creation."
fi
