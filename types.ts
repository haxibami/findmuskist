export interface UserResults {
  result: {
    legacy: {
      screen_name: string;
    };
    is_blue_verified: boolean;
  };
}

export interface TweetResults {
  result: {
    __typename: string;
    core: {
      user_results: UserResults;
    };
    tweet?: {
      core: {
        user_results: UserResults;
      };
      quoted_status_result?: TweetResults;
      legacy: {
        retweeted_status_result?: TweetResults;
      };
    };
    quoted_status_result?: TweetResults;
    legacy: {
      retweeted_status_result?: TweetResults;
    };
  };
}

interface ItemContent {
  tweet_results?: TweetResults;
  user_results?: UserResults;
}

export interface TimelineEntry {
  entryId: string;
  content: {
    itemContent: ItemContent;
    items: {
      item: {
        itemContent: ItemContent;
      };
    }[];
  };
  item: {
    itemContent: ItemContent;
  };
}

export interface Timeline {
  instructions: {
    type: string;
    entry?: TimelineEntry;
    entries?: TimelineEntry[];
    moduleItems?: TimelineEntry[];
  }[];
}
