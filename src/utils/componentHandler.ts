import { Colors, EmbedBuilder, MessageFlags, inlineCode, type MessageComponentInteraction } from 'discord.js';
import commandPermissionCheck from './commandPermissionCheck.ts';
import * as handlers from './componentHandler/index.js';
import errorHandler from './errorHandler.ts';
import { msInSecond } from './timeFormatter.ts';

export default async function componentHandler(
  this: MessageComponentInteraction,
  lang: lang
): Promise<unknown> {
  lang.config.backupPaths[0] = 'events.command';

  const
    [feature, id, mode, data, ...args] = this.customId.split('.'),
    cooldown = this.client.cooldowns.update(`buttonPressEvent.${this.message.id}`, this, { user: msInSecond }),
    command = this.client.commandManager.get(feature) ?? { name: feature?.toLowerCase() };

  /* eslint-disable-next-line unicorn/no-null -- consistency with discord.js */
  this.commandName = command.name ?? null;

  let err = commandPermissionCheck.call(command, this, this.user);

  if (Array.isArray(err)) err = err[0];
  else if (cooldown) err = 'events.interaction.buttonOnCooldown';

  if (err) {
    const embed = new EmbedBuilder({ description: lang(err, inlineCode(Math.round(cooldown / msInSecond))), color: Colors.Red });
    return this.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  try { if (feature && feature in handlers) return await handlers[feature].call(this, lang, id, mode, data, args); }
  catch (err) { return errorHandler.call(this.client, err, this, lang); }
};