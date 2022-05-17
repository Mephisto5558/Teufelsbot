const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");

let sender;

module.exports = new Command({
  name: 'dm',
  aliases: [],
  description: 'sends a user a dm',
  permissions: { client: [], user: [] },
  cooldown: { global: '', user: '' },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: false,
  noDefer: true,
  options: [{
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
    },
    {
      name: 'as_mod',
      description: `shows 'a mod of {server}' instead of your name`,
      type: 'STRING',
      required: false,
      choices: [{ name: 'yes', value: 'yes' }]
    }
  ],

  run: async(client, _, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    
    let
      user = interaction.options.getMember('target'),
      messageToSend = interaction.options.getString('message'),
      hideName = interaction.options.getString('as_mod');
    messageToSend = messageToSend.replace('/n', `\n`);

    if(hideName == 'yes') {
      firstLine = `Message sent by a moderator of '${interaction.guild.name}'\n`
    }
    else {
      await client.users.fetch(interaction.member.user.id)
        .then(user => {
          firstLine = `Message sent by [${user.username}#${user.discriminator}](https://discord.com/channels/@me/${user.id}).\n`
        });
    }
    
    let embed = new MessageEmbed()
      .setDescription(messageToSend)
      .setFooter({ text:
       firstLine +
        `If you don't want to receive user-made dms from me, run /disabledm in any server.`
      });

    user.send({ embeds: [embed] })
      .then(interaction.editReply({
        content: 'Message sent!',
        ephemeral: true
      }))
      .catch(err => {
        interaction.editReply({
          content: "I couldn't message this member!",
          ephemeral: true
        })
      })
 
  }
})