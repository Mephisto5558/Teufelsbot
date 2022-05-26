const
  { Command } = require("reconlx"),
  { MessageEmbed } = require("discord.js"),
  colorConfig = require('../../Settings/embed.json').colors;

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
  options: [
    {
      name: 'toggle',
      description: 'toggles the ability to send you user-made dms',
      type: 'SUB_COMMAND'
    },
    {
      name: 'send',
      description: 'send a dm to a user of this guild',
      type: 'SUB_COMMAND',
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
        },
        {
          name: 'as_mod',
          description: `shows 'a mod of {server}' instead of your name`,
          type: 'BOOLEAN',
          required: false
        }
      ]
    }
  ],
  beta: true,

  run: async (client, _, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    let
      message, sender
      blackList = await client.db.get('dmCommandBlacklist'),
      cmd = interaction.options.getSubcommand();
      target = interaction.options.getMember('target'),
      messageToSend = interaction.options.getString('message'),
      perm = interaction.member.permissions.has('MANAGE_MESSAGES'),
      asMod = (interaction.options.getBoolean('as_mod') && perm);

    switch(cmd) {
      case 'toggle':
        if (blackList.includes(interaction.member.id)) {
          blackList = blackList.filter(entry => entry != interaction.member.id)
          await client.db.set('dmCommandBlacklist', blackList);

          message =
            'Your entry in the blacklist has been removed.\n' +
            'You can now receive user-made dms from me.';
        }
        else {
          await client.db.push('dmCommandBlacklist', interaction.member.id);

          message =
            'You are now blacklisted from this command.\n' +
            'This will not prevent server moderators from sending dms to you.';
        }

        interaction.editReply({
          content: message,
          ephemeral: true
        });
        break;

      case 'send':
        if (blackList.includes(target.id) && !asMod) {
          let errorMsg = 'This user does not allow dms from this command.';
          if (perm) errorMsg += '\nUse the `as_mod` option to force the message to send.';

          return interaction.editReply({
            content: errorMsg,
            ephemeral: true
          });
        }

        if(!asMod) sender = `\`${interaction.member.user.username}#${interaction.member.user.discriminator}\``;
      
        let embed = new MessageEmbed()
          .setTitle('You got a message!')
          .setDescription(
            `From: **${sender || 'a guild moderator'}**\n` +
            `Guild: \`${interaction.guild.name}\`\n\n` +
            messageToSend
          )
          .setColor(colorConfig.discord.BURPLE)
          .setFooter({
            text: "If you don't want to receive user-made dms from me, run /dm toggle in any server."
          });
          
        target.send({ embeds: [embed] })
          .then(
            interaction.editReply({
              content: 'Message sent!',
              ephemeral: true
            })
          )
          .catch(_ => {
            interaction.editReply({
              content: "I couldn't message this member!",
              ephemeral: true
            })
          })
        break;

      default: throw new SyntaxError(`The arg '${cmd}' of let cmd is not handled`);
    }

  }
})