# FROM nginx:alpine

# # Remove default configuration
# RUN rm /etc/nginx/conf.d/default.conf

# # Copy custom Nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/

# # Create directories for static and media files
# RUN mkdir -p /var/www/static /var/www/media

# # Copy landing page static files (will be mounted via volume in dev)
# COPY --from=landingpage /app/dist /var/www/static/landing

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]





FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx.conf
COPY nginx.conf /etc/nginx/conf.d/

# Create static and media directories for volume mounting
RUN mkdir -p /var/www/static /var/www/media

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
