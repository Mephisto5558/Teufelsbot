const { getTarget } = require('../../Utils');

module.exports = {
  name: 'motherweight',
  aliases: { prefix: ['mutterwaage'] },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{ name: 'target', type: 'User' }],

  /**@this Interaction|Message @param {lang}lang*/
  run: function (lang) {
    const
      target = getTarget(),
      weight = Math.round(Math.random() * 1000);

    return this.customReply(lang(`responses${target ? 'Others' : 'Self'}.${Math.ceil(weight / 100)}`, { user: target?.displayName }) + lang('weight', weight));
  }
};