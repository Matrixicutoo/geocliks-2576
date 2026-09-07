import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "../../api";
import { authToken } from "./auth";
import { impersonateToken } from "./impersonate";

const link = new RPCLink({
  url: `${window.location.origin}/api/rpc`,
  fetch: (request, init) => fetch(request, { ...init, credentials: "include" }),
  headers: () => {
    const token = authToken();
    const impersonate = impersonateToken();
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(impersonate ? { "x-geocliks-impersonate": impersonate } : {}),
    };
  },
});

/** Direct typed client: await client.ping() */
export const client: AppRouterClient = createORPCClient(link);

/** TanStack Query helpers: useQuery(orpc.ping.queryOptions()) */
export const orpc = createTanstackQueryUtils(client);
