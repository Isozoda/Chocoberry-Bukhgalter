import TelegramBot from 'node-telegram-bot-api';
import { ApiService } from '../services/api.service';
import { backKeyboard } from '../utils/keyboards';

export async function handleReport(
  bot: TelegramBot,
  chatId: string,
  api: ApiService,
): Promise<void> {
  await bot.sendMessage(chatId, '📊 Ҳисоботи рӯзонаро меёбам...');

  try {
    const report = await api.getDailyReport('');
    if (!report) {
      await bot.sendMessage(chatId, '📭 Имрӯз ҳисобот сабт нашудааст.', {
        reply_markup: backKeyboard(),
      });
      return;
    }

    const text =
      `📊 *Ҳисоботи рӯзона — ${report.date}*\n\n` +
      `💰 Фурӯш: *${Number(report.totalSales).toLocaleString()} TJS*\n` +
      `💸 Хароҷот: *${Number(report.totalExpenses).toLocaleString()} TJS*\n` +
      `✅ Боқимонда: *${Number(report.remaining).toLocaleString()} TJS*`;

    await bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: backKeyboard(),
    });
  } catch (err) {
    console.error('[report] Error:', err);
    await bot.sendMessage(chatId, '❌ Ҳисоботро гирифта натавонистам.', {
      reply_markup: backKeyboard(),
    });
  }
}
