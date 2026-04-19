#!/usr/bin/env bash
echo "start services for project"

docker compose up -d

echo "services started, checking status..."
docker compose ps

echo "start development server..."
npm run dev