import type { Database as WebsiteDB } from '@mephisto5558/bot-website';

import type { backups } from './backups';
import type { botSettings } from './botSettings';
import type { guildSettings } from './guildSettings';
import type { leaderboards } from './leaderboards';
import type { userSettings } from './userSettings';

export type { Database };
export type { backupId } from './common';
export type { backupChannel } from './backups';

type Database = {
  botSettings: botSettings;
  leaderboards: leaderboards;
  userSettings: userSettings;
  guildSettings: guildSettings;
  backups: backups;
  website: WebsiteDB['website'];
};