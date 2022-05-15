const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");
const embedConfig = require('../../Settings/embed.json');

let noMsg;
let errorMsg;
let embed;

module.exports = new Command({
  name: 'ban',
  aliases: [],
  description: `bans a member from the server`,
  permissions: { client: ['BAN_MEMBERS'], user: ['BAN_MEMBERS'] },
  cooldowns: { global: '', user: '' },
  category: "Moderation",
  slashCommand: true,
  prefixCommand: false,
  options: [{
      name: "member",
      description: `Who want you to get banned`,
      type: "USER",
      required: true
    },
    {
      name: "reason",
      description: `The user will see the reason in a dm`,
      type: "STRING",
      required: true
    },
    {
      name: "duration",
      description: `COMING SOON`, //How long want you to get this user banned, empty for permament`,
      type: "NUMBER",
      required: false,
      disabled: true
    }
  ],

  run: async(_, __, interaction) => {

    let user = interaction.options.getUser('member');
    user = await interaction.guild.members.fetch(user.id);
    const reason = interaction.options.getString('reason');
    const moderator = `${interaction.member.user.username}#${interaction.member.user.discriminator}`;

    if (user.id === interaction.member.id)
      errorMsg = `You can't ban yourself!`;
    else if (user.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1)
      errorMsg = `You don't have the permission to do that!`;
    else if (!user.bannable)
      errorMsg = `I don't have the permission to do that!`;

    if (errorMsg) return interaction.followUp(errorMsg);

    embed = new MessageEmbed()
      .setTitle('Banned')
      .setDescription(
        `You have been banned from \`${interaction.guild.name}\`.\n` +
        `Moderator: ${moderator}\n` +
        `Reason: ${reason}`
      )
      .setColor(embedConfig.RED);

    try {
      await user.send({ embeds: [embed] })
    } catch (err) { noMsg = true }

    try {
      await user.ban({ reason: reason }) 
    } catch (err) {
      console.error(err);
      return interaction.followUp("I couldn't ban the user")
    }

    let description = `${user.displayName} has been successfully banned.\nReason: ${reason}`
    if (noMsg) description = `${description}\nI Couldn't dm the user.`

    embed = new MessageEmbed()
      .setTitle('Ban')
      .setDescription(description)
      .setColor(embedConfig.RED);

    interaction.followUp({ embeds: [embed] })
  }
})