/* eslint-disable custom/cyclomatic-complexity, sonarjs/cognitive-complexity, no-underscore-dangle
-- will be fixed when commands are moved to their own lib */

/**
 * @import { BaseInteraction } from 'discord.js'
 * @import Utils from '.' */

const
  { ChannelType, Colors, CommandInteraction, EmbedBuilder, Message, MessageFlags, PermissionFlagsBits, Role, inlineCode } = require('discord.js'),
  /** @type {Utils['autocompleteGenerator']} */ autocompleteGenerator = require('./autocompleteGenerator'),
  /** @type {Utils['commandMention']} */ commandMention = require('./commandMention'),
  /** @type {Utils['cooldowns']} */ cooldowns = require('./cooldowns'),
  /** @type {Utils['permissionTranslator']} */ permissionTranslator = require('./permissionTranslator'),
  /** @type {Utils['timeFormatter']} */ { msInSecond } = require('./timeFormatter'),
  /** @type {Utils['DiscordAPIErrorCodes']} */ DiscordAPIErrorCodes = require('./DiscordAPIErrorCodes.json'),

  PERM_ERR_MSG_DELETETIME = msInSecond * 10,

  isValidType = /** @param {Message | BaseInteraction} type */ type => type instanceof Message || type.isChatInputCommand();

/**
 * @this {Interaction | Message}
 * @param {command<'both', boolean, true>} command
 * @param {lang} lang
 * @returns {Promise<[string, { option: string, description: string }] | [string, { option: string, availableOptions?: string }] | false>} */
async function checkOptions(command, lang) {
  /** @type {command<'both', boolean, true> | commandOptions<true>} */
  let option = command;
  if (this.options?._group) {
    option = option.options.find(e => e.name == this.options._group);
    if (!(option.dmPermission ?? command.dmPermission) && this.channel.type == ChannelType.DM) return ['guildOnly'];
  }
  if (this.options?._subcommand) {
    option = option.options.find(e => e.name == this.options._subcommand);
    if (!(option.dmPermission ?? command.dmPermission) && this.channel.type == ChannelType.DM) return ['guildOnly'];
  }

  if (!option.options) return false;

  for (const [i, data] of option.options.entries()) {
    const {
      required, name, description, descriptionLocalizations, autocomplete,
      strictAutocomplete, autocompleteOptions, choices, channelTypes
    } = data;

    if (required && !this.options?.get(name) && !this.args?.[i]) {
      return ['paramRequired', {
        option: name,
        description: (lang.config.locale ? descriptionLocalizations?.[lang.config.locale] : undefined)
          ?? descriptionLocalizations?.[lang.defaultConfig.defaultLocale] ?? description
      }];
    }

    if (
      channelTypes && (this.options?.get(name) || this.args?.[i])
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      -- will be fixed when commands are moved to their own lib */
      && !channelTypes.includes((this.options?.getChannel(name) ?? this.mentions?.channels.at(i))?.type)
    ) return ['invalidChannelType', name];

    const autocompleteIsUsed = () => !!(autocomplete && strictAutocomplete && (this.options?.get(name) ?? this.args?.[i]));
    if (
      isValidType(this) && autocompleteIsUsed() && !(await autocompleteGenerator.call(
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-condition,
        @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- false positive/ts bug */
        this, command, { name, value: this.options?.get(name).value ?? this.args?.[i] ?? '' }, this.guild?.db.config.lang ?? this.guild?.localeCode
      )).some(e => (e.toLowerCase?.() ?? e.value.toLowerCase()) === (this.options?.get(name).value ?? this.args?.[i])?.toLowerCase())

    /* eslint-enable */
    ) {
      if (typeof autocompleteOptions != 'function') {
        return ['strictAutocompleteNoMatchWValues', {
          option: name,
          availableOptions: Array.isArray(autocompleteOptions)
            ? autocompleteOptions.map(e => (typeof e == 'object' ? e.value : e)).map(inlineCode).join(', ')
            : autocompleteOptions
        }];
      }
      return ['strictAutocompleteNoMatch', name];
    }

    if (this instanceof Message && this.args[i] && choices && !choices.some(e => e.value == this.args[i]))
      return ['strictAutocompleteNoMatchWValues', { option: name, availableOptions: choices.map(e => inlineCode(e.value)).join(', ') }];
  }

  return false;
}

/**
 * @this {GuildInteraction | Message<true>}
 * @param {command<'both', boolean, true>} command
 * @param {lang} lang
 * @returns {Promise<boolean>} `false` if no permission issues have been found. */
async function checkPerms(command, lang) {
  const
    userPermsMissing = this.member.permissionsIn(this.channel).missing([...command.permissions?.user ?? [], PermissionFlagsBits.SendMessages]),
    botPermsMissing = this.guild.members.me.permissionsIn(this.channel)
      .missing([...command.permissions?.client ?? [], PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]);

  if (!botPermsMissing.length && !userPermsMissing.length) return false;

  const embed = new EmbedBuilder({
    title: lang('permissionDenied.embedTitle'),
    description: lang(`permissionDenied.embedDescription${userPermsMissing.length ? 'User' : 'Bot'}`, {
      permissions: permissionTranslator(botPermsMissing.length ? botPermsMissing : userPermsMissing,
        lang.config.locale, this.client.i18n).map(inlineCode).join(', ')
    }),
    color: Colors.Red
  });

  if (botPermsMissing.includes('SendMessages') || botPermsMissing.includes('ViewChannel')) {
    if (this instanceof Message && this.guild.members.me.permissionsIn(this.channel).has(PermissionFlagsBits.AddReactions)) {
      await this.react('❌');
      void this.react('✍️'); // don't need to wait here
    }

    try { await this.user.send({ content: this.url, embeds: [embed] }); }
    catch (err) {
      if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
    }
  }
  else await this.customReply({ embeds: [embed], flags: MessageFlags.Ephemeral }, this instanceof Message ? PERM_ERR_MSG_DELETETIME : 0);

  return true;
}

/** @type {Utils['checkForErrors']} */
module.exports = async function checkForErrors(command, lang) {
  if (!command) {
    if (this instanceof Message) {
      let cmd = this.client.slashCommands.get(this.commandName) ?? this.client.prefixCommands.get(this.commandName);
      if (cmd?.aliasOf) cmd = this.client.slashCommands.get(cmd.aliasOf);
      if (cmd) {
        if (this.client.botType == 'dev' && !cmd.beta) return this.client.config.replyOnNonBetaCommand ? ['nonBeta'] : true;
        return ['slashOnly', commandMention(cmd.name, cmd.id)];
      }

      void this.runMessages();
    }

    return true;
  }

  // DO NOT REMOVE THE FOLLOWING LINE
  if (this.client.config.devOnlyFolders.includes(command.category) && !this.client.config.devIds.has(this.user.id)) return true;
  if (this instanceof Message && this.guild?.members.me.communicationDisabledUntil) return true;
  if (command.disabled) return this.client.config.replyOnDisabledCommand ? ['disabled', command.disabledReason ?? 'Not provided'] : true;

  if (this.client.botType == 'dev' && !command.beta) return this.client.config.replyOnNonBetaCommand ? ['nonBeta'] : true;
  if (!command.dmPermission && this.channel.type == ChannelType.DM) return ['guildOnly'];

  const disabledList = this.guild?.db.config.commands?.[command.aliasOf ?? command.name]?.disabled;
  if (disabledList && this.member && this.member.id != this.guild.ownerId) {
    if (Object.values(disabledList).some(e => Array.isArray(e) && e.includes('*'))) return ['notAllowed.anyone'];
    if (disabledList.users?.includes(this.user.id)) return ['notAllowed.user'];
    if (disabledList.channels?.includes(this.channel.id)) return ['notAllowed.channel'];
    if (
      disabledList.roles && ('cache' in this.member.roles ? this.member.roles.cache : this.member.roles)
        .some(e => disabledList.roles.includes(e instanceof Role ? e.id : e))
    ) return ['notAllowed.role'];
  }

  if (command.category == 'nsfw' && !this.channel.nsfw) return ['nsfw'];

  if (command.options) {
    const err = await checkOptions.call(this, command, lang);
    if (err) return err;
  }

  if (this.client.botType != 'dev') {
    const cooldown = cooldowns.call(this, command.name, command.cooldowns);
    if (cooldown) return ['cooldown', inlineCode(cooldown)];
  }

  return this.inGuild() && (this instanceof Message || this instanceof CommandInteraction) && await checkPerms.call(this, command, lang);
};