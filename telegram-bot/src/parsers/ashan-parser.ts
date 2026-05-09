export interface InventoryItemRef {
  id: string;
  name: string;
  nameRu?: string | null;
  nameTg?: string | null;
  unit: string;
  currentStock: string;
  minStockLevel: string;
}

export interface ParsedMatchedItem {
  rawText: string;
  name: string;
  quantity: number;
  unit: string;
  itemId: string;
  itemName: string;
  itemUnit: string;
  currentStock: string;
}

export interface ParsedNotFoundItem {
  rawText: string;
  name: string;
  quantity: number;
  unit: string;
  suggestions: InventoryItemRef[];
}

export interface ParseResult {
  matched: ParsedMatchedItem[];
  notFound: ParsedNotFoundItem[];
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(dp[j], dp[j - 1], prev);
      prev = tmp;
    }
  }
  return dp[b.length];
}

function stripEmoji(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/️/g, '')
    .trim();
}

function parseLineQty(line: string): { name: string; quantity: number; unit: string } | null {
  const m = line.match(/(\d+(?:[.,]\d+)?)\s*(кг\.?|гр?\.?|шт\.?|л\.?|мл|хша|дон|пак|бл|кор)$/iu);
  if (!m) return null;

  const rawName = line.slice(0, line.length - m[0].length).trim();
  const name = stripEmoji(rawName);
  if (!name) return null;

  const rawQty = parseFloat(m[1].replace(',', '.'));
  const unitRaw = m[2].toLowerCase().replace(/\.$/, '');

  let unit: string;
  let quantity: number;

  if (unitRaw === 'кг') { unit = 'кг'; quantity = rawQty; }
  else if (unitRaw === 'г' || unitRaw === 'гр') { unit = 'кг'; quantity = rawQty / 1000; }
  else if (unitRaw === 'шт' || unitRaw === 'дон' || unitRaw === 'хша') { unit = 'шт'; quantity = rawQty; }
  else if (unitRaw === 'л') { unit = 'л'; quantity = rawQty; }
  else if (unitRaw === 'мл') { unit = 'л'; quantity = rawQty / 1000; }
  else if (unitRaw === 'пак') { unit = 'пак'; quantity = rawQty; }
  else { unit = unitRaw.toUpperCase(); quantity = rawQty; }

  return { name, quantity, unit };
}

function bestMatchDist(name: string, item: InventoryItemRef): number {
  const key = name.toLowerCase();
  return Math.min(
    levenshtein(key, item.name.toLowerCase()),
    item.nameRu ? levenshtein(key, item.nameRu.toLowerCase()) : 9999,
    item.nameTg ? levenshtein(key, item.nameTg.toLowerCase()) : 9999,
  );
}

export function isAshanMessage(text: string): boolean {
  const lines = text.trim().split('\n');
  if (lines[0].trim().match(/^ашан$/iu)) return true;
  const unitPat = /\d+(?:[.,]\d+)?\s*(?:кг|г|гр|шт|л|мл)/iu;
  return lines.filter((l) => unitPat.test(l)).length >= 2;
}

export function parseAshanMessage(text: string, items: InventoryItemRef[]): ParseResult {
  const lines = text.trim().split('\n');
  const start = lines[0].trim().match(/^ашан$/iu) ? 1 : 0;

  const matched: ParsedMatchedItem[] = [];
  const notFound: ParsedNotFoundItem[] = [];

  for (let i = start; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    // 1. Strip emojis from the whole line first
    const cleanLine = stripEmoji(rawLine);
    
    // 2. Parse quantity and unit from the cleaned line
    const parsed = parseLineQty(cleanLine);
    if (!parsed) continue;

    const { name, quantity, unit } = parsed;

    const ranked = items
      .map((item) => ({ item, dist: bestMatchDist(name, item) }))
      .sort((a, b) => a.dist - b.dist);

    const best = ranked[0];

    // Improved matching logic: Word-based prefix matching
    const isClose = best && best.dist <= 3;
    
    const foundByFlexibleMatch = items.find(item => {
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
      const cleanInput = normalize(name);
      const cleanDB = normalize(item.name);
      const cleanRu = normalize(item.nameRu || '');
      const cleanTg = normalize(item.nameTg || '');

      // Simple inclusion
      if (cleanDB.includes(cleanInput) || cleanInput.includes(cleanDB) ||
          cleanRu.includes(cleanInput) || cleanInput.includes(cleanRu) ||
          cleanTg.includes(cleanInput) || cleanInput.includes(cleanTg)) return true;

      // Word-based prefix match (e.g., "Ст 04" -> "Стакан 0.4 ml")
      const inputWords = name.toLowerCase().split(/[\s.]+/).filter(w => w.length > 0);
      const dbNames = [item.name, item.nameRu || '', item.nameTg || ''].map(n => n.toLowerCase());

      return dbNames.some(dbName => {
        const dbWords = dbName.split(/[\s.]+/).filter(w => w.length > 0);
        // Every input word must be a prefix of some DB word
        return inputWords.every(iw => 
          dbWords.some(dw => dw.startsWith(iw) || iw.startsWith(dw) || normalize(dw).includes(normalize(iw)))
        );
      });
    });

    if (isClose || (name.length >= 2 && foundByFlexibleMatch)) {
      const matchedItem = isClose ? best.item : foundByFlexibleMatch!;

      matched.push({
        rawText: rawLine,
        name,
        quantity,
        unit,
        itemId: matchedItem.id,
        itemName: matchedItem.name,
        itemUnit: matchedItem.unit,
        currentStock: matchedItem.currentStock,
      });
    } else {
      notFound.push({
        rawText: rawLine,
        name,
        quantity,
        unit,
        suggestions: ranked.slice(0, 3).map((r) => r.item),
      });
    }
  }

  return { matched, notFound };
}
