const { getTargetMember, constants: { memberNameMaxLength } } = require('#Utils');

/** @type {command<'both', false>}*/
module.exports = {
  aliases: { prefix: ['custom-name'] },
  /* eslint-disable-next-line custom/sonar-no-magic-numbers */
  cooldowns: { user: 3e4 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  premium: true,
  options: [
    {
      name: 'set',
      type: 'Subcommand',
      options: [
        {
          name: 'name',
          type: 'String',
          minLength: 2,
          maxLength: 32,
          required: true
        },
        { name: 'global', type: 'Boolean' }
      ]
    },
    {
      name: 'get',
      type: 'Subcommand',
      options: [
        { name: 'target', type: 'User' },
        { name: 'global', type: 'Boolean' }
      ]
    },
    {
      name: 'clear',
      type: 'Subcommand',
      options: [{ name: 'global', type: 'Boolean' }]
    }
  ],

  async run(lang) {
    let target = getTargetMember(this, { returnSelf: true });
    if (this.options?.getBoolean('global') && 'user' in target) target = target.user; // target.user check for execution in dms

    switch (this.options?.getSubcommand() ?? this.args[0]) {
      case 'clear':
        if (target.customName) {
          if (this.options?.getBoolean('global')) target.user.customName = undefined;
          else target.customName = undefined;
        }

        return this.customReply(lang('clear.success'));


      case 'set': {
        const newName = this.options?.getString('name', true) ?? (this.args[0] == 'set' ? this.args.slice(1) : this.args).join(' ').slice(0, memberNameMaxLength + 1);
        target.customName = newName;

        return this.customReply(newName ? lang('set.success', newName) : lang('clear.success'));
      }

      default: return this.customReply(lang(target.id == this.user.id ? 'get.successYou' : 'get.successOther', target.customName));
    }
  }
};