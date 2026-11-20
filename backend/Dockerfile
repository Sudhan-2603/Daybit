# Build stage
FROM rust:1.82-bookworm AS builder

WORKDIR /usr/src/daybit

# Copy manifests
COPY backend/Cargo.toml ./backend/
COPY backend/src ./backend/src

WORKDIR /usr/src/daybit/backend

# Build release binary
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install OpenSSL, CA certificates and curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary from builder
COPY --from=builder /usr/src/daybit/backend/target/release/daybit-backend /app/daybit-backend

# Expose default port
EXPOSE 10000

ENV PORT=10000
ENV RUST_LOG=info

# Run binary
CMD ["/app/daybit-backend"]
