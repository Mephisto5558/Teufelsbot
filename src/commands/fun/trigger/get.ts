import { Colors, EmbedBuilder, bold, codeBlock, inlineCode } from 'discord.js';
import { OptionType } from '@mephisto5558/command';
import { findTriggerId, triggerQuery, triggerSubcommand } from './index.ts';
import { embedFieldMaxAmt, suffix } from '#utils/constants';

import type { triggersArray } from './index.ts';


export default triggerSubcommand({
  name: 'get',
  type: OptionType.Subcommand,
  options: [
    {
      name: 'query_or_id',
      type: OptionType.String,
      autocompleteOptions: triggerQuery
    },
    { name: 'short', type: OptionType.Boolean }
  ],

  async run(lang, { oldData, query }) {
    if (!oldData.__count__) return this.editReply(lang('noneFound'));

    const embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Blue });

    if (query) {
      const
        id = findTriggerId(query, oldData),
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- false positive */
        { trigger, response, wildcard } = (id ? oldData[id] : {}) as triggersArray[1] | Record<keyof triggersArray[1], undefined>;

      if (!trigger) return this.editReply(lang('notFound'));

      const maxLength = 1900;
      embed.data.title = bold(lang('embedTitleOne', id));
      embed.data.description = lang('embedDescriptionOne', {
        trigger: codeBlock(trigger.length < maxLength ? trigger : trigger.slice(0, maxLength - suffix.length) + suffix),
        response: codeBlock(response.length < maxLength ? response : response.slice(0, maxLength - suffix.length) + suffix),
        wildcard: inlineCode(String(wildcard))
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
            wildcard: inlineCode(String(wildcard))
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
            id, wildcard: inlineCode(String(wildcard)),
            trigger: inlineCode(trigger.length < maxLength ? trigger : trigger.slice(0, maxLength - suffix.length) + suffix),
            response: inlineCode(response.length < maxLength ? response : response.slice(0, maxLength - suffix.length) + suffix)
          }) + '\n\n',
        '');
    }

    return this.editReply({ embeds: [embed] });
  }
});