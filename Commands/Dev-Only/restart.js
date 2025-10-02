const
  { HTTP_STATUS_NO_CONTENT } = require('node:http2').constants,
  fetch = require('node-fetch').default,

  getUpdateFunc = /** @param {Message} msg */ msg => (msg.editable && msg.channel.lastMessageId == msg.id ? 'edit' : 'reply');

let restarting = false;

/** @type {command<'prefix', false>} */
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,
  disabled: !process.env.restartServerURL || !process.env.restartServerAPIKey,
  disabledReason: 'Missing restartServerURL or restartServerAPIKey in .env',

  async run(lang) {
    if (restarting) return this.reply(lang('alreadyRestarting', restarting));

    restarting = true;
    log(`Restarting bot, initiated by user '${this.user.tag}'...`);

    /* eslint-disable-next-line @typescript-eslint/no-this-alias -- This assignment is for mutability, not for context preservation. */
    let msg = this;

    msg = await msg[getUpdateFunc(msg)](lang('restarting', this.client.application.getEmoji('loading')));

    try {
      const res = await fetch(process.env.restartServerURL, {
        method: 'POST',
        headers: {
          // https://pterodactyl-api-docs.netvpx.com/docs/authentication#required-headers
          Authorization: `Bearer ${process.env.restartServerAPIKey}`,
          'User-Agent': `Discord Bot ${this.client.application.name ?? ''} (${this.client.config.github.repo ?? ''})`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ signal: 'restart' })
      });

      // https://pterodactyl-api-docs.netvpx.com/docs/api/client/servers#success-response-204
      if (res.status != HTTP_STATUS_NO_CONTENT) throw new Error(res.text());
    }
    catch (err) {
      restarting = false; /* eslint-disable-line require-atomic-updates -- Not an issue */

      log.error('Restarting Error: ', err);
      return msg.content == lang('restartingError') ? undefined : msg[getUpdateFunc(msg)](lang('restartingError'));
    }

    return msg[getUpdateFunc(msg)](lang('success'));
  }
};