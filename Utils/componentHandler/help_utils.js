/**
 * @import { SelectMenuInteraction } from 'discord.js'
 * @import { help_getCommands, help_getCommandCategories, help_commandQuery, help_categoryQuery, help_allQuery } from '.' */

const
  {
    ActionRowBuilder, ChatInputCommandInteraction, Colors, EmbedBuilder, Message, StringSelectMenuBuilder,
    StringSelectMenuComponent, StringSelectMenuInteraction, codeBlock, inlineCode
  } = require('discord.js'),
  { permissionTranslator } = require('@mephisto5558/command'),
  { msInSecond, secsInMinute } = require('../timeFormatter');

/** @type {help_getCommands} */
function getCommands() {
  return [...this.client.prefixCommands.values(), ...this.client.slashCommands.values()].unique().filter(e => !!filterCommands.call(this, e));
}

/** @type {help_getCommandCategories} */
function getCommandCategories() { return getCommands.call(this).map(e => e.category).unique(); }

/**
 * @this {Interaction | Message | SelectMenuInteraction}
 * @returns {string | undefined} */
function getDefaultOption() {
  if (this instanceof ChatInputCommandInteraction && !this.options.getString('command')) return this.options.getString('category');
  if (this instanceof Message) {
    if (this.args.length > 1) return (this.client.prefixCommands.get(this.args[1]) ?? this.client.slashCommands.get(this.args[1]))?.category;
    return this.args[0];
  }
  if (
    this instanceof StringSelectMenuInteraction && this.message.components[0]
    && 'components' in this.message.components[0] && this.message.components[0].components[0] instanceof StringSelectMenuComponent
  ) return this.message.components[0].components[0].options.find(e => e.value === this.values[0])?.value;
}

/**
 * @this {Interaction | Message | SelectMenuInteraction}
 * @param {lang} lang
 * @param {string[]?} commandCategories */
function createCategoryComponent(lang, commandCategories) {
  commandCategories ??= getCommandCategories.call(this);
  const defaultOption = getDefaultOption.call(this);

  if (
    this instanceof StringSelectMenuInteraction && this.message.components[0]
    && 'components' in this.message.components[0] && this.message.components[0].components[0] instanceof StringSelectMenuComponent
  ) {
    if (defaultOption) {
      delete this.message.components[0].components[0].options.find(e => e.default)?.default;
      this.message.components[0].components[0].options.find(e => e.value === defaultOption.toLowerCase()).default = true;
    }
    return this.message.components[0];
  }

  return new ActionRowBuilder({
    components: [new StringSelectMenuBuilder({
      customId: 'help.category',
      placeholder: lang('categoryListPlaceholder'),
      minValues: 0,
      options: commandCategories.map(e => ({
        label: lang(`commands.${e}.categoryName`),
        value: e,
        default: defaultOption?.toLowerCase() == e
      }))
    })]
  });
}

/**
 * @this {Interaction | Message | StringSelectMenuInteraction}
 * @param {lang} lang
 * @param {string} category */
function createCommandsComponent(lang, category) {
  let defaultOption;
  if (this instanceof ChatInputCommandInteraction) defaultOption = this.options.getString('command');
  else if (this instanceof Message) defaultOption = this.args[1];
  else if (
    this instanceof StringSelectMenuInteraction && this.message.components[1]
    && 'components' in this.message.components[1] && this.message.components[1].components[0] instanceof StringSelectMenuComponent
  ) defaultOption = this.message.components[1].components[0].options.find(e => e.value === this.values[0])?.value;

  return new ActionRowBuilder({
    components: [new StringSelectMenuBuilder({
      customId: 'help.command',
      placeholder: lang('commandListPlaceholder'),
      minValues: 0,
      options: getCommands.call(this).reduce((acc, e) => {
        if (e.category == category && !e.aliasOf) acc.push({ label: e.name, value: e.name, default: defaultOption == e.name });
        return acc;
      }, [])
    })]
  });
}

/**
 * @this {Interaction | Message}
 * @param {lang} lang
 * @param {command<'prefix' | 'slash' | 'both', boolean, true> | undefined} cmd */
function createInfoFields(lang, cmd = {}) {
  const arr = [];

  if ('aliases' in cmd) {
    if ('prefix' in cmd.aliases && cmd.aliases.prefix.length)
      arr.push({ name: lang('one.prefixAlias'), value: cmd.aliases.prefix.map(inlineCode).join(', '), inline: true });

    if ('slash' in cmd.aliases && cmd.aliases.slash.length)
      arr.push({ name: lang('one.slashAlias'), value: cmd.aliases.slash.map(inlineCode).join(', '), inline: true });
  }
  if (cmd.aliasOf) arr.push({ name: lang('one.aliasOf'), value: inlineCode(cmd.aliasOf), inline: true });
  if (cmd.permissions?.client?.length) {
    arr.push({
      name: lang('one.botPerms'), inline: false,
      value: permissionTranslator(cmd.permissions.client, lang.config.locale, this.client.i18n).map(inlineCode).join(', ')
    });
  }
  if (cmd.permissions?.user?.length) {
    arr.push({
      name: lang('one.userPerms'), inline: true,
      value: permissionTranslator(cmd.permissions.user, lang.config.locale, this.client.i18n).map(inlineCode).join(', ')
    });
  }

  /** @type {['channel' | 'guild' | 'user', number][]} */
  const cooldowns = Object.entries(cmd.cooldowns ?? {}).filter(([, e]) => !!e);
  if (cooldowns.length) {
    arr.push({
      name: lang('one.cooldowns'), inline: false,
      value: cooldowns.map(([k, v]) => {
        const min = Math.floor(v / secsInMinute * msInSecond);
        let sec = v % secsInMinute;
        sec = sec % 1 ? sec.toFixed(2) : Math.floor(sec);

        if (min && sec) return `${lang('global.' + k)}: ${min}min ${sec}s`;
        return `${lang('global.' + k)}: ` + (min ? `${min}min` : `${sec}s`);
      }).join(', ')
    });
  }

  const
    usage = (cmd.usageLocalizations[lang.config.locale ?? '']?.usage ?? cmd.usage.usage)?.replaceAll('{prefix}', this.guild.prefixes[0].prefix),
    examples = (cmd.usageLocalizations[lang.config.locale ?? '']?.examples ?? cmd.usage.examples)
      ?.replaceAll('{prefix}', this.guild.prefixes[0].prefix);

  if (usage) arr.push({ name: codeBlock(lang('one.usage')), value: usage, inline: true });
  if (examples) arr.push({ name: codeBlock(lang('one.examples')), value: examples, inline: true });

  return arr;
}

/**
 * @this {Interaction | Message}
 * @param {command<string, boolean, true> | undefined} cmd */
function filterCommands(cmd) {
  return !!cmd?.name && !cmd.disabled && (this.client.botType != 'dev' || cmd.beta)
    && (!this.client.config.devOnlyFolders.includes(cmd.category) || this.client.config.devIds.has(this.user.id));
}

/** @type {help_commandQuery} */
module.exports.commandQuery = async function commandQuery(lang, query) {
  if (
    this instanceof StringSelectMenuInteraction && !this.values.length
    && 'components' in this.message.components[0] && this.message.components[0].components[0] instanceof StringSelectMenuComponent
  ) return module.exports.categoryQuery.call(this, lang, this.message.components[0].components[0].data.options.find(e => e.default).value);

  const command = this.client.slashCommands.get(query) ?? this.client.prefixCommands.get(query);
  if (!filterCommands.call(this, command)) {
    const embed = new EmbedBuilder({
      description: lang('one.notFound', inlineCode(query)),
      color: Colors.Red
    });

    return this.customReply({ embeds: [embed], components: [createCategoryComponent.call(this, lang)] });
  }

  const
    helpLang = this.client.i18n.getTranslator({
      undefinedNotFound: true, locale: this.guild?.localeCode ?? this.client.defaultSettings.config.lang,
      backupPaths: [`commands.${command.category}.${command.name}`]
    }),
    embed = new EmbedBuilder({
      title: lang('one.embedTitle', { category: command.category, command: command.name }),
      description: helpLang('description') ?? command.description,
      fields: createInfoFields.call(this, lang, command),
      footer: {
        text: lang('one.embedFooterTextCreatedAt', this.client.settings.cmdStats[command.name].createdAt.toLocaleDateString(
          helpLang.config.locale, { day: '2-digit', month: '2-digit', year: 'numeric' }
        ))
        + '\n' + lang('one.embedFooterText', `"${this.guild.prefixes.map(e => e.prefix).join('", "')}"`)
      },
      color: Colors.Blurple
    });

  return this.customReply({
    embeds: [embed],
    components: [createCategoryComponent.call(this, lang), createCommandsComponent.call(this, lang, command.category)]
  });
};

/** @type {help_categoryQuery} */
module.exports.categoryQuery = async function categoryQuery(lang, query) {
  if (!query) {
    if (
      this instanceof StringSelectMenuInteraction
      && 'components' in this.message.components[0] && this.message.components[0].components[0] instanceof StringSelectMenuComponent
    ) delete this.message.components[0].components[0].data.options.find(e => e.default)?.default;

    return module.exports.allQuery.call(this, lang);
  }

  const
    helpLang = this.client.i18n.getTranslator({
      undefinedNotFound: true, locale: this.guild?.localeCode ?? this.client.defaultSettings.config.lang,
      backupPaths: [`commands.${query}`]
    }),
    commands = getCommands.call(this),
    embed = new EmbedBuilder({
      title: lang(`commands.${query}.categoryName`),
      description: lang(`commands.${query}.categoryDescription`),
      fields: commands.reduce((acc, e) => { // U+200E (LEFT-TO-RIGHT MARK) is used to make a newline for better spacing
        if (e.category == query && !e.aliasOf && filterCommands.call(this, e))
          acc.push({ name: e.name, value: (helpLang(`${e.name}.description`) ?? e.description) + '\n\u200E', inline: true });
        return acc;
      }, []),
      footer: { text: lang(this.client.botType == 'dev' ? 'devEmbedFooterText' : 'all.embedFooterText') },
      color: Colors.Blurple
    });

  if (!embed.data.fields.length) embed.data.description = lang('all.notFound');

  return this.customReply({
    embeds: [embed],
    components: [createCategoryComponent.call(this, lang), createCommandsComponent.call(this, lang, query)]
  });
};

/** @type {help_allQuery} */
module.exports.allQuery = async function allQuery(lang) {
  const
    commandCategories = getCommandCategories.call(this),
    embed = new EmbedBuilder({
      title: lang('all.embedTitle'),
      description: lang(commandCategories.length ? 'all.embedDescription' : 'all.notFound'),

      // /u200E is used here to add extra space
      fields: commandCategories.map(e => ({
        name: lang(`commands.${e}.categoryName`),
        value: lang(`commands.${e}.categoryDescription`) + '\n\u200E',
        inline: true
      })),
      footer: { text: lang('all.embedFooterText') },
      color: commandCategories.length ? Colors.Blurple : Colors.Red
    });

  return this.customReply({ embeds: [embed], components: [createCategoryComponent.call(this, lang, commandCategories)] });
};

module.exports.getCommands = getCommands;
module.exports.getCommandCategories = getCommandCategories;