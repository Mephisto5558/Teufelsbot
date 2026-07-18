import { Colors, EmbedBuilder } from 'discord.js';
import { CommandOption, CooldownType, OptionType, constants } from '@mephisto5558/command';

import type { CommandType } from '@mephisto5558/command';
import type { Locale } from '@mephisto5558/i18n';


export default CommandOption.create<readonly [CommandType.Slash]>()({
  name: 'language',
  type: OptionType.Subcommand,
  cooldowns: { [CooldownType.Guild]: '10s' },
  options: [{
    name: 'language',
    type: OptionType.String,
    required: true,
    autocompleteOptions(query) {
      return this.client.i18n.availableLocales.keys().reduce<{ name: string; value: Locale }[]>((acc, locale) => {
        if (acc.length > constants.autocompleteOptionsMaxAmt) return acc;

        const name = this.client.i18n.__({ locale, undefinedNotFound: true }, 'global.languageName') ?? locale;
        if (name.toLowerCase().includes(query.toLowerCase()) || locale.toLowerCase().includes(query.toLowerCase()))
          acc.push({ name, value: locale });

        return acc;
      }, []);
    },
    strictAutocomplete: true
  }],

  async run(lang) {
    const
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- enforced by autocompleteOptions */
      language = this.options.getString('language', true) as Locale,

      setLang = this.client.i18n.getTranslator({
        locale: this.client.i18n.availableLocales.has(language) ? language : lang.defaultConfig.defaultLocale
      }),

      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the currently executing command can never not be found */
      { name, category } = this.client.commandManager.get(this.commandName)!,
      embed = new EmbedBuilder({
        title: setLang(`commands.${category.toLowerCase()}.${name}.language.embedTitle`),
        description: setLang(`commands.${category.toLowerCase()}.${name}.language.embedDescription`, setLang('global.languageName')),
        color: Colors.Green
      });

    await this.guild.updateDB('config.lang', language);
    return this.editReply({ embeds: [embed] });
  }
});