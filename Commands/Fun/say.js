const { Command } = require("reconlx");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = new Command({
  name: 'say',
  aliases: [],
  description: 'Let me say something',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  disabled: false,
  options: [{
      name: 'msg',
      description: `Type your message here, /n for new line`,
      type: 'STRING',
      required: true
    },
    {
      name: 'guild',
      descripton: 'The guild the message get sent to',
      type: 'STRING',
      required: 'false'
    },
    {
      name: 'channel',
      description: 'The channel the message gets sent to. Let this empty if you choosed guild.',
      type: 'CHANNEL',
      channel_type: 'GUILD_TEXT',
      required: false
    }
  ],

  run: async(client, _, interaction) => {
    
    let guild = interaction.options.getString('guild');
    let channel = interaction.options.getChannel('channel')
    let msg = interaction.options.getString('msg');

    if (!channel) channel = interaction.channel

    if(guild) {
      let rows = [];
      let row = new MessageActionRow();
      let description = '**Please press the button corresponding to the wanted guild number.**';
      let interaction0;

      let guilds = client.guilds.fetch()
        .filter((guild => guild.name == guild || guild.id == guild) && guild.member(interaction.member.id));
      
      if(!guilds) return interaction.followUp(
        "I couldn't find the guild you are looking for.\n" +
        'We both need to be in it in order to send messages.'
      );

      guilds.forEach(guild => {
        if(i >= 25 || description.length >= 2048) return;

        description = `${description}\n${i++} ${guild.name}`

        if(row.components.length == 5) {
          rows[c++] = row
          row = new MessageActionRow();
        };
        row.addComponents(new MessageButton()
				  .setCustomId(i.toString())
				  .setLabel(i.toString())
				  .setStyle('PRIMARY')
        )
      });

      let embed = new MessageEmbed()
        .setTitle('Guilds found:')
        .setDescription(description);


      await interaction.followUp({ embeds: [embed], components: [rows] })
        .then(msg => interaction0 = msg);
    }
  }
})
      






      
    }

    if (!channel.permissionsFor(interaction.member).has('SEND_MESSAGES')) {
      return interaction.followUp({ content: `You dont't have permission to send messages in <#${channel.id}>!`, ephemeral: true });
    };
    if (!interaction.guild.me.permissionsIn(channel).has('SEND_MESSAGES')) {
      return interaction.followUp({ content: `I dont't have permission to send messages in <#${channel.id}>!`, ephemeral: true });
    };

    channel.send(msg)
      .then(interaction.followUp({ content: 'Message sent!', ephemeral: true }));

  }
})