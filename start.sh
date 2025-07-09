#!/bin/bash

echo "Generating .env..."
echo "DB_ROOT_PASSWORD=$(openssl rand -base64 32)" > .env
echo "DB_NAME=isp_software_db" >> .env
echo "DB_USER=isp_user" >> .env
echo "DB_PASSWORD=$(openssl rand -base64 24)" >> .env

echo "Starting Docker Compose..."
docker compose up --build
