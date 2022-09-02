const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'trigger',
  aliases: { prefix: [], slash: [] },
  description: 'Manage custom responses to message triggers!',
  usage: '',
  permissions: { client: [], user: ['ManageMessages'] },
  cooldowns: { guild: 0, user: 0 },
  category: 'FUN',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'add',
      description: 'Add a new trigger',
      type: 'Subcommand',
      options: [
        {
          name: 'trigger',
          description: 'The text you want the bot to respond to',
          type: 'String',
          required: true
        },
        {
          name: 'response',
          description: 'The response the bot should send',
          type: 'String',
          required: true
        },
        {
          name: 'wildcard',
          description: 'Find the trigger anywhere in the message (default: true)',
          type: 'Boolean',
          required: false
        }
      ]
    },
    {
      name: 'delete',
      description: 'Delete a trigger. This is irreversible!',
      type: 'Subcommand',
      options: [{
        name: 'id',
        description: 'The trigger id, can be found by using "/trigger get". Leave this empty to delete the last one',
        type: 'Number',
        required: false
      }]
    },
    {
      name: 'clear',
      description: 'Delete all triggers. This is irreversible!',
      type: 'Subcommand',
      options: [{
        name: 'confirmation',
        description: 'Write "CLEAR ALL" for confirmation.',
        type: 'String',
        required: true
      }]
    },
    {
      name: 'get',
      description: 'Get one or all added triggers',
      type: 'Subcommand',
      options: [
        {
          name: 'query',
          description: 'Search for a trigger by its trigger content',
          type: 'String',
          required: false
        },
        {
          name: 'id',
          description: 'The trigger id, can be found by using "/trigger get" (without the "id" arg)',
          type: 'Number',
          required: false
        },
        {
          name: 'short',
          description: 'return as many triggers as possible',
          type: 'Boolean',
          required: false
        }
      ]
    }
  ],

  run: async (interaction, lang, { db }) => {
    const
      settings = db.get('guildSettings'),
      oldData = settings[interaction.guild.id]?.triggers || [],
      query = interaction.options.getString('query')?.toLowerCase();

    let id = interaction.options.getNumber('id'), newData;

    switch (interaction.options.getSubcommand()) {
      case 'add': {
        const data = {
          id: parseInt(Object.values(oldData).sort((a, b) => b.id - a.id)[0]?.id) + 1 || 1,
          trigger: interaction.options.getString('trigger'),
          response: interaction.options.getString('response'),
          wildcard: interaction.options.getBoolean('wildcard') !== false
        };

        newData = settings.fMerge({ [interaction.guild.id]: { triggers: [data] } }, 'push');
        db.set('guildSettings', newData);

        interaction.editReply(lang('saved', data.trigger));
        break;
      }

      case 'delete': {
        if (!id) id = Object.values(oldData).sort((a, b) => b.id - a.id)[0]?.id;

        const filtered = oldData.filter(e => e.id != id);
        if (filtered.length == oldData.length) return interaction.editReply(lang('idNotFound'));

        newData = settings.fMerge({ [interaction.guild.id]: { triggers: filtered } }, 'overwrite');
        db.set('guildSettings', newData);

        interaction.editReply(lang('deletedOne', id));
        break;
      }

      case 'clear': {
        if (interaction.options.getString('confirmation').toLowerCase() != 'clear all') return interaction.editReply(lang('needConfirm'));
        if (!oldData.length) return interaction.editReply(lang('noneFound'));

        newData = settings.fMerge({ [interaction.guild.id]: { triggers: [] } }, 'overwrite');
        db.set('guildSettings', newData);

        interaction.editReply(lang('deletedAll', oldData.length));
        break;
      }

      case 'get': {
        if (!oldData.length) return interaction.editReply(lang('noneFound'));

        const embed = new EmbedBuilder({
          title: lang('embedTitle'),
          color: Colors.Blue
        });

        if (id || id == 0 || query) {
          const data = oldData.filter(e => query ? e.trigger.toLowerCase().includes(query) : e.id == id);
          if (!data.trigger) return interaction.editReply(lang('notFound'));

          embed.data.fields = data.slice(0, 25).map(({ id, trigger, response, wildcard }) => ({
            name: lang('fieldName', id),
            value: lang('fieldValue', {
              trigger: trigger.length < 1900 ? trigger : trigger.substring(0, 197) + '...',
              response: response.length < 1900 ? response : response.substring(0, 197) + '...',
              wildcard: !!wildcard
            }),
            inline: false
          }));

          return interaction.editReply({ embeds: [embed] });
        }
        else {
          if (interaction.options.getBoolean('short')) {
            let description = '';
            for (const { id, trigger, response, wildcard } of oldData) {
              if (description.length >= 3800) break;

              description += lang('longEmbedDescription', {
                id, wildcard: !!wildcard,
                trigger: trigger.length < 20 ? trigger : trigger.substring(0, 17) + '...',
                response: response.length < 20 ? response : response.substring(0, 17) + '...'
              })
            }

            embed.data.description = description;
          }
          else {
            embed.data.description = oldData.length > 25 ? lang('first25') : ' ';
            embed.data.fields = oldData.slice(0, 25).map(({ id, trigger, response, wildcard }) => ({
              name: lang('shortFieldName', id),
              value: lang('shortFieldValue', {
                trigger: trigger.length < 200 ? trigger : trigger.subsstring(0, 197) + '...',
                response: response.length < 200 ? response : response.subsstring(0, 197) + '...',
                wildcard: !!wildcard
              }),
              inline: true
            }));
          }

          interaction.editReply({ embeds: [embed] });
        }
      }
    }
  }
}
