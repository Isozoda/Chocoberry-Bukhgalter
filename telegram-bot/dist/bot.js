"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBot = createBot;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const start_1 = require("./commands/start");
const status_1 = require("./commands/status");
const report_1 = require("./commands/report");
const ashan_1 = require("./commands/ashan");
const ashan_parser_1 = require("./parsers/ashan-parser");
const keyboards_1 = require("./utils/keyboards");
function createBot(token, api) {
    const bot = new node_telegram_bot_api_1.default(token, { polling: true });
    bot.on('polling_error', (err) => {
        console.error('[Bot] Polling error:', err.message);
    });
    // /start [TOKEN]
    bot.onText(/^\/start(?:\s+(.+))?$/, async (msg, match) => {
        const connectToken = match?.[1]?.trim();
        await (0, start_1.handleStart)(bot, msg, connectToken, api);
    });
    // /status
    bot.onText(/^\/status$/, async (msg) => {
        await (0, status_1.handleStatus)(bot, msg.chat.id.toString(), api);
    });
    // /report
    bot.onText(/^\/report$/, async (msg) => {
        await (0, report_1.handleReport)(bot, msg.chat.id.toString(), api);
    });
    // /help
    bot.onText(/^\/help$/, async (msg) => {
        const chatId = msg.chat.id.toString();
        await bot.sendMessage(chatId, '📋 *Дастурҳо:*\n\n' +
            '/start — Оғоз кардан\n' +
            '/status — Ҳолати захира\n' +
            '/report — Ҳисоботи рӯзона\n' +
            '/help — Ёрдам', { parse_mode: 'Markdown', reply_markup: (0, keyboards_1.mainMenuKeyboard)() });
    });
    // Callback query handler for inline buttons
    bot.on('callback_query', async (query) => {
        try {
            const chatId = query.message?.chat.id.toString();
            if (!chatId)
                return;
            await bot.answerCallbackQuery(query.id).catch((err) => {
                console.warn('[Bot] Could not answer callback query (likely expired):', err.message);
            });
            const data = query.data || '';
            if (data === 'cmd_status') {
                await (0, status_1.handleStatus)(bot, chatId, api);
            }
            else if (data === 'cmd_report') {
                await (0, report_1.handleReport)(bot, chatId, api);
            }
            else if (data === 'cmd_main') {
                await bot.sendMessage(chatId, 'Менюи асосӣ:', { reply_markup: (0, keyboards_1.mainMenuKeyboard)() });
            }
            else if (data === 'cmd_help') {
                await bot.sendMessage(chatId, '📋 *Дастурҳо:*\n\n/start — Оғоз\n/status — Захира\n/report — Ҳисобот', { parse_mode: 'Markdown', reply_markup: (0, keyboards_1.mainMenuKeyboard)() });
            }
            else if (data === 'ash_ok') {
                await (0, ashan_1.handleAshanConfirm)(bot, chatId, api);
            }
            else if (data === 'ash_no') {
                await (0, ashan_1.handleAshanCancel)(bot, chatId);
            }
            else if (data === 'ash_ed') {
                await (0, ashan_1.handleAshanEdit)(bot, chatId);
            }
            else if (data.startsWith('ash_p:')) {
                await (0, ashan_1.handleAshanPick)(bot, chatId, data.slice(6));
            }
            else if (data === 'ash_sk') {
                await (0, ashan_1.handleAshanSkip)(bot, chatId);
            }
        }
        catch (error) {
            console.error('[Bot] Error in callback_query handler:', error.message);
        }
    });
    // General message handler for non-command text
    bot.on('message', async (msg) => {
        if (msg.text?.startsWith('/'))
            return;
        if (msg.text && (0, ashan_parser_1.isAshanMessage)(msg.text)) {
            await (0, ashan_1.handleAshanMessage)(bot, msg, api);
            return;
        }
        const firstName = msg.from?.first_name || 'Дӯст';
        await bot.sendMessage(msg.chat.id, `Салом, ${firstName}! 😊\n\nМан боти MoneyMind ҳастам.\n\n📋 Рӯйхати харидории Ашанро бифиристед — ман автоматӣ анборро навсозӣ мекунам.\n\nМисол:\n<code>Ашан\nКлубника 8,2кг\nБанан 8,4кг</code>`, { parse_mode: 'HTML', reply_markup: (0, keyboards_1.mainMenuKeyboard)() });
    });
    console.log('[Bot] Started with polling');
    return bot;
}
