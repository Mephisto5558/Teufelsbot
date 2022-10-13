const { parseEmoji, EmbedBuilder, Colors } = require('discord.js');
return;
module.exports = {
  name: 'reaction',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Customization',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'option',
      type: 'String',
      autocomplete: true,
      autocompleteOptions: ['role-add', 'role-remove', 'message', 'command'],
      required: true,
    },
    {
      name: 'channel',
      type: 'Channel'
    },
    {
      name: 'message_id',
      type: 'String',
      required: true
    },
    {
      name: 'emoji',
      type: 'String',
      required: true
    },
    { name: 'role', type: 'Role' },
    { name: 'message', type: 'String' },
    { name: 'command', type: 'String' }
  ],
  beta: true,

  run: function (lang, client) {
    const
      option = this.options.getString('option'),
      input = this.options.get(option.split('-')[0]),
      message = (this.options.getChannel(channel) || this.channel).messages.fetch(this.options.getString('message_id')),
      emoji = parseEmoji(this.options.getString('emoji')),
      getData = () => {
        switch (option) {
          case 'role-add':
          case 'role-remove': return input?.role ? input.role.id : (this.customReply(lang('needsRole')), undefined);
          case 'message': return input?.value ? input.value?.toString() : (this.customReply(lang('needsMessage')), undefined);
          case 'command': return (client.prefixCommands.get(input?.value.split(' ')[0]) || client.slashCommands.get(input?.value.split(' ')[0]))?.category.toLowerCase().includes('owner-only', undefined) ? (this.customReply(lang('commandNotFound')), undefined) : input.value?.toString();
        }
      };

    let data = getData();

    if (!data) return;
    data = (this.client.db.get('guildSettings')[this.guild.id]?.reactionActions?.[message.id]?.[emoji.id||emoji]?.[option] || []).push(data)

    try { message.react(emoji); }
    catch { return this.customReply(lang('invalidEmoji')); }

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { emoji: emoji.id || emoji, url: `${message.channel.url}/${message.id}`, option }),
      color: Colors.Green
    });

    this.customReply({ embeds: [embed] });

    client.db.update('guildSettings', `${this.guild.id}.reactionActions.${message.id}.${emoji.id || emoji}.${option}`, data);
  }
};