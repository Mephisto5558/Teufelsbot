/** this.customId: `reddit.<subreddit>.<type>.<filterNSFW>`
 * @this {import('discord.js').ButtonInteraction} @param {string}subreddit @param {string}type @param {'true'|'false'}filterNSFW*/
module.exports = function reddit(lang, subreddit, type, filterNSFW) {
  lang.__boundArgs__[0].backupPath = 'commands.fun.reddit';

  this.options = {
    getBoolean: () => filterNSFW == 'true',
    getString: (str) => str == 'type' ? type : subreddit
  };

  this.update({ components: [] });

  this.client.slashCommands.get('reddit').run.call(this, lang);
};