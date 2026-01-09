const
  { HTTP_STATUS_NO_CONTENT } = require('node:http2').constants,
  { Command } = require('@mephisto5558/command'),
  fetch = require('node-fetch').default,
  { commonHeaders } = require('#Utils').constants,

  getUpdateFunc = /** @param {Message} msg */ msg => (msg.editable && msg.channel.lastMessageId == msg.id ? 'edit' : 'reply');

let restarting = false;


module.exports = new Command({
  types: ['prefix'],
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
          ...commonHeaders(this.client, true),
          Authorization: `Bearer ${process.env.restartServerAPIKey}`
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
});