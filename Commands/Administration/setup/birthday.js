/** @import {CommandType} from '@mephisto5558/command' */

const
  { hyperlink } = require('discord.js'),
  { CommandOption, OptionType } = require('@mephisto5558/command');

const { website = {}, disableWebserver } = require('#Utils').getConfig();


/** @type {CommandOption<[CommandType.Slash]>} */
module.exports = new CommandOption({
  name: 'birthday',
  type: OptionType.Subcommand,
  disabled: !!disableWebserver || !website.domain,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing domain url in config.json',

  async run(lang) {
    const { domain, port } = this.client.config.website;

    if (!domain) return this.customReply(lang('events.command.missingDomainConfig'));
    return this.customReply(lang('useDashboard', hyperlink(lang('link'), domain + (port ? `:${port}` : '') + `/guild/${this.guild.id}#birthday`)));
  }
});