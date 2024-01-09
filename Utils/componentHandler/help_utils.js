/**@typedef {import('discord.js').StringSelectMenuInteraction}SelectMenuInteraction*/

const
  { EmbedBuilder, Colors, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js'),
  permissionTranslator = require('../permissionTranslator.js'),
  ownerOnlyFolders = require('../getOwnerOnlyFolders.js')();

/**@this Message|Interaction|SelectMenuInteraction*/
function getCommands() { return [...new Set([...this.client.prefixCommands.values(), ...this.client.slashCommands.values()])].filter(filterCommands.bind(this)); }

/**@this Message|Interaction|SelectMenuInteraction*/
function getCommandCategories() { return [...new Set(getCommands.call(this).map(e => e.category.toLowerCase()))]; }

/**@this Message|Interaction|SelectMenuInteraction @param {lang}lang @param {string[]?}commandCategories*/
function createCategoryComponent(lang, commandCategories) {
  commandCategories ??= getCommandCategories.call(this);
  const defaultOption = (this.options?.getString('command') ? null : this.options?.getString('category')) || (this.args ? this.client.prefixCommands.get(this.args[0]) || this.client.slashCommands.get(this.args[0]) : null)?.category || (this.values ? this.message.components[0].components[0].options.find(e => e.value === this.values[0])?.value : null);

  if (this.message?.components.length) {
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
        label: lang(`options.category.choices.${e}`),
        value: e,
        default: defaultOption?.toLowerCase() == e
      }))
    })]
  });
}

/**@this Message|Interaction|SelectMenuInteraction @param {lang}lang @param {string}category*/
function createCommandsComponent(lang, category) {
  const defaultOption = this.args?.[0] || this.options?.getString('command') || (this.message?.components[1] ? this.message.components[1].components[0].options.find(e => e.value === this.values[0])?.value : null);

  return new ActionRowBuilder({
    components: [new StringSelectMenuBuilder({
      customId: 'help.command',
      placeholder: lang('commandListPlaceholder'),
      minValues: 0,
      options: getCommands.call(this).reduce((acc, e) => {
        if (e.category.toLowerCase() == category && !e.aliasOf) acc.push({ label: e.name, value: e.name, default: defaultOption == e.name });
        return acc;
      }, [])
    })]
  });
}

/**@this Message|Interaction|SelectMenuInteraction @param {command}cmd @param {lang}lang @param {lang}helpLang*/
function createInfoFields(cmd, lang, helpLang) {
  const
    arr = [],
    prefix = this.guild?.db.config?.prefix?.prefix || this.client.defaultSettings.config.prefix;

  cmd ??= {};
  if (cmd.aliases?.prefix?.length) arr.push({ name: lang('one.prefixAlias'), value: `\`${cmd.aliases.prefix.join('`, `')}\``, inline: true });
  if (cmd.aliases?.slash?.length) arr.push({ name: lang('one.slashAlias'), value: `\`${cmd.aliases.slash.join('`, `')}\``, inline: true });
  if (cmd.aliasOf) arr.push({ name: lang('one.aliasOf'), value: `\`${cmd.aliasOf}\``, inline: true });
  if (cmd.permissions?.client?.length) arr.push({ name: lang('one.botPerms'), value: `\`${permissionTranslator(cmd.permissions.client, lang.__boundArgs__[0].locale, this.client.i18n).join('`, `')}\``, inline: false });
  if (cmd.permissions?.user?.length) arr.push({ name: lang('one.userPerms'), value: `\`${permissionTranslator(cmd.permissions.user, lang.__boundArgs__[0].locale, this.client.i18n).join('`, `')}\``, inline: true });
  if (cmd.cooldowns?.user || cmd.cooldowns?.guild) arr.push({
    name: lang('one.cooldowns'), inline: false,
    value: Object.entries(cmd.cooldowns).filter(([, e]) => e).map(([k, v]) => {
      let min = Math.floor(v / 60000), sec = (v % 60000 / 1000);
      sec = (sec % 1) ? sec.toFixed(2) : Math.floor(sec);

      if (min && sec) return `${lang('global.' + k)}: ${min}min ${sec}s`;
      return `${lang('global.' + k)}: ` + (min ? `${min}min` : `${sec}s`);
    }).join(', ')
  });

  if (helpLang('usage.usage')) {
    arr.push({ name: '```' + lang('one.usage') + '```', value: helpLang('usage.usage', prefix), inline: true });
    arr.push({ name: '```' + lang('one.examples') + '```', value: helpLang('usage.examples', prefix), inline: true });
  }

  return arr;
}

/**@this Message|Interaction|SelectMenuInteraction @param {command}cmd*/
function filterCommands(cmd) {
  return cmd?.name && !cmd.disabled && (this.client.botType != 'dev' || cmd.beta) || (ownerOnlyFolders.includes(cmd.category?.toLowerCase()) && this.user.id != this.client.application.owner.id);
}

/**@this Message|Interaction|SelectMenuInteraction @param {lang}lang @param {string}commandQuery*/
module.exports.commandQuery = function commandQuery(lang, commandQuery) {
  if (this.values && !this.values.length) return module.exports.categoryQuery.call(this, lang, this.message.components[0].components[0].data.options.find(e => e.default).value);

  const command = this.client.slashCommands.get(commandQuery) || this.client.prefixCommands.get(commandQuery);
  if (!filterCommands.call(this, command)) {
    const embed = new EmbedBuilder({
      description: lang('one.notFound', commandQuery),
      color: Colors.Red
    });

    return this.customReply({ embeds: [embed], components: [createCategoryComponent.call(this, lang)] });
  }

  const
    /**@type {lang}*/
    helpLang = this.client.i18n.__.bind(this.client.i18n, { undefinedNotFound: true, locale: this.guild?.localeCode || this.client.defaultSettings.config.lang, backupPath: `commands.${command.category.toLowerCase()}.${command.name}` }),
    embed = new EmbedBuilder({
      title: lang('one.embedTitle', { category: command.category, command: command.name }),
      description: helpLang('description'),
      fields: createInfoFields.call(this, command, lang, helpLang),
      footer: { text: lang('one.embedFooterText', this.guild?.db.config?.prefix || this.client.defaultSettings.config.prefix) },
      color: Colors.Blurple,
    });

  return this.customReply({ embeds: [embed], components: [createCategoryComponent.call(this, lang), createCommandsComponent.call(this, lang, command.category.toLowerCase())] });
};

/**@this Interaction|SelectMenuInteraction @param {lang}lang @param {string?}categoryQuery*/
module.exports.categoryQuery = function categoryQuery(lang, categoryQuery) {
  if (!categoryQuery) {
    delete this.message.components[0].components[0].data.options.find(e => e.default)?.default;
    return module.exports.allQuery.call(this, lang);
  }

  const
    /**@type {lang}*/
    helpLang = this.client.i18n.__.bind(this.client.i18n, { undefinedNotFound: true, locale: this.guild?.localeCode || this.client.defaultSettings.config.lang, backupPath: `commands.${categoryQuery}` }),
    /**@type {command[]}*/
    commands = getCommands.call(this),
    embed = new EmbedBuilder({
      title: lang(`options.category.choices.${categoryQuery}`),
      fields: commands.reduce((acc, e) => { //U+200E (LEFT-TO-RIGHT MARK) is used to make a newline for better spacing
        if (e.category.toLowerCase() === categoryQuery && !e.aliasOf && filterCommands.call(this, e))
          acc.push({ name: e.name, value: helpLang(`${e.name}.description`) + '\n\u200E', inline: true });
        return acc;
      }, []),
      footer: { text: lang(this.client.botType == 'dev' ? 'devEmbedFooterText' : 'all.embedFooterText') },
      color: Colors.Blurple
    });

  if (!embed.data.fields.length) embed.data.description = lang('all.notFound');

  return this.customReply({ embeds: [embed], components: [createCategoryComponent.call(this, lang), createCommandsComponent.call(this, lang, categoryQuery)] });
};

/**@this Message|Interaction|SelectMenuInteraction @param {lang}lang*/
module.exports.allQuery = function allQuery(lang) {
  const
    commandCategories = getCommandCategories.call(this),
    embed = new EmbedBuilder({
      title: lang('all.embedTitle'),
      description: lang(commandCategories.length ? 'all.embedDescription' : 'all.notFound'),
      fields: commandCategories.map(e => ({ name: lang(`options.category.choices.${e.toLowerCase()}`), value: lang(`commands.${e.toLowerCase()}.categoryDescription`) + '\n‎', inline: true })),
      footer: { text: lang('all.embedFooterText') },
      color: commandCategories.length ? Colors.Blurple : Colors.Red
    });

  return this.customReply({ embeds: [embed], components: [createCategoryComponent.call(this, lang, commandCategories)] });
};

module.exports.getCommands = getCommands;
module.exports.getCommandCategories = getCommandCategories;
