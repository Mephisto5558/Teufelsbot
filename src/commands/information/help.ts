import { AllContexts, Command, CommandType, OptionType } from '@mephisto5558/command';
import {
  help_allQuery: allQuery, help_categoryQuery: categoryQuery, help_commandQuery: commandQuery,
  help_getCommandCategories: getCommandCategories, help_getCommands: getCommands
} from '#utils/componentHandler';

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  usage: { examples: 'fun joke\n{prefix}{cmdName} fun' },
  contexts: AllContexts,
  ephemeralDefer: true,
  beta: true,
  options: [
    {
      name: 'category',
      type: OptionType.String,
      autocompleteOptions() {
        return getCommandCategories.call(this).map(e => ({
          name: this.client.i18n.__({ locale: 'locale' in this ? this.locale : this.user.localeCode }, `commands.${e}.categoryName`), value: e
        }));
      },
      strictAutocomplete: true
    },
    {
      name: 'command',
      type: OptionType.String,
      autocompleteOptions() { return getCommands.call(this).map(e => e.name); },
      strictAutocomplete: true
    }
  ],

  async run(lang, { command }) {
    const
      categoryName = (this.options?.getString('category') ?? this.args?.at(command.options.findIndex(e => e.name == 'category')))?.toLowerCase(),
      commandName = (this.options?.getString('command') ?? this.args?.at(command.options.findIndex(e => e.name == 'command')))?.toLowerCase();

    if (commandName) return commandQuery.call(this, lang, commandName);
    if (categoryName) return categoryQuery.call(this, lang, categoryName);
    return allQuery.call(this, lang);
  }
});