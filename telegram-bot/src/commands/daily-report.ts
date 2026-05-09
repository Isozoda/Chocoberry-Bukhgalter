import TelegramBot from 'node-telegram-bot-api';
import { ApiService } from '../services/api.service';
import { parseDailyReport } from '../parsers/daily-report-parser';

// In-memory store for pending confirmations (chatId → parsed report)
const pendingReports = new Map<string, {
  date: string;
  openingBalance: number;
  closingBalance: number;
  totalExpenses: number;
  rawText: string;
  items: Array<{ name: string; amount: number; category: string }>;
}>();

function fmt(n: number): string {
  return n.toLocaleString('ru-RU');
}

export function hasPendingReport(chatId: string): boolean {
  return pendingReports.has(chatId);
}

export async function handleDailyReportMessage(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  api: ApiService,
): Promise<void> {
  const chatId = msg.chat.id.toString();
  const rawText = msg.text || '';

  const parsed = parseDailyReport(rawText);

  if (!parsed.date) {
    await bot.sendMessage(chatId, '❌ Санаи ҳисобот ёфт нашуд.\nМисол: *БРР 06.05.2026*', { parse_mode: 'Markdown' });
    return;
  }

  // Save pending
  pendingReports.set(chatId, { ...parsed, date: parsed.date, rawText });

  // Build preview message
  const itemLines = parsed.items
    .map((i) => `  • ${i.name}: ${fmt(i.amount)} с.`)
    .join('\n');

  const dateFormatted = parsed.date.split('-').reverse().join('.');

  const text =
    `📊 *Ҳисоботи ${dateFormatted} шинохта шуд*\n\n` +
    `💰 Тавоноии оғоз: *${fmt(parsed.openingBalance)} с.*\n` +
    `💸 Умумии хароҷот: *${fmt(parsed.totalExpenses)} с.*\n` +
    `💵 Монанда: *${fmt(parsed.closingBalance)} с.*\n\n` +
    (itemLines ? `Хароҷотҳо:\n${itemLines}\n\n` : '') +
    `Ҳисоботро сабт кунам?`;

  await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Ҳа, сабт кун', callback_data: 'dr_save' },
          { text: '❌ Бекор кун', callback_data: 'dr_cancel' },
        ],
      ],
    },
  });
}

export async function handleDailyReportSave(
  bot: TelegramBot,
  chatId: string,
  api: ApiService,
): Promise<void> {
  const pending = pendingReports.get(chatId);
  if (!pending) {
    await bot.sendMessage(chatId, '❌ Ҳисоботи интизор нест.');
    return;
  }

  pendingReports.delete(chatId);

  try {
    await api.saveDailyReport({ chatId, ...pending });
    const dateFormatted = pending.date.split('-').reverse().join('.');
    await bot.sendMessage(
      chatId,
      `✅ *Ҳисоботи ${dateFormatted} бо муваффақият сабт шуд!*\n\n` +
        `💰 ТО: ${fmt(pending.openingBalance)} с.\n` +
        `💸 Хароҷот: ${fmt(pending.totalExpenses)} с.\n` +
        `💵 Монд: ${fmt(pending.closingBalance)} с.`,
      { parse_mode: 'Markdown' },
    );
  } catch (err: any) {
    console.error('[DailyReport] save error:', err.message);
    await bot.sendMessage(chatId, '❌ Хато рӯй дод. Лутфан дубора кӯшиш кунед.');
  }
}

export function handleDailyReportCancel(chatId: string): void {
  pendingReports.delete(chatId);
}
