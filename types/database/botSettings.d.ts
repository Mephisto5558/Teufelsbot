import type { ActivityType } from 'discord.js';
import type { Database } from '@mephisto5558/command';
import type { Locale } from '@mephisto5558/i18n';

import type { Embed, prefixes, userId } from './common';

export type botSettings = Database['botSettings'] & {
  startCount: Record<string, number>;
  activity?: {
    name: string;
    type: ActivityType;
  };
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