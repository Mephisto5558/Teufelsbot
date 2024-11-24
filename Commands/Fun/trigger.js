/**
 * @typedef {NonNullable<NonNullable<Database['guildSettings'][Snowflake]>['triggers']>}triggers
 * @typedef {[keyof triggers, NonNullable<triggers[keyof triggers]>]}triggersArray*//* eslint-disable-line jsdoc/valid-types -- false positive*/

const
  { EmbedBuilder, Colors } = require('discord.js'),
  { embedMaxFieldAmt, suffix } = require('#Utils').constants,

  /** @type {Record<string, (this: GuildInteraction, lang: lang, oldData: triggers, query: string) => Promise<Message>>}*/
  triggerMainFunctions = {
    async add(lang, oldData) {
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

    async delete(lang, oldData, query) {
      let id;
      if (query) {
        id = query in oldData
          ? query
          : Object.entries(oldData).find((/** @type {triggersArray}*/[tId, { trigger }]) => trigger.toLowerCase() == query.toLowerCase() || tId.toLowerCase() == query.toLowerCase())?.[0];
      }
      else id = Math.max(...Object.keys(oldData).map(Number)); // Returns `-Infinity` on an empty array

      if (id < 0) return this.editReply(lang('noneFound'));

      await this.client.db.delete('guildSettings', `${this.guild.id}.triggers.${id}`);
      return this.editReply(lang('deletedOne', id));
    },

    async clear(lang, oldData) {
      if (this.options.getString('confirmation', true).toLowerCase() != lang('confirmation')) return this.editReply(lang('needConfirm'));
      if (!oldData.__count__) return this.editReply(lang('noneFound'));

      await this.client.db.delete('guildSettings', `${this.guild.id}.triggers`);
      return this.editReply(lang('deletedAll', oldData.__count__));
    },

    async get(lang, oldData, query) {
      if (!oldData.__count__) return this.editReply(lang('noneFound'));

      const embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Blue });

      if (query) {
        /** @type {triggersArray}*/
        const [id, { trigger, response, wildcard }] = Object.entries(oldData).find(([k, v]) => k == query || v.trigger.toLowerCase() == query) ?? {};
        if (!trigger) return this.editReply(lang('notFound'));

        const maxLength = 1900;
        embed.data.title = lang('embedTitleOne', id);
        embed.data.description = lang('embedDescriptionOne', {
          trigger: trigger.length < maxLength ? trigger : trigger.slice(0, maxLength - suffix.length) + suffix,
          response: response.length < maxLength ? response : response.slice(0, maxLength - suffix.length) + suffix,
          wildcard: !!wildcard
        });
      }
      else if (this.options.getBoolean('short')) {
        const maxLength = 200;

        embed.data.description = oldData.__count__ > embedMaxFieldAmt ? lang('first25') : ' ';
        embed.data.fields = Object.entries(oldData).slice(0, embedMaxFieldAmt + 1).map((/** @type {triggersArray}*/[id, { trigger, response, wildcard }]) => ({
          name: lang('shortFieldName', id), inline: true,
          value: lang('shortFieldValue', {
            trigger: trigger.length < maxLength ? trigger : trigger.slice(0, maxLength - suffix.length) + suffix,
            response: response.length < maxLength ? response : response.slice(0, maxLength - suffix.length) + suffix,
            wildcard: !!wildcard
          })
        }));
      }
      else {
        const
          maxDescriptionLength = 3800,
          maxLength = 20;

        embed.data.description = Object.entries(oldData).reduce((acc, /** @type {triggersArray}*/[id, { trigger, response, wildcard }]) => acc.length >= maxDescriptionLength
          ? acc
          : acc + lang('longEmbedDescription', {
            id, wildcard: !!wildcard,
            trigger: trigger.length < maxLength ? trigger : trigger.slice(0, maxLength - suffix.length) + suffix,
            response: response.length < maxLength ? response : response.slice(0, maxLength - suffix.length) + suffix
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

/** @type {command<'slash'>}*/
module.exports = {
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
      options: [{
        name: 'query_or_id',
        type: 'String',
        autocompleteOptions: triggerQuery
      }]
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
        {
          name: 'query_or_id',
          type: 'String',
          autocompleteOptions: triggerQuery
        },
        { name: 'short', type: 'Boolean' }
      ]
    }
  ],

  run(lang) {
    const
      oldData = this.guild.db.triggers ?? [],
      query = this.options.getString('query_or_id')?.toLowerCase();

    return triggerMainFunctions[this.options.getSubcommand()].call(this, lang, oldData, query);
  }
};