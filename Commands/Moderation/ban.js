const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'ban',
  aliases: [],
  description: 'bans a member from the guild',
  usage: '',
  permissions: { client: ['BAN_MEMBERS'], user: ['BAN_MEMBERS'] },
  cooldowns: { global: '', user: '' },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'target',
      description: 'Who do want you to get banned?',
      type: 'USER',
      required: true
    },
    {
      name: 'reason',
      description: 'The target will see the reason in a DM.',
      type: 'STRING',
      required: true
    },
    /*{
      name: 'duration',
      description: 'How long want you to get the target banned, empty for permament',
      type: "NUMBER",
      required: false,
      disabled: true
    }*/
  ],

  run: async (_, __, interaction) => {
    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason');

    let errorMsg, noMsg;
    
    if(!target) errorMsg = `I cannot find that user.`;
    else if (target.id === interaction.member.id) errorMsg = `You can't ban yourself!`;
    else if (target.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1 && interaction.guild.ownerId != interaction.user.id)
      errorMsg = `You don't have the permission to do that!`;
    else if (!target.bannable) errorMsg = `I don't have the permission to do that!`;

    if (errorMsg) return interaction.editReply(errorMsg);

    let embed = new MessageEmbed()
      .setTitle('Banned')
      .setDescription(
        `You have been banned from \`${interaction.guild.name}\`.\n` +
        `Moderator: ${interaction.user.tag}\n` +
        `Reason: ${reason}`
      )
      .setColor(colors.RED);

    try { await target.send({ embeds: [embed] }) }
    catch { noMsg = true }

    try { await target.ban({ reason: reason }) }
    catch (err) {
      interaction.editReply("I couldn't ban the target");
      throw new Error("couldn't ban/kick target", err)
    }

    embed
      .setTitle('Ban')
      .setDescription(
        `${target.user.tag} has been successfully banned.\n` +
        `Reason: ${reason}\n` +
        `${noMsg ? `\nI couldn't DM the target.` : ''}`
      );

    interaction.editReply({ embeds: [embed] });
  }
})