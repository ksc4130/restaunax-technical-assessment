#!/bin/sh
set -e

npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy

if [ ! -f ".seeded" ]; then
  echo "Running Prisma seed..."
  npm run prisma:seed
  touch .seeded
else
  echo "Seed already run. Skipping..."
fi


