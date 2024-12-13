import type { Collection } from 'discord.js';

export type Cache = Collection<`${string}_${string}`, RedditPage>;

export interface RedditPage {
  children: { data: RedditPost } [];
}

// todo: complete the api response and possible correct return types
export interface RedditPost {
  pinned: boolean;
  stickied: boolean;
  over_18: boolean;
  title: string;
  subreddit: string;
  author: string;
  ups?: number;
  downs?: number;
  num_comments?: number;
  upvote_ratio?: number;
  permalink: URL;
  url: URL;
  media?: {
    oembed?: {
      thumbnail_url?: URL;
    };
  };
}