# FROM python:3.10-bullseye

# # Environment variables
# ENV PYTHONDONTWRITEBYTECODE=1
# ENV PYTHONUNBUFFERED=1

# # Set working directory
# WORKDIR /app/backend/

# # Install system dependencies (group apt commands)
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     gcc \
#     libmariadb-dev \
#     python3-dev \
#     libffi-dev \
#     pkg-config \
#     libjpeg-dev \
#     zlib1g-dev \
#     libpng-dev \
#     libfreetype6-dev \
#     liblcms2-dev \
#     libopenjp2-7-dev \
#     libtiff-dev \
#     libwebp-dev \
#     libxml2-dev \
#     libxslt-dev \
#     libpq-dev \
#     && rm -rf /var/lib/apt/lists/*

# # Upgrade pip first (separate layer)
# RUN pip install --upgrade pip

# # Copy only requirements first to leverage Docker cache
# COPY requirements.txt .

# # Install Python dependencies with timeout and retry
# RUN pip install --no-cache-dir -r requirements.txt --default-timeout=100 --retries 5

# # Copy the rest of the project files
# COPY . .

# # Collect static files
# RUN python manage.py collectstatic --noinput

# EXPOSE 8000

# CMD ["sh", "-c", "python manage.py migrate && gunicorn --bind 0.0.0.0:8000 interlink.wsgi:application"]



# ---- Builder stage ----
FROM python:3.10-slim-bullseye AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- Runtime stage ----
FROM python:3.10-slim-bullseye AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY --from=builder /usr/local /usr/local
COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && gunicorn --bind 0.0.0.0:8000 interlink.wsgi:application"]
