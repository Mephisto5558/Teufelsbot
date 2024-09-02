const
  { EmbedBuilder, Colors } = require('discord.js'),

  /** @type {Record<string, (this: GuildInteraction, lang: lang, oldData: NonNullable<NonNullable<Database['guildSettings'][Snowflake]>['triggers']>, query: string) => Promise<Message>>}* */
  triggerMainFunctions = {
    add: async function (lang, oldData) {
      const
        id = Math.max(...Object.keys(oldData).map(Number), 0) || 0 + 1,
        data = {
          trigger: this.options.getString('trigger', true),
          response: this.options.getString('response', true).replaceAll('/n', '\n'),
          wildcard: !!this.options.getBoolean('wildcard')
        };

      await this.guild.updateDB(`triggers.${id}`, data);
      return this.editReply(lang('saved', data.trigger));
    },

    delete: async function (lang, oldData, query) {
      let id;
      if (query) id = query in oldData ? query : Object.entries(oldData).find(([tId, { trigger }]) => trigger.toLowerCase() == query.toLowerCase() || tId.toLowerCase() == query.toLowerCase())?.[0];
      else id = Math.max(...Object.keys(oldData).map(Number)); // Returns `-Infinity` on an empty array

      if (id < 0) return this.editReply(lang('noneFound'));

      await this.client.db.delete('guildSettings', `${this.guild.id}.triggers.${id}`);
      return this.editReply(lang('deletedOne', id));
    },

    clear: async function (lang, oldData) {
      if (this.options.getString('confirmation', true).toLowerCase() != lang('confirmation')) return this.editReply(lang('needConfirm'));
      if (!oldData.__count__) return this.editReply(lang('noneFound'));

      await this.client.db.delete('guildSettings', `${this.guild.id}.triggers`);
      return this.editReply(lang('deletedAll', oldData.__count__));
    },

    get: async function (lang, oldData, query) {
      if (!oldData.__count__) return this.editReply(lang('noneFound'));

      const embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Blue });

      if (query) {
        const { id, trigger, response, wildcard } = Object.values(oldData).find(e => e.id == query || e.trigger.toLowerCase() == query) ?? {};
        if (!trigger) return this.editReply(lang('notFound'));

        embed.data.title = lang('embedTitleOne', id);
        embed.data.description = lang('embedDescriptionOne', {
          trigger: trigger.length < 1900 ? trigger : trigger.slice(0, 1897) + '...',
          response: response.length < 1900 ? response : response.slice(0, 1897) + '...',
          wildcard: !!wildcard
        });
      }
      else if (this.options.getBoolean('short')) {
        embed.data.description = oldData.__count__ > 25 ? lang('first25') : ' ';
        embed.data.fields = Object.entries(oldData).slice(0, 25).map(([id, { trigger, response, wildcard }]) => ({
          name: lang('shortFieldName', id), inline: true,
          value: lang('shortFieldValue', {
            trigger: trigger.length < 200 ? trigger : trigger.slice(0, 197) + '...',
            response: response.length < 200 ? response : response.slice(0, 197) + '...',
            wildcard: !!wildcard
          })
        }));
      }
      else {
        embed.data.description = Object.entries(oldData).reduce((acc, [id, { trigger, response, wildcard }]) => acc.length >= 3800
          ? acc
          : acc + lang('longEmbedDescription', {
            id, wildcard: !!wildcard,
            trigger: trigger.length < 20 ? trigger : trigger.slice(0, 17) + '...',
            response: response.length < 20 ? response : response.slice(0, 17) + '...'
          }), '');
      }

      return this.editReply({ embeds: [embed] });
    }
  };

/**
 * @this {import('discord.js').AutocompleteInteraction}
 * @returns  {string[]}*/
function triggerQuery() {
  return Object.entries(this.guild.db.triggers ?? {}).reduce((acc, [k, v]) => {
    acc[0].push(v.trigger);
    acc[1].push(k);

    return acc;
  }, [[], []]).flat();
}

module.exports = new SlashCommand({
  permissions: { user: ['ManageMessages'] },
  options: [
    new CommandOption({
      name: 'add',
      type: 'Subcommand',
      options: [
        new CommandOption({
          name: 'trigger',
          type: 'String',
          required: true
        }),
        new CommandOption({
          name: 'response',
          type: 'String',
          required: true
        }),
        new CommandOption({ name: 'wildcard', type: 'Boolean' })
      ]
    }),
    new CommandOption({
      name: 'delete',
      type: 'Subcommand',
      options: [new CommandOption({
        name: 'query_or_id',
        type: 'String',
        autocompleteOptions: triggerQuery
      })]
    }),
    new CommandOption({
      name: 'clear',
      type: 'Subcommand',
      options: [new CommandOption({
        name: 'confirmation',
        type: 'String',
        required: true
      })]
    }),
    new CommandOption({
      name: 'get',
      type: 'Subcommand',
      options: [
        new CommandOption({
          name: 'query_or_id',
          type: 'String',
          autocompleteOptions: triggerQuery
        }),
        new CommandOption({ name: 'short', type: 'Boolean' })
      ]
    })
  ],

  run: function (lang) {
    const
      oldData = this.guild.db.triggers ?? [],
      query = this.options.getString('query_or_id')?.toLowerCase();

    return triggerMainFunctions[this.options.getSubcommand()].call(this, lang, oldData, query);
  }
});