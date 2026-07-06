import { CommandType, PermissionType, isComponent, isMessage, isSlash } from '@mephisto5558/command';


import permissionTranslator from '../permissionTranslator.ts';
import { msInSecond, secsInMinute } from '../timeFormatter.ts';
import type { ActionRowBuilder, Colors, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuComponent, StringSelectMenuInteraction, codeBlock, inlineCode } from 'discord.js';
import type { AllContexts, CommandInitialized as Command, CommandManagerMember } from '@mephisto5558/command';

export function getCommands(this: Interaction | Message): CommandManagerMember[] {
  return this.client.commandManager.commands.map(e => e.command).filter(filterCommands.bind(this));
}

export function getCommandCategories(this: Interaction | Message): string[] {
  return getCommands.call(this).map(e => e.category).unique();
}

function getDefaultOption(this: Interaction | Message | StringSelectMenuInteraction): string | undefined {
  if (isSlash(this) && !this.options.getString('command')) return this.options.getString('category') ?? undefined;
  if (isMessage(this)) {
    if (this.args.length > 1) return this.client.commandManager.get(this.args[1])?.category;
    return this.args[0];
  }
  if (
    isComponent(this) && this.isStringSelectMenu() && this.message.components[0]
    && 'components' in this.message.components[0] && this.message.components[0].components[0] instanceof StringSelectMenuComponent
  ) return this.message.components[0].components[0].options.find(e => e.value === this.values[0])?.value;
}

function createCategoryComponent(this: Interaction | Message | StringSelectMenuInteraction, lang: lang, commandCategories?: string[]) {
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

function createCommandsComponent(this: Interaction | Message | StringSelectMenuInteraction, lang: lang, category: string) {
  let defaultOption: string | undefined;
  if (isSlash(this)) defaultOption = this.options.getString('command') ?? undefined;
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

function createInfoFields(this: Interaction | Message, lang: lang, cmd: Command<CommandType[], AllContexts> = {}) {
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
        const
          min = Math.floor(v / secsInMinute * msInSecond),
          sec = v % secsInMinute,
          secStr = sec % 1 ? sec.toFixed(2) : Math.floor(sec).toString();

        if (min && secStr) return `${lang('global.' + k)}: ${min}min ${secStr}s`;
        return `${lang('global.' + k)}: ` + (min ? `${min}min` : `${secStr}s`);
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

function filterCommands(this: Interaction | Message, cmd: CommandManagerMember): boolean {
  return !cmd.disabled && (this.client.botType != 'dev' || cmd.beta)
    && (!this.client.config.devOnlyFolders.includes(cmd.category) || this.client.config.devIds.has(this.user.id));
}

export async function commandQuery(
  this: Interaction | Message | StringSelectMenuInteraction,
  lang: lang, query: string
): Promise<Message> {
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
}

export async function categoryQuery(
  this: Interaction | Message | StringSelectMenuInteraction,
  lang: lang, query?: string
): Promise<Message> {
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
}

export async function allQuery(
  this: Interaction | Message,
  lang: lang
): Promise<Message> {
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
}