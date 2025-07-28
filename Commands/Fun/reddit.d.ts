import type { Collection } from 'discord.js';

export type Cache = Collection<`${RedditPost['subreddit']}_${string}`, RedditPage>;

export type RedditResponse = {
  kind: 'Listing';
  data: RedditPage;
};

export type RedditErrorResponse = {
  error: number;
  message: string;
  reason: string;
};

export type RedditPage = {
  after: string | null;
  before: string | null;
  dist: number | null;
  geo_filter: string | null;
  modhash: string | null;
  children: { kind: 't3'; data: RedditPost }[];
};

/* eslint-disable @typescript-eslint/no-redundant-type-constituents -- not all api response types are known */
export type RedditPost<AUTHOR extends string = string, SUBREDDIT extends string = string, POST_ID extends string = string> = {
  all_awardings: unknown[];
  allow_live_comments: boolean;
  approved_at_utc: number | null;
  approved_by: string | null;
  archived: boolean;
  author: AUTHOR;
  author_flair_background_color: string | null;
  author_flair_css_class: string | null;
  author_flair_richtext: unknown[];
  author_flair_template_id: string | null;
  author_flair_text: string | null;
  author_flair_text_color: string | null;
  author_flair_type: 'text';
  author_fullname: string;
  author_is_blocked: boolean;
  author_patreon_flair: boolean;
  author_premium: boolean;
  awarders: unknown[];
  banned_at_utc: number | null;
  banned_by: string | null;
  can_gild: boolean;
  can_mod_post: boolean;
  category: string | null;
  clicked: boolean;
  content_categories: unknown | null;
  contest_mode: boolean;
  created: number;
  created_utc: number;
  discussion_type: unknown | null;
  distinguished: string | null;
  domain: string;
  downs: number;
  edited: number;
  gilded: number;
  gildings: Record<string, unknown>;
  hidden: boolean;
  hide_score: boolean;
  id: POST_ID;
  is_created_from_ads_ui: boolean;
  is_crosspostable: boolean;
  is_meta: boolean;
  is_original_content: boolean;
  is_reddit_media_domain: boolean;
  is_robot_indexable: boolean;
  is_self: boolean;
  is_video: boolean;
  likes: number | null;
  link_flair_background_color: `#${string}`;
  link_flair_css_class: string;
  link_flair_richtext: Record<string, string>[];
  link_flair_template_id: string;
  link_flair_text: string;
  link_flair_text_color: string;
  link_flair_type: string;
  locked: boolean;
  media: {
    oembed?: {
      thumbnail_url?: string;
    };
  } | null;
  media_embed: Record<string, unknown>;
  media_only: boolean;
  mod_note: string | null;
  mod_reason_by: string | null;
  mod_reason_title: string | null;
  mod_reports: unknown[];
  name: `t3_${POST_ID}`;
  no_follow: boolean;
  num_comments: number;
  num_crossposts: number;
  num_reports: number | null;
  over_18: boolean;
  permalink: `/r/${SUBREDDIT}/comments/${POST_ID}/${string}`;
  pinned: boolean;
  post_hint?: string;
  preview?: { images: RedditPreviewImage[]; enabled: boolean };
  pwls: number;
  quarantine: boolean;
  removal_reason: string | null;
  removed_by: string | null;
  removed_by_category: string | null;
  report_reasons: unknown | null;
  saved: boolean;
  score: number;
  secure_media: {
    type: string;
    oembed: {
      author_name: string;
      author_url: string;
      height: number;
      html: string;
      provider_name: string;
      provider_url: string;
      thumbnail_height: number;
      thumbnail_url: string;
      thumbnail_width: number;
      title: string;
      type: string;
      version: string;
      width: number;
    };
  } | {
    reddit_video: {
      bitrate_kbps: number;
      dash_url: string;
      duration: number;
      fallback_url: string;
      has_audio: boolean;
      height: number;
      hls_url: string;
      is_gif: boolean;
      scrubber_media_url: string;
      transcoding_status: string;
      width: number;
    };
  } | null;
  secure_media_embed: Record<string, unknown>;
  selftext: string;
  selftext_html: string;
  send_replies: boolean;
  spoiler: boolean;
  stickied: boolean;
  subreddit: SUBREDDIT;
  subreddit_id: string;
  subreddit_name_prefixed: `r/${SUBREDDIT}`;
  subreddit_subscribers: number;
  subreddit_type: 'public' | 'private';
  suggested_sort: string | null;
  thumbnail: string;
  thumbnail_height: number | null;
  thumbnail_width: number | null;
  title: string;
  top_awarded_type: unknown | null;
  total_awards_received: number;
  treatment_tags: unknown[];
  ups: number;
  upvote_ratio: number;
  url: string;
  user_reports: unknown[];
  view_count: number | null;
  visited: boolean;
  wls: number;
};

export type RedditPreviewImage = {
  id: string;
  resolutions: (RedditPreviewImage['source'])[];
  source: {
    url: string;
    width: number;
    height: number;
  };
  variants: Record<string, unknown>;
};
/* eslint-enable @typescript-eslint/no-redundant-type-constituents */