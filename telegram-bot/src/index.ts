import 'dotenv/config';
import http from 'http';
import { createBot } from './bot';
import { ApiService } from './services/api.service';
import { startScheduler } from './services/scheduler';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000/api';
const BOT_SECRET = process.env.TELEGRAM_BOT_SECRET || 'chocoberry_bot_secret';
const PORT = process.env.PORT || 8080;

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is not set in .env');
  process.exit(1);
}

// Start a lightweight HTTP health check server for cloud hosting platforms like Render
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Choco Berry Telegram Bot is alive and running!\n');
}).listen(PORT, () => {
  console.log(`[MoneyMind Bot] Health check server listening on port ${PORT}`);
});

const api = new ApiService(BACKEND_URL, BOT_SECRET);
const bot = createBot(BOT_TOKEN, api);

startScheduler(bot, api);

console.log('[MoneyMind Bot] Running...');

process.on('SIGINT', () => {
  console.log('[MoneyMind Bot] Stopping...');
  bot.stopPolling();
  process.exit(0);
});

