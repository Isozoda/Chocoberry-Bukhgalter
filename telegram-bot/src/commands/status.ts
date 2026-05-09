import TelegramBot from 'node-telegram-bot-api';
import { ApiService, InventoryItem } from '../services/api.service';
import { backKeyboard } from '../utils/keyboards';

export async function handleStatus(
  bot: TelegramBot,
  chatId: string,
  api: ApiService,
): Promise<void> {
  await bot.sendMessage(chatId, '🔍 Дар ҳол маълумот мегирам...');

  try {
    // Fetch low-stock items using the user's chatId
    const items: InventoryItem[] = await api.getLowStockItems(chatId);
    if (items.length === 0) {
      await bot.sendMessage(chatId, '✅ Ҳамаи захираҳо дар сатҳи муқаррарӣ мебошанд.', {
        reply_markup: backKeyboard(),
      });
      return;
    }

    const lines = items.map((i) => `• ⚠️ ${i.name}: ${i.currentStock} ${i.unit}`).join('\n');
    await bot.sendMessage(chatId, `📦 *Захираи кам:*\n\n${lines}`, {
      parse_mode: 'Markdown',
      reply_markup: backKeyboard(),
    });
  } catch (err) {
    console.error('[status] Error:', err);
    await bot.sendMessage(chatId, '❌ Маълумотро гирифта натавонистам. Баъдтар кӯшиш кунед.', {
      reply_markup: backKeyboard(),
    });
  }
}
