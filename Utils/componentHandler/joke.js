const commandExecutionWrapper = require('../commandExecutionWrapper.js');

/** this.customId: `joke.<api>.<type>.<blacklist>.<maxLength>`
 * @this {import('discord.js').ButtonInteraction}
 * @param {lang}lang
 * @param {string}api
 * @param {string}type
 * @param {string}blacklist
 * @param {string}maxLength*/
module.exports = function joke(lang, api, type, blacklist, maxLength) {
  lang.__boundArgs__[0].backupPath = 'commands.fun.joke';

  this.options = {
    /** @param {string}str*/
    getString: str => {
      switch (str) {
        case 'api': return api == 'null' ? null : api;
        case 'type': return type == 'null' ? null : type;
        case 'blacklist': return blacklist == 'null' ? null : blacklist;
        default: return null;
      }
    },
    getInteger: () => maxLength == 'null' ? null : maxLength
  };

  this.update({ components: [] });

  return commandExecutionWrapper.call(this, this.client.slashCommands.get('joke'), 'component', lang);
};