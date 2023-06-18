const
  { EmbedBuilder, Colors, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js'),
  I18nProvider = require('../I18nProvider.js'),
  permissionTranslator = require('../permissionTranslator.js'),
  ownerOnlyFolders = require('../getOwnerOnlyFolders.js')();

function reply(data) { return this.message?.editable ? this.message.edit(data) : this.customReply(data); }
function getAllCommands() { return [...new Set([...this.client.prefixCommands.values(), ...this.client.slashCommands.values()])].filter(module.exports.filterCommands.bind(this)); }

function createCategoryComponent(lang, commandCategories) {
  if (!commandCategories) {
    commandCategories = [...new Set([...this.client.prefixCommands.map(e => e.category), ...this.client.slashCommands.map(e => e.category)])];
    if (this.user.id != this.client.application.owner.id) commandCategories = commandCategories.filter(e => !ownerOnlyFolders.includes(e.toLowerCase()));
  }

  const defaultOption = this.options?.getString('category') || (this.values ? this.message.components[0].components[0].options.find(e => e.value === this.values[0]) : null);
  if (this.message?.components.length) {
    if (defaultOption) {
      delete this.message.components[0].components[0].options.find(e => e.default)?.default;
      defaultOption.default = true;
    }
    return this.message.components[0];
  }

  return new ActionRowBuilder({
    components: [new StringSelectMenuBuilder({
      customId: 'help.category',
      placeholder: lang('categoryListPlaceholder'),
      minValues: 0,
      options: commandCategories.map(e => ({
        label: lang(`options.category.choices.${e.toLowerCase()}`),
        value: e.toLowerCase(),
        default: defaultOption?.value == e
      }))
    })]
  });
}

function createCommandsComponent(lang, category) {
  const defaultOption = this.args?.[0] || this.options?.getString('command') || (this.message?.components[1] ? this.message.components[1].components[0].options.find(e => e.value === this.values[0]) : null);

  return new ActionRowBuilder({
    components: [new StringSelectMenuBuilder({
      customId: 'help.command',
      placeholder: lang('commandListPlaceholder'),
      minValues: 0,
      options: getAllCommands.call(this).reduce((acc, e) => {
        if (e.category.toLowerCase() == category) acc.push({ label: e.name, value: e.name, default: defaultOption?.value == e.name });
        return acc;
      }, [])
    })]
  });
}

function createInfoFields(cmd = {}, lang = null, helpLang = null) {
  const
    arr = [],
    prefix = this.guild.db.config?.prefix?.prefix || this.client.defaultSettings.config.prefix;

  if (cmd.aliases?.prefix?.length) arr.push({ name: lang('one.prefixAlias'), value: `\`${cmd.aliases.prefix.join('`, `')}\``, inline: true });
  if (cmd.aliases?.slash?.length) arr.push({ name: lang('one.slashAlias'), value: `\`${cmd.aliases.slash.join('`, `')}\``, inline: true });
  if (cmd.aliasOf) arr.push({ name: lang('one.aliasOf'), value: `\`${cmd.aliasOf}\``, inline: true });
  if (cmd.permissions?.client?.length) arr.push({ name: lang('one.botPerms'), value: `\`${permissionTranslator(cmd.permissions.client, lang.__boundArgs__[0].locale).join('`, `')}\``, inline: false });
  if (cmd.permissions?.user?.length) arr.push({ name: lang('one.userPerms'), value: `\`${permissionTranslator(cmd.permissions.user, lang.__boundArgs__[0].locale).join('`, `')}\``, inline: true });
  if (cmd.cooldowns?.user || cmd.cooldowns?.guild) arr.push({
    name: lang('one.cooldowns'), inline: false,
    value: Object.entries(cmd.cooldowns).filter(([, e]) => e).map(([k, v]) => {
      let min = Math.floor(v / 60000), sec = (v % 60000 / 1000);
      sec = !(sec % 1) ? Math.floor(sec) : sec.toFixed(2);

      if (min && sec) return `${lang('global.' + k)}: ${min}min ${sec}s`;
      return lang(`global.${k}`) + ': ' + (min ? `${min}min` : `${sec}s`);
    }).join(', ')
  });
  if (helpLang('usage.usage')) {
    arr.push({ name: '```' + lang('one.usage') + '```', value: helpLang('usage.usage', prefix), inline: true });
    arr.push({ name: '```' + lang('one.examples') + '```', value: helpLang('usage.examples', prefix), inline: true });
  }

  return arr;
}

module.exports.filterCommands = function filterCommands(e) {
  return e?.name && !e.disabled && (this.client.botType != 'dev' || e.beta) || (ownerOnlyFolders.includes(e.category.toLowerCase()) && this.user.id != this.client.application.owner.id);
};

/**@this {import('discord.js').Message|import('discord.js').ChatInputCommandInteraction|import('discord.js').StringSelectMenuInteraction}*/
module.exports.commandQuery = function commandQuery(lang, commandQuery) {
  if (this.values && !this.values.length) return module.exports.categoryQuery.call(this, lang, this.message.components[0].components[0].data.options.find(e => e.default).value);

  const command = this.client.slashCommands.get(commandQuery) || this.client.prefixCommands.get(commandQuery);
  if (!module.exports.filterCommands.call(this, command)) {
    const embed = new EmbedBuilder({
      description: lang('one.notFound', commandQuery),
      color: Colors.Red
    });

    return reply.call(this, { embeds: [embed], components: [createCategoryComponent.call(this, lang)] });
  }

  const
    helpLang = I18nProvider.__.bind(I18nProvider, { undefinedNotFound: true, locale: this.guild.localeCode, backupPath: `commands.${command.category.toLowerCase()}.${command.name}` }),
    embed = new EmbedBuilder({
      title: lang('one.embedTitle', { category: command.category, command: command.name }),
      description: helpLang('description'),
      fields: createInfoFields.call(this, command, lang, helpLang),
      footer: { text: lang('one.embedFooterText', this.guild.db.config?.prefix || this.client.defaultSettings.config.prefix) },
      color: Colors.Blurple,
    });

  return reply.call(this, { embeds: [embed], components: [createCategoryComponent.call(this, lang), createCommandsComponent.call(this, lang, command.category.toLowerCase())] });
};

/**@this {import('discord.js').ChatInputCommandInteraction|import('discord.js').StringSelectMenuInteraction}*/
module.exports.categoryQuery = function categoryQuery(lang, categoryQuery) {
  if (!categoryQuery) {
    delete this.message.components[0].components[0].data.options.find(e => e.default)?.default;
    return module.exports.allQuery.call(this, lang);
  }

  const
    helpLang = I18nProvider.__.bind(I18nProvider, { undefinedNotFound: true, locale: this.guild.localeCode, backupPath: `commands.${categoryQuery}` }),
    commands = getAllCommands.call(this),
    embed = new EmbedBuilder({
      title: lang(`options.category.choices.${categoryQuery}`),
      fields: commands.reduce((acc, e) => { //U+200E (LEFT-TO-RIGHT MARK) is used to make a newline for better spacing
        if (e.category.toLowerCase() === categoryQuery && module.exports.filterCommands.call(this, e)) acc.push({ name: e.name, value: helpLang(`${e.name}.description`) + '\n‎', inline: true });
        return acc;
      }, []),
      color: Colors.Blurple
    });

  if (!embed.data.fields.length) embed.data.description = lang('all.notFound');

  return reply.call(this, { embeds: [embed], components: [createCategoryComponent.call(this, lang), createCommandsComponent.call(this, lang, categoryQuery)] });
};

/**@this {import('discord.js').Message|import('discord.js').ChatInputCommandInteraction|import('discord.js').StringSelectMenuInteraction}*/
module.exports.allQuery = function allQuery(lang) {
  let commandCategories = [...new Set(getAllCommands.call(this).map(e => e.category))];
  if (this.user.id != this.client.application.owner.id) commandCategories = commandCategories.filter(e => !ownerOnlyFolders.includes(e.toLowerCase()));

  const
    embed = new EmbedBuilder({
      title: lang('all.embedTitle'),
      description: lang(commandCategories.length ? 'all.embedDescription' : 'all.notFound'),
      fields: commandCategories.map(e => ({ name: lang(`options.category.choices.${e.toLowerCase()}`), value: lang(`commands.${e.toLowerCase()}.categoryDescription`) + '\n‎', inline: true })),
      footer: { text: lang('all.embedFooterText') },
      color: commandCategories.length ? Colors.Blurple : Colors.Red
    });

  return reply.call(this, { embeds: [embed], components: [createCategoryComponent.call(this, lang, commandCategories)] });
};