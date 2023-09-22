import badgeCss from "data-text:~badge.css";

export const setBadgeCss = () => {
  let budgeEl = document.getElementById("muskist-budge");
  if (!budgeEl) {
    let badgeStyle = document.createElement("style");
    badgeStyle.id = "muskist-budge";
    badgeStyle.textContent = badgeCss;
    let target = document.head || document.documentElement;
    target.appendChild(badgeStyle);
  }
};

const processContentItem = (item: any) => {
  if (
    !Object.hasOwn(item.itemContent, "tweet_results") ||
    !Object.hasOwn(item.itemContent.tweet_results, "result")
  ) {
    return;
  }
  if (item.itemContent.tweet_results.result.__typename === "Tweet") {
    if (!Object.hasOwn(item.itemContent.tweet_results.result, "core")) {
      return;
    }
    if (
      localStorage.getItem(
        item.itemContent.tweet_results.result.core.user_results.result.rest_id,
      )
    ) {
      item.itemContent.tweet_results.result.core.user_results.result.is_blue_verified =
        true;
    }
    if (
      Object.hasOwn(
        item.itemContent.tweet_results.result,
        "quoted_status_result",
      ) &&
      Object.hasOwn(
        item.itemContent.tweet_results.result.quoted_status_result.result,
        "core",
      ) &&
      localStorage.getItem(
        item.itemContent.tweet_results.result.quoted_status_result.result.core
          .user_results.result.rest_id,
      )
    ) {
      item.itemContent.tweet_results.result.quoted_status_result.result.core.user_results.result.is_blue_verified =
        true;
    }
  } else if (
    item.itemContent.tweet_results.result.__typename ===
    "TweetWithVisibilityResults"
  ) {
    if (!Object.hasOwn(item.itemContent.tweet_results.result.tweet, "core")) {
      return;
    }
    if (
      localStorage.getItem(
        item.itemContent.tweet_results.result.tweet.core.user_results.result
          .rest_id,
      )
    ) {
      item.itemContent.tweet_results.result.tweet.core.user_results.result.is_blue_verified =
        true;
    }
    if (
      Object.hasOwn(
        item.itemContent.tweet_results.result.tweet,
        "quoted_status_result",
      ) &&
      Object.hasOwn(
        item.itemContent.tweet_results.result.tweet.quoted_status_result.result,
        "core",
      ) &&
      localStorage.getItem(
        item.itemContent.tweet_results.result.tweet.quoted_status_result.result
          .core.user_results.result.rest_id,
      )
    ) {
      item.itemContent.tweet_results.result.tweet.quoted_status_result.result.core.user_results.result.is_blue_verified =
        true;
    }
  }
};

const processUserItem = (item: any) => {
  if (
    !Object.hasOwn(item.itemContent, "user_results") ||
    !Object.hasOwn(item.itemContent.user_results, "result")
  ) {
    return;
  }
  if (localStorage.getItem(item.itemContent.user_results.result.rest_id)) {
    item.itemContent.user_results.result.is_blue_verified = true;
  }
};

const processTimelineEntry = (entry: any) => {
  if (
    entry.entryId.startsWith("tweet-") ||
    entry.entryId.startsWith("promoted-tweet-")
  ) {
    // single tweet
    processContentItem(entry.content);
  } else if (
    entry.entryId.startsWith("profile-conversation-") ||
    entry.entryId.startsWith("home-conversation-") ||
    entry.entryId.startsWith("list-conversation-") ||
    entry.entryId.startsWith("conversationthread-") ||
    entry.entryId.startsWith("tweetdetailrelatedtweets-")
  ) {
    // conversation, thread
    entry.content.items.forEach((item) => {
      processContentItem(item.item);
    });
  } else if (entry.entryId.startsWith("user-")) {
    // user
    processUserItem(entry.content);
  } else if (
    entry.entryId.startsWith("who-to-follow-") ||
    entry.entryId.startsWith("mergeallcandidatesmodule-")
  ) {
    // user list
    entry.content.items.forEach((item) => {
      processUserItem(item.item);
    });
  }
};

export const processTimeline = (timeline: any) => {
  const pinnedIndex = timeline.instructions.findIndex(
    (instruction) => instruction.type === "TimelinePinEntry",
  );
  if (pinnedIndex !== -1) {
    processTimelineEntry(timeline.instructions[pinnedIndex].entry);
  }

  const entriesIndex = timeline.instructions.findIndex(
    (instruction) => instruction.type === "TimelineAddEntries",
  );
  if (entriesIndex !== -1) {
    timeline.instructions[entriesIndex].entries.forEach((entry: any) => {
      processTimelineEntry(entry);
    });
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

export const getTimeline = (res: any, path: string) => {
  const key = getkeys(path);
  const target = key.split(".").reduce((acc, cur) => acc[cur], res);
  return target;
};
