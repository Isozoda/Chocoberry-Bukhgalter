"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bot_1 = require("./bot");
const api_service_1 = require("./services/api.service");
const scheduler_1 = require("./services/scheduler");
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000/api';
const BOT_SECRET = process.env.TELEGRAM_BOT_SECRET || 'chocoberry_bot_secret';
if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set in .env');
    process.exit(1);
}
const api = new api_service_1.ApiService(BACKEND_URL, BOT_SECRET);
const bot = (0, bot_1.createBot)(BOT_TOKEN, api);
(0, scheduler_1.startScheduler)(bot, api);
console.log('[MoneyMind Bot] Running...');
process.on('SIGINT', () => {
    console.log('[MoneyMind Bot] Stopping...');
    bot.stopPolling();
    process.exit(0);
});
