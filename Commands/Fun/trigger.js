const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'trigger',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: ['ManageMessages'] },
  cooldowns: { guild: 0, user: 0 },
  category: 'FUN',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'add',
      type: 'Subcommand',
      options: [
        {
          name: 'trigger',
          type: 'String',
          required: true
        },
        {
          name: 'response',
          type: 'String',
          required: true
        },
        { name: 'wildcard', type: 'Boolean' }
      ]
    },
    {
      name: 'delete',
      type: 'Subcommand',
      options: [{ name: 'id', type: 'Number' }]
    },
    {
      name: 'clear',
      type: 'Subcommand',
      options: [{
        name: 'confirmation',
        type: 'String',
        required: true
      }]
    },
    {
      name: 'get',
      type: 'Subcommand',
      options: [
        { name: 'query', type: 'String' },
        { name: 'id', type: 'Number' },
        { name: 'short', type: 'Boolean' }
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
        if (interaction.options.getString('confirmation').toLowerCase() != lang('confirmation')) return interaction.editReply(lang('needConfirm'));
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
