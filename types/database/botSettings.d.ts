import type { ActivityType } from 'discord.js';
import type { Locale } from '@mephisto5558/i18n';

import type { cmdStats, userId, Embed } from './common';

export type botSettings = {
  startCount: Record<string, number>;
  activity?: {
    name: string;
    type: ActivityType;
  };
  cmdStats: cmdStats;
  blacklist?: userId[];
  timeEvents: {
    lastFileClear?: Date;
    lastBirthdayCheck?: Date;
    lastDBCleanup?: Date;
    lastEmojiSync?: Date;
    lastVotingReminder?: Date;
  };
  defaultGuild: {
    config: {
      lang: Locale;
      prefixes: { prefix: string; caseinsensitive: boolean }[];
      betaBotPrefixes: { prefix: string; caseinsensitive: boolean }[];
    };
    birthday: {
      ch: {
        msg: {
          embed: Embed;
        };
      };
      dm: {
        msg: {
          embed: Embed;
        };
      };
    };
    serverbackup: {
      allowedToLoad: number;
    };
    giveaway: {
      reaction: string;
      embedColor: number;
      embedColorEnd: number;
    };
  };

  patreonBonuses?: Record<string, unknown>;
};