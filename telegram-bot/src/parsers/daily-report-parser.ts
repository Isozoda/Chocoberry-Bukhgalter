export interface DailyReportItem {
  name: string;
  amount: number;
  category: string;
}

export interface ParsedDailyReport {
  date: string | null;
  openingBalance: number;
  closingBalance: number;
  totalExpenses: number;
  items: DailyReportItem[];
}

const AUTO_CATEGORIES: Record<string, string> = {
  'ашан': 'shopping',
  'сиёма': 'shopping',
  'клубника': 'ingredients',
  'шоколад': 'ingredients',
  'намк': 'ingredients',
  'банан': 'ingredients',
  'сливки': 'ingredients',
  'баҳрулло': 'salary',
  'дилшод': 'salary',
  'саф': 'salary',
  'трайфл': 'production',
  'дом печат': 'other',
  'масрафҳо': 'misc',
  'масрафхо': 'misc',
};

function detectCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, cat] of Object.entries(AUTO_CATEGORIES)) {
    if (lower.includes(key)) return cat;
  }
  return 'other';
}

export function isDailyReportMessage(text: string): boolean {
  const lines = text.trim().split('\n').map((l) => l.trim());
  return lines.some((l) => /^БРР\s+\d{2}\.\d{2}\.\d{4}/i.test(l));
}

export function parseDailyReport(rawText: string): ParsedDailyReport {
  const lines = rawText.trim().split('\n').map((l) => l.trim()).filter(Boolean);

  let date: string | null = null;
  let openingBalance = 0;
  let closingBalance = 0;
  const items: DailyReportItem[] = [];

  for (const line of lines) {
    // БРР — сана
    const brrMatch = line.match(/^БРР\s+(\d{2})\.(\d{2})\.(\d{4})/i);
    if (brrMatch) {
      date = `${brrMatch[3]}-${brrMatch[2]}-${brrMatch[1]}`;
      continue;
    }

    // ТО — тавоноии оғоз
    const toMatch = line.match(/^ТО\s+([\d\s]+)/i);
    if (toMatch) {
      openingBalance = parseInt(toMatch[1].replace(/\s+/g, ''), 10) || 0;
      continue;
    }

    // Монд — моданда (closingBalance)
    const mondMatch = line.match(/^Монд[:\s]+([\d\s]+)/i);
    if (mondMatch) {
      closingBalance = parseInt(mondMatch[1].replace(/\s+/g, ''), 10) || 0;
      continue;
    }

    // Дигар сатрҳо — хароҷот: "Ном 1234"
    const expMatch = line.match(/^(.+?)\s+([\d][\d\s]*)$/);
    if (expMatch) {
      const name = expMatch[1].trim();
      const amount = parseInt(expMatch[2].replace(/\s+/g, ''), 10) || 0;
      if (amount > 0 && name.length > 1) {
        items.push({ name, amount, category: detectCategory(name) });
      }
    }
  }

  const totalExpenses =
    openingBalance > 0 && closingBalance > 0
      ? openingBalance - closingBalance
      : items.reduce((s, i) => s + i.amount, 0);

  return { date, openingBalance, closingBalance, totalExpenses, items };
}
