import type { DiscordEvent } from './index.ts';

export default (async function threadCreate() {
  return this.joinable ? this.join() : undefined;
}) as DiscordEvent<'threadCreate'>;