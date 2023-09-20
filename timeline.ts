export const processTimelineEntry = (entry: any) => {
  if (
    (entry.entryId.startsWith("tweet-") ||
      entry.entryId.startsWith("promoted-tweet-")) &&
    Object.keys(entry.content.itemContent.tweet_results).length !== 0
  ) {
    if (entry.content.itemContent.tweet_results.result.__typename === "Tweet") {
      // normal tweet
      // target: res.data.user.result.timeline_v2.timeline.instructions[n].entries[n].content.itemContent.tweet_results.result.core.user_results.result.is_blue_verified
      if (
        localStorage.getItem(
          entry.content.itemContent.tweet_results.result.core.user_results
            .result.rest_id,
        )
      ) {
        entry.content.itemContent.tweet_results.result.core.user_results.result.is_blue_verified =
          true;
        // entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.verified =
        //   true;
      }
    } else if (
      entry.content.itemContent.tweet_results.result.__typename ===
      "TweetWithVisibilityResults"
    ) {
      // retweet (?)
      // target: res.data.user.result.timeline_v2.timeline.instructions[n].entries[n].content.itemContent.tweet_results.result.tweet.core.user_results.result.is_blue_verified
      if (
        localStorage.getItem(
          entry.content.itemContent.tweet_results.result.tweet.core.user_results
            .result.rest_id,
        )
      ) {
        entry.content.itemContent.tweet_results.result.tweet.core.user_results.result.is_blue_verified =
          true;
        // entry.content.itemContent.tweet_results.result.tweet.core.user_results.result.legacy.verified =
        //   true;
      }
    }
  } else if (
    entry.entryId.startsWith("profile-conversation-") ||
    entry.entryId.startsWith("home-conversation-") ||
    entry.entryId.startsWith("list-conversation-")
  ) {
    // conversation
    // target: res.data.user.result.timeline_v2.timeline.instructions[n].entries[n].content.items[n].item.itemContent.tweet_results.result.core.user_results.result.is_blue_verified
    entry.content.items.forEach((item) => {
      if (item.item.itemContent.tweet_results.result.__typename === "Tweet") {
        if (
          localStorage.getItem(
            item.item.itemContent.tweet_results.result.core.user_results.result
              .rest_id,
          )
        ) {
          item.item.itemContent.tweet_results.result.core.user_results.result.is_blue_verified =
            true;
          // item.item.itemContent.tweet_results.result.core.user_results.result.legacy.verified =
          //   true;
        }
      } else if (
        item.item.itemContent.tweet_results.result.__typename ===
        "TweetWithVisibilityResults"
      ) {
        // retweet (?)
        // target: res.data.user.result.timeline_v2.timeline.instructions[n].entries[n].content.items[n].item.itemContent.tweet_results.result.tweet.core.user_results.result.is_blue_verified
        if (
          localStorage.getItem(
            item.item.itemContent.tweet_results.result.tweet.core.user_results
              .result.rest_id,
          )
        ) {
          item.item.itemContent.tweet_results.result.tweet.core.user_results.result.is_blue_verified =
            true;
          // item.item.itemContent.tweet_results.result.tweet.core.user_results.result.legacy.verified =
          //   true;
        }
      }
    });
  } else if (entry.entryId.startsWith("who-to-follow-")) {
    // who to follow
    // target: res.data.user.result.timeline_v2.timeline.instructions[n].entries[n].content.items[n].item.itemContent.user_results.result.is_blue_verified
    entry.content.items.forEach((item) => {
      if (
        localStorage.getItem(item.item.itemContent.user_results.result.rest_id)
      ) {
        item.item.itemContent.user_results.result.is_blue_verified = true;
        // item.item.itemContent.user_results.result.legacy.verified = true;
      }
    });
  }
};
