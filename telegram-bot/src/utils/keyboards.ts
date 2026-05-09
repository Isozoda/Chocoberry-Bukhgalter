import TelegramBot from 'node-telegram-bot-api';

export function mainMenuKeyboard(): TelegramBot.InlineKeyboardMarkup {
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

export function backKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [[{ text: '⬅️ Бозгашт', callback_data: 'cmd_main' }]],
  };
}

export function ashanConfirmKeyboard(hasNotFound: boolean): TelegramBot.InlineKeyboardMarkup {
  const rows: TelegramBot.InlineKeyboardButton[][] = [
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

export function ashanPickKeyboard(
  suggestions: Array<{ id: string; name: string }>,
): TelegramBot.InlineKeyboardMarkup {
  const rows: TelegramBot.InlineKeyboardButton[][] = suggestions.map((s) => [
    { text: s.name, callback_data: `ash_p:${s.id}` },
  ]);
  rows.push([{ text: '❌ Ин молро гузор', callback_data: 'ash_sk' }]);
  return { inline_keyboard: rows };
}
