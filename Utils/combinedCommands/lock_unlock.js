const
  { PermissionFlagsBits, OverwriteType, EmbedBuilder, Colors } = require('discord.js'),
  getTargetChannel = require('../getTargetChannel.js');

/**@this {GuildMessage|GuildInteraction} @param {lang}lang*/
module.exports = async function lock_unlock(lang) {
  this.args?.shift();

  const
    msg = await this.customReply(lang('global.loading')),
    channel = getTargetChannel.call(this, { returnSelf: true }),
    reason = this.options?.getString('reason') || this.args?.join(' ') || lang('noReason'),
    embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { mod: this.user.username, reason }),
      color: Colors.Red
    });

  let overwrites;

  if (this.commandName == 'lock') {
    overwrites = await channel.permissionOverwrites.cache.reduce(async (acc, e) =>
      e.allow.has(PermissionFlagsBits.SendMessages) && !e.allow.has(PermissionFlagsBits.Administrator) && (
        e.type == OverwriteType.Role && (await this.guild.roles.fetch(e.id))?.position - this.guild.members.me.roles.highest.position < 0
        || (await this.guild.members.fetch(e.id)).manageable
      ) ? { ...(await acc), [e.id]: e.type } : acc, Promise.resolve({}));

    if (channel.permissionOverwrites.resolve(this.guild.roles.everyone.id)?.allow.has(PermissionFlagsBits.SendMessages))
      overwrites[this.guild.roles.everyone.id] = OverwriteType.Role;

    await this.client.db.update('guildSettings', `${this.guild.id}.lockedChannels.${channel.id}`, overwrites);
  }
  else {
    overwrites = Object.entries(this.guild.db.lockedChannels?.[channel.id] || {})?.filter(async ([k, v]) => {
      if (channel.permissionOverwrites.cache.get(k)?.allow.has(PermissionFlagsBits.SendMessages)) return;
      if (v == OverwriteType.Role) return (await this.guild.roles.fetch(k))?.position - this.guild.members.me.roles.highest.position < 0;
      return (await this.guild.members.fetch(k)).manageable;
    });

    if (!overwrites.length) return msg.edit(lang('notLocked'));

    await this.client.db.delete('guildSettings', `${this.guild.id}.lockedChannels.${channel.id}`);
  }

  for (const [id, type] of Array.isArray(overwrites) ? overwrites : Object.entries(overwrites)) await channel.permissionOverwrites.edit(id,
    { [PermissionFlagsBits.SendMessages]: this.commandName == 'lock' },
    { type, reason: lang('global.modReason', { command: this.commandName, user: this.user.username }) }
  );

  await channel.send({ embeds: [embed] });
  return msg.edit(lang('success'));
};