const LONG_CHOICE_LENGTH = 100;

/** @type {command<'both', false>} */
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'options',
    type: 'String',
    required: true
  }],

  async run(lang) {
    const choice = (this.options?.getString('options') ?? this.content).split(';').map(e => e.trim()).filter(Boolean)
      .random();

    return this.customReply(lang(choice.length > LONG_CHOICE_LENGTH ? 'choiceLong' : 'choice', choice));
  }
};