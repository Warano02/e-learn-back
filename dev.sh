#!/usr/bin/env bash

#set -e

echo "Starting containers..."
docker compose up -d

echo "Waiting Redis..."
sleep 3

echo "Launching app..."
npm run dev