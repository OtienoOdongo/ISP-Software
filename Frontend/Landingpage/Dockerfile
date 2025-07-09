# FROM node:20-alpine as builder

# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm install

# COPY . .
# RUN npm run build

# FROM nginx:alpine
# COPY --from=builder /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80




# Stage 1: Build landing page app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build output to Nginx HTML folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
