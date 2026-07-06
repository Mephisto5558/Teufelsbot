import { errorHandler } from '#utils';

import type { DiscordEvent } from './index.ts';

export default (function error(client): void {
  return void errorHandler.call(client, this);
}) as DiscordEvent<'error'>;