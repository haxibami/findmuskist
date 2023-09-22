// wraps XMLHttpRequest to modify the response

import xhook from "xhook";
import {
  processTimeline,
  setBadgeCss,
  timelineKeys,
  getTimeline,
} from "./timeline";

xhook.after(function (request, response) {
  const url = new URL(request.url);
  if (
    response.status !== 200 ||
    url.hostname !== "twitter.com" ||
    !url.pathname.startsWith("/i/api/")
  ) {
    return;
  }
  const apiPath = url.pathname.split("/").slice(-1)[0];
  if (apiPath === "UserByScreenName" || apiPath === "UserByRestId") {
    try {
      // user profile
      let res = JSON.parse(response.text);
      if (
        res.data.user.result.is_blue_verified === false &&
        !res.data.user.result.legacy.verified_type
      ) {
        if (
          Object.hasOwn(res.data.user.result, "verification_info") &&
          Object.hasOwn(res.data.user.result.verification_info, "reason")
        ) {
          if (!localStorage.getItem(res.data.user.result.rest_id)) {
            localStorage.setItem(res.data.user.result.rest_id, "true");
          }
          res.data.user.result.is_blue_verified = true;
          // res.data.user.result.legacy.verified = true;
          // res.data.user.result.verification_info.is_identity_verified = true;
          // res.data.user.result.has_hidden_subscriptions_on_profile = false;
          res.data.user.result.verification_info.reason.description.text +=
            "。また、認証バッジを非表示にしています。";

          setBadgeCss();
          response.text = JSON.stringify(res);
        } else if (
          res.data.user.result.highlights_info.can_highlight_tweets === true ||
          res.data.user.result.has_hidden_subscriptions_on_profile === true ||
          res.data.user.result.has_hidden_likes_on_profile === true
        ) {
          if (!localStorage.getItem(res.data.user.result.rest_id)) {
            localStorage.setItem(res.data.user.result.rest_id, "true");
          }
          res.data.user.result.is_blue_verified = true;
          setBadgeCss();
          response.text = JSON.stringify(res);
        }
      }
      // TODO: remove from localStorage when `verification_info.reason`
      // nor `highlights_info.can_highlight_tweets` is found
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (apiPath === "UsersByRestIds") {
    try {
      let res = JSON.parse(response.text);
      res.data.users.forEach((user) => {
        if (localStorage.getItem(user.result.rest_id)) {
          user.result.is_blue_verified = true;
          // user.legacy.verified = true;
        }
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (Object.keys(timelineKeys).some((key) => apiPath === key)) {
    try {
      let res = JSON.parse(response.text);
      const timeline = getTimeline(res, apiPath);
      processTimeline(timeline);
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (apiPath === "TweetResultByRestId") {
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
      }
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (apiPath === "CommunitiesCreateButtonQuery") {
    try {
      let res = JSON.parse(response.text);
      res.data.viewer.create_community_action_result = {
        __typename: "CommunityCreateActionAvailable",
        __isCommunityCreateActionResult: "CommunityCreateActionAvailable",
        // reason: "Verified",
      };
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (url.pathname.endsWith("/i/api/1.1/users/recommendations.json")) {
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
  } else if (
    url.pathname.endsWith("/i/api/2/notifications/all.json") ||
    url.pathname.endsWith("/i/api/2/notifications/verified.json") ||
    url.pathname.endsWith("/i/api/2/notifications/mentions.json")
  ) {
    try {
      // notifications
      // target: res.globalObjects.users[n].ext_is_blue_verified
      let res = JSON.parse(response.text);
      if (Object.keys(res.globalObjects).length !== 0) {
        Object.entries(res.globalObjects.users).forEach(([key]) => {
          if (localStorage.getItem(res.globalObjects.users[key].id_str)) {
            res.globalObjects.users[key].ext_is_blue_verified = true;
          }
        });
        response.text = JSON.stringify(res);
      }
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (url.pathname.endsWith("/i/api/1.1/friends/following/list.json")) {
    try {
      // following list
      // target: res.users[n].ext_is_blue_verified
      let res = JSON.parse(response.text);
      res.users.forEach((user) => {
        if (localStorage.getItem(user.id_str)) {
          user.ext_is_blue_verified = true;
          response.text = JSON.stringify(res);
        }
      });
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (url.pathname.endsWith("/i/api/1.1/search/typeahead.json")) {
    try {
      // search suggestions
      // target: res.users[n].ext_is_blue_verified
      let res = JSON.parse(response.text);
      Object.entries(res.users).forEach(([key]) => {
        if (localStorage.getItem(res.users[key].id_str)) {
          res.users[key].ext_is_blue_verified = true;
        }
      });
      response.text = JSON.stringify(res);
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  } else if (url.pathname.endsWith("/i/api/1.1/dm/inbox_initial_state.json")) {
    try {
      let res = JSON.parse(response.text);
      Object.entries(res.inbox_initial_state.users).forEach(([key]) => {
        if (localStorage.getItem(res.inbox_initial_state.users[key].id_str)) {
          res.inbox_initial_state.users[key]._is_blue_verified = true;
        }
      });
    } catch (e) {
      console.error(`Error with ${request.url}: ${e}`);
    }
  }
});
