const
  { Constants, PermissionFlagsBits, Message, AllowedMentionsTypes } = require('discord.js'),
  { logSayCommandUse } = require('../../Utils');

/**@type {command}*/
module.exports = {
  name: 'say',
  cooldowns: { user: 200 },
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'msg',
      type: 'String',
      maxLength: 2000,
      required: true
    },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.TextBasedChannelTypes,
    }
  ],

  /**@this GuildInteraction|GuildMessage*/
  run: async function (lang) {
    const
      msg = this.content || this.options?.getString('msg'),
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first() || this.channel;

    if (!this.member.permissionsIn(channel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return this.customReply(lang('noPerm'));
    if (!msg) return this.customReply(lang('noMsgProvided'));

    let allowedMentions = { parse: [AllowedMentionsTypes.User] };
    if (this.member.permissionsIn(channel).has(PermissionFlagsBits.MentionEveryone)) {
      allowedMentions.parse.push(AllowedMentionsTypes.Role);
      allowedMentions.parse.push(AllowedMentionsTypes.Everyone);
    }

    const sentMessage = await channel.send({ content: msg.replaceAll('/n', '\n'), allowedMentions });
    await (this instanceof Message ? this.react('👍') : this.customReply(lang('global.messageSent')));

    return logSayCommandUse.call(sentMessage, this.member, lang);
  }
};