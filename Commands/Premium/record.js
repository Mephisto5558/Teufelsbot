const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, Constants, EmbedBuilder, bold, channelMention, userMention } = require('discord.js'),
  { mkdir } = require('node:fs/promises'),
  { Command, commandTypes } = require('@mephisto5558/command'),
  { msInSecond } = require('#Utils').timeFormatter;

function isEncryptionAvailable() {
  // https://discord.js.org/docs/packages/voice/main
  if (require('node:crypto').getCiphers().includes('aes-256-gcm')) return true;

  const libraries = ['sodium-native', 'sodium', '@stablelib/xchacha20poly1305', '@noble/ciphers', 'libsodium-wrappers'];
  for (const lib of libraries) {
    try { if (require.resolve(lib)) return true; }
    catch (err) { if (err.code != 'MODULE_NOT_FOUND') throw err; }
  }

  return false;
}

// Due to VoiceRecords being in .gitignore, we may need to create it.
if (isEncryptionAvailable()) void mkdir('./VoiceRecords/raw', { recursive: true });
else log.warn('Missing encryption library for record Command!');

module.exports = new Command({
  types: [commandTypes.slash],
  cooldowns: { user: msInSecond * 10 },
  disabled: !isEncryptionAvailable(),
  disabledReason: 'No encryption library is installed.',
  options: [
    { name: 'target', type: 'User' },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.VoiceBasedChannelTypes
    },
    { name: 'public', type: 'Boolean' }
  ],

  async run(lang) {
    const
      isPublic = !!this.options.getBoolean('public'),
      voiceChannel = this.options.getChannel('channel', false, Constants.VoiceBasedChannelTypes)
        ?? this.options.getMember('target')?.voice.channel ?? this.member.voice.channel,
      target = voiceChannel?.members.get(this.options.getMember('target')?.id),
      targets = (target ? [target] : [...voiceChannel?.members.values() ?? []]).filter(e => !!e.voice.channel && !e.user.bot);

    if (!voiceChannel) return this.editReply(lang('needVoiceChannel'));
    if (!voiceChannel.joinable) return this.editReply(lang('cannotJoin'));
    if (!targets.length) return this.editReply(lang('noTarget'));

    void this.deleteReply();

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescription', {
          user: userMention(this.user.id), channel: channelMention(voiceChannel.id),
          publicOrPrivate: bold(lang(isPublic ? 'isPublic' : 'isPrivate'))
        }),
        footer: { text: this.user.username, iconURL: this.member.displayAvatarURL({ forceStatic: true }) },
        color: Colors.Red
      }),
      components = [
        new ActionRowBuilder({
          components: [
            new ButtonBuilder({
              customId: `${this.commandName}.memberAllow.${this.user.id}.${voiceChannel.id}.${isPublic}`,
              label: lang('allow'),
              style: ButtonStyle.Success
            }),
            new ButtonBuilder({
              customId: `${this.commandName}.memberDeny.${this.user.id}.${voiceChannel.id}.${isPublic}`,
              label: lang('deny'),
              style: ButtonStyle.Danger
            })
          ]
        }),
        new ActionRowBuilder({
          components: [new ButtonBuilder({
            customId: `${this.commandName}.cancel.${this.user.id}.${voiceChannel.id}`,
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
});