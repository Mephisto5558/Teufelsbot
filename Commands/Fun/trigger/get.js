/** @import TriggerSubcommand from '.' */

const
  { Colors, EmbedBuilder, bold, codeBlock, inlineCode } = require('discord.js'),
  { CommandOption } = require('@mephisto5558/command'),
  { embedFieldMaxAmt, suffix } = require('#Utils').constants,
  { findTriggerId, triggerQuery } = require('./_utils');


/** @type {TriggerSubcommand} */
module.exports = new CommandOption({
  name: 'get',
  type: 'Subcommand',
  options: [
    {
      name: 'query_or_id',
      type: 'String',
      autocompleteOptions: triggerQuery
    },
    { name: 'short', type: 'Boolean' }
  ],

  async run(lang, { oldData, query }) {
    if (!oldData.__count__) return this.editReply(lang('noneFound'));

    const embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Blue });

    if (query) {
      const
        /** @type {NonNullable<ReturnType<findTriggerId>>} */ id = findTriggerId(query, oldData),
        { trigger, response, wildcard } = oldData[id] ?? {};

      if (!trigger) return this.editReply(lang('notFound'));

      const maxLength = 1900;
      embed.data.title = bold(lang('embedTitleOne', id));
      embed.data.description = lang('embedDescriptionOne', {
        trigger: codeBlock(trigger.length < maxLength ? trigger : trigger.slice(0, maxLength - suffix.length) + suffix),
        response: codeBlock(response.length < maxLength ? response : response.slice(0, maxLength - suffix.length) + suffix),
        wildcard: inlineCode(wildcard)
      });
    }
    else if (this.options.getBoolean('short')) {
      const maxLength = 200;

      embed.data.description = oldData.__count__ > embedFieldMaxAmt ? lang('first25') : ' ';
      embed.data.fields = Object.entries(oldData)
        .slice(0, embedFieldMaxAmt)
        .map(([id, { trigger, response, wildcard }]) => ({
          name: lang('shortFieldName', id), inline: true,
          value: lang('shortFieldValue', {
            trigger: codeBlock(trigger.length < maxLength ? trigger : trigger.slice(0, maxLength - suffix.length) + suffix),
            response: codeBlock(response.length < maxLength ? response : response.slice(0, maxLength - suffix.length) + suffix),
            wildcard: inlineCode(wildcard)
          })
        }));
    }
    else {
      const
        maxDescriptionLength = 3800,
        maxLength = 20;

      embed.data.description = Object.entries(oldData)
        .reduce((acc, [id, { trigger, response, wildcard }]) => acc.length >= maxDescriptionLength
          ? acc
          : acc + lang('longEmbedDescription', {
            id, wildcard: inlineCode(wildcard),
            trigger: inlineCode(trigger.length < maxLength ? trigger : trigger.slice(0, maxLength - suffix.length) + suffix),
            response: inlineCode(response.length < maxLength ? response : response.slice(0, maxLength - suffix.length) + suffix)
          }) + '\n\n',
        '');
    }

    return this.editReply({ embeds: [embed] });
  }
});