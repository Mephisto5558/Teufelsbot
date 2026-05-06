/**
 * @import { BaseGuildTextChannel } from 'discord.js'
 * @import { lock_unlock } from '.' */

const
  { Colors, EmbedBuilder, Message, OverwriteType } = require('discord.js'),
  { OptionType, Permission } = require('@mephisto5558/command');

/** @type {lock_unlock} */
/* eslint-disable-next-line camelcase -- This casing is used to better display the commandNames. */
module.exports = async function lock_unlock(lang, { command }) {
  let reason;
  if (this.isChatInputCommand?.()) reason = this.options.getString('reason');
  else if (this instanceof Message) {
    this.args.shift();
    reason = this.args.join(' ');
  }

  /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- string may be empty */
  reason ||= lang('noReason');

  const
    msg = await this.customReply(lang('global.loading', this.client.application.getEmoji('loading'))),
    channel = command.findOptions({ type: OptionType.Channel }).getChannel(this, true),
    embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { mod: this.user.username, reason }),
      color: Colors.Red
    }),
    roles = await this.guild.roles.fetch(),
    members = await this.guild.members.fetch();

  /** @type {NonNullable<Database['guildSettings'][Snowflake]>['lockedChannels']} */
  let overwrites;

  if (this.commandName == 'lock') {
    overwrites = channel.permissionOverwrites.cache.reduce((acc, e) => {
      if (
        (e.type == OverwriteType.Role && roles.get(e.id)?.editable || members.get(e.id).manageable)
        && !e.deny.has(Permission.SendMessages) && !e.allow.has(Permission.Administrator)
      ) acc[e.id] = e.type;

      return acc;
    }, {});

    if (
      this.guild.roles.everyone.editable
      && channel.permissionsFor(this.guild.roles.everyone.id)?.has(Permission.SendMessages)
    ) overwrites[this.guild.roles.everyone.id] = OverwriteType.Role;
  }
  else {
    overwrites = Object.fromEntries(Object.entries(this.guild.db.lockedChannels?.[channel.id] ?? {}).filter(([k, v]) => {
      if (channel.permissionOverwrites.cache.get(k)?.allow.has(Permission.SendMessages)) return false;
      if (v == OverwriteType.Role) return roles.get(k).position - this.guild.members.me.roles.highest.position < 0;
      return members.get(k).manageable;
    }));

    if (!overwrites.length) return msg.edit(lang('notLocked'));
  }

  for (const [id, type] of Object.entries(overwrites)) {
    await channel.permissionOverwrites.edit(id,
      { [Permission.SendMessages]: this.commandName == 'lock' },
      { type, reason: lang('global.modReason', { command: this.commandName, user: this.user.username }) });
  }

  if (this.commandName == 'unlock') await this.guild.deleteDB(`lockedChannels.${channel.id}`);
  else if (overwrites.__count__) await this.guild.updateDB(`lockedChannels.${channel.id}`, overwrites);

  await channel.send({ embeds: [embed] });
  return msg.edit(lang('success'));
};