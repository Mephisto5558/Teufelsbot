/* eslint-disable unicorn/no-top-level-side-effects */
/* eslint-disable @eslint-community/eslint-comments/no-use -- special properties */
/* eslint no-underscore-dangle: [warn, {allow: [_patch, __count__, _log]}] -- special properties */


import { mkdir } from 'node:fs/promises';
import { DB } from '@mephisto5558/mongoose-db';
import TicTacToe from 'discord-tictactoe';
import GameBoardButtonBuilder from 'discord-tictactoe/dist/src/bot/builder/GameBoardButtonBuilder.js';
import { setDefaultConfig } from '../configValidator.ts';
import Log, { LogLevel } from './Log.ts';
import { playAgain, sendChallengeMention } from './TicTacToe_playAgain.ts';

import {} from './builtin.ts';

export { default as _patch } from './message__patch.ts';
export { default as customReply } from './message_customReply.ts';
export { default as runMessages } from './message_runMessages.ts';
export { Log, playAgain, sendChallengeMention };

globalThis.log = new Log();
await mkdir(log.logFilesDir, { recursive: true });

const
  config = await setDefaultConfig(),
  overwrites = Object.fromEntries(Object.entries({
    globals: ['globalThis.log()'],
    vanilla: [
      'Array#random()', 'Array#unique()', 'Number#limit()', 'Number#inRange()', 'Object#__count__', 'BigInt#toJSON()'
    ],
    discordJs: [
      'Client#commandManager', 'Client#backupSystem', 'Client#giveawaysManager', 'Client#webServer',
      'Client#cooldowns', 'Client#db', 'Client#i18n', 'Client#settings', 'Client#defaultSettings', 'Client#botType', 'Client#config', 'Client#prefix',
      'Client#loadEnvAndDB()', 'Client#awaitReady()', 'ClientApplication#getEmoji()',
      'Message#originalContent', 'Message#args', 'Message#commandName', 'Message#user', 'Message#customReply()', 'Message#runMessages',
      'BaseInteraction#customReply()', 'AutocompleteInteraction#focused',
      'User#localeCode', 'User#db', 'User#updateDB()', 'User#deleteDB()',
      'GuildMember#db', 'GuildMember#localeCode',
      'Guild#localeCode', 'Guild#prefix', 'Guild#db', 'Guild#updateDB()', 'Guild#deleteDB()'
    ]
  }).map(([k, v]) => [k, v.join(', ')]));

if (!config.hideOverwriteWarning) {
  log.logToConsole({ level: LogLevel.warn }, [
    'Overwriting the following variables and functions (if they exist):',
    `  Globals:    ${overwrites.globals}`,
    `  Vanilla:    ${overwrites.vanilla}`,
    `  Discord.js: ${overwrites.discordJs}`,
    '  Modifying Discord.js Message._patch method.'
  ].join('\n'));
}

// #region mongoose-db
Object.defineProperty(DB.prototype, 'generate', {

  value: async function generate(this: DB, overwrite = false) {
    this.saveLog(`generating db files${overwrite ? ', overwriting existing data' : ''}`);
    await Promise.all((await import('../../../Templates/db_collections.json')).map(async ({ key, value }) => void await this.set(key, value, overwrite)));
  } as DB['generate']
});

// #endregion

// #region discord-tictactoe
Object.defineProperty(TicTacToe.prototype, 'playAgain', {
  value: playAgain
});

/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
-- the library does not provide types */
const originalCreateButton = GameBoardButtonBuilder.prototype.createButton;
Object.defineProperty(GameBoardButtonBuilder.prototype, 'createButton', {
  value: function createButton(this: { buttonLabels: [string, string, string] }, ...args: unknown[]) {
    this.buttonLabels[0] = '\u{200B}'; // Discord does not allow empty strings as label, this is a "ZERO WIDTH SPACE"

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    -- the library does not provide types */
    return originalCreateButton.call(this, ...args);
  }
});

// #endregion