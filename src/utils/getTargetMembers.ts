import { GuildMember, userMention } from 'discord.js';

import type { Collection, User } from 'discord.js';
import type { ChatInputCommandInteraction, ContextType } from '@mephisto5558/command';
import type { getTargetUtils } from './index.ts';

type MemberParam = getTargetUtils.Param & { returnUser?: boolean };
type MemberType<I, T> = I extends ChatInputCommandInteraction<[ContextType.BotDM]> | Message<[ContextType.BotDM]>
  ? User : [T] extends [{ returnUser: true }] ? GuildMember | User
  : GuildMember;

const searchCache = <T extends GuildMember | User>(
  query: string, filter: (e: T) => boolean, cache: Collection<Snowflake, T>
): T | undefined => cache.find(e => filter(e) && [
  ...e instanceof GuildMember ? [e.user.username, e.user.globalName, e.nickname] : [e.username, e.globalName], e.id, e.displayName
].some(e => !!e && (query.includes(e) || e.includes(query))));

function getTargetUser<
  I extends ChatInputCommandInteraction | Message, const O extends MemberParam
>(
  interaction: I, { targetOptionName, returnSelf }: O, seenList: Map<Snowflake, MemberType<I, O>>
): getTargetUtils.MaybeWithUndefined<User, getTargetUtils.ShouldReturnSelf<O>> {
  let target: User | undefined = 'options' in interaction
    ? interaction.options.getUser(targetOptionName)
    : interaction.mentions.users.at(seenList.size) ?? interaction.mentions.users.first();

  if ('content' in interaction) {
    const botMention = userMention(interaction.client.user.id);
    if (
      target?.id == interaction.client.user.id
      && interaction.content.startsWith(botMention)
      && interaction.content.indexOf(botMention) == interaction.content.lastIndexOf(botMention)
    ) target = undefined;

    if (!target || seenList.has(target.id)) target = searchCache(interaction.content, e => !seenList.has(e.id), interaction.client.users.cache);
  }
  if (target && !seenList.has(target.id)) return target;

  if (returnSelf && !seenList.has(interaction.user.id)) return interaction.user;
}

function getTargetMember<
  I extends ChatInputCommandInteraction | Message, const O extends MemberParam
>(
  interaction: I, { targetOptionName, returnSelf, returnUser }: O, seenList: Map<Snowflake, MemberType<I, O>>
): MaybeWithUndefined<MemberType<I, O>, ShouldReturnSelf<O>> {
  if (interaction.guild) {
    let target: GuildMember | undefined = 'options' in interaction
      ? interaction.options.getMember(targetOptionName)
      : interaction.mentions.members?.at(seenList.size) ?? interaction.mentions.members?.first();

    if ('content' in interaction) {
      const botMention = userMention(interaction.client.user.id);

      if (
        target?.id == interaction.client.user.id
        && interaction.content.startsWith(botMention)
        && interaction.content.indexOf(botMention) == interaction.content.lastIndexOf(botMention)
      ) target = undefined;

      if (!target || seenList.has(target.id)) target = searchCache(interaction.content, e => !seenList.has(e.id), interaction.guild.members.cache);
      target ??= searchCache(interaction.content, e => !seenList.has(e.id), interaction.client.users.cache);
    }

    if (target && !seenList.has(target.id)) return target;
    return returnSelf ? interaction.member ?? interaction.user : undefined;
  }

  return returnUser ? getTargetUser(interaction, { targetOptionName, returnSelf } as O, seenList) : undefined;
}

/**
 * Can only return duplicates if `returnSelf` is true for any option.
 * Can only return Users if `returnUser` is true for the option.
 * @default targetOptionName = `target${index}` */
export default function getTargetMembers<
  I extends ChatInputCommandInteraction | Message, const O extends readonly MemberParam[] = [MemberParam]
>(
  interaction: I, targetSettings: O = []
): O['length'] extends 1
  ? MaybeWithUndefined<MemberType<I, O[0]>, ShouldReturnSelf<O[0]>>
  : { [K in keyof O]: MaybeWithUndefined<MemberType<I, O[K]>, ShouldReturnSelf<O[K]>> } {
  const
    map = new Map<string, GuildMember | User>(),
    members = targetSettings.reduce((acc, options, i) => {
      const
        member = getTargetMember(interaction, { ...options, targetOptionName: options.targetOptionName ?? `target${i || ''}` }, acc),
        id = member?.id ?? `target${i || ''}`;

      acc.set(acc.has(id) ? `${id}${i}` : id, member);
      return acc;
    }, map);

  return members.values().toArray();
}