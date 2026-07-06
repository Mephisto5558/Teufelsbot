import type { Database as WebsiteDB } from '@mephisto5558/bot-website';
import type { Locale } from '@mephisto5558/i18n';

import type { channelId, cmdStats, guildId, userId } from './common.ts';

export type userSettings = Record<userId, {
  localeCode?: Locale;
  afkMessage?: {
    message: string;
    createdAt: Temporal.Instant;
  };
  birthday?: Temporal.PlainDate;
  lastVoted?: NonNullable<WebsiteDB['userSettings'][Snowflake]>['lastVoted'];
  featureRequestAutoApprove?: NonNullable<WebsiteDB['userSettings'][Snowflake]>['featureRequestAutoApprove'];
  lastFeatureRequested?: number;
  votingReminderDisabled?: boolean;
  cmdStats?: cmdStats;
  wordCounter?: {
    enabled: boolean;
    enabledAt?: Temporal.Instant;
    sum: number;
    guilds: Record<guildId, {
      sum: number;
      channels: Record<channelId, number>;
    }>;
  };
  pageViews?: Record<string, {
    count: number;
    lastVisited: Temporal.Instant;
  }>;
}>;