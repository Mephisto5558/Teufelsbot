const
  { Message, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } = require('discord.js'),
  emojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯'];

module.exports = {
  name: 'vote',
  aliases: { prefix: [], slash: [] },
  permissions: { client: ['AddReactions'], user: [] },
  cooldowns: { guild: 0, user: 500 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'question',
      type: 'String',
      required: true
    },
    {
      name: 'option_1',
      type: 'String',
      required: true
    },
    {
      name: 'option_2',
      type: 'String',
      required: true
    },
    { name: 'option_3', type: 'String' },
    { name: 'option_4', type: 'String' },
    { name: 'option_5', type: 'String' },
    { name: 'option_6', type: 'String' },
    { name: 'option_7', type: 'String' },
    { name: 'option_8', type: 'String' },
    { name: 'option_9', type: 'String' },
    {
      name: 'type',
      type: 'String',
      choices: ['normal', 'anonymous']
    },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: ['GuildText', 'GuildNews']
    }
  ], beta: true,

  run: async (message, lang, { db }) => {
    const channel = message.options?.getChannel('channel') || message.mentions?.channels?.first() || message.channel;

    if (!message.member.permissionsIn(channel).has(PermissionFlagsBits.SendMessages)) return message.customReply(lang('noPerm'));

    if (message instanceof Message) message.args = message.content.replace(channel.toString(), '').split('|').slice(0, 10).map(e => e.trim());
    const
      question = message.options?.getString('question') || message.args.shift(),
      type = message.options?.getString('type'),
      options = (message.args || Object.entries(message.options.data || 0).filter(([, e]) => e.name.startsWith('option')).map(([, v]) => v.value))
        .map((text, i) => ({ emoji: emojis[i], text }));

    if (!question) return message.customReply(lang('noQuestion'), 30000);
    else if (options.length < 2) return message.customReply(lang('notEnoughOptions'), 30000);

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      fields: [
        { name: lang('fieldsQuestion'), value: question, inline: false },
        { name: lang('fieldsOptions'), value: options.map(e => `${e.emoji} | ${e.text}`).join('\n'), inline: false }
      ],
      footer: {},
      color: Colors.White
    });
    let msg;

    if (type == 'anonymous') {
      embed.data.footer.text = lang('buttonEmbedFooterText');

      const buttons = options.map(e => new ButtonBuilder({
        customId: `voteCommand.${message.user.id}.${e.emoji}`,
        emoji: e.emoji
      }));

      const rows = new ActionRowBuilder({
        components: [
          ...buttons.splice(0, 5), ...buttons,
          new ButtonBuilder({ customId: `voteCommand.${message.user.id}.end`, emoji: '❌' })
        ]
      });

      msg = message.customReply({ embeds: [embed], components: [rows] });
    }
    else {
      embed.data.footer.text = lang('embedFooterText');
      msg = await message.customReply({ embeds: [embed] });
      for (const emoji of options.map(e => e.emoji)) await msg.react(emoji);
      await msg.react('❌');
    }

    db.set('polls', db.get('polls').fMerge({ [msg.id]: message.user.id }));

    message instanceof Message ? message.react('👍') : message.customReply(lang('global.messageSent'));
  }
}