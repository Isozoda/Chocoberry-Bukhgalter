"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = startScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
function startScheduler(bot, api) {
    // Daily report at 21:00 Dushanbe time (UTC+5 = 16:00 UTC)
    node_cron_1.default.schedule('0 16 * * *', async () => {
        console.log('[Scheduler] Running daily report cron');
        try {
            await sendDailyReportToBackend(api);
        }
        catch (err) {
            console.error('[Scheduler] Daily report error:', err);
        }
    });
    console.log('[Scheduler] Started — daily report at 21:00 Dushanbe (UTC+5)');
}
async function sendDailyReportToBackend(api) {
    // The backend handles fetching data and sending to each linked user
    // This just triggers the backend endpoint via a POST
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000/api';
    const secret = process.env.TELEGRAM_BOT_SECRET || 'chocoberry_bot_secret';
    try {
        await fetch(`${backendUrl}/telegram/notify/daily-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-bot-secret': secret },
            body: JSON.stringify({ trigger: 'cron' }),
        });
    }
    catch (err) {
        console.error('[Scheduler] Failed to trigger daily report:', err);
    }
}
