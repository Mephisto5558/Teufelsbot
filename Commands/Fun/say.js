const { Command } = require("reconlx");

module.exports = new Command({
  name: 'say',
  aliases: [],
  description: 'Let me say something',
  permissions: {client: [], user: []},
  category: "Fun",
  slashCommand: true,
  disabled: false,
  options: [
    {
      name: 'msg',
      description: `Type your message here, /n for new line`,
      type: 'STRING',
      required: true
    },
    {
      name: 'channel',
      description: 'The channel the message gets sent to',
      type: 'CHANNEL',
      channel_type: 'GUILD_TEXT',
      required: false
    }
  ],

  run: async (client, _, interaction) => {
    if(!interaction) return;
    
    let channel = interaction.options.getChannel('channel')
    let msg = interaction.options.getString('msg');
    msg = msg.replace('/n', `\n`);

    if(!channel) channel = interaction.channel
    
    if(!channel.permissionsFor(interaction.member).has('SEND_MESSAGES')) {
      return interaction.followUp({content: `You dont't have permission to send messages in <#${channel.id}>!`, ephemeral: true});
    };
    if(!interaction.guild.me.permissionsIn(channel).has('SEND_MESSAGES')) {
      return interaction.followUp({content: `I dont't have permission to send messages in <#${channel.id}>!`, ephemeral: true});
    };
    
    channel.send(msg)
      .then(interaction.followUp({content: 'Message sent!', ephemeral: true}));
  }
})