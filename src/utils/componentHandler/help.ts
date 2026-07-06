import * as utils from './help_utils.ts';
import type { StringSelectMenuInteraction } from 'discord.js';

export default async function help<TYPE extends 'command' | 'category' | 'all'>(
  this: StringSelectMenuInteraction<undefined> & { customId: `help.${TYPE}` },
  lang: lang, type: TYPE
): Promise<Message> {
  lang.config.backupPaths[0] = 'commands.information.help';

  await this.deferUpdate();
  return utils[`${type}Query`].call(this, lang, this.values[0]!);
}