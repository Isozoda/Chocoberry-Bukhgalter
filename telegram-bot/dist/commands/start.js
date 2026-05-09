"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStart = handleStart;
const keyboards_1 = require("../utils/keyboards");
async function handleStart(bot, msg, token, api) {
    const chatId = msg.chat.id.toString();
    const firstName = msg.from?.first_name || 'Дӯст';
    if (token) {
        try {
            await api.subscribe(token, chatId);
            await bot.sendMessage(chatId, `✅ Салом, ${firstName}!\n\nHesоби MoneyMind шумо бо Telegram пайваст шуд.\n\nАкнун шумо огоҳиҳоро хоҳед дид:\n• 📦 Захираи кам\n• 📊 Ҳисоботи рӯзона`, { reply_markup: (0, keyboards_1.mainMenuKeyboard)() });
        }
        catch (err) {
            console.error('[start] Subscribe error:', err);
            await bot.sendMessage(chatId, '❌ Хато рӯй дод. Лутфан аз нав кӯшиш кунед ё линки нав гиред.');
        }
        return;
    }
    await bot.sendMessage(chatId, `Салом, ${firstName}! 👋\n\nБо MoneyMind пайваст шавед:\n1. Ба саҳифаи "Бизнес" равед\n2. "Пайваст кардан" -ро клик кунед\n3. Линкро клик кунед`, { reply_markup: (0, keyboards_1.mainMenuKeyboard)() });
}
