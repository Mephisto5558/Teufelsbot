const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");

module.exports = new Command({
  name: 'dm',
  aliases: [],
  description: 'sends a user a dm',
  permissions: {client: [], user: []},
  category : 'Fun',
  slashCommand: true,
  prefiCommand: true,
  options: [
    {
      name: 'target',
      description: 'the user you want to send a dm to',
      type: 'USER',
      required: true
    },
    {
      name: 'message',
      description: `the message you want to send, /n for new line`,
      type: 'STRING',
      required: true
    }
  ],
  
  run: async (client, _, interaction) => {
    if(!interaction) return;
    
    let user = interaction.options.getMember('target');
    let messageToSend = interaction.options.getString('message');
    messageToSend = messageToSend.replace('/n', `\n`);
    let sender;
    await client.users.fetch(interaction.member.user.id).then(user => { sender = `${user.username}#${user.discriminator}` });

    let embed = new MessageEmbed()
      .setDescription(messageToSend)
      .setFooter({
        text: `Message sent by [${sender}](https://discord.com/channels/@me/${user.id}). If you don't want to receive user-made dms from me, run /disabledm in any server.`,
      });

    user.send({ embeds: [embed] })
      .then(interaction.followUp('Message sent!'))
      .catch(err => { interaction.followUp("I couldn't message this member!") })
  }
})