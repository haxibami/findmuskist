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
    (url.hostname !== "twitter.com" && url.hostname !== "api.twitter.com") ||
    !(
      url.pathname.startsWith("/i/api/") || url.pathname.startsWith("/graphql/")
    )
  ) {
    // deny except twitter.com/i/api/* and api.twitter.com/graphql/*
    return;
  }
  if (
    url.pathname.startsWith("/i/api/graphql/") ||
    url.pathname.startsWith("/graphql/")
  ) {
    // filter graphql requests
    const apiPath = url.pathname.split("/").slice(-1)[0];
    if (apiPath === "UserByScreenName" || apiPath === "UserByRestId") {
      // user profile
      try {
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
            setBadgeCss();
            response.text = JSON.stringify(res);
          } else if (
            res.data.user.result.highlights_info.can_highlight_tweets ===
              true ||
            res.data.user.result.has_hidden_subscriptions_on_profile === true ||
            res.data.user.result.has_hidden_likes_on_profile === true
          ) {
            if (!localStorage.getItem(res.data.user.result.rest_id)) {
              localStorage.setItem(res.data.user.result.rest_id, "true");
            }
            res.data.user.result.is_blue_verified = true;

            setBadgeCss();
            response.text = JSON.stringify(res);
          } else {
            if (localStorage.getItem(res.data.user.result.rest_id)) {
              localStorage.removeItem(res.data.user.result.rest_id);
            }
          }
        }
      } catch (e) {
        console.error(`Error with ${request.url}: ${e}`);
      }
    } else if (Object.keys(timelineKeys).some((key) => apiPath === key)) {
      // timeline
      try {
        let res = JSON.parse(response.text);
        let timeline = getTimeline(res, apiPath);
        processTimeline(timeline);
        response.text = JSON.stringify(res);
      } catch (e) {
        console.error(`Error with ${request.url}: ${e}`);
      }
    } else if (apiPath === "UsersByRestIds") {
      // user lists
      try {
        let res = JSON.parse(response.text);
        res.data.users.forEach((user) => {
          if (
            Object.hasOwn(user, "result") &&
            localStorage.getItem(user.result.rest_id)
          ) {
            user.result.is_blue_verified = true;
          }
        });
        response.text = JSON.stringify(res);
      } catch (e) {
        console.error(`Error with ${request.url}: ${e}`);
      }
    } else if (apiPath === "TweetResultByRestId") {
      // tweet detail
      try {
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
    }
  } else if (url.pathname.startsWith("/i/api/2/")) {
    // filter api v2 requests
    if (
      url.pathname === "/i/api/2/notifications/all.json" ||
      url.pathname === "/i/api/2/notifications/verified.json" ||
      url.pathname === "/i/api/2/notifications/mentions.json"
    ) {
      // notifications
      try {
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
    }
  } else if (url.pathname.startsWith("/i/api/1.1/")) {
    // filter api v1 requests
    if (url.pathname === "/i/api/1.1/users/recommendations.json") {
      // recommended users
      try {
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
    } else if (url.pathname === "/i/api/1.1/friends/following/list.json") {
      // following list
      try {
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
    } else if (url.pathname === "/i/api/1.1/search/typeahead.json") {
      // search suggestions

      try {
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
    } else if (url.pathname === "/i/api/1.1/dm/inbox_initial_state.json") {
      // DM inbox
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
  }
});
