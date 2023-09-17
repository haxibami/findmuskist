// wraps XMLHttpRequest to modify the response

import xhook from "./node_modules/xhook/es/main.js";

let budgeHidingUsers = [];

xhook.after(function (request, response) {
  if (request.url.includes("UserByScreenName")) {
    const res = JSON.parse(response.text);
    const vf_info = res.data.user.result.verification_info;
    if (Object.hasOwn(vf_info, "reason")) {
      if (res.data.user.result.is_blue_verified === false) {
        budgeHidingUsers.push(res.data.user.result.rest_id);
        res.data.user.result.is_blue_verified = true;
        res.data.user.result.legacy.verified = true;
        res.data.user.result.verification_info.is_identity_verified = true;
        res.data.user.result.has_hidden_subscriptions_on_profile = false;
        res.data.user.result.verification_info.reason.description.text +=
          "。また、認証バッジを非表示にしています。";
        response.text = JSON.stringify(res);

        const style = document.createElement("style");
        style.setAttribute("type", "text/css");
        style.setAttribute("id", "muskist-budge");
        style.innerHTML = `
          div[data-testid="UserName"] svg[data-testid="icon-verified"] {color: red;}
          div[data-testid="HoverCard"] svg[data-testid="verificationBadge"] {color: red;}
          div[data-testid="HoverCard"] > div > div > span > span {position: relative; visibility: hidden; display: inline-block; width: 100%;}
          div[data-testid="HoverCard"] > div > div > span > span::after {all: inherit; position:absolute; left: 0; top: 0; width: 100%; height: 100%; visibility: visible; display: inline; content: "隠れ認証済みアカウント";}
        `;
        const target = document.head || document.documentElement;
        target.appendChild(style);
      } else {
        const budgeEl = document.getElementById("muskist-budge");
        if (budgeEl) {
          budgeEl.remove();
        }
      }
    }
  } else if (
    request.url.includes("UserTweets") ||
    request.url.includes("UserMedia")
  ) {
    try {
      const res = JSON.parse(response.text);
      const targetIndex =
        res.data.user.result.timeline_v2.timeline.instructions.findIndex(
          (instruction) => instruction.type === "TimelineAddEntries",
        );
      res.data.user.result.timeline_v2.timeline.instructions[
        targetIndex
      ].entries.forEach((entry) => {
        switch (true) {
          case entry.entryId.startsWith("tweet-"):
            if (
              entry.content.itemContent.tweet_results.result.__typename ===
              "Tweet"
            ) {
              if (
                budgeHidingUsers.includes(
                  entry.content.itemContent.tweet_results.result.core
                    .user_results.result.rest_id,
                )
              ) {
                entry.content.itemContent.tweet_results.result.core.user_results.result.is_blue_verified = true;
                entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.verified = true;
              }
            } else if (
              entry.content.itemContent.tweet_results.result.__typename ===
              "TweetWithVisibilityResults"
            ) {
              if (
                budgeHidingUsers.includes(
                  entry.content.itemContent.tweet_results.result.tweet.core
                    .user_results.result.rest_id,
                )
              ) {
                entry.content.itemContent.tweet_results.result.core.user_results.result.is_blue_verified = true;
                entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.verified = true;
              }
            }
            break;
          case entry.entryId.startsWith("profile-conversation-"):
            entry.content.items.forEach((item) => {
              if (
                budgeHidingUsers.includes(
                  item.item.itemContent.tweet_results.result.core.user_results
                    .result.rest_id,
                )
              ) {
                item.item.itemContent.tweet_results.result.core.user_results.result.is_blue_verified = true;
                item.item.itemContent.tweet_results.result.core.user_results.result.legacy.verified = true;
              }
            });
            break;
          case entry.entryId.startsWith("who-to-follow-"):
            entry.content.items.forEach((item) => {
              if (
                budgeHidingUsers.includes(
                  item.item.itemContent.user_results.result.rest_id,
                )
              ) {
                item.item.itemContent.user_results.result.is_blue_verified = true;
                item.item.itemContent.user_results.result.legacy.verified = true;
              }
            });
            break;
        }
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("TweetDetail")) {
    try {
      const res = JSON.parse(response.text);
      const targetIndex =
        res.data.threaded_conversation_with_injections_v2.instructions.findIndex(
          (instruction) => instruction.type === "TimelineAddEntries",
        );
      res.data.threaded_conversation_with_injections_v2.instructions[
        targetIndex
      ].entries.forEach((entry) => {
        switch (true) {
          case entry.entryId.startsWith("tweet-"):
            if (
              entry.content.itemContent.tweet_results.result.__typename ===
              "Tweet"
            ) {
              if (
                budgeHidingUsers.includes(
                  entry.content.itemContent.tweet_results.result.core
                    .user_results.result.rest_id,
                )
              ) {
                entry.content.itemContent.tweet_results.result.core.user_results.result.is_blue_verified = true;
                entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.verified = true;
              }
            }
            break;
          case entry.entryId.startsWith("conversationthread-"):
            entry.content.items.forEach((item) => {
              if (
                budgeHidingUsers.includes(
                  item.item.itemContent.tweet_results.result.core.user_results
                    .result.rest_id,
                )
              ) {
                item.item.itemContent.tweet_results.result.core.user_results.result.is_blue_verified = true;
                item.item.itemContent.tweet_results.result.core.user_results.result.legacy.verified = true;
              }
            });
            break;

          case entry.entryId.startsWith("tweetdetailrelatedtweets-"):
            entry.content.items.forEach((item) => {
              if (
                budgeHidingUsers.includes(
                  item.item.itemContent.tweet_results.result.core.user_results
                    .result.rest_id,
                )
              ) {
                item.item.itemContent.tweet_results.result.core.user_results.result.is_blue_verified = true;
                item.item.itemContent.tweet_results.result.core.user_results.result.legacy.verified = true;
              }
            });
            break;
        }
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("recommendations.json")) {
    try {
      const res = JSON.parse(response.text);
      res.forEach((item) => {
        if (budgeHidingUsers.includes(item.user_id)) {
          item.user.ext_is_blue_verified = true;
          item.user.verified = true;
        }
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("all.json")) {
    try {
      const res = JSON.parse(response.text);
      Object.entries(res.globalObjects.users).forEach(([key]) => {
        if (budgeHidingUsers.includes(res.globalObjects.users[key].id_str)) {
          res.globalObjects.users[key].ext_is_blue_verified = true;
          res.globalObjects.users[key].verified = true;
        }
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (request.url.includes("typeahead.json")) {
    try {
      const res = JSON.parse(response.text);
      Object.entries(res.users).forEach(([key]) => {
        if (budgeHidingUsers.includes(res.users[key].id_str)) {
          res.users[key].ext_is_blue_verified = true;
          res.users[key].verified = true;
        }
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  }
});
