/**
 * @import { StringSelectMenuInteraction } from 'discord.js'
 * @import { AllContexts, CommandInitialized as Command, CommandType, CommandManagerMember } from '@mephisto5558/command'
 * @import { help_getCommands, help_getCommandCategories, help_commandQuery, help_categoryQuery, help_allQuery } from './' */

const
  { ActionRowBuilder, Colors, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuComponent, codeBlock, inlineCode } = require('discord.js'),
  { CommandType, PermissionType, isComponent, isMessage, isSlash } = require('@mephisto5558/command'),
  permissionTranslator = require('../permissionTranslator'),
  { msInSecond, secsInMinute } = require('../timeFormatter');

/** @type {help_getCommands} */
function getCommands() {
  return this.client.commandManager.commands.map(e => e.command).filter(filterCommands.bind(this));
}

/** @type {help_getCommandCategories} */
function getCommandCategories() { return getCommands.call(this).map(e => e.category).unique(); }

/**
 * @this {Interaction | Message | StringSelectMenuInteraction}
 * @returns {string | undefined} */
function getDefaultOption() {
  if (isSlash(this) && !this.options.getString('command')) return this.options.getString('category');
  if (isMessage(this)) {
    if (this.args.length > 1) return this.client.commandManager.get(this.args[1])?.category;
    return this.args[0];
  }
  if (
    isComponent(this) && this.isStringSelectMenu() && this.message.components[0]
    && 'components' in this.message.components[0] && this.message.components[0].components[0] instanceof StringSelectMenuComponent
  ) return this.message.components[0].components[0].options.find(e => e.value === this.values[0])?.value;
}

/**
 * @this {Interaction | Message | StringSelectMenuInteraction}
 * @param {lang} lang
 * @param {string[]?} commandCategories */
function createCategoryComponent(lang, commandCategories) {
  commandCategories ??= getCommandCategories.call(this);
  const defaultOption = getDefaultOption.call(this);

  if (
    isComponent(this) && this.isStringSelectMenu() && this.message.components[0]
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
  if (isSlash(this)) defaultOption = this.options.getString('command');
  else if (isMessage(this)) defaultOption = this.args[1];
  else if (
    isComponent(this) && this.isStringSelectMenu() && this.message.components[1]
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
 * @param {Command<CommandType[], AllContexts> | undefined} cmd */
function createInfoFields(lang, cmd = {}) {
  const arr = [];

  if ('aliases' in cmd) {
    for (const commandType of Object.values(CommandType)) {
      if (!(commandType in cmd.aliases && cmd.aliases[commandType].length)) continue;
      arr.push({ name: lang(`one.${commandType}Alias`), value: cmd.aliases[commandType].map(inlineCode).join(', '), inline: true });
    }
  }
  if (cmd.aliasOf) arr.push({ name: lang('one.aliasOf'), value: inlineCode(cmd.aliasOf), inline: true });
  if (cmd.permissions[PermissionType.Client].length) {
    arr.push({
      name: lang('one.botPerms'), inline: false,
      value: permissionTranslator(cmd.permissions[PermissionType.Client], lang.config.locale, this.client.i18n).map(inlineCode).join(', ')
    });
  }
  if (cmd.permissions[PermissionType.User].length) {
    arr.push({
      name: lang('one.userPerms'), inline: true,
      value: permissionTranslator(cmd.permissions[PermissionType.User], lang.config.locale, this.client.i18n).map(inlineCode).join(', ')
    });
  }

  const cooldowns = Object.entries(cmd.cooldowns).filter(([, e]) => !!e);
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
    usageData = lang.config.locale ? cmd.usageLocalizations[lang.config.locale] ?? cmd.usage : cmd.usage,
    usage = usageData.usage?.replaceAll('{prefix}', this.guild.prefixes[0].prefix),
    examples = usageData.examples?.replaceAll('{prefix}', this.guild.prefixes[0].prefix);

  if (usage) arr.push({ name: codeBlock(lang('one.usage')), value: usage, inline: true });
  if (examples) arr.push({ name: codeBlock(lang('one.examples')), value: examples, inline: true });

  return arr;
}

/**
 * @this {Interaction | Message}
 * @param {CommandManagerMember} cmd */
function filterCommands(cmd) {
  return !cmd.disabled && (this.client.botType != 'dev' || cmd.beta)
    && (!this.client.config.devOnlyFolders.includes(cmd.category) || this.client.config.devIds.has(this.user.id));
}

/** @type {help_commandQuery} */
module.exports.commandQuery = async function commandQuery(lang, query) {
  if (
    isComponent(this) && this.isStringSelectMenu() && !this.values.length
    && 'components' in this.message.components[0] && this.message.components[0].components[0] instanceof StringSelectMenuComponent
  ) return module.exports.categoryQuery.call(this, lang, this.message.components[0].components[0].data.options.find(e => e.default).value);

  const command = this.client.commandManager.get(query);
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
        text: lang(
          'one.embedFooterTextCreatedAt', this.client.settings.cmdStats[command.name].createdAt
            .toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDate().toLocaleString(helpLang.config.locale)
        )
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
      isComponent(this) && this.isStringSelectMenu()
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
          acc.push({ name: e.name, value: (helpLang(`${e.name}.description`) ?? e.description) + '\n\u{200E}', inline: true });
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
        value: lang(`commands.${e}.categoryDescription`) + '\n\u{200E}',
        inline: true
      })),
      footer: { text: lang('all.embedFooterText') },
      color: commandCategories.length ? Colors.Blurple : Colors.Red
    });

  return this.customReply({ embeds: [embed], components: [createCategoryComponent.call(this, lang, commandCategories)] });
};

module.exports.getCommands = getCommands;
module.exports.getCommandCategories = getCommandCategories;