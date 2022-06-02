const 
  { Command } = require("reconlx"),
  { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = new Command({
  name: 'avatar',
  alias: [],
  description: 'shows the user avatar',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'FUN',
  slashCommand: true,
  prefixCommand: false,
  disabled: false,
  options: [
    {
      name: 'target',
      description: 'the user you want to get the avatar of',
      type: 'USER',
      required: false
    },
    {
      name: 'size',
      description: 'The size of the picture',
      type: 'NUMBER',
      required: false,
      choices: [
        { name: 16,   value: 16   }, { name: 32,   value: 32   },
        { name: 56,   value: 56   }, { name: 64,   value: 64   },
        { name: 96,   value: 96   }, { name: 128,  value: 128  },
        { name: 256,  value: 256  }, { name: 300,  value: 300  },
        { name: 512,  value: 512  }, { name: 600,  value: 600  },
        { name: 1024, value: 1024 }, { name: 2048, value: 2048 }
      ]
    }
  ],

  run: async(client, _, interaction) => {

    let target = interaction.options?.getMember('target');
    if(!target) target = await interaction.member.fetch();
    
    let size = interaction.options?.getNumber('size');
    if(!size) size = 2048
      
    target.avatarURL = await target.displayAvatarURL({
      size: size, format: 'png', dynamic: true
    });
    
    let embed = new MessageEmbed()
      .setDescription(`Avatar of ${target.user.username}`)
      .setColor('FFFFFF')
      .setImage(target.avatarURL);
    
    let row = new MessageActionRow().addComponents(
      new MessageButton()
				.setLabel('Download picture')
        .setURL(target.avatarURL)
				.setStyle('LINK')
    );
    
    interaction.followUp({ embeds: [embed], components: [row] });
    
  }
})