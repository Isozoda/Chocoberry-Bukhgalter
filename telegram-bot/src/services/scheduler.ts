import cron from 'node-cron';
import TelegramBot from 'node-telegram-bot-api';
import { ApiService } from './api.service';

export function startScheduler(bot: TelegramBot, api: ApiService): void {
  // Daily report at 21:00 Dushanbe time (UTC+5 = 16:00 UTC)
  cron.schedule('0 16 * * *', async () => {
    console.log('[Scheduler] Running daily report cron');
    try {
      await sendDailyReportToBackend(api);
    } catch (err) {
      console.error('[Scheduler] Daily report error:', err);
    }
  });

  // Fixed expense due-soon reminder at 09:00 Dushanbe time (UTC+5 = 04:00 UTC)
  cron.schedule('0 4 * * *', async () => {
    console.log('[Scheduler] Checking due-soon fixed expenses');
    try {
      await notifyDueSoonExpenses();
    } catch (err) {
      console.error('[Scheduler] Due-soon notification error:', err);
    }
  });

  console.log('[Scheduler] Started — daily report 21:00 & due-soon check 09:00 Dushanbe (UTC+5)');
}

async function sendDailyReportToBackend(api: ApiService): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000/api';
  const secret = process.env.TELEGRAM_BOT_SECRET || 'chocoberry_bot_secret';
  try {
    await fetch(`${backendUrl}/telegram/notify/daily-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bot-secret': secret },
      body: JSON.stringify({ trigger: 'cron' }),
    });
  } catch (err) {
    console.error('[Scheduler] Failed to trigger daily report:', err);
  }
}

async function notifyDueSoonExpenses(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000/api';
  const secret = process.env.TELEGRAM_BOT_SECRET || 'chocoberry_bot_secret';
  try {
    await fetch(`${backendUrl}/telegram/notify/due-soon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bot-secret': secret },
    });
  } catch (err) {
    console.error('[Scheduler] Failed to trigger due-soon notification:', err);
  }
}
