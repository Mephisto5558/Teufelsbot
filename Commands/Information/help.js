const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");
const embed = require('../../Settings/embed.json')

module.exports = new Command({
  name: 'help',
  aliases: [],
  description: `Shows all bot commands`,
  userPermissions: [],
  category: "Information",
  slashCommand: true,
  options: [{
    name: "command",
    description: "Type a command here to search for it",
    type: "STRING",
    required: false
  }],
  
  run: async (client, message, interaction) => {
    if(interaction) args = interaction.options.get('command')
    else args = message.args[0];
    
    try {
      if(args) {
        const embed = new MessageEmbed();
        const cmd = client.commands.get(args.toLowerCase())
        if(!cmd) return interaction.followUp({ embeds: [embed.setColor(embed.embed_wrongcolor).setDescription(`No Information found for command **${args.toLowerCase()}**`)] });
        if(cmd.name) {
          embed.addField("**Command name**", `\`${cmd.name}\``);
          embed.setTitle(`Detailed Information about:\`${cmd.name}\``);
        }
        if(cmd.alias) embed.addField("Alias", `\`${cmd.alias}\``);
        if(cmd.description) embed.addField("**Description**", `\`${cmd.description}\``);
        if(cmd.usage) {
          embed.addField("**Usage**", `\`${prefix}${cmd.usage}\``);
          embed.setFooter("Syntax: <> = required, [] = optional");
        }
        
        return interaction.followUp({ embeds: [embed.setColor(embed.embed_color)] });
      }
      else {
        let homeEmbed = new MessageEmbed()
        .setColor(embed.embed_color)
        .setTitle(` 🔰All my commands`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))

        const commands = category => {
          return client.commands.filter((cmd) => cmd.category === category).map((cmd) => `\`${cmd.name}\``);
        }
        
        try {
          for (let i = 0; i < client.categories.length; i += 1) {
            const current = client.categories[i];
            const items = commands(current);
            homeEmbed.addField(`**${current.toUpperCase()} [${items.length}]**`, `> ${items.join(", ")}`);
          }
        }
        catch (err) {
          console.log(err);
        }
        if(interaction) {
          return interaction.followUp({ embeds: [homeEmbed], ephemeral: true });
        }
        message.reply({
          embeds: [homeEmbed],
          allowedMentions: { repliedUser: false }
        });
      }
    
    }
    catch (err) {
      console.log(err);
    }
    
  }
})