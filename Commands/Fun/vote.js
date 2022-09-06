const
  { Message, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } = require('discord.js'),
  emojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯'];

module.exports = {
  name: 'vote',
  aliases: { prefix: [], slash: [] },
  description: 'Create a poll for something',
  usage: 'vote <channel> [question] | [option 1] | [option 2] | <option 3> ... <option 9>',
  permissions: { client: ['AddReactions'], user: [] },
  cooldowns: { guild: 0, user: 500 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'question',
      description: 'What do you want people to vote about?',
      type: 'String',
      required: true
    },
    {
      name: 'option_1',
      description: 'The 1st answer of this poll',
      type: 'String',
      required: true
    },
    {
      name: 'option_2',
      description: 'The 2nd answer of this poll',
      type: 'String',
      required: true
    },
    {
      name: 'option_3',
      description: 'The 3rd answer of this poll',
      type: 'String',
      required: false
    },
    {
      name: 'option_4',
      description: 'The 4th answer of this poll',
      type: 'String',
      required: false
    },
    {
      name: 'option_5',
      description: 'The 5th answer of this poll',
      type: 'String',
      required: false
    },
    {
      name: 'option_6',
      description: 'The 6th answer of this poll',
      type: 'String',
      required: false
    },
    {
      name: 'option_7',
      description: 'The 7th answer of this poll',
      type: 'String',
      required: false
    },
    {
      name: 'option_8',
      description: 'The 8th answer of this poll',
      type: 'String',
      required: false
    },
    {
      name: 'option_9',
      description: 'The 9th answer of this poll',
      type: 'String',
      required: false
    },
    {
      name: 'type',
      description: 'What kind of vote do you want?',
      type: 'String',
      choices: [
        { name: 'normal', value: 'normal' },
        { name: 'anonymous', value: 'anonymous' }
      ],
      required: false
    },
    {
      name: 'channel',
      description: 'Where should I post the poll?',
      type: 'Channel',
      channelTypes: ['GuildText', 'GuildNews'],
      required: false
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