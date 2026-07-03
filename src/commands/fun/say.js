/** @import { GuildTextBasedChannel } from 'discord.js' */

const
  { AllowedMentionsTypes, Constants } = require('discord.js'),
  { Command, CommandType, CooldownType, OptionType, Permission, isMessage } = require('@mephisto5558/command'),
  { constants, logSayCommandUse } = require('#utils');

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  cooldowns: { [CooldownType.User]: '200ms' },
  ephemeralDefer: true,
  options: [
    {
      name: 'msg',
      type: OptionType.String,
      maxLength: constants.messageMaxLength,
      required: true
    },
    {
      name: 'channel',
      type: OptionType.Channel,
      channelTypes: Constants.GuildTextBasedChannelTypes
    },
    {
      name: 'reply_to',
      type: OptionType.String,
      minLength: constants.snowflakeMinLength,
      maxLength: constants.snowflakeMaxLength
    }
  ],

  async run(lang, { command }) {
    const

      /** @type {string} */
      msg = this.options?.getString('msg', true) ?? this.content,
      allowedMentions = { parse: [AllowedMentionsTypes.User] },
      channel = command.findOption({ type: OptionType.Channel }).getChannel(this, true),
      replyTo = this.options?.getString('reply_to');

    if (!this.member.permissionsIn(channel).has([Permission.ViewChannel, Permission.SendMessages]))
      return this.customReply(lang('noPerm'));

    if (this.member.permissionsIn(channel).has(Permission.MentionEveryone))
      allowedMentions.parse.push(AllowedMentionsTypes.Role, AllowedMentionsTypes.Everyone);

    const sentMessage = await channel.send({
      allowedMentions, content: msg.replaceAll('/n', '\n'),
      reply: { messageReference: replyTo, failIfNotExists: false }
    });
    await (isMessage(this) ? this.react('👍') : this.customReply(lang('global.messageSent')));

    return logSayCommandUse.call(sentMessage, this.member, lang);
  }
});