// wraps XMLHttpRequest to modify the response

import xhook from "xhook";
import badgeCss from "data-text:~badge.css";
import { processTimelineEntry } from "./timeline.ts";

xhook.after(function (request, response) {
  if (response.status !== 200) {
    return;
  }
  if (request.url.includes("UserByScreenName")) {
    try {
      let res = JSON.parse(response.text);
      const vf_info = res.data.user.result.verification_info;
      if (
        Object.hasOwn(vf_info, "reason") &&
        res.data.user.result.is_blue_verified === false &&
        !res.data.user.result.legacy.verified_type
      ) {
        if (!localStorage.getItem(res.data.user.result.rest_id)) {
          localStorage.setItem(
            res.data.user.result.rest_id,
            "true",
            //             JSON.stringify({
            //               reason: vf_info.reason,
            //               is_blue_verified: res.data.user.result.is_blue_verified,
            //               verified_type: res.data.user.result.legacy.verified_type,
            //             }),
          );
        }
        res.data.user.result.is_blue_verified = true;
        // res.data.user.result.legacy.verified = true;
        // res.data.user.result.verification_info.is_identity_verified = true;
        // res.data.user.result.has_hidden_subscriptions_on_profile = false;
        res.data.user.result.verification_info.reason.description.text +=
          "。また、認証バッジを非表示にしています。";

        let budgeEl = document.getElementById("muskist-budge");
        if (!budgeEl) {
          let badgeStyle = document.createElement("style");
          badgeStyle.id = "muskist-budge";
          badgeStyle.textContent = badgeCss;
          let target = document.head || document.documentElement;
          target.appendChild(badgeStyle);
        }
        response.text = JSON.stringify(res);
      }
      // TODO: remove from localStorage when `verification_info.reason` is no longer provided
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("UserByRestId")) {
    try {
      let res = JSON.parse(response.text);
      if (res.data.user.result.highlights_info.can_highlight_tweets === true) {
        if (!localStorage.getItem(res.data.user.result.rest_id)) {
          localStorage.setItem(res.data.user.result.rest_id, "true");
        }
        res.data.user.result.is_blue_verified = true;
        let budgeEl = document.getElementById("muskist-budge");
        if (!budgeEl) {
          let badgeStyle = document.createElement("style");
          badgeStyle.id = "muskist-budge";
          badgeStyle.textContent = badgeCss;
          let target = document.head || document.documentElement;
          target.appendChild(badgeStyle);
        }
        response.text = JSON.stringify(res);
      }
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (
    request.url.includes("UserTweets") ||
    request.url.includes("UserMedia") ||
    request.url.includes("UserHighlights")
  ) {
    const timelineName = request.url.includes("UserHighlights")
      ? "timeline"
      : "timeline_v2";
    try {
      let res = JSON.parse(response.text);
      // pinned tweet
      const pinnedIndex = res.data.user.result[
        timelineName
      ].timeline.instructions.findIndex(
        (instruction) => instruction.type === "TimelinePinEntry",
      );
      if (pinnedIndex !== -1) {
        const entry =
          res.data.user.result[timelineName].timeline.instructions[pinnedIndex]
            .entry;
        if (
          entry.entryId.startsWith("tweet-") ||
          entry.entryId.startsWith("promoted-tweet-")
        ) {
          if (
            localStorage.getItem(
              entry.content.itemContent.tweet_results.result.core.user_results
                .result.rest_id,
            )
          ) {
            entry.content.itemContent.tweet_results.result.core.user_results.result.is_blue_verified =
              true;
            // entry.content.tweet_results.result.core.user_results.result.legacy.verified = true;
          }
        }
      }
      // user tweets
      const entriesIndex = res.data.user.result[
        timelineName
      ].timeline.instructions.findIndex(
        (instruction) => instruction.type === "TimelineAddEntries",
      );
      res.data.user.result[timelineName].timeline.instructions[
        entriesIndex
      ].entries.forEach((entry) => {
        processTimelineEntry(entry);
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("TweetDetail")) {
    try {
      let res = JSON.parse(response.text);
      const entriesIndex =
        res.data.threaded_conversation_with_injections_v2.instructions.findIndex(
          (instruction) => instruction.type === "TimelineAddEntries",
        );
      res.data.threaded_conversation_with_injections_v2.instructions[
        entriesIndex
      ].entries.forEach((entry) => {
        if (entry.entryId.startsWith("tweet-")) {
          // normal tweet
          // target: res.data.threaded_conversation_with_injections_v2.instructions[n].entries[n].content.itemContent.tweet_results.result.core.user_results.result.is_blue_verified
          if (
            entry.content.itemContent.tweet_results.result.__typename ===
            "Tweet"
          ) {
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
          }
        } else if (
          entry.entryId.startsWith("conversationthread-") ||
          entry.entryId.startsWith("tweetdetailrelatedtweets-")
        ) {
          // conversation or related tweets
          // target: res.data.threaded_conversation_with_injections_v2.instructions[n].entries[n].content.items[n].item.itemContent.tweet_results.result.core.user_results.result.is_blue_verified
          entry.content.items.forEach((item) => {
            if (
              Object.hasOwn(item.item.itemContent, "tweet_results") &&
              localStorage.getItem(
                item.item.itemContent.tweet_results.result.core.user_results
                  .result.rest_id,
              )
            ) {
              item.item.itemContent.tweet_results.result.core.user_results.result.is_blue_verified =
                true;
              // item.item.itemContent.tweet_results.result.core.user_results.result.legacy.verified =
              //   true;
            }
          });
        }
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("TweetResultByRestId")) {
    try {
      // tweet detail when not logged in
      // target: res.data.tweetResult.result.core.user_results.result.is_blue_verified
      let res = JSON.parse(response.text);
      if (
        localStorage.getItem(
          res.data.tweetResult.result.core.user_results.result.rest_id,
        )
      ) {
        res.data.tweetResult.result.core.user_results.result.is_blue_verified =
          true;
        // res.data.tweetResult.result.core.user_results.result.legacy.verified =
        //   true;
      }
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("recommendations.json")) {
    try {
      // recommended users
      // target: res[n].user.ext_is_blue_verified
      let res = JSON.parse(response.text);
      res.forEach((item) => {
        if (localStorage.getItem(item.user_id)) {
          item.user.ext_is_blue_verified = true;
          // item.user.verified = true;
        }
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("all.json")) {
    try {
      // search results
      // target: res.globalObjects.users[n].ext_is_blue_verified
      let res = JSON.parse(response.text);
      if (Object.keys(res.globalObjects).length !== 0) {
        Object.entries(res.globalObjects.users).forEach(([key]) => {
          if (localStorage.getItem(res.globalObjects.users[key].id_str)) {
            res.globalObjects.users[key].ext_is_blue_verified = true;
            // res.globalObjects.users[key].verified = true;
          }
        });
        response.text = JSON.stringify(res);
      }
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("/i/api/1.1/friends/following/list.json")) {
    try {
      let res = JSON.parse(response.text);
      res.users.forEach((user) => {
        if (localStorage.getItem(user.id_str)) {
          user.ext_is_blue_verified = true;
          // user.verified = true;
          response.text = JSON.stringify(res);
        }
      });
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("typeahead.json")) {
    try {
      // search results
      // target: res.users[n].ext_is_blue_verified
      let res = JSON.parse(response.text);
      Object.entries(res.users).forEach(([key]) => {
        if (localStorage.getItem(res.users[key].id_str)) {
          res.users[key].ext_is_blue_verified = true;
          // res.users[key].verified = true;
        }
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (
    request.url.includes("HomeLatestTimeline") ||
    request.url.includes("HomeTimeline")
  ) {
    try {
      // performance.mark("start");
      // latest timeline
      // target: res.data.home.home_timeline_urt.instructions[n].entries[n].content.
      let res = JSON.parse(response.text);
      const entriesIndex =
        res.data.home.home_timeline_urt.instructions.findIndex(
          (instruction) => instruction.type === "TimelineAddEntries",
        );
      res.data.home.home_timeline_urt.instructions[
        entriesIndex
      ].entries.forEach((entry) => {
        processTimelineEntry(entry);
      });
      response.text = JSON.stringify(res);
      // performance.mark("end");
      // performance.measure("timeline", "start", "end");
      // console.log(performance.getEntriesByName("timeline"));
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("ListLatestTweetsTimeline")) {
    try {
      let res = JSON.parse(response.text);
      const entriesIndex =
        res.data.list.tweets_timeline.timeline.instructions.findIndex(
          (instruction) => instruction.type === "TimelineAddEntries",
        );
      res.data.list.tweets_timeline.timeline.instructions[
        entriesIndex
      ].entries.forEach((entry) => {
        processTimelineEntry(entry);
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  }
});
