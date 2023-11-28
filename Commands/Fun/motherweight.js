const { getTarget } = require('../../Utils');

/**@type {command}*/
module.exports = {
  name: 'motherweight',
  aliases: { prefix: ['mutterwaage'] },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{ name: 'target', type: 'User' }],

  run: function (lang) {
    const
      target = getTarget.call(this),
      weight = Math.round(Math.random() * 1000);

    return this.customReply(lang(`responses${target ? 'Others' : 'Self'}.${Math.ceil(weight / 100)}`, { user: target?.displayName }) + lang('weight', weight));
  }
};