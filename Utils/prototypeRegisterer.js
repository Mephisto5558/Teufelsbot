const
  { BaseInteraction, Message, BaseClient, Collection, AutocompleteInteraction, User, Guild, GuildMember, ButtonBuilder, Events } = require('discord.js'),
  TicTacToe = require('discord-tictactoe'),
  GameBoardButtonBuilder = require('discord-tictactoe/dist/src/bot/builder/GameBoardButtonBuilder').default,
  { randomInt } = require('crypto'),
  { readdir } = require('fs/promises'),
  { join } = require('path'),
  DB = require('@mephisto5558/mongoose-db'),
  I18nProvider = require('@mephisto5558/i18n'),
  { Log, customReply, runMessages, _patch, playAgain } = require('./prototypeRegisterer/'),
  findAllEntries = require('./findAllEntries.js');

if (!require('../config.json')?.HideOverwriteWarning) console.warn(`Overwriting the following variables and functions (if they exist):
  Vanilla:    global.getDirectories, global.sleep, global.log, Array#random, Number#limit, Object#fMerge, Object#filterEmpty, Function#bBind
  Discord.js: BaseInteraction#customReply, Message#user, Message#customReply, Message#runMessages, BaseClient#prefixCommands, BaseClient#slashCommands, BaseClient#cooldowns, BaseClient#awaitReady, BaseClient#defaultSettings, BaseClient#settings, AutocompleteInteraction#focused, User#db, Guild#db, Guild#localeCode, GuildMember#db.
  \nModifying Discord.js Message._patch method.`
);

global.log = new Log();
global.sleep = require('util').promisify(setTimeout);
/**@param {string}path @returns {string[]}directory names*/
global.getDirectories = async path => (await readdir(path, { withFileTypes: true })).reduce((acc, e) => e.isDirectory() ? [...acc, e.name] : acc, []);

Object.defineProperty(Array.prototype, 'random', {
  value: function random() { return this[randomInt(this.length)]; },
  enumerable: false
});
Object.defineProperty(Number.prototype, 'limit', {
  value: function limit({ min = -Infinity, max = Infinity } = {}) { return Math.min(Math.max(Number(this), min), max); },
  enumerable: false
});
Object.defineProperty(Object.prototype, 'fMerge', {
  /**@param {'overwrite'|'push'|null}mode*/
  value: function fMerge(obj, mode, { ...output } = { ...this }) {
    if (`${{}}` != this || `${{}}` != obj) return output;
    for (const key of Object.keys({ ...this, ...obj })) {
      if (`${{}}` == this[key]) output[key] = key in obj ? this[key].fMerge(obj[key], mode) : this[key];
      else if (Array.isArray(this[key])) {
        if (key in obj) {
          if (mode == 'overwrite') output[key] = obj[key];
          else if (mode == 'push') for (const e of obj[key]) output[key].push(e);
          else for (let i = 0; i < this[key].length || i < obj[key].length; i++) output[key][i] = i in obj[key] ? obj[key][i] : this[key][i];
        }
        else output[key] = this[key];
      }
      else output = { ...output, [key]: key in obj ? obj[key] : this[key] };
    }
    return output;
  },
  enumerable: false
});
Object.defineProperty(Object.prototype, 'filterEmpty', {
  value: function filterEmpty() { return Object.fromEntries(Object.entries(this).filter(([, v]) => !(v == null || (Object(v) === v && Object.keys(v).length == 0))).map(([k, v]) => [k, v instanceof Object ? v.filterEmpty() : v])); },
  enumerable: false
});
Object.defineProperty(Function.prototype, 'bBind', {
  /**@returns {bBoundFunction}*/
  value: function bBind(thisArg, ...args) {
    const bound = this.bind(thisArg, ...args);
    bound.__targetFunction__ = this;
    bound.__boundThis__ = thisArg;
    bound.__boundArgs__ = args;
    return bound;
  },
  enumerable: false
});
Object.defineProperty(BaseInteraction.prototype, 'customReply', {
  value: customReply,
  enumerable: false
});
Object.defineProperties(BaseClient.prototype, {
  /**@type {Collection<string, object}*/
  prefixCommands: { value: new Collection() },
  /**@type {Collection<string, object}*/
  slashCommands: { value: new Collection() },
  i18n: { value: new I18nProvider({ notFoundMessage: 'TEXT_NOT_FOUND: {key}', localesPath: join(__dirname, '/../Locales') }) },
  cooldowns: { value: new Map() },
  settings: {
    get() { return this.db?.get('botSettings') ?? {}; },
    set(val) { this.db.set('botSettings', val); },
  },
  defaultSettings: {
    get() { return this.db?.get('guildSettings')?.default ?? {}; },
    set(val) { this.db.update('guildSettings', 'default', val); }
  },
  awaitReady: {
    /**@returns {Promise<Application>} fetched application*/
    value: function awaitReady() { return new Promise(res => this.once(Events.ClientReady, () => res(this.application.name ? this.application : this.application.fetch()))); }
  }
});
Object.defineProperty(AutocompleteInteraction.prototype, 'focused', {
  get() { return this.options.getFocused(true); },
  set(val) { this.options.data.find(e => e.focused).value = val; }
});
Object.defineProperty(Message.prototype, 'user', { get() { return this.author; } });
Object.assign(Message.prototype, { customReply, runMessages, _patch });
Object.defineProperties(User.prototype, {
  db: {
    get() { return this.client.db?.get('userSettings')?.[this.id] ?? {}; },
    set(val) { this.client.db.update('userSettings', this.id, val); }
  },
  customName: {
    get() { return this.db.customName ?? this.username; },
    set(val) { this.db.update('customName', val); }
  },
  customTag: {
    get() { return (this.db.customName ?? this.username) + `#${this.discriminator}`; },
    set() { throw new Error('You cannot set a value to User#customTag!'); }
  }
});
Object.defineProperties(GuildMember.prototype, {
  db: {
    get() { return findAllEntries(this.guild.db, this.id); },
    set() { throw new Error('You cannot set a value to GuildMember#db!'); }
  },
  customName: {
    get() { return this.guild.db.customNames?.[this.id] ?? this.nickname ?? this.user.username; },
    set(val) { this.client.db.update('guildSettings', `${this.guild.id}.customNames.${this.id}`, val); }
  },
  customTag: {
    get() { return (this.guild.db.customNames?.[this.id] ?? this.nickname ?? this.user.username) + `#${this.user.discriminator}`; },
    set() { throw new Error('You cannot set a value to GuildMember#customTag!'); }
  }
}
);
Object.defineProperties(Guild.prototype, {
  db: {
    get() { return this.client.db?.get('guildSettings')?.[this.id] ?? {}; },
    set(val) { this.client.db.update('guildSettings', this.id, val); }
  },
  /**@type {string?}*/
  localeCode: {
    get() { return this.db.config?.lang ?? this.preferredLocale.slice(0, 2) ?? this.client.defaultSettings.config.lang; },
    set(val) { this.client.db.update('guildSettings', 'config.lang', val); }
  }
});

/**@param overwrite overwrite existing collection, default: `false`*/
DB.prototype.generate = async function generate(overwrite = false) {
  log.setType('DB').debug(`generating db files${overwrite ? ', overwriting existing data' : ''}`).setType();
  for (const { key, value } of require('../Templates/db_collections.json')) await this.set(key, value, overwrite);
};

TicTacToe.prototype.playAgain = playAgain;
/**@param {number}row @param {number}col*/
GameBoardButtonBuilder.prototype.createButton = function createButton(row, col) {
  const
    button = new ButtonBuilder(),
    buttonIndex = row * this.boardSize + col,
    buttonData = this.boardData[buttonIndex];

  //Discord does not allow empty strings as label, this is a "ZERO WIDTH SPACE"
  if (buttonData === 0) button.setLabel('\u200B');
  else {
    if (this.customEmojies) button.setEmoji(this.emojies[buttonData]);
    else button.setLabel(this.buttonLabels[buttonData - 1]);

    if (this.disableButtonsAfterUsed) button.setDisabled(true);
  }
  return button.setCustomId(buttonIndex.toString()).setStyle(this.buttonStyles[buttonData]);
};