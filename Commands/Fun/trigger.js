const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js');

module.exports = new Command({
  name: 'trigger',
  aliases: { prefix: [], slash: [] },
  description: 'Manage custom responses to message triggers!',
  usage: '',
  permissions: { client: [], user: ['MANAGE_MESSAGES'] },
  cooldowns: { guild: 0, user: 0 },
  category: 'FUN',
  slashCommand: true,
  prefixCommand: false, beta: true,///////
  options: [
    {
      name: 'add',
      description: 'Add a new trigger',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'trigger',
          description: 'The text you want the bot to respond to',
          type: 'STRING',
          required: true
        },
        {
          name: 'response',
          description: 'The response the bot should send',
          type: 'STRING',
          required: true
        },
        {
          name: 'wildcard',
          description: 'Find the trigger anywhere in the message (default: true)',
          type: 'BOOLEAN',
          required: false
        }
      ]
    },
    {
      name: 'delete',
      description: 'Delete a trigger. This is irreversible!',
      type: 'SUB_COMMAND',
      options: [{
        name: 'id',
        description: 'The trigger id, can be found by using "/trigger get"',
        type: 'NUMBER',
        required: true
      }]
    },
    {
      name: 'clear',
      description: 'Delete all triggers. This is irreversible!',
      type: 'SUB_COMMAND',
      options: [{
        name: 'confirmation',
        description: 'Write "CLEAR ALL" for confirmation.',
        type: 'STRING',
        required: true
      }]
    },
    {
      name: 'get',
      description: 'Get one or all added triggers',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'id',
          description: 'The trigger id, can be found by using "/trigger get" (without the "id" arg)',
          type: 'NUMBER',
          required: false
        },
        {
          name: 'short',
          description: 'return as many triggers as possible',
          type: 'BOOLEAN',
          required: false
        }
      ]
    }
  ],

  run: async (client, _, interaction) => {
    const oldData = client.db.get('settings')[interaction.guild.id]?.triggers || [];
    const settings = client.db.get('settings');
    const id = interaction.options.getNumber('id');
    let newData;

    switch (interaction.options.getSubcommand()) {
      case 'add':
        const data = {
          id: Object.values(oldData).sort((a, b) => b.id - a.id)[0]?.id || 1,
          trigger: interaction.options.getString('trigger'),
          response: interaction.options.getString('response'),
          wildcard: !(interaction.options.getBoolean('wildcard') === false)
        };

        newData = Object.merge(settings, { [interaction.guild.id]: { triggers: [data] } }, 'push');
        await client.db.set('settings', newData);

        interaction.editReply(`Added new trigger for \`${data.trigger}\`.`);
        break;

      case 'delete':
        const filtered = oldData.filter(e => e.id != id);
        if (filtered.length == oldData.length) return interaction.editReply('There is no trigger with that ID!');

        newData = Object.merge(settings, { [interaction.guild.id]: { triggers: filtered } }, 'overwrite');
        await client.db.set('settings', newData);

        interaction.editReply(`I deleted the trigger with id \`${id}\`.`);
        break;

      case 'clear':
        if (interaction.options.getString('confirmation').toLowerCase() != 'clear all') return interaction.editReply('You need to confirm this action by writing `CLEAR ALL` as the confirm option!');
        if (!oldData.length) return interaction.editReply('There are no triggers I could clear!');

        newData = Object.merge(settings, { [interaction.guild.id]: { triggers: [] } }, 'overwrite');
        await client.db.set('settings', newData);

        interaction.editReply(`I deleted all (\`${oldData.length}\`) triggers.`);
        break;

      case 'get':
        if (id || id == 0) {
          const { trigger, response, wildcard } = oldData.find(e => e.id == id) || {};
          if (!trigger) return interaction.editReply('There is no trigger with that ID!');

          const embed = new MessageEmbed({
            title: `Trigger ${id}`,
            description:
              `**Trigger:** \n` +
              '```\n' + (trigger.length < 1900 ? trigger : trigger.substring(0, 197) + '...') + '\n```\n' +
              '**Response:** \n' +
              '```\n' + (response.length < 1900 ? response : response.substring(0, 197) + '...') + '\n```\n' +
              `**Wildcard:** \`${!!wildcard}\`\n`,
            color: 'BLUE'
          });

          interaction.editReply({ embeds: [embed] });
        }
        else {
          if (!oldData.length) return interaction.editReply('There are no triggers!');

          const embed = new MessageEmbed({
            title: 'Triggers',
            color: 'BLUE'
          });

          if (interaction.options.getBoolean('short')) {
            let description = '';
            for (const { id, trigger, response, wildcard } of oldData) {
              if (description.length >= 3800) break;

              description +=
                `> ID: ${id}\n` +
                `> Trigger: \`${trigger.length < 20 ? trigger : trigger.substring(0, 17) + '...'}\`\n` +
                `> Response: \`${response.length < 20 ? response : response.substring(0, 17) + '...'}\`\n` +
                `> Wildcard: \`${!!wildcard}\`\n`;
            }

            embed.description = description;
            return interaction.editReply({ embeds: [embed] });
          }

          const fields = [];

          for (const { id, trigger, response, wildcard } of oldData) {
            if (fields.length >= 25) break;

            fields.push({
              name: `ID: ${id}`,
              value:
                `**Trigger:** \n` +
                '```\n' + (trigger.length < 200 ? trigger : trigger.subsstring(0, 197) + '...') + '\n```\n' +
                '**Response:** \n' +
                '```\n' + (response.length < 200 ? response : response.subsstring(0, 197) + '...') + '\n```\n' +
                `**Wildcard:** \`${!!wildcard}\`\n`,
              inline: true
            });
          }

          embed.description = oldData.length > 25 ? 'The first 25 triggers. Get more with the `short` option' : ' ';
          embed.fields = fields;

          interaction.editReply({ embeds: [embed] });
        }
        break;

      default: throw new SyntaxError('Unexpected value');
    }
  }
})