const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");

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
      target = interaction.options.getMember('target'),
      messageToSend = interaction.options.getString('message'),
      asMod = interaction.options.getString('as_mod');

    messageToSend = messageToSend.replace('/n', `\n`);

    if(!asMod) {
      let blockList = await client.db.get('dmCommandBlocklist');
      if(blockList.includes(target)) {
        return interaction.editReply({
          content:
            "This user does not allow dms from this command.\n" +
            "use the `as_mod` option to force the message to send.",
          ephemeral: true
        });
      }
      else {
          firstLine = `Message sent by [${interaction.member.user.username}#${interaction.member.user.discriminator}](https://discord.com/channels/@me/${interaction.member.user.id}).\n`
        };
    }
    else {
      if(interaction.member.permissions.has('MANAGE_MESSAGES')) {
        firstLine = `Message sent by a moderator of '${interaction.guild.name}'\n`
      }
      else {
        return interaction.editReply({
          content:
            "You are not permitted to use the `as_mod` option\n" +
            "You need the 'MANAGE_MESSAGES' permission.",
            ephemeral: true
        })
      }
    }
    
    let embed = new MessageEmbed()
      .setDescription(messageToSend)
      .setFooter({ text:
       firstLine +
        `If you don't want to receive user-made dms from me, run /disabledm in any server.`
      });

    target.send({ embeds: [embed] })
      .then(interaction.editReply({
        content: 'Message sent!',
        ephemeral: true
      }))
      .catch(_ => {
        interaction.editReply({
          content: "I couldn't message this member!",
          ephemeral: true
        })
      })
 
  }
})