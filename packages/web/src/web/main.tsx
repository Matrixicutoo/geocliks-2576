// Entry point referenced by index.html — composition only, real bootstrap
// lives in __main.tsx (template-managed).
// boot-auth finishes a returning managed sign-in redirect first; its top-level
// await delays evaluation of the bootstrap import below.
import "./boot-auth";
import "./__main";
