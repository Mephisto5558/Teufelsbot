/** @typedef {import('discord.js').Interaction}Interaction*/

const
  { EmbedBuilder, Colors, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js'),
  permissionTranslator = require('../permissionTranslator.js');

/** @this {Interaction|Message}*/
function getCommands() { return [...new Set([...this.client.prefixCommands.values(), ...this.client.slashCommands.values()])].filter(filterCommands.bind(this)); }

/** @this {Interaction|Message}*/
function getCommandCategories() { return [...new Set(getCommands.call(this).map(e => e.category))]; }

/**
 * @this {Interaction|Message}
 * @param {lang}lang
 * @param {string[]?}commandCategories*/
function createCategoryComponent(lang, commandCategories) {
  commandCategories ??= getCommandCategories.call(this);
  const defaultOption = (this.options?.getString('command') ? undefined : this.options?.getString('category'))
    ?? (this.client.prefixCommands.get(this.args?.[0]) ?? this.client.slashCommands.get(this.args?.[0]))?.category
    ?? (this.values ? this.message.components[0].components[0].options.find(e => e.value === this.values[0])?.value : undefined);

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
        label: lang(`commands.${e}.categoryName`),
        value: e,
        default: defaultOption?.toLowerCase() == e
      }))
    })]
  });
}

/**
 * @this {Interaction|Message}
 * @param {lang}lang
 * @param {string}category*/
function createCommandsComponent(lang, category) {
  const defaultOption = this.args?.[0] ?? this.options?.getString('command')
    ?? (this.message?.components[1] ? this.message.components[1].components[0].options.find(e => e.value === this.values[0])?.value : undefined);

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
 * @this {Interaction|Message}
 * @param {command<*, boolean, true>}cmd
 * @param {lang}lang*/
function createInfoFields(cmd, lang) {
  const
    arr = [],
    prefix = this.guild?.db.config?.prefix?.prefix ?? this.client.defaultSettings.config.prefix;

  cmd ??= {};
  if (cmd.aliases?.prefix?.length) arr.push({ name: lang('one.prefixAlias'), value: `\`${cmd.aliases.prefix.join('`, `')}\``, inline: true });
  if (cmd.aliases?.slash?.length) arr.push({ name: lang('one.slashAlias'), value: `\`${cmd.aliases.slash.join('`, `')}\``, inline: true });
  if (cmd.aliasOf) arr.push({ name: lang('one.aliasOf'), value: `\`${cmd.aliasOf}\``, inline: true });
  if (cmd.permissions?.client?.length)
    arr.push({ name: lang('one.botPerms'), value: `\`${permissionTranslator(cmd.permissions.client, lang.__boundArgs__[0].locale, this.client.i18n).join('`, `')}\``, inline: false });
  if (cmd.permissions?.user?.length)
    arr.push({ name: lang('one.userPerms'), value: `\`${permissionTranslator(cmd.permissions.user, lang.__boundArgs__[0].locale, this.client.i18n).join('`, `')}\``, inline: true });

  const cooldowns = Object.entries(cmd.cooldowns ?? {}).filter(([, e]) => e);
  if (cooldowns.length) {
    arr.push({
      name: lang('one.cooldowns'), inline: false,
      value: cooldowns.map(([k, v]) => {
        const min = Math.floor(v / 6e4);
        let sec = v % 6e4 / 1000;
        sec = sec % 1 ? sec.toFixed(2) : Math.floor(sec);

        if (min && sec) return `${lang('global.' + k)}: ${min}min ${sec}s`;
        return `${lang('global.' + k)}: ` + (min ? `${min}min` : `${sec}s`);
      }).join(', ')
    });
  }

  const
    usage = (cmd.usageLocalizations[lang.__boundArgs__[0].locale]?.usage ?? cmd.usage.usage)?.replaceAll('{prefix}', prefix),
    examples = (cmd.usageLocalizations[lang.__boundArgs__[0].locale]?.examples ?? cmd.usage.examples)?.replaceAll('{prefix}', prefix);

  if (usage || examples) {
    arr.push(
      { name: '```' + lang('one.usage') + '```', value: usage, inline: true },
      { name: '```' + lang('one.examples') + '```', value: examples, inline: true }
    );
  }


  return arr;
}

/**
 * @this {Interaction|Message}
 * @param {command<*, boolean, true>}cmd*/
function filterCommands(cmd) {
  return cmd?.name && !cmd.disabled && (this.client.botType != 'dev' || cmd.beta)
    && (this.client.config.ownerOnlyFolders.includes(cmd.category) ? this.user.id == this.client.application.owner.id : true);
}

/**
 * @this {Interaction|Message}
 * @param {lang}lang
 * @param {string}query*/
module.exports.commandQuery = function commandQuery(lang, query) {
  if (this.values && !this.values.length) return module.exports.categoryQuery.call(this, lang, this.message.components[0].components[0].data.options.find(e => e.default).value);

  const command = this.client.slashCommands.get(query) ?? this.client.prefixCommands.get(query);
  if (!filterCommands.call(this, command)) {
    const embed = new EmbedBuilder({
      description: lang('one.notFound', query),
      color: Colors.Red
    });

    return this.customReply({ embeds: [embed], components: [createCategoryComponent.call(this, lang)] });
  }

  const

    /** @type {lang}*/
    helpLang = this.client.i18n.__.bind(this.client.i18n, {
      undefinedNotFound: true, locale: this.guild?.localeCode ?? this.client.defaultSettings.config.lang, backupPath: `commands.${command.category}.${command.name}`
    }),
    embed = new EmbedBuilder({
      title: lang('one.embedTitle', { category: command.category, command: command.name }),
      description: helpLang('description'),
      fields: createInfoFields.call(this, command, lang),
      footer: { text: lang('one.embedFooterText', this.guild?.db.config?.prefix ?? this.client.defaultSettings.config.prefix) },
      color: Colors.Blurple
    });

  return this.customReply({ embeds: [embed], components: [createCategoryComponent.call(this, lang), createCommandsComponent.call(this, lang, command.category)] });
};

/**
 * @this {Interaction|Message}
 * @param {lang}lang
 * @param {string?}query*/
module.exports.categoryQuery = function categoryQuery(lang, query) {
  if (!query) {
    delete this.message.components[0].components[0].data.options.find(e => e.default)?.default;
    return module.exports.allQuery.call(this, lang);
  }

  const

    /** @type {lang}*/
    helpLang = this.client.i18n.__.bind(this.client.i18n, {
      undefinedNotFound: true, locale: this.guild?.localeCode ?? this.client.defaultSettings.config.lang,
      backupPath: `commands.${query}`
    }),
    commands = getCommands.call(this),
    embed = new EmbedBuilder({
      title: lang(`commands.${query}.categoryName`),
      fields: commands.reduce((acc, e) => { // U+200E (LEFT-TO-RIGHT MARK) is used to make a newline for better spacing
        if (e.category == query && !e.aliasOf && filterCommands.call(this, e))
          acc.push({ name: e.name, value: helpLang(`${e.name}.description`) + '\n\u200E', inline: true });
        return acc;
      }, []),
      footer: { text: lang(this.client.botType == 'dev' ? 'devEmbedFooterText' : 'all.embedFooterText') },
      color: Colors.Blurple
    });

  if (!embed.data.fields.length) embed.data.description = lang('all.notFound');

  return this.customReply({ embeds: [embed], components: [createCategoryComponent.call(this, lang), createCommandsComponent.call(this, lang, query)] });
};

/**
 * @this {Interaction|Message}
 * @param {lang}lang*/
module.exports.allQuery = function allQuery(lang) {
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