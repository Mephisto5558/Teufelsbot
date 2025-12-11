import type { ActivityType } from 'discord.js';
import type { Locale } from '@mephisto5558/i18n';

import type { Embed, cmdStats, prefixes, userId } from './common';

export type botSettings = {
  startCount: Record<string, number>;
  activity?: {
    name: string;
    type: ActivityType;
  };
  cmdStats: cmdStats & Record<string, {
    /** Is only missing for very old commands that no longer exist. */
    createdAt?: Date;
  }>;
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
      prefixes: Record<string, prefixes> & { main: prefixes };
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