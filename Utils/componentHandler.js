/** @import { componentHandler } from '.' */

const
  { Colors, EmbedBuilder, MessageFlags, Role, inlineCode } = require('discord.js'),
  /** @type {Record<string, GenericFunction<unknown>>} */ handlers = require('./componentHandler/'),
  errorHandler = require('./errorHandler'),
  { msInSecond } = require('./timeFormatter');

/** @type {componentHandler} */
module.exports = async function messageComponentHandler(lang) {
  lang.config.backupPaths[0] = 'events.command';

  const
    [feature, id, mode, data, ...args] = this.customId.split('.'),
    cooldown = this.client.cooldowns.update(`buttonPressEvent.${this.message.id}`, this, { user: msInSecond }),
    command = this.client.slashCommands.get(feature) ?? this.client.prefixCommands.get(feature) ?? { name: feature, aliasOf: undefined },
    disabledList = this.guild.db.config.commands?.[command.aliasOf ?? command.name ?? '']?.disabled ?? {};

  let err;
  if (disabledList.users?.includes(this.user.id)) err = 'notAllowed.user';
  else if (disabledList.channels?.includes(this.channel.id)) err = 'notAllowed.channel';
  else if (
    disabledList.roles && this.member && ('cache' in this.member.roles ? this.member.roles.cache : this.member.roles)
      .some(e => disabledList.roles.includes(e instanceof Role ? e.id : e))
  ) err = 'notAllowed.role';
  else if (command.category == 'nsfw' && !this.channel.nsfw) err = 'nsfw';
  else if (cooldown) err = 'events.interaction.buttonOnCooldown';

  if (err) {
    const embed = new EmbedBuilder({ description: lang(err, inlineCode(Math.round(cooldown / msInSecond))), color: Colors.Red });
    return this.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  try { if (feature && feature in handlers) return await handlers[feature].call(this, lang, id, mode, data, args); }
  catch (err) { return errorHandler.call(this.client, err, this, lang); }
};