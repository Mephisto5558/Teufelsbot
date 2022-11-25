const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'trigger',
  permissions: { user: ['ManageMessages'] },
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

  run: function (lang) {
    const
      oldData = this.guild.db.triggers || [],
      query = this.options.getString('query')?.toLowerCase();

    let id = this.options.getNumber('id');

    switch (this.options.getSubcommand()) {
      case 'add': {
        const data = {
          id: parseInt(Object.values(oldData).sort((a, b) => b.id - a.id)[0]?.id) + 1 || 1,
          trigger: this.options.getString('trigger'),
          response: this.options.getString('response'),
          wildcard: this.options.getBoolean('wildcard') !== false
        };

        this.client.db.update('guildSettings', `${this.guild.id}.triggers`, [...oldData, data]);

        this.editReply(lang('saved', data.trigger));
        break;
      }

      case 'delete': {
        if (!id) id = Object.values(oldData).sort((a, b) => b.id - a.id)[0]?.id;

        const filtered = oldData.filter(e => e.id != id);
        if (filtered.length == oldData.length) return this.editReply(lang('idNotFound'));

        this.client.db.update('guildSettings', `${this.guild.id}.triggers`, filtered);

        this.editReply(lang('deletedOne', id));
        break;
      }

      case 'clear': {
        if (this.options.getString('confirmation').toLowerCase() != lang('confirmation')) return this.editReply(lang('needConfirm'));
        if (!oldData.length) return this.editReply(lang('noneFound'));

        this.client.db.update('guildSettings', `${this.guild.id}.triggers`, []);

        this.editReply(lang('deletedAll', oldData.length));
        break;
      }

      case 'get': {
        if (!oldData.length) return this.editReply(lang('noneFound'));

        const embed = new EmbedBuilder({
          title: lang('embedTitle'),
          color: Colors.Blue
        });

        if (id || id == 0 || query) {
          const data = oldData.filter(e => query ? e.trigger.toLowerCase().includes(query) : e.id == id);
          if (!data.trigger) return this.editReply(lang('notFound'));

          embed.data.fields = data.slice(0, 25).map(({ id, trigger, response, wildcard }) => ({
            name: lang('fieldName', id),
            value: lang('fieldValue', {
              trigger: trigger.length < 1900 ? trigger : trigger.substring(0, 197) + '...',
              response: response.length < 1900 ? response : response.substring(0, 197) + '...',
              wildcard: !!wildcard
            }),
            inline: false
          }));

          return this.editReply({ embeds: [embed] });
        }
        else {
          if (this.options.getBoolean('short')) {
            let description = '';
            for (const { id, trigger, response, wildcard } of oldData) {
              if (description.length >= 3800) break;

              description += lang('longEmbedDescription', {
                id, wildcard: !!wildcard,
                trigger: trigger.length < 20 ? trigger : trigger.substring(0, 17) + '...',
                response: response.length < 20 ? response : response.substring(0, 17) + '...'
              });
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

          this.editReply({ embeds: [embed] });
        }
      }
    }
  }
};
