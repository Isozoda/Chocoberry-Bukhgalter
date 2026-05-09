"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAshanMessage = handleAshanMessage;
exports.handleAshanConfirm = handleAshanConfirm;
exports.handleAshanCancel = handleAshanCancel;
exports.handleAshanEdit = handleAshanEdit;
exports.handleAshanPick = handleAshanPick;
exports.handleAshanSkip = handleAshanSkip;
const ashan_parser_1 = require("../parsers/ashan-parser");
const keyboards_1 = require("../utils/keyboards");
const sessions = new Map();
const UNIT_DISPLAY = {
    KG: 'кг', GRAM: 'г', LITER: 'л', ML: 'мл',
    PIECE: 'шт', BOX: 'кор', PACK: 'пак', BLOCK: 'бл', DOZEN: 'дз', TON: 'т',
};
function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function fmtNum(n) {
    return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}
function fmtStock(stock, unit) {
    const n = parseFloat(stock);
    const u = UNIT_DISPLAY[unit] || unit;
    return `${fmtNum(n)} ${u}`;
}
function getResolvedIndices(session) {
    return new Set(session.manualMatched.map((mm) => mm.notFoundIndex));
}
function buildConfirmText(session) {
    const resolved = getResolvedIndices(session);
    const totalMatched = session.autoMatched.length + session.manualMatched.length;
    const remaining = session.notFound.filter((_, i) => !resolved.has(i));
    let text = `📋 <b>Рӯйхати Ашан</b>\n\n`;
    if (totalMatched > 0) {
        text += `✅ <b>Шинохта шуд (${totalMatched}):</b>\n`;
        for (const m of session.autoMatched) {
            const u = UNIT_DISPLAY[m.itemUnit] || m.itemUnit;
            text += `▫️ <b>${esc(m.itemName)}</b> — <code>${fmtNum(m.quantity)} ${m.unit}</code>  <i>(захира: ${fmtStock(m.currentStock, m.itemUnit)})</i>\n`;
        }
        for (const mm of session.manualMatched) {
            const nf = session.notFound[mm.notFoundIndex];
            text += `▫️ <b>${esc(mm.itemName)}</b> — <code>${fmtNum(nf.quantity)} ${nf.unit}</code>  <i>(захира: ${fmtStock(mm.currentStock, mm.itemUnit)})</i>\n`;
        }
    }
    if (remaining.length > 0) {
        text += `\n❓ <b>Шинохта нашуд (${remaining.length}):</b>\n`;
        for (const nf of remaining) {
            text += `⚠️ <i>"${esc(nf.name)}"</i>\n`;
        }
    }
    text += '\nАз анбор минус кунам?';
    return text;
}
async function handleAshanMessage(bot, msg, api) {
    const chatId = msg.chat.id.toString();
    await bot.sendMessage(chatId, '⏳ Таҳлил карда истодаем...');
    let items;
    try {
        const res = await api.getInventoryItems(chatId);
        items = res.items;
    }
    catch (err) {
        const status = err?.response?.status;
        await bot.sendMessage(chatId, status === 404
            ? '❌ Ҳисоби шумо пайваст нашудааст. Ба саҳифаи "Бизнес" равед ва пайваст кунед.'
            : '❌ Маълумоти анбор гирифта нашуд. Серверро тафтиш кунед.');
        return;
    }
    if (items.length === 0) {
        await bot.sendMessage(chatId, '📦 Анбор холӣ аст. Аввал молҳо илова кунед.');
        return;
    }
    const rawMessage = msg.text || '';
    const result = (0, ashan_parser_1.parseAshanMessage)(rawMessage, items);
    if (result.matched.length === 0 && result.notFound.length === 0) {
        await bot.sendMessage(chatId, '❓ Рӯйхат шинохта нашуд. Формати дуруст:\n\n<code>Ашан\nКлубника 8,2кг\nБанан 8,4кг</code>', { parse_mode: 'HTML' });
        return;
    }
    const session = {
        autoMatched: result.matched,
        notFound: result.notFound,
        manualMatched: [],
        editIndex: 0,
        rawMessage,
    };
    sessions.set(chatId, session);
    await bot.sendMessage(chatId, buildConfirmText(session), {
        parse_mode: 'HTML',
        reply_markup: (0, keyboards_1.ashanConfirmKeyboard)(result.notFound.length > 0),
    });
}
async function handleAshanConfirm(bot, chatId, api) {
    const session = sessions.get(chatId);
    if (!session) {
        await bot.sendMessage(chatId, '❌ Сессия ёфт нашуд. Рӯйхатро аз нав фиристед.');
        return;
    }
    const deductItems = [
        ...session.autoMatched.map((m) => ({ itemId: m.itemId, quantity: m.quantity, unit: m.unit })),
        ...session.manualMatched.map((mm) => {
            const nf = session.notFound[mm.notFoundIndex];
            return { itemId: mm.itemId, quantity: nf.quantity, unit: nf.unit };
        }),
    ];
    if (deductItems.length === 0) {
        sessions.delete(chatId);
        await bot.sendMessage(chatId, '❌ Минус кардани мол нест.');
        return;
    }
    await bot.sendMessage(chatId, '⏳ Анборро навсозӣ мекунем...');
    let result;
    try {
        result = await api.bulkDeduct(chatId, deductItems, session.rawMessage);
    }
    catch (err) {
        sessions.delete(chatId);
        await bot.sendMessage(chatId, `❌ Хато: ${err?.response?.data?.message || err.message || 'Серверро тафтиш кунед'}`);
        return;
    }
    sessions.delete(chatId);
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    let text = '✅ <b>Анбор навсозӣ шуд!</b>\n\n';
    for (const r of result.results ?? []) {
        const u = UNIT_DISPLAY[r.unit] || r.unit;
        const before = parseFloat(r.stockBefore);
        const after = parseFloat(r.stockAfter);
        text += `📦 <b>${esc(r.name)}:</b>  <code>${fmtNum(before)} → ${fmtNum(after)} ${u}</code>\n`;
    }
    const lowItems = (result.results ?? []).filter((r) => r.isLow);
    if (lowItems.length > 0) {
        text += '\n';
        for (const r of lowItems) {
            const u = UNIT_DISPLAY[r.unit] || r.unit;
            const after = parseFloat(r.stockAfter);
            const min = parseFloat(r.minStockLevel);
            text += `⚠️ <b>${esc(r.name)}</b> кам мондааст (${fmtNum(after)} ${u} &lt; ${fmtNum(min)} ${u} ҳад)\n`;
        }
    }
    if ((result.warnings ?? []).length > 0) {
        text += '\n❌ <b>Хатоҳо:</b>\n';
        for (const w of result.warnings) {
            text += `• <i>${esc(w.error || 'Хато')}</i>\n`;
        }
    }
    text += `\n🕐 <i>${time} | Ашан харид</i>`;
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
}
async function handleAshanCancel(bot, chatId) {
    sessions.delete(chatId);
    await bot.sendMessage(chatId, '❌ Бекор карда шуд.');
}
async function handleAshanEdit(bot, chatId) {
    const session = sessions.get(chatId);
    if (!session) {
        await bot.sendMessage(chatId, '❌ Сессия ёфт нашуд.');
        return;
    }
    const resolved = getResolvedIndices(session);
    const firstUnresolved = session.notFound.findIndex((_, i) => !resolved.has(i));
    if (firstUnresolved === -1) {
        await bot.sendMessage(chatId, buildConfirmText(session), {
            parse_mode: 'HTML',
            reply_markup: (0, keyboards_1.ashanConfirmKeyboard)(false),
        });
        return;
    }
    session.editIndex = firstUnresolved;
    sessions.set(chatId, session);
    await showEditStep(bot, chatId);
}
async function showEditStep(bot, chatId) {
    const session = sessions.get(chatId);
    if (!session)
        return;
    const resolved = getResolvedIndices(session);
    let idx = session.editIndex;
    while (idx < session.notFound.length && resolved.has(idx))
        idx++;
    if (idx >= session.notFound.length) {
        await bot.sendMessage(chatId, buildConfirmText(session), {
            parse_mode: 'HTML',
            reply_markup: (0, keyboards_1.ashanConfirmKeyboard)(false),
        });
        return;
    }
    session.editIndex = idx;
    sessions.set(chatId, session);
    const nf = session.notFound[idx];
    const remaining = session.notFound.filter((_, i) => !resolved.has(i));
    const pos = remaining.indexOf(nf) + 1;
    const text = `❓ <b>"${esc(nf.name)}"</b> — кадом мол? (${pos}/${remaining.length})\n` +
        `<i>Миқдор: ${fmtNum(nf.quantity)} ${nf.unit}</i>`;
    await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: (0, keyboards_1.ashanPickKeyboard)(nf.suggestions),
    });
}
async function handleAshanPick(bot, chatId, itemId) {
    const session = sessions.get(chatId);
    if (!session) {
        await bot.sendMessage(chatId, '❌ Сессия ёфт нашуд.');
        return;
    }
    const idx = session.editIndex;
    const nf = session.notFound[idx];
    if (!nf)
        return;
    const picked = nf.suggestions.find((s) => s.id === itemId);
    if (!picked) {
        await bot.sendMessage(chatId, '❌ Интихоб нодуруст аст.');
        return;
    }
    session.manualMatched.push({
        notFoundIndex: idx,
        itemId: picked.id,
        itemName: picked.name,
        itemUnit: picked.unit,
        currentStock: picked.currentStock,
    });
    session.editIndex = idx + 1;
    sessions.set(chatId, session);
    await showEditStep(bot, chatId);
}
async function handleAshanSkip(bot, chatId) {
    const session = sessions.get(chatId);
    if (!session) {
        await bot.sendMessage(chatId, '❌ Сессия ёфт нашуд.');
        return;
    }
    session.editIndex++;
    sessions.set(chatId, session);
    await showEditStep(bot, chatId);
}
