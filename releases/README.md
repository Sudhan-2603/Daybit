# Daybit releases

The current local release source is [Daybit v0.2](v0.2/README.md). Its Windows build script creates the standalone app and MSI installer.

## Backend deployment

The API backend is deployed separately on Render. Create a Blueprint in Render from this repository; the root [`render.yaml`](../render.yaml) configures the `daybit-backend` Rust web service. When prompted, set `DATABASE_URL` to the MongoDB Atlas connection string, including the `daybit` database name (for example, `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/daybit?retryWrites=true&w=majority`). In Atlas, add Render to the cluster's IP access list; for Render's dynamic outbound IPs, allow `0.0.0.0/0` and use a strong database password. Render generates `JWT_SECRET` and supplies `PORT`. The service connects to MongoDB before starting, so a missing or blocked database URL prevents the health check from passing. The health check endpoint is `/health`.

After deployment, the backend is available at the Render service URL (`https://<service>.onrender.com`). Use that URL as `VITE_API_URL` and `wss://<service>.onrender.com/ws` as `VITE_WS_URL` when building the web frontend. The v0.2 desktop app remains standalone and does not connect to this backend.
