/* eslint-disable unicorn/no-null -- Mimicing discord.js behavior */
/* eslint-disable @eslint-community/eslint-comments/no-use -- overwriting that one */
/* eslint no-underscore-dangle: [warn, {allow: [_patch]}] -- overwriting that one */

import { Constants, Message, userMention } from 'discord.js';

/* eslint-disable-next-line custom/unbound-method -- safely used here */// @ts-expect-error -- this is available
const originalPatch = Message.prototype._patch;

/** Modified from the default one to set additional properties and modify the message content. */
export default function _patch(this: Message, data: Parameters<Message['_patch']>[0], ...rest: OmitFirstParameters<Message['_patch']>): void {
  if (!Constants.NonSystemMessageTypes.includes(data.type)) return originalPatch.call(this, data, ...rest);

  let isCommand = false;
  if ('content' in data) {
    this.originalContent = data.content;

    const
      clientUserMention = userMention(this.client.user.id),
      prefixLength = (
        data.content.startsWith(clientUserMention)
          ? clientUserMention
          : (this.guild?.prefixes ?? this.client.prefixes)
              .find(({ prefix, caseinsensitive }) => (caseinsensitive ? data.content.toLowerCase() : data.content)
                .startsWith(caseinsensitive ? prefix.toLowerCase() : prefix))?.prefix
      )?.length ?? 0;

    this.args = data.content.slice(prefixLength).trim().split(/\s+/);

    /* eslint-disable-next-line unicorn/no-array-front-mutation -- cleanest solution */
    this.commandName = prefixLength ? this.args.shift().toLowerCase() : null;

    if (prefixLength) isCommand = true;
  }
  else {
    this.originalContent ??= null;
    this.args = [];
    this.commandName ??= null;
  }

  originalPatch.call(this, data, ...rest);

  if (isCommand) this.content = this.args.join(' ');
}