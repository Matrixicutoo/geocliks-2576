const KEY = "geocliks.impersonate.token";
const USER_KEY = "geocliks.impersonate.user";

let memoryToken = "";
let memoryUser = "";

/** localStorage can throw inside partitioned iframes — fall back to memory. */
function read(key: string, fallback: string): string {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    /* ignore — memory copy is authoritative in this context */
  }
}

export function impersonateToken(): string {
  return read(KEY, memoryToken);
}

export function impersonateLabel(): string {
  return read(USER_KEY, memoryUser);
}

export function startImpersonation(token: string, label: string) {
  memoryToken = token;
  memoryUser = label;
  write(KEY, token);
  write(USER_KEY, label);
}

export function stopImpersonation() {
  memoryToken = "";
  memoryUser = "";
  write(KEY, "");
  write(USER_KEY, "");
}
