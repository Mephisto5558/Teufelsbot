import { constants } from 'node:http2';
import { AllContexts, Command, CommandType } from '@mephisto5558/command';
import { commonHeaders } from '#utils/constants';


const
  { HTTP_STATUS_NO_CONTENT } = constants,
  getUpdateFunc = (msg: Message): 'edit' | 'reply' => (msg.editable && msg.channel.lastMessageId == msg.id ? 'edit' : 'reply'),
  state = { restarting: false };


export default new Command({
  types: [CommandType.Prefix],
  contexts: AllContexts,
  beta: true,
  disabled: !process.env.pterodactylPanelURL || !process.env.pterodactylServerId || !process.env.pterodactylServerAPIKey,
  disabledReason: 'Missing pterodactylPanelURL, pterodactylServerId or pterodactylServerAPIKey in .env',

  async run(lang) {
    if (state.restarting) return this.reply(lang('alreadyRestarting', state.restarting));

    state.restarting = true;
    log(`Restarting bot, initiated by user '${this.user.tag}'...`);

    /* eslint-disable-next-line @typescript-eslint/no-this-alias -- This assignment is for mutability, not for context preservation. */
    let msg = this;

    msg = await msg[getUpdateFunc(msg)](lang('restarting', this.client.application.getEmoji('loading')));

    try {
      const res = await fetch(`${process.env.pterodactylPanelURL}/api/client/servers/${process.env.pterodactylServerId}/power`, {
        method: 'POST',
        headers: {
          // https://pterodactyl-api-docs.netvpx.com/docs/authentication#required-headers
          ...commonHeaders(this.client, true),
          Authorization: `Bearer ${process.env.pterodactylServerAPIKey}`
        },
        body: JSON.stringify({ signal: 'restart' })
      });

      // https://pterodactyl-api-docs.netvpx.com/docs/api/client/servers#success-response-204
      if (res.status != HTTP_STATUS_NO_CONTENT) throw new Error(await res.text());
    }
    catch (err) {
      state.restarting = false; /* eslint-disable-line require-atomic-updates -- Not an issue */

      log.error('Restarting Error: ', err);
      return msg.content == lang('restartingError') ? undefined : msg[getUpdateFunc(msg)](lang('restartingError'));
    }

    return msg[getUpdateFunc(msg)](lang('success'));
  }
});