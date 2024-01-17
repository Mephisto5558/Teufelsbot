const { Constants, ButtonBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, Colors, } = require('discord.js');

/**@type {command}*/
module.exports = {
  name: 'record',
  cooldowns: { user: 10000 },
  slashCommand: true,
  prefixCommand: false,
  options: [
    { name: 'target', type: 'User' },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.VoiceBasedChannelTypes
    },
    { name: 'public', type: 'Boolean' }
  ],

  /**@this GuildInteraction*/
  run: async function (lang) {
    const
      /**@type {import('discord.js').BaseGuildVoiceChannel?}*/
      voiceChannel = this.options.getChannel('channel') || this.options.getMember('target')?.voice.channel || this.member.voice.channel,
      target = voiceChannel?.members.get(this.options.getMember('target')?.id),
      targets = (target ? [target] : [...(voiceChannel?.members?.values() ?? [])]).filter(e => e?.voice.channel && !e.user.bot),
      isPublic = this.options.getBoolean('public');

    if (!voiceChannel) return this.editReply(lang('needVoiceChannel'));
    if (!voiceChannel.joinable) return this.editReply(lang('cannotJoin'));
    if (!targets.length) return this.editReply(lang('noTarget'));

    this.deleteReply();

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescription', { user: this.user.id, channel: voiceChannel.id, publicOrPrivate: lang(isPublic ? 'isPublic' : 'isPrivate') }),
        footer: { text: this.user.username, iconURL: this.member.displayAvatarURL({ forceStatic: true }) },
        color: Colors.Red
      }),
      components = [
        new ActionRowBuilder({
          components: [
            new ButtonBuilder({
              customId: `record.memberAllow.${this.user.id}.${voiceChannel.id}.${isPublic}`,
              label: lang('allow'),
              style: ButtonStyle.Success
            }),
            new ButtonBuilder({
              customId: `record.memberDeny.${this.user.id}.${voiceChannel.id}.${isPublic}`,
              label: lang('deny'),
              style: ButtonStyle.Danger
            })
          ]
        }),
        new ActionRowBuilder({
          components: [new ButtonBuilder({
            customId: `record.cancel.${this.user.id}.${voiceChannel.id}`,
            label: lang('global.cancel'),
            style: ButtonStyle.Danger
          })]
        })
      ];

    return this.channel.send({
      content: targets.join(', '),
      embeds: [embed],
      components
    });
  }
};