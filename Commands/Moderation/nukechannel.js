const { Constants, EmbedBuilder, Colors } = require('discord.js');

/** @type {command<'slash'>}*/
module.exports = {
  aliases: { prefix: ['clearchannel'], slash: ['clearchannel'] },
  permissions: { client: ['ManageChannels'], user: ['ManageGuild', 'ManageChannels'] },
  cooldowns: { guild: 1e4, user: 1000 },
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'confirmation',
      type: 'String',
      required: true
    },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.TextBasedChannelTypes
    }
  ],

  run: async function (lang) {
    if (this.options.getString('confirmation')?.toLowerCase() != lang('confirmation')) return this.editReply(lang('needConfirm'));

    const
      embed = new EmbedBuilder({
        description: lang('embedDescription'),
        color: Colors.Red,
        image: { url: 'https://i.giphy.com/XUFPGrX5Zis6Y.gif' },
        footer: { text: lang('embedFooterText', this.user.tag) }
      }),
      channel = this.options?.getChannel('channel') ?? this.channel,
      cloned = await channel.clone({ reason: lang('global.modReason', { command: this.commandName, user: this.user.username }) });

    await channel.delete(lang('global.modReason', { command: this.commandName, user: this.user.username }));
    return cloned.send({ embeds: [embed] });
  }
};