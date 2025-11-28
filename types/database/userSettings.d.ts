import type { Database as WebsiteDB } from '@mephisto5558/bot-website';
import type { Locale } from '@mephisto5558/i18n';

import type { channelId, cmdStats, guildId, userId } from './common';

export type userSettings = Record<userId, {
  localeCode?: Locale;
  afkMessage?: {
    message: string;
    createdAt: Date;
  };
  birthday?: Date;
  lastVoted?: NonNullable<WebsiteDB['userSettings'][Snowflake]>['lastVoted'];
  featureRequestAutoApprove?: NonNullable<WebsiteDB['userSettings'][Snowflake]>['featureRequestAutoApprove'];
  lastFeatureRequested?: number;
  votingReminderDisabled?: boolean;
  cmdStats?: cmdStats;
  wordCounter?: {
    enabled: boolean;
    enabledAt?: Date;
    sum: number;
    guilds: Record<guildId, {
      sum: number;
      channels: Record<channelId, number>;
    }>;
  };
  pageViews?: Record<string, {
    count: number;
    lastVisited: Date;
  }>;
}>;