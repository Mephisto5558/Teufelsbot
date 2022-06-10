const
  { Command } = require("reconlx"),
  { MessageEmbed } = require("discord.js"),
  { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'kick',
  aliases: [],
  description: 'kicks a member from the server',
  usage: '',
  permissions: { client: ['KICK_MEMBERS'], user: ['KICK_MEMBERS'] },
  cooldowns: { global: '', user: '' },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'member',
      description: 'Who do you want to get kicked?',
      type: 'USER',
      required: true
    },
    {
      name: 'reason',
      description: 'The member will see the reason in a DM.',
      type: 'STRING',
      required: true
    }
  ],

  run: async (_, __, interaction) => {
    const member = interaction.options.getMember('member');
    const reason = interaction.options.getString('reason');
    let errorMsg, noMsg;

    if (member.id == interaction.member.id)
      errorMsg = `You can't kick yourself!`;
    else if (member.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1 && interaction.guild.ownerId != interaction.user.id)
      errorMsg = `You don't have the permission to do that!`;
    else if (!member.kickable)
      errorMsg = `I don't have the permission to do that!`;

    if (errorMsg) return interaction.editReply(errorMsg);

    let embed = new MessageEmbed()
      .setTitle('Kicked')
      .setDescription(
        `You have been kicked from \`${interaction.guild.name}\`.\n` +
        `Moderator: ${interaction.user.tag}\n` +
        `Reason: ${reason}`
      )
      .setColor(colors.RED);

    try { await member.send({ embeds: [embed] }) }
    catch { noMsg = true }

    try { await member.kick({ reason: reason }) }
    catch (err) {
      interaction.editReply("I couldn't kick the target");
      throw new Error("couldn't ban/kick target", err)
    }

    embed
      .setTitle('Kick')
      .setDescription(
        `${member.user.tag} has been successfully kicked.\n` +
        `Reason: ${reason}\n` +
        `${noMsg ? `\nI couldn't DM the target.` : ''}`
      )

    interaction.editReply({ embeds: [embed] });

  }
})