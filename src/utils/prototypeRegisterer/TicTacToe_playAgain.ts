/* eslint-disable @eslint-community/eslint-comments/no-use -- this trick needs to be used here */
/* eslint no-underscore-dangle: [warn, {allow: [_hoistedOptions]}] -- this trick needs to be used here */


import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, userMention } from 'discord.js';
import sleep from '../sleep.ts';
import { minToMs, secToMs } from '../toMs.ts';
import type { ActionRow, ButtonComponent, ButtonInteraction, CommandInteractionOption } from 'discord.js';
import type TicTacToe from 'discord-tictactoe';

const BUTTON_TIME = minToMs(15); /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 15s */

/** Sends the challenge mention after waiting 10s, then waits 5s and deletes its afterwards. */
export async function sendChallengeMention(msg: Interaction, userId: Snowflake, lang: lang): Promise<void> {
  await sleep(secToMs(10));

  const reply = await msg.fetchReply().catch(() => { /* empty */ }) as Message & { components: ActionRow<ButtonComponent>[] } | undefined;

  // challenge has been accepted - the accept button does not exist
  if (reply?.components[0]?.components[0]?.customId != 'yes') return;

  const mentionMsg = await reply.reply(lang('newChallenge', userMention(userId)));

  await sleep(secToMs(5)); /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 5s */
  void mentionMsg.delete().catch(() => { /* empty */ });
}

export async function playAgain(
  this: TicTacToe,
  interaction: Interaction & { options: { _hoistedOptions: CommandInteractionOption[] } },
  lang: lang
): Promise<void> {
  const
    opponent = interaction.options.getUser('opponent'),

    { components } = await interaction.fetchReply() as { components: ActionRow<ButtonComponent>[] },
    lastRow = 3;

  if (!components[lastRow]?.components[0]?.customId) {
    components[lastRow] = new ActionRowBuilder({
      components: [new ButtonBuilder({
        customId: 'playAgain',
        label: lang('global.playAgain'),
        style: ButtonStyle.Success
      })]
    });
  }

  const collector = (await interaction.editReply({ components })).createMessageComponentCollector({
    filter: i => [interaction.user.id, opponent?.id].includes(i.member.id) && i.customId == 'playAgain',
    max: 1, componentType: ComponentType.Button, time: BUTTON_TIME
  });

  collector

    /* eslint-disable-next-line @typescript-eslint/strict-void-return -- this cannot be cleanly resolved. */
    .on('collect', async (PAButton: ButtonInteraction) => {
      void PAButton.deferUpdate();
      collector.stop();

      if (interaction.member.id != PAButton.member.id && opponent?.id != interaction.client.user.id) {
        if (opponent) {
          interaction.options._hoistedOptions[0].member = interaction.member;
          interaction.options._hoistedOptions[0].user = interaction.user;
          interaction.options._hoistedOptions[0].value = interaction.member.id;

          interaction.options.data[0].member = interaction.member;
          interaction.options.data[0].user = interaction.user;
          interaction.options.data[0].value = interaction.member.id;

          /* eslint-disable @typescript-eslint/no-unsafe-call -- a hack that is not really doable otherwise */
          interaction.options.resolved.members.set(interaction.member.id, interaction.member);
          interaction.options.resolved.users.set(interaction.member.id, interaction.user);
          /* eslint-enable @typescript-eslint/no-unsafe-call */
        }

        interaction.member = PAButton.member;
        interaction.user = PAButton.user;
      }

      if (interaction.options._hoistedOptions[0]?.user) void sendChallengeMention(interaction, interaction.options._hoistedOptions[0].user.id, lang);

      return this.handleInteraction(interaction);
    })
    .on('end', collected => {
      if (!collected.size) return;

      for (let i = 0; i < lastRow; i++) for (const button of components[i].components) button.data.disabled = true;

      return void interaction.editReply({ components });
    });
}