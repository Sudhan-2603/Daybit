# Stage 1: Build Frontend (Vite + React)
FROM node:22-alpine AS frontend-builder
WORKDIR /usr/src/daybit/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend (Rust + Axum)
FROM rust:1.82-bookworm AS backend-builder
WORKDIR /usr/src/daybit/backend
COPY backend/Cargo.toml ./
COPY backend/src ./src
RUN cargo build --release

# Stage 3: Unified Production Runtime (Serves both Frontend & Backend on Daybit.sudhan.website)
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend binary and frontend static dist
COPY --from=backend-builder /usr/src/daybit/backend/target/release/daybit-backend /app/daybit-backend
COPY --from=frontend-builder /usr/src/daybit/frontend/dist /app/static

EXPOSE 10000

ENV PORT=10000
ENV FRONTEND_DIR=/app/static
ENV RUST_LOG=info

CMD ["/app/daybit-backend"]
