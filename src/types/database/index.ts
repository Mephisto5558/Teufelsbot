import type { Database as WebsiteDB } from '@mephisto5558/bot-website';

import type { backups } from './backups.ts';
import type { botSettings } from './botSettings.ts';
import type { guildSettings } from './guildSettings.ts';
import type { leaderboards } from './leaderboards.ts';
import type { userSettings } from './userSettings.ts';

export type { backupId } from './common.ts';
export type { backupChannel } from './backups.ts';

export type Database = {
  botSettings: botSettings;
  leaderboards: leaderboards;
  userSettings: userSettings;
  guildSettings: guildSettings;
  backups: backups;
  website: WebsiteDB['website'];
};