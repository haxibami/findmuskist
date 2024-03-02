import type {
  Timeline,
  TimelineEntry,
  TweetResults,
  UserResults,
} from "./types";

const processUserResults = (user_results: UserResults) => {
  if (
    user_results &&
    Object.hasOwn(user_results, "result") &&
    localStorage
      .getItem("muskists")
      ?.split(",")
      .includes(user_results.result.legacy.screen_name)
  ) {
    user_results.result.is_blue_verified = true;
  }
};

const processTweetResults = (tweet_results: TweetResults) => {
  if (!tweet_results || !Object.hasOwn(tweet_results, "result")) {
    return;
  }
  if (tweet_results.result.__typename === "Tweet") {
    if (Object.hasOwn(tweet_results.result, "core")) {
      processUserResults(tweet_results.result.core.user_results);
    }
    if (
      Object.hasOwn(tweet_results.result, "quoted_status_result") &&
      Object.hasOwn(tweet_results.result.quoted_status_result, "result")
    ) {
      processTweetResults(tweet_results.result.quoted_status_result);
    }
    if (
      Object.hasOwn(tweet_results.result.legacy, "retweeted_status_result") &&
      Object.hasOwn(
        tweet_results.result.legacy.retweeted_status_result,
        "result",
      )
    ) {
      processTweetResults(tweet_results.result.legacy.retweeted_status_result);
    }
  } else if (tweet_results.result.__typename === "TweetWithVisibilityResults") {
    if (Object.hasOwn(tweet_results.result.tweet, "core")) {
      processUserResults(tweet_results.result.tweet.core.user_results);
    }
    if (
      Object.hasOwn(tweet_results.result.tweet, "quoted_status_result") &&
      Object.hasOwn(tweet_results.result.tweet.quoted_status_result, "result")
    ) {
      processTweetResults(tweet_results.result.tweet.quoted_status_result);
    }
    if (
      Object.hasOwn(
        tweet_results.result.tweet.legacy,
        "retweeted_status_result",
      ) &&
      Object.hasOwn(
        tweet_results.result.tweet.legacy.retweeted_status_result,
        "result",
      )
    ) {
      processTweetResults(
        tweet_results.result.tweet.legacy.retweeted_status_result,
      );
    }
  }
};

const processTimelineEntry = (entry: TimelineEntry) => {
  if (!entry) {
    return;
  }
  // TODO: "community-to-join", "list-search-.+-list-.+"
  const singleTweetRegex = new RegExp(
    `^(${["tweet-", "promoted-tweet-"].join("|")})`,
  );
  const moduleTweetRegex = new RegExp(
    `^(${[
      ".+-grid-.+-tweet-",
      "conversationthread-.+-tweet-",
      "bookmarked-tweet-.+-tweet-",
    ].join("|")})`,
  );
  const multiTweetsRegex = new RegExp(
    `^(${[
      "profile-conversation-",
      "home-conversation-",
      "list-conversation-",
      "conversationthread-",
      "tweetdetailrelatedtweets-",
      ".+-grid-",
      "bookmarked-tweet-",
    ].join("|")})(?!-tweet-)`,
  );
  const singleUserRegex = new RegExp(
    `^(${["user-", "who-to-follow-.+-user-", "who-to-subscribe-.+-user-"].join(
      "|",
    )})`,
  );
  const multiUsersRegex = new RegExp(
    `^(${[
      "who-to-follow-",
      "who-to-subscribe-",
      "singleusermodule-",
      "similartomodule-",
      "mergeallcandidatesmodule-",
      "toptabsrpusermodule-",
    ].join("|")})(?!-user-)`,
  );

  if (
    // single tweet
    singleTweetRegex.test(entry.entryId) &&
    Object.hasOwn(entry.content.itemContent, "tweet_results")
  ) {
    processTweetResults(entry.content.itemContent.tweet_results);
  } else if (
    // single grid tweet
    moduleTweetRegex.test(entry.entryId) &&
    Object.hasOwn(entry.item.itemContent, "tweet_results")
  ) {
    processTweetResults(entry.item.itemContent.tweet_results);
  } else if (
    // conversation, thread
    multiTweetsRegex.test(entry.entryId) &&
    Object.hasOwn(entry.content, "items") &&
    entry.content.items.length > 0 &&
    Object.hasOwn(entry.content.items[0].item.itemContent, "tweet_results")
  ) {
    for (const item of entry.content.items) {
      processTweetResults(item.item.itemContent.tweet_results);
    }
  } else if (
    // single user
    singleUserRegex.test(entry.entryId) &&
    Object.hasOwn(entry.content.itemContent, "user_results")
  ) {
    processUserResults(entry.content.itemContent.user_results);
  } else if (
    // user list
    multiUsersRegex.test(entry.entryId) &&
    Object.hasOwn(entry.content, "items") &&
    entry.content.items.length > 0 &&
    Object.hasOwn(entry.content.items[0].item.itemContent, "user_results")
  ) {
    for (const item of entry.content.items) {
      processUserResults(item.item.itemContent.user_results);
    }
  }
};

export const processTimeline = (timeline: Timeline) => {
  for (const instruction of timeline.instructions) {
    if (instruction.type === "TimelinePinEntry") {
      processTimelineEntry(instruction.entry);
    } else if (instruction.type === "TimelineAddEntries") {
      for (const entry of instruction.entries) {
        processTimelineEntry(entry);
      }
    } else if (instruction.type === "TimelineAddToModule") {
      for (const item of instruction.moduleItems) {
        processTimelineEntry(item);
      }
    }
  }
};

export const timelineKeys = {
  UserHighlightsTweets: "data.user.result.timeline.timeline",
  UserTweets: "data.user.result.timeline_v2.timeline",
  UserTweetsAndReplies: "data.user.result.timeline_v2.timeline",
  UserMedia: "data.user.result.timeline_v2.timeline",
  Likes: "data.user.result.timeline_v2.timeline",
  Bookmarks: "data.bookmark_timeline_v2.timeline",
  TweetDetail: "data.threaded_conversation_with_injections_v2",
  HomeTimeline: "data.home.home_timeline_urt",
  HomeLatestTimeline: "data.home.home_timeline_urt",
  ListLatestTweetsTimeline: "data.list.tweets_timeline.timeline",
  SearchTimeline: "data.search_by_raw_query.search_timeline.timeline",
  ListMembers: "data.list.members_timeline.timeline",
  Followers: "data.user.result.timeline.timeline",
  Following: "data.user.result.timeline.timeline",
  FollowersYouKnow: "data.user.result.timeline.timeline",
  Favoriters: "data.favoriters_timeline.timeline",
  Retweeters: "data.retweeters_timeline.timeline",
  ListSubscribers: "data.list.subscribers_timeline.timeline",
  CommunitiesMainPageTimeline: "data.viewer.communities_timeline.timeline",
  ConnectTabTimeline: "data.connect_tab_timeline.timeline",
};

const getkeys = (path: string) => {
  return timelineKeys[path];
};

export const getTimeline = (res: any, path: string): Timeline => {
  const key = getkeys(path);
  const target = key.split(".").reduce((acc, cur) => acc[cur], res);
  return target;
};
