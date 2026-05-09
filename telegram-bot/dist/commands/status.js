"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStatus = handleStatus;
const keyboards_1 = require("../utils/keyboards");
async function handleStatus(bot, chatId, api) {
    await bot.sendMessage(chatId, '🔍 Дар ҳол маълумот мегирам...');
    try {
        // Fetch low-stock items using the user's chatId
        const items = await api.getLowStockItems(chatId);
        if (items.length === 0) {
            await bot.sendMessage(chatId, '✅ Ҳамаи захираҳо дар сатҳи муқаррарӣ мебошанд.', {
                reply_markup: (0, keyboards_1.backKeyboard)(),
            });
            return;
        }
        const lines = items.map((i) => `• ⚠️ ${i.name}: ${i.currentStock} ${i.unit}`).join('\n');
        await bot.sendMessage(chatId, `📦 *Захираи кам:*\n\n${lines}`, {
            parse_mode: 'Markdown',
            reply_markup: (0, keyboards_1.backKeyboard)(),
        });
    }
    catch (err) {
        console.error('[status] Error:', err);
        await bot.sendMessage(chatId, '❌ Маълумотро гирифта натавонистам. Баъдтар кӯшиш кунед.', {
            reply_markup: (0, keyboards_1.backKeyboard)(),
        });
    }
}
