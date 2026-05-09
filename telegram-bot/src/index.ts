import 'dotenv/config';
import { createBot } from './bot';
import { ApiService } from './services/api.service';
import { startScheduler } from './services/scheduler';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000/api';
const BOT_SECRET = process.env.TELEGRAM_BOT_SECRET || 'chocoberry_bot_secret';

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is not set in .env');
  process.exit(1);
}

const api = new ApiService(BACKEND_URL, BOT_SECRET);
const bot = createBot(BOT_TOKEN, api);

startScheduler(bot, api);

console.log('[MoneyMind Bot] Running...');

process.on('SIGINT', () => {
  console.log('[MoneyMind Bot] Stopping...');
  bot.stopPolling();
  process.exit(0);
});
