# Build stage for Daybit Axum Backend
FROM rust:1.82-bookworm AS builder

WORKDIR /usr/src/daybit/backend
COPY backend/Cargo.toml ./
COPY backend/src ./src

RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /usr/src/daybit/backend/target/release/daybit-backend /app/daybit-backend

EXPOSE 10000

ENV PORT=10000
ENV RUST_LOG=info,daybit_backend=debug

CMD ["/app/daybit-backend"]
