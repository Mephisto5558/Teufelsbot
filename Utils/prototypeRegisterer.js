const
  { CommandInteraction, Message, BaseClient, Collection, AutocompleteInteraction, User, Guild, GuildMember, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, Events } = require('discord.js'),
  TicTacToe = require('discord-tictactoe'),
  GameBoardButtonBuilder = require('discord-tictactoe/dist/src/bot/builder/GameBoardButtonBuilder').default,
  { randomInt } = require('crypto'),
  { appendFileSync, readdirSync, existsSync, mkdirSync } = require('fs'),
  customReply = require('./customReply.js'),
  findAllEntries = require('./findAllEntries.js'),
  cooldowns = require('./cooldowns.js'),
  I18nProvider = require('./I18nProvider.js'),
  date = new Date().toLocaleDateString('en').replaceAll('/', '-'),
  getTime = () => new Date().toLocaleTimeString('en', { timeStyle: 'medium', hour12: false }).replace(/^24:/, '00:'),
  writeLogFile = (type, ...data) => appendFileSync(`./Logs/${date}_${type}.log`, `[${getTime()}] ${data.join(' ')}\n`),
  originalMessage_patchMethod = Message.prototype._patch;

if (!existsSync('./Logs')) mkdirSync('./Logs');
if (!require('../config.json')?.HideOverwriteWarning) console.warn(`Overwriting the following variables and functions (if they exist):
  Vanilla:    global.getDirectoriesSync, global.sleep, Array#random, Number#limit, Object#fMerge, Object#filterEmpty, Function#bBind
  Discord.js: CommandInteraction#customReply, Message#user, Message#customReply, Message#runMessages, Message#runEco, BaseClient#prefixCommands, BaseClient#slashCommands, BaseClient#cooldowns, BaseClient#awaitReady, BaseClient#log, BaseClient#error, BaseClient#defaultSettings, BaseClient#settings, AutocompleteInteraction#focused, User#db, Guild#db, Guild#localeCode, GuildMember#db.
  \nModifying Discord.js Message._patch method.`
);

global.sleep = require('util').promisify(setTimeout);
global.getDirectoriesSync = path => readdirSync(path, { withFileTypes: true }).reduce((acc, e) => e.isDirectory() ? [...acc, e.name] : acc, []);

Array.prototype.random = function random() { return this[randomInt(this.length)]; };
Number.prototype.limit = function limit({ min = -Infinity, max = Infinity } = {}) { return Math.min(Math.max(Number(this), min), max); };
Object.prototype.fMerge = function fMerge(obj, mode, { ...output } = { ...this }) {
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
};
Object.prototype.filterEmpty = function filterEmpty() { return Object.fromEntries(Object.entries(this).filter(([, v]) => !(v == null || (Object(v) === v && Object.keys(v).length == 0))).map(([k, v]) => [k, v instanceof Object ? v.filterEmpty() : v])); };
Function.prototype.bBind = function bBind(thisArg, ...args) {
  const bound = this.bind(thisArg, ...args);
  bound.__targetFunction__ = this;
  bound.__boundThis__ = thisArg;
  bound.__boundArgs__ = args;
  return bound;
};
CommandInteraction.prototype.customReply = customReply;
Object.defineProperties(BaseClient.prototype, {
  prefixCommands: { value: new Collection() },
  slashCommands: { value: new Collection() },
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
    value: function awaitReady() { return new Promise(res => this.once(Events.ClientReady, () => res(this.application.name ? this.application : this.application.fetch()))); }
  },
  log: {
    value: function log(...data) {
      console.info(`[${getTime()}] ${data.join(' ')}`);
      writeLogFile('log', ...data);
      return this;
    }
  },
  error: {
    value: function error(...data) {
      console.error('\x1b[1;31m%s\x1b[0m', `[${getTime()}] ${data.join(' ')}`);
      writeLogFile('log', ...data);
      writeLogFile('error', ...data);
      return this;
    }
  }
});
Object.defineProperty(AutocompleteInteraction.prototype, 'focused', {
  get() { return this.options.getFocused(true); },
  set(val) { this.options.data.find(e => e.focused).value = val; }
});
Object.defineProperty(Message.prototype, 'user', { get() { return this.author; } });
Object.assign(Message.prototype, {
  customReply,

  /**Modified from default one.*/
  _patch(data) {
    if ('content' in data) {
      /**
       * The original content of the message. This is a custom property set in "prototypeRegisterer.js".
       * <info>This property requires the GatewayIntentBits.MessageContent privileged intent
       * in a guild for messages that do not mention the client.</info>
       * @type {?string}
       */
      this.originalContent = data.content;

      const prefixType = this.client.botType == 'dev' ? 'betaBotPrefix' : 'prefix';
      let
        prefixLength = 0,
        { prefix, caseinsensitive } = this.guild?.db.config?.[prefixType] ?? {};

      if (!prefix) prefix = this.client.defaultSettings.config[prefixType];
      if (caseinsensitive) prefix = prefix.toLowerCase();

      if ((caseinsensitive ? data.content.toLowerCase() : data.content).startsWith(prefix)) prefixLength = prefix.length;
      else if (data.content.startsWith(`<@${this.client.user.id}>`)) prefixLength = this.client.user.id.length + 3;

      /**
       * The arguments of the message. It slices out the prefix and splits by spaces. This is a custom property set in "prototypeRegisterer.js".
       * @type {?string[]}
       */
      this.args = data.content.replaceAll('<@!', '<@').slice(prefixLength).trim().split(' ');

      /**
       * The first word of the original message content. `null` if no prefix has been found. This is a custom property set in "prototypeRegisterer.js".
       * @type {?string}
       */
      this.commandName = prefixLength ? this.args.shift().toLowerCase() : null;
    }
    else {
      this.originalContent ??= null;
      this.args ??= null;
      this.commandName ??= null;
    }

    originalMessage_patchMethod.call(this, ...arguments);

    if (this.args) this.content = this.args.join(' ');
  },
  /**@returns {Message} */
  runMessages() {
    const { afkMessages = {}, triggers = {}, counting: { [this.channel.id]: countingData } = {} } = this.guild.db;

    if (this.client.botType != 'dev' && triggers.length && !cooldowns.call(this, { name: 'triggers', cooldowns: { user: 10000 } }))
      for (const trigger of triggers.filter(e => this.originalContent?.toLowerCase()?.includes(e.trigger.toLowerCase())).slice(0, 3))
        this.customReply(trigger.response);
    else if (this.originalContent.includes(this.client.user.id) && !cooldowns.call(this, { name: 'botMentionReaction', cooldowns: { user: 5000 } }))
      this.react('👀');

    if (this.client.botType == 'dev') return this;

    if (countingData && Number(this.originalContent)) {
      if (countingData.lastNumber + 1 == this.originalContent && countingData.lastAuthor != this.user.id) {
        this.client.db.update('guildSettings', `${this.guild.id}.counting.${this.channel.id}`, { lastNumber: countingData.lastNumber + 1, lastAuthor: this.user.id });
        this.react('✅');
      }
      else {
        this.react('❌');

        if (countingData.lastNumber != 0) {
          this.client.db.update('guildSettings', `${this.guild.id}.counting.${this.channel.id}`, { user: null, lastNumber: 0 });
          this.reply(I18nProvider.__({ locale: this.guild.localeCode }, 'events.counting.error', countingData.lastNumber) + I18nProvider.__({ locale: this.guild.localeCode }, countingData.lastNumber + 1 != this.originalContent ? 'events.counting.wrongNumber' : 'events.counting.sameUserTwice'));
        }
      }
    }

    const { createdAt, message } = (afkMessages[this.user.id]?.message ? afkMessages[this.user.id] : this.user.db.afkMessage) ?? {};
    if (message && !this.originalContent.toLowerCase().includes('--afkignore')) {
      this.client.db.update('userSettings', `${this.user.id}.afkMessage`, {});
      this.client.db.update('guildSettings', `${this.guild.id}.afkMessages.${this.user.id}`, {});
      if (this.member.moderatable && this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(this.member.nickname.substring(6));
      this.customReply(I18nProvider.__({ locale: this.guild.localeCode }, 'events.afkEnd', { timestamp: createdAt, message }));
    }

    if (cooldowns.call(this, { name: 'afkMsg', cooldowns: { user: 10000 } })) return this;

    const afkMsgs = this.mentions.members.reduce((acc, e) => {
      const { message, createdAt } = (afkMessages[e.id]?.message ? afkMessages[e.id] : e.user.db.afkMessage) ?? {};
      if (!message || e.id == this.user.id) return acc;

      const afkMessage = I18nProvider.__({ locale: this.guild.localeCode }, 'events.afkMsg', {
        member: e.nickname?.startsWith('[AFK] ') ? e.nickname.substring(6) : e.displayName,
        message, timestamp: createdAt
      });

      if (acc.length + afkMessage.length >= 2000) {
        this.customReply(acc);
        acc = '';
      }

      return `${acc}${afkMessage}\n`;
    }, '');

    if (afkMsgs.length) this.customReply(afkMsgs);
    return this;
  },
  /**@returns {Message} */
  runEco() {
    const { config: { gaining: cGaining = {}, blacklist: cBlacklist = {} } = {}, [this.user.id]: { gaining, currency, currencyCapacity, skills } = {} } = this.guild.db.economy ?? {};

    if (
      this.channel.type != ChannelType.DM && this.guild.db.economy?.enable && gaining?.chat && currency >= currencyCapacity &&
      this.content.length > (cGaining.chat?.min_message_length ?? this.client.defaultSettings.economy.gaining.chat.min_message_length) &&
      this.content.length < (cGaining.chat?.max_message_length ?? this.client.defaultSettings.economy.gaining.chat.max_message_length) &&
      !cBlacklist.channel?.includes(this.channel.id) && !cBlacklist.users?.includes(this.user.id) &&
      !this.member.roles.cache.hasAny(cBlacklist.roles) && !cooldowns.call(this, { name: 'economy', cooldowns: { user: 2e4 } })
    ) this.client.db.update('guildSettings', `${this.guild.id}.economy.${this.user.id}.currency`, parseFloat((currency + gaining.chat + skills.currency_bonus_absolute.lvl ** 2 + gaining.chat * skills.currency_bonus_percentage.lvl ** 2 / 100).limit(0, currencyCapacity).toFixed(3)));

    return this;
  }
});
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
  localeCode: {
    get() { return this.db.config?.lang ?? this.preferredLocale.slice(0, 2) ?? this.client.defaultSettings.config.lang; },
    set(val) { this.client.db.update('guildSettings', 'config.lang', val); }
  }
});
TicTacToe.prototype.playAgain = async function playAgain(interaction, lang) {
  const
    opponent = interaction.options?.getUser('opponent'),
    oldComponents = (await interaction.fetchReply()).components;

  let components = oldComponents;

  if (!components[3]?.components[0]?.customId) components[3] = new ActionRowBuilder({
    components: [new ButtonBuilder({
      customId: 'playAgain',
      label: lang('global.playAgain'),
      style: ButtonStyle.Success
    })]
  });

  const collector = (await interaction.editReply({ components })).createMessageComponentCollector({
    filter: i => [interaction.user.id, opponent?.id].includes(i.member.id) && i.customId == 'playAgain',
    max: 1, componentType: ComponentType.Button, time: 15000
  });

  collector
    .on('collect', async PAButton => {
      PAButton.deferUpdate();
      collector.stop();

      if (interaction.member.id != PAButton.member.id && opponent?.id != interaction.client.user.id) {
        if (opponent) {
          interaction.options._hoistedOptions[0].member = interaction.member;
          interaction.options._hoistedOptions[0].user = interaction.user;
          interaction.options._hoistedOptions[0].value = interaction.member.id;

          interaction.options.data[0].member = interaction.member;
          interaction.options.data[0].user = interaction.user;
          interaction.options.data[0].value = interaction.member.id;

          interaction.options.resolved.members.set(interaction.member.id, interaction.member);
          interaction.options.resolved.users.set(interaction.member.id, interaction.user);
        }

        interaction.member = PAButton.member;
        interaction.user = PAButton.user;
      }

      if (interaction.options._hoistedOptions[0]?.user) {
        const msg = await interaction.channel.send(lang('newChallenge', interaction.options._hoistedOptions[0].user.id));
        sleep(5000).then(msg.delete.bind(msg));
      }

      this.handleInteraction(interaction);
    })
    .on('end', collected => {
      if (!collected.size) return;

      for (const row of oldComponents)
        for (const button of row.components) button.data.disabled = true;

      interaction.editReply({ components: oldComponents });
    });
};
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