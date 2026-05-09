"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainMenuKeyboard = mainMenuKeyboard;
exports.backKeyboard = backKeyboard;
exports.ashanConfirmKeyboard = ashanConfirmKeyboard;
exports.ashanPickKeyboard = ashanPickKeyboard;
function mainMenuKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '📦 Захира', callback_data: 'cmd_status' },
                { text: '📊 Ҳисобот', callback_data: 'cmd_report' },
            ],
            [
                { text: '❓ Ёрдам', callback_data: 'cmd_help' },
            ],
        ],
    };
}
function backKeyboard() {
    return {
        inline_keyboard: [[{ text: '⬅️ Бозгашт', callback_data: 'cmd_main' }]],
    };
}
function ashanConfirmKeyboard(hasNotFound) {
    const rows = [
        [
            { text: '✅ Ҳа, минус кун', callback_data: 'ash_ok' },
            { text: '❌ Бекор кун', callback_data: 'ash_no' },
        ],
    ];
    if (hasNotFound) {
        rows.push([{ text: '✏️ Ношинохтаҳоро муайян кун', callback_data: 'ash_ed' }]);
    }
    return { inline_keyboard: rows };
}
function ashanPickKeyboard(suggestions) {
    const rows = suggestions.map((s) => [
        { text: s.name, callback_data: `ash_p:${s.id}` },
    ]);
    rows.push([{ text: '❌ Ин молро гузор', callback_data: 'ash_sk' }]);
    return { inline_keyboard: rows };
}
