const
  { EmbedBuilder, Colors, codeBlock, inlineCode, bold } = require('discord.js'),
  { embedFieldMaxAmt, suffix } = require('#Utils').constants,
  { triggerQuery, findTriggerId } = require('./_utils');

/** @type {import('.').default} */
module.exports = {
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
      /** @type {import('.').triggersArray} */
      const [id, { trigger, response, wildcard }] = oldData[findTriggerId(query, oldData)] ?? {};
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
        .slice(0, embedFieldMaxAmt + 1)
        .map((/** @type {import('.').triggersArray} */ [id, { trigger, response, wildcard }]) => ({
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
        .reduce((acc, /** @type {import('.').triggersArray} */ [id, { trigger, response, wildcard }]) => acc.length >= maxDescriptionLength
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
};