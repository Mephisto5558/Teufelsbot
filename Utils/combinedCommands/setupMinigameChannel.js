const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getTargetChannel } = require('../../Utils');

/** @type {command<'both'>['run']} */
module.exports = async function setupMinigameChannel(lang) {
  const
    game = this.commandName,
    gameData = this.guild.db.channelMinigames?.[game] ?? {},

    /** @type {import('discord.js').GuildTextBasedChannel}*/
    channel = getTargetChannel(this, { returnSelf: true });

  if (gameData[channel.id]) {
    await this.client.db.delete('guildSettings', `${this.guild.id}.channelMinigames.${game}.${channel.id}`);

    const embed = new EmbedBuilder({
      description: lang('removed.embedDescription'),
      footer: { text: lang('removed.by', this.user.tag) },
      color: Colors.Red
    });

    if (this.channel.id == channel.id) return this.customReply({ embeds: [embed] });

    await channel.send({ embeds: [embed] });
    return this.customReply(lang('removed.success', channel.id));
  }

  const embed = new EmbedBuilder({
    title: lang('added.embedTitle'),
    description: lang('added.embedDescription'),
    footer: { text: lang('added.by', this.user.tag) },
    color: Colors.Green
  });

  await this.guild.updateDB(`channelMinigames.${game}.${channel.id}`, { lastNumber: 0 });

  if (this.channel.id == channel.id) return this.customReply({ embeds: [embed] });
  await channel.send({ embeds: [embed] });

  return this.customReply(lang('added.success', channel.id));
};