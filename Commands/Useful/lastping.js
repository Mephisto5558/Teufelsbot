/** @import { GuildTextBasedChannel } from 'discord.js' */

const
  { Colors, Constants, EmbedBuilder, hyperlink, userMention } = require('discord.js'),
  { Command, commandTypes } = require('@mephisto5558/command'),
  { getTargetMembers, getTargetChannel, constants: { embedDescriptionMaxLength } } = require('#Utils');

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  cooldowns: { guild: '200ms', user: '10s' },
  ephemeralDefer: true,
  options: [
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.GuildTextBasedChannelTypes
    },
    { name: 'member', type: 'User' }
  ],

  async run(lang) {
    const
      target = getTargetMembers(this, { targetOptionName: 'member' }),
      /** @type {GuildTextBasedChannel | undefined} */ channel = getTargetChannel(this);

    if (target) {
      if (!channel) return this.customReply(lang('memberRequiresChannel'));
      if (!channel.isTextBased()) return this.customReply(lang('invalidChannel'));
    }

    const { url, content, author, createdAt } = (channel
      ? channel.messages.cache.find(
          e => (!target || e.author.id == target.id) && e.mentions.everyone
            || e.mentions.users.has(this.user.id) || e.mentions.roles.hasAny(this.member.roles.cache.keys())
        )
      : this.guild.db.lastMentions?.[this.user.id]) ?? {};

    if (!url) return this.customReply(lang('noneFound'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', {
        author: userMention(author),
        link: hyperlink(lang('global.here'), url),
        content: content ? `>>> ${content.slice(0, embedDescriptionMaxLength)}` : lang('global.unknown')
      }),
      timestamp: createdAt,
      color: Colors.White
    });

    return this.customReply({ embeds: [embed] });
  }
});