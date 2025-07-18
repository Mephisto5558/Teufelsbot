import type { Database as WebsiteDB } from '@mephisto5558/bot-website/database';

import type { guildId, userId } from './common';
import type { botSettings } from './botSettings';
import type { leaderboards } from './leaderboards';
import type { userSettings } from './userSettings';
import type { guildSettings } from './guildSettings';
import type { backups } from './backups';

export type { Database };
export type { backupId } from './common';
export type { backupChannel } from './backups';

type Database = {
  botSettings: botSettings;
  leaderboards: leaderboards;
  userSettings: userSettings;
  guildSettings: guildSettings;
  polls: Record<guildId, userId>;
  backups: backups;
  website: WebsiteDB['website'];
};