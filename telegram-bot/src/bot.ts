import TelegramBot from 'node-telegram-bot-api';
import { ApiService } from './services/api.service';
import { handleStart } from './commands/start';
import { handleStatus } from './commands/status';
import { handleReport } from './commands/report';
import {
  handleAshanMessage,
  handleAshanConfirm,
  handleAshanCancel,
  handleAshanEdit,
  handleAshanPick,
  handleAshanSkip,
} from './commands/ashan';
import {
  handleDailyReportMessage,
  handleDailyReportSave,
  handleDailyReportCancel,
} from './commands/daily-report';
import { isAshanMessage } from './parsers/ashan-parser';
import { isDailyReportMessage } from './parsers/daily-report-parser';
import { mainMenuKeyboard } from './utils/keyboards';

export function createBot(token: string, api: ApiService): TelegramBot {
  const bot = new TelegramBot(token, { polling: true });

  bot.on('polling_error', (err) => {
    console.error('[Bot] Polling error:', err);
    if (Array.isArray((err as any).errors)) {
      console.error('[Bot] Polling aggregate errors:', (err as any).errors);
    }
    if ((err as any).response) {
      console.error('[Bot] Polling error response:', (err as any).response);
    }
  });

  // /start [TOKEN]
  bot.onText(/^\/start(?:\s+(.+))?$/, async (msg, match) => {
    const connectToken = match?.[1]?.trim();
    await handleStart(bot, msg, connectToken, api);
  });

  // /status
  bot.onText(/^\/status$/, async (msg) => {
    await handleStatus(bot, msg.chat.id.toString(), api);
  });

  // /report
  bot.onText(/^\/report$/, async (msg) => {
    await handleReport(bot, msg.chat.id.toString(), api);
  });

  // /help
  bot.onText(/^\/help$/, async (msg) => {
    const chatId = msg.chat.id.toString();
    await bot.sendMessage(
      chatId,
      '📋 *Дастурҳо:*\n\n' +
        '/start — Оғоз кардан\n' +
        '/status — Ҳолати захира\n' +
        '/report — Ҳисоботи рӯзона\n' +
        '/help — Ёрдам',
      { parse_mode: 'Markdown', reply_markup: mainMenuKeyboard() },
    );
  });

  // Callback query handler for inline buttons
  bot.on('callback_query', async (query) => {
    try {
      const chatId = query.message?.chat.id.toString();
      if (!chatId) return;

      await bot.answerCallbackQuery(query.id).catch((err) => {
        console.warn('[Bot] Could not answer callback query (likely expired):', err.message);
      });

      const data = query.data || '';

      if (data === 'cmd_status') {
        await handleStatus(bot, chatId, api);
      } else if (data === 'cmd_report') {
        await handleReport(bot, chatId, api);
      } else if (data === 'cmd_main') {
        await bot.sendMessage(chatId, 'Менюи асосӣ:', { reply_markup: mainMenuKeyboard() });
      } else if (data === 'cmd_help') {
        await bot.sendMessage(
          chatId,
          '📋 *Дастурҳо:*\n\n/start — Оғоз\n/status — Захира\n/report — Ҳисобот',
          { parse_mode: 'Markdown', reply_markup: mainMenuKeyboard() },
        );
      } else if (data === 'ash_ok') {
        await handleAshanConfirm(bot, chatId, api);
      } else if (data === 'ash_no') {
        await handleAshanCancel(bot, chatId);
      } else if (data === 'ash_ed') {
        await handleAshanEdit(bot, chatId);
      } else if (data.startsWith('ash_p:')) {
        await handleAshanPick(bot, chatId, data.slice(6));
      } else if (data === 'ash_sk') {
        await handleAshanSkip(bot, chatId);
      } else if (data === 'dr_save') {
        await handleDailyReportSave(bot, chatId, api);
      } else if (data === 'dr_cancel') {
        handleDailyReportCancel(chatId);
        await bot.sendMessage(chatId, '❌ Сабт бекор карда шуд.', { reply_markup: mainMenuKeyboard() });
      }
    } catch (error: any) {
      console.error('[Bot] Error in callback_query handler:', error.message);
    }
  });

  // General message handler for non-command text
  bot.on('message', async (msg) => {
    if (msg.text?.startsWith('/')) return;

    if (msg.text && isDailyReportMessage(msg.text)) {
      await handleDailyReportMessage(bot, msg, api);
      return;
    }

    if (msg.text && isAshanMessage(msg.text)) {
      await handleAshanMessage(bot, msg, api);
      return;
    }

    const firstName = msg.from?.first_name || 'Дӯст';
    await bot.sendMessage(
      msg.chat.id,
      `Салом, ${firstName}! 😊\n\nМан боти MoneyMind ҳастам.\n\n📋 Рӯйхати харидории Ашанро бифиристед — ман автоматӣ анборро навсозӣ мекунам.\n\nМисол:\n<code>Ашан\nКлубника 8,2кг\nБанан 8,4кг</code>`,
      { parse_mode: 'HTML', reply_markup: mainMenuKeyboard() },
    );
  });

  console.log('[Bot] Started with polling');
  return bot;
}
