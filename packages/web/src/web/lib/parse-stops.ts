/**
 * Turn pasted delivery lists into stops.
 *
 * Dispatchers paste from wherever the list already lives: a spreadsheet column, an exported CSV,
 * an email from the customer. That means tabs, commas or semicolons, quoted fields, an optional
 * header row, and columns in any order. The old parser split on "," and popped the last field as
 * the recipient name, which turned "12 Main St, Moncton NB, E1A 4H2" into a person called
 * "E1A 4H2" — so postal codes became recipients on every Canadian list.
 *
 * Two modes:
 *  - A header row is present -> map columns by name. Exact, no guessing.
 *  - No header -> pull out the email and phone by shape, then treat the rest as the address,
 *    popping a trailing field as the name ONLY when it actually looks like a person's name.
 *
 * Delimiter matters for the address. With tabs or semicolons every cell is a discrete column, so
 * the address is one cell. With commas the address itself contains commas ("12 Main St, Moncton
 * NB"), so unclaimed leading cells are joined back together.
 */

export type ParsedStop = {
  addressRaw: string;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
  reference: string | null;
  notes: string | null;
};

export type StopField = keyof ParsedStop;

export type ParseResult = {
  stops: ParsedStop[];
  /** Which delimiter won, for the UI to explain what it did. */
  delimiter: "tab" | "comma" | "semicolon";
  /** The header cells when one was detected and skipped, else null. */
  headerRow: string[] | null;
  /** Non-empty lines that yielded no address and were dropped. */
  skipped: number;
  /** Header columns that matched no field, so the UI can say what it ignored. */
  ignoredColumns: string[];
};

const HEADER_ALIASES: Record<StopField, string[]> = {
  addressRaw: [
    "address", "addresses", "address1", "address 1", "address2", "address 2", "adresse",
    "street", "street address", "rue", "addr", "location", "destination", "stop",
    "delivery address", "ship to", "apt", "unit", "suite",
    // A spreadsheet usually splits the address across columns. Each of these is one more piece
    // of the same line, so they are joined back together in column order.
    "city", "town", "ville", "municipality", "province", "prov", "state", "region",
    "postal", "postal code", "postalcode", "postcode", "code postal", "zip", "zip code",
    "country", "pays",
    // Portuguese. Brazilian exports split the address the most of any locale — street, number,
    // apartment, neighbourhood, city, state and CEP each arrive as their own column.
    "endereço", "endereco", "morada", "logradouro", "rua", "avenida", "número", "numero", "nº",
    "complemento", "bairro", "cidade", "município", "municipio", "estado", "uf",
    "cep", "código postal", "codigo postal", "país", "pais", "entrega", "local", "parada",
    // German. "ß" is not a diacritic, so normalizeHeader leaves it alone and "straße" has to be
    // listed next to "strasse". The same goes for umlaut columns a user transliterated by hand:
    // "empfänger" folds to "empfanger", never to "empfaenger", so both spellings are listed.
    "anschrift", "lieferadresse", "zieladresse", "straße", "strasse", "str", "hausnummer", "nr",
    "stadt", "ort", "wohnort", "plz", "postleitzahl", "bundesland", "land",
    // Italian. "città" folds to "citta", but a user who typed the unaccented form by hand gets
    // the same key either way, so both spellings are listed for readability.
    "indirizzo", "indirizzo di consegna", "via", "viale", "corso", "piazza", "civico",
    "città", "citta", "comune", "località", "localita", "provincia", "cap", "paese",
    "consegna", "destinazione",
    // Polish. Ogonki and acutes fold away ("miejscowość" folds to "miejscowosc"), so a hand
    // transliterated column matches either way. "nr" is already claimed by the German list
    // for this same field, so "nr domu" is listed for the house-number column instead.
    "adres", "adres dostawy", "adres odbiorcy", "ulica", "nr domu", "numer domu",
    "miasto", "miejscowość", "kod pocztowy", "województwo", "gmina", "kraj", "dostawa",
    // Chinese. Han characters carry no combining marks, so normalizeHeader passes them through
    // untouched and nothing has to be listed twice. A Chinese sheet splits the address across
    // columns as much as a Brazilian one does, so the single-character province, city and
    // district headers are listed alongside the full words. Bare "地区" is left out on purpose —
    // it reads as a vague "area" and is as likely to be a sales territory as an address column.
    "地址", "送达地址", "收件地址", "配送地址", "详细地址", "街道", "门牌号",
    "城市", "市", "区", "省", "省份", "邮编", "邮政编码", "国家",
    // Vietnamese. Tone marks and vowel diacritics fold away ("thành phố" folds to "thanh pho"),
    // so those words are listed once. The stroked "đ" is a different matter: it is a single
    // codepoint, not a letter plus a combining mark, so normalizeHeader leaves it alone and
    // "địa chỉ" folds to "đia chi", never to "dia chi". Every word containing "đ" is therefore
    // listed twice — accented, then fully unaccented — exactly like "straße"/"strasse" and
    // "przesyłka"/"przesylka" above, so a sheet typed without Vietnamese input still matches.
    // A Vietnamese sheet splits the address across ward, district and city columns as much as
    // a Brazilian one does, so those headers are listed alongside the full address words.
    "địa chỉ", "dia chi", "địa chỉ giao hàng", "dia chi giao hang",
    "địa chỉ nhận", "dia chi nhan", "địa chỉ nhận hàng", "dia chi nhan hang",
    "nơi giao", "số nhà", "đường", "duong", "phường", "xã", "quận", "huyện",
    "thành phố", "tỉnh", "tỉnh thành", "mã bưu điện", "ma buu dien",
    "mã bưu chính", "quốc gia",
  ],
  recipientName: [
    "name", "nom", "recipient", "recipient name", "customer", "client", "contact",
    "destinataire", "attention", "attn",
    // Portuguese
    "nome", "nome do cliente", "nome do destinatário", "nome do destinatario",
    "destinatário", "destinatario", "cliente", "contato", "responsável", "responsavel",
    // German
    "empfänger", "empfanger", "empfaenger", "kunde", "kundenname", "ansprechpartner",
    // Italian ("nome", "cliente" and "destinatario" are already covered by the Portuguese list)
    "nominativo", "ragione sociale", "referente", "contatto",
    // Polish. Folding only strips diacritics, it does not transliterate, so "klient" and
    // "kontakt" are separate keys from the English "client" and "contact" and both are listed.
    "odbiorca", "nazwa odbiorcy", "nazwisko", "imię", "imię i nazwisko", "imie i nazwisko",
    "klient", "nazwa klienta", "kontakt", "firma", "nazwa firmy", "nazwa",
    // Chinese. No Chinese word can collide with a Latin one, because folding strips diacritics
    // and never transliterates, so every term below is a key of its own.
    "收件人", "收件人姓名", "姓名", "名字", "客户", "客户名称", "联系人", "公司", "公司名称",
    // Vietnamese. None of these carry a stroked "đ", so folding handles the accents and each
    // word is listed once — see the note in the address list above for why "đ" words are not.
    "người nhận", "tên người nhận", "họ tên", "họ và tên", "tên", "tên khách hàng",
    "khách hàng", "công ty", "tên công ty", "người liên hệ",
  ],
  recipientEmail: [
    "email", "e-mail", "email address", "courriel", "mail",
    // Portuguese ("e-mail" and "email" already cover the common cases)
    "correio eletrônico", "correio eletronico", "endereço de e-mail", "endereco de e-mail",
    // German ("e-mail" and "email" already cover the common cases)
    "e-mail-adresse", "emailadresse", "mailadresse",
    // Italian ("e-mail" and "email" already cover the common cases)
    "posta elettronica", "indirizzo e-mail", "indirizzo email",
    // Polish ("e-mail" and "email" already cover the common cases). Bare "poczta" is left out
    // on purpose — on a Polish sheet it can just as easily mean postal mail.
    "adres e-mail", "poczta elektroniczna", "e-mail odbiorcy",
    // Chinese. "邮箱" is the everyday word; "邮编" is the postal code and stays with the address
    // field above, so the two never compete for the same column.
    "邮箱", "电子邮件", "电子邮箱", "邮件地址", "收件人邮箱",
    // Vietnamese ("email" and "e-mail" already cover the common cases). "thư điện tử" and
    // "địa chỉ email" contain a stroked "đ", so both spellings are listed.
    "thư điện tử", "thu dien tu", "địa chỉ email", "dia chi email",
    "hòm thư", "email người nhận",
  ],
  recipientPhone: [
    "phone", "phone number", "telephone", "téléphone", "tel", "mobile", "cell", "cellular",
    "contact number",
    // Portuguese
    "telefone", "celular", "fone", "telemóvel", "telemovel", "whatsapp", "contato telefônico",
    "contato telefonico",
    // German
    "telefon", "telefonnummer", "handy", "handynummer", "mobil", "festnetz", "rufnummer",
    // Italian ("telefono" is already covered by the Portuguese list)
    "cellulare", "numero di telefono", "recapito", "recapito telefonico",
    // Polish ("telefon" is already covered by the German list). "komórka" folds to "komorka",
    // but the hand-typed form is listed too so the help text's promise holds either way.
    "numer telefonu", "nr telefonu", "komórka", "komorka",
    "telefon komórkowy", "telefon komorkowy",
    // Chinese. "联系方式" is a catch-all contact column that in practice holds a phone number.
    "电话", "电话号码", "手机", "手机号", "手机号码", "联系电话", "联系方式",
    // Vietnamese. Every word here contains "điện" or "động", so each is listed accented and
    // fully unaccented. "sđt" is the everyday abbreviation on a Vietnamese order sheet.
    "điện thoại", "dien thoai", "số điện thoại", "so dien thoai",
    "sđt", "sdt", "di động", "di dong", "điện thoại di động", "dien thoai di dong",
    "số di động", "so di dong", "điện thoại người nhận", "dien thoai nguoi nhan",
  ],
  reference: [
    "reference", "ref", "order", "order #", "order number", "invoice", "po", "po #",
    "commande", "facture", "tracking", "job", "job #",
    // Portuguese. "nota" and "nota fiscal" are the invoice, not the remarks column — the EN
    // "note"/"notes" words stay with the notes field below because they are different keys.
    "referência", "referencia", "pedido", "nº do pedido", "numero do pedido",
    "número do pedido", "nota", "nota fiscal", "nf", "nf-e", "fatura", "rastreio",
    "código de rastreio", "codigo de rastreio",
    // German. "auftrag" is the job/order here, not the project code field in the web app.
    "referenz", "bestellung", "bestellnummer", "auftrag", "auftragsnummer", "rechnung",
    "rechnungsnummer", "sendungsnummer", "lieferschein",
    // Italian. "nota" is already claimed here by the Portuguese list as the invoice, which is
    // also its meaning on an Italian order sheet, so the Italian remarks words below are the
    // plural "note"/"osservazioni" instead.
    "riferimento", "rif", "ordine", "numero ordine", "numero d'ordine", "fattura", "bolla",
    "ddt", "commessa", "tracciamento",
    // Polish. The stroked "ł" is a single codepoint, not a letter plus a combining mark, so
    // normalizeHeader leaves it alone and "przesyłka" has to be listed next to "przesylka" —
    // exactly like "straße"/"strasse" above. Polish "faktura" is a separate key from the
    // Italian "fattura" — folding strips diacritics, it does not transliterate — so it is listed.
    "referencja", "numer referencyjny", "nr zamówienia", "numer zamówienia", "zamówienie",
    "zlecenie", "faktura", "numer faktury", "nr faktury", "list przewozowy",
    "przesyłka", "przesylka", "numer przesyłki", "numer przesylki", "paczka",
    // Chinese. Bare "编码" and "代码" are deliberately left out — in GeoCliks a "编码" is the
    // photo code, and claiming it here would read as a promise this column is that.
    "参考号", "订单号", "订单编号", "订单", "单号", "发票", "发票号",
    "运单号", "快递单号", "工单",
    // Vietnamese. "đơn" (order) and "hóa đơn" (invoice) carry the stroked "đ", so both
    // spellings are listed. Bare "mã" is deliberately left out — in GeoCliks a "mã" on its own
    // reads as the photo code, and claiming it here would promise this column is that.
    "mã đơn hàng", "ma don hang", "mã đơn", "ma don", "số đơn hàng", "so don hang",
    "đơn hàng", "don hang", "mã vận đơn", "ma van don", "số vận đơn", "so van don",
    "hóa đơn", "hoa don", "số hóa đơn", "so hoa don",
    "tham chiếu", "mã tham chiếu",
  ],
  notes: [
    "notes", "note", "comment", "comments", "instructions", "special instructions",
    "remarque", "remarques", "details",
    // Portuguese
    "notas", "observação", "observacao", "observações", "observacoes", "obs",
    "comentários", "comentarios", "instruções", "instrucoes", "detalhes",
    // German
    "notiz", "notizen", "bemerkung", "bemerkungen", "anmerkung", "anmerkungen", "hinweis",
    "hinweise", "kommentar", "anweisungen",
    // Italian ("note" is already covered by the English list; "nota" stays with reference)
    "osservazioni", "osservazione", "annotazioni", "istruzioni", "istruzioni di consegna",
    "commenti", "dettagli",
    // Polish. "wskazówki" folds to "wskazowki", but the hand-typed form is listed too.
    "uwagi", "uwaga", "notatki", "notatka", "komentarz", "komentarze",
    "instrukcje", "instrukcja", "opis", "wskazówki", "wskazowki", "informacje",
    // Chinese. "备注" is what a Chinese sheet almost always calls this column.
    "备注", "注释", "说明", "留言", "提示", "特殊说明", "详情",
    // Vietnamese. "ghi chú" is what a Vietnamese sheet almost always calls this column. None of
    // these carry a stroked "đ" ("dẫn" and "diễn" are a plain "d"), so each is listed once.
    "ghi chú", "chú thích", "lưu ý", "hướng dẫn", "hướng dẫn giao hàng",
    "nhận xét", "mô tả", "chi tiết", "thông tin thêm",
  ],
};

const FIELD_ORDER: StopField[] = [
  "addressRaw", "recipientName", "recipientEmail", "recipientPhone", "reference", "notes",
];

/** Words that mean a field is part of a street address, never a person's name. */
const STREET_WORDS = new Set([
  "st", "st.", "street", "rue", "ave", "ave.", "avenue", "rd", "rd.", "road", "blvd", "blvd.",
  "boulevard", "dr", "dr.", "drive", "lane", "ln", "court", "crt", "ct", "cres", "crescent",
  "way", "place", "pl", "highway", "hwy", "route", "rt", "suite", "ste", "unit", "apt",
  "apartment", "floor", "po", "box", "north", "south", "east", "west", "n", "s", "e", "w",
]);

/** Province / state / country tokens that must never be mistaken for a recipient. */
const REGION_WORDS = new Set([
  "nb", "ns", "pe", "pei", "nl", "qc", "on", "mb", "sk", "ab", "bc", "yt", "nt", "nu",
  "canada", "usa", "us", "united states", "new brunswick", "nouveau-brunswick", "quebec", "québec",
]);

const CA_POSTAL = /^[A-Za-z]\d[A-Za-z][\s-]?\d[A-Za-z]\d$/;
const US_ZIP = /^\d{5}(-\d{4})?$/;

/**
 * Fold a header cell to a comparable key.
 *
 * Accents are stripped, because the same spreadsheet column ships as "téléphone" or "telephone"
 * and as "endereço" or "endereco" depending on who exported it. The alias lists below are folded
 * the same way at module load (see HEADER_INDEX), so an accented alias still matches an accented
 * or unaccented column and nothing has to be listed twice.
 */
function normalizeHeader(cell: string): string {
  return cell
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/^["']|["']$/g, "")
    .replace(/[_*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Folded alias -> field, resolved in FIELD_ORDER so the first field to claim a word keeps it. */
const HEADER_INDEX: Map<string, StopField> = (() => {
  const index = new Map<string, StopField>();
  for (const field of FIELD_ORDER) {
    for (const alias of HEADER_ALIASES[field]) {
      const key = normalizeHeader(alias);
      if (key && !index.has(key)) index.set(key, field);
    }
  }
  return index;
})();

/** Split one delimited line, honouring "quoted fields" and "" escapes. */
export function splitLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
      continue;
    }
    if (ch === delimiter) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

/**
 * Pick the delimiter.
 *
 * A tab anywhere means the list came out of a spreadsheet and tabs are authoritative. Otherwise
 * whichever of ";" or "," appears more often outside quotes wins, defaulting to a comma.
 */
export function detectDelimiter(text: string): { name: ParseResult["delimiter"]; char: string } {
  const outside = text.replace(/"[^"]*"/g, "");
  if (outside.includes("\t")) return { name: "tab", char: "\t" };
  const semis = (outside.match(/;/g) ?? []).length;
  const commas = (outside.match(/,/g) ?? []).length;
  if (semis > 0 && semis >= commas) return { name: "semicolon", char: ";" };
  return { name: "comma", char: "," };
}

/** Map header cells to fields. Returns null when the row is data, not a header. */
export function mapHeader(cells: string[]): (StopField | null)[] | null {
  // An email address in the row means it is data — no header contains one.
  if (cells.some((c) => c.includes("@"))) return null;

  const mapped = cells.map((cell) => {
    const key = normalizeHeader(cell);
    if (!key) return null;
    return HEADER_INDEX.get(key) ?? null;
  });

  const hits = mapped.filter(Boolean).length;
  if (hits === 0) return null;
  // One recognised word alone is too weak unless it is the only column.
  if (hits < 2 && cells.length > 1) return null;
  if (!mapped.includes("addressRaw")) return null;
  return mapped;
}

function digitCount(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function looksLikePhone(value: string): boolean {
  const digits = digitCount(value);
  if (digits < 7 || digits > 15) return false;
  // Phone fields are digits and punctuation; a street address has real words in it.
  return /^[\d\s()+.\-x/]*(ext\.?|poste)?[\d\s()+.\-x/]*$/i.test(value.trim());
}

/** Would this field pass as a person's name? Deliberately strict — a wrong guess is worse. */
function looksLikeName(value: string): boolean {
  const clean = value.trim();
  if (!clean || clean.length > 60) return false;
  if (digitCount(clean) > 0) return false;
  if (CA_POSTAL.test(clean) || US_ZIP.test(clean)) return false;
  if (!/^[\p{L}][\p{L}'\-.\s]*$/u.test(clean)) return false;

  const words = clean.toLowerCase().split(/\s+/);
  if (words.length > 4) return false;
  if (words.some((w) => STREET_WORDS.has(w))) return false;
  if (REGION_WORDS.has(clean.toLowerCase())) return false;
  // "Moncton NB" is the tail of an address, not a recipient. One region token anywhere in the
  // field is enough to disqualify it — a missed name is recoverable, a wrong one is not.
  if (words.some((w) => REGION_WORDS.has(w))) return false;
  return true;
}

function clean(value: string | null | undefined, max: number): string | null {
  const out = (value ?? "").trim();
  if (!out) return null;
  return out.length > max ? out.slice(0, max) : out;
}

function emptyStop(): ParsedStop {
  return {
    addressRaw: "",
    recipientName: null,
    recipientEmail: null,
    recipientPhone: null,
    reference: null,
    notes: null,
  };
}

/** Build a stop from a mapped header row. */
function fromHeader(cells: string[], mapping: (StopField | null)[]): ParsedStop {
  const stop = emptyStop();
  const extras: string[] = [];

  mapping.forEach((field, i) => {
    const value = (cells[i] ?? "").trim();
    if (!value) return;
    if (!field) return;
    if (field === "addressRaw") {
      // Several address columns (street / city / postal) join back into one line.
      extras.push(value);
      return;
    }
    if (!stop[field]) stop[field] = value;
  });

  stop.addressRaw = extras.join(", ");
  return stop;
}

/** Build a stop by shape when there is no header to trust. */
function fromHeuristics(cells: string[], joinAddress: boolean): ParsedStop {
  const stop = emptyStop();
  const remaining: string[] = [];

  for (const cell of cells) {
    if (!cell) continue;
    if (!stop.recipientEmail && looksLikeEmail(cell)) {
      stop.recipientEmail = cell;
      continue;
    }
    if (!stop.recipientPhone && looksLikePhone(cell)) {
      stop.recipientPhone = cell;
      continue;
    }
    remaining.push(cell);
  }

  if (remaining.length === 0) return stop;

  if (joinAddress) {
    // Comma-separated: the address spans cells, so only a trailing real name comes off.
    if (remaining.length > 1 && looksLikeName(remaining[remaining.length - 1])) {
      stop.recipientName = remaining.pop() ?? null;
    }
    stop.addressRaw = remaining.join(", ");
  } else {
    // Tab/semicolon: discrete columns. First is the address, a following name-shaped cell is the
    // recipient, and anything left over is kept as notes rather than thrown away.
    stop.addressRaw = remaining.shift() ?? "";
    const nameAt = remaining.findIndex((c) => looksLikeName(c));
    if (nameAt !== -1) stop.recipientName = remaining.splice(nameAt, 1)[0];
    if (remaining.length) stop.notes = remaining.join(" · ");
  }

  return stop;
}

/** Parse a pasted block into stops, ready for `routes.addStops`. */
export function parseStops(text: string): ParseResult {
  const { name, char } = detectDelimiter(text);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let headerRow: string[] | null = null;
  let mapping: (StopField | null)[] | null = null;
  const ignoredColumns: string[] = [];

  if (lines.length > 0) {
    const first = splitLine(lines[0], char);
    const candidate = mapHeader(first);
    if (candidate) {
      mapping = candidate;
      headerRow = first;
      candidate.forEach((field, i) => {
        const label = (first[i] ?? "").trim();
        if (!field && label) ignoredColumns.push(label);
      });
      lines.shift();
    }
  }

  const stops: ParsedStop[] = [];
  let skipped = 0;

  for (const line of lines) {
    const cells = splitLine(line, char);
    const stop = mapping
      ? fromHeader(cells, mapping)
      : fromHeuristics(cells, name === "comma");

    const addressRaw = clean(stop.addressRaw, 300);
    if (!addressRaw) {
      skipped++;
      continue;
    }

    stops.push({
      addressRaw,
      recipientName: clean(stop.recipientName, 120),
      recipientEmail: clean(stop.recipientEmail, 200),
      recipientPhone: clean(stop.recipientPhone, 50),
      reference: clean(stop.reference, 80),
      notes: clean(stop.notes, 500),
    });
  }

  return { stops, delimiter: name, headerRow, skipped, ignoredColumns };
}
