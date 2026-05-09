"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReport = handleReport;
const keyboards_1 = require("../utils/keyboards");
async function handleReport(bot, chatId, api) {
    await bot.sendMessage(chatId, '📊 Ҳисоботи рӯзонаро меёбам...');
    try {
        const report = await api.getDailyReport('');
        if (!report) {
            await bot.sendMessage(chatId, '📭 Имрӯз ҳисобот сабт нашудааст.', {
                reply_markup: (0, keyboards_1.backKeyboard)(),
            });
            return;
        }
        const text = `📊 *Ҳисоботи рӯзона — ${report.date}*\n\n` +
            `💰 Фурӯш: *${Number(report.totalSales).toLocaleString()} TJS*\n` +
            `💸 Хароҷот: *${Number(report.totalExpenses).toLocaleString()} TJS*\n` +
            `✅ Боқимонда: *${Number(report.remaining).toLocaleString()} TJS*`;
        await bot.sendMessage(chatId, text, {
            parse_mode: 'Markdown',
            reply_markup: (0, keyboards_1.backKeyboard)(),
        });
    }
    catch (err) {
        console.error('[report] Error:', err);
        await bot.sendMessage(chatId, '❌ Ҳисоботро гирифта натавонистам.', {
            reply_markup: (0, keyboards_1.backKeyboard)(),
        });
    }
}
