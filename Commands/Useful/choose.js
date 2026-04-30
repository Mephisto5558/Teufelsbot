const { Command, CommandType, OptionType } = require('@mephisto5558/command');

const LONG_CHOICE_LENGTH = 100;

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  dmPermission: true,
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