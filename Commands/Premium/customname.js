const { getTarget } = require('../../Utils');

/**@type {command}*/
module.exports = {
  name: 'customname',
  aliases: { prefix: ['custom-name'] },
  cooldowns: { user: 30000 },
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

  run: function (lang) {
    let target = getTarget.call(this);
    if (this.options?.getBoolean('global') && target.user) target = target.user; //target.user check for execution in dms

    switch (this.options?.getSubcommand() || this.args[0]) {
      case 'clear': {
        if (target.customName) {
          if (this.options?.getBoolean('global')) target.user.customName = null;
          else target.customName = null;
        }

        return this.customReply(lang('clear.success'));
      }
      case 'get':
      case undefined: return this.customReply(lang(target.id == this.user.id ? 'get.successYou' : 'get.successOther', target.customName));
      default: {
        const newName = this.options?.getString('name') || (this.args[0] == 'set' ? this.args.slice(1) : this.args).join(' ').slice(0, 32) || null;
        target.customName = newName;

        return this.customReply(newName ? lang('set.success', newName) : lang('clear.success'));
      }
    }
  }
};