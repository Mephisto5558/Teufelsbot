import { AllContexts, Command, CommandType, OptionType } from '@mephisto5558/command';

const LONG_CHOICE_LENGTH = 100;

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  contexts: AllContexts,
  options: [{
    name: 'options',
    type: OptionType.String,
    required: true
  }],

  async run(lang) {
    const choice = (this.options?.getString('options') ?? this.content)
      .split(';').map(e => e.trim()).filter(Boolean)
      .random();

    if (!choice) return this.customReply(lang('noChoices'));
    return this.customReply(lang(choice.length > LONG_CHOICE_LENGTH ? 'choiceLong' : 'choice', choice));
  }
});