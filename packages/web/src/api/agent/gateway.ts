import { createGateway } from "ai";

/**
 * Self-hosted AI gateway. Both values come from the root .env and are server-only — the
 * browser never sees the key, it talks to /api/agent/messages instead.
 */
export const gateway = createGateway({
  baseURL: process.env.AI_GATEWAY_BASE_URL,
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

/** True when the gateway is configured, so the route can 503 instead of throwing. */
export const gatewayReady = () =>
  !!process.env.AI_GATEWAY_BASE_URL && !!process.env.AI_GATEWAY_API_KEY;
