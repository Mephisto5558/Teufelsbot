const
  { Constants, PermissionFlagsBits, Message, AllowedMentionsTypes } = require('discord.js'),
  { getTargetChannel, logSayCommandUse } = require('#Utils');

/** @type {command<'both'>}*/
module.exports = {
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
      channelTypes: Constants.GuildTextBasedChannelTypes
    },
    {
      name: 'reply_to', type: 'String',
      minLength: 17,
      maxLength: 19 // No snowflake will be longer than that until 2090 (https://snowsta.mp/?s=9999999999999999999)
    }
  ],

  run: async function (lang) {
    const

      /** @type {string}*/
      msg = this.options?.getString('msg', true) ?? this.content,
      allowedMentions = { parse: [AllowedMentionsTypes.User] },

      /** @type {import('discord.js').GuildTextBasedChannel}*/
      channel = getTargetChannel(this, { returnSelf: true }),
      replyTo = this.options?.getString('reply_to');

    if (!this.member.permissionsIn(channel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return this.customReply(lang('noPerm'));

    if (this.member.permissionsIn(channel).has(PermissionFlagsBits.MentionEveryone))
      allowedMentions.parse.push(AllowedMentionsTypes.Role, AllowedMentionsTypes.Everyone);

    const sentMessage = await channel.send({ content: msg.replaceAll('/n', '\n'), allowedMentions, reply: { messageReference: replyTo, failIfNotExists: false } });
    await (this instanceof Message ? this.react('👍') : this.customReply(lang('global.messageSent')));

    return logSayCommandUse.call(sentMessage, this.member, lang);
  }
};