import Redis from "ioredis";
import { config } from "dotenv";

config();

let redis;

if (process.env.REDIS_URL) {
    // 🚀 PRODUCTION (Render)
    // Render provides a full connection string (rediss://user:pass@host:port)
    // This automatically handles password and TLS if 'rediss' is used.
    console.log("🚀 Connecting to Production Redis...");
    redis = new Redis(process.env.REDIS_URL);

} else {
    // 🛠️ DEVELOPMENT (Localhost)
    console.log("🛠️ Connecting to Local Redis...");
    redis = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1', 
        port: process.env.REDIS_PORT || 6379,
        family: 4, // Forces IPv4 for local dev (Fixes Node 17+ localhost issues)
        retryStrategy: (times) => {
            return Math.min(times * 50, 2000);
        }
    });
}

redis.on("connect", () => {
    console.log("✅ Redis Connected Successfully");
});

redis.on("error", (err) => {
    if (err.code === 'ECONNREFUSED') {
        console.error("❌ Redis Connection Refused. Is the server running?");
    } else {
        console.error("❌ Redis Connection Error:", err);
    }
});

export default redis;
