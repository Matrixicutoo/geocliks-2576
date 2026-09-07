import { authClient } from "./lib/auth";

// Finish a returning managed sign-in redirect before the app mounts.
// Top-level await here delays evaluation of later imports in main.tsx.
await authClient.managedAuth.handleRedirect();
