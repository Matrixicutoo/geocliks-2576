/**
 * Registers every catalog, synchronously. Server only.
 *
 * `seo-html.ts` writes each request's head tags and fallback body in the URL's
 * language, with no chance to await a chunk, so the server process holds all
 * eleven from startup. The browser must never import this file: doing so puts
 * every language back into the entry bundle (see `catalogs.ts`).
 */
import { registerCatalog } from "./catalogs";
import { frCA } from "../i18n/fr-CA";
import { es } from "../i18n/es";
import { ptBR } from "../i18n/pt-BR";
import { de } from "../i18n/de";
import { it } from "../i18n/it";
import { zh } from "../i18n/zh";
import { vi } from "../i18n/vi";
import { tl } from "../i18n/tl";
import { ar } from "../i18n/ar";
import { pl } from "../i18n/pl";

registerCatalog("fr-CA", frCA);
registerCatalog("es", es);
registerCatalog("pt-BR", ptBR);
registerCatalog("de", de);
registerCatalog("it", it);
registerCatalog("zh", zh);
registerCatalog("vi", vi);
registerCatalog("tl", tl);
registerCatalog("ar", ar);
registerCatalog("pl", pl);
