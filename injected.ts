// wraps XMLHttpRequest to modify the response

import xhook from "xhook";
import { processTimeline, timelineKeys, getTimeline } from "./timeline";

import { setHovercardCss, setGlobalCss } from "./style";

setGlobalCss();

xhook.after((request, response) => {
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

  const muskistsStr = localStorage.getItem("muskists");
  const muskists = muskistsStr?.split(",");

  if (
    url.pathname.startsWith("/i/api/graphql/") ||
    url.pathname.startsWith("/graphql/")
  ) {
    // filter graphql requests
    const apiPath = url.pathname.split("/").slice(-1)[0];
    if (apiPath === "UserByScreenName" || apiPath === "UserByRestId") {
      // user profile
      try {
        const res = JSON.parse(response.text);
        if (
          res.data.user.result.is_blue_verified === false &&
          !res.data.user.result.legacy.verified_type
        ) {
          if (
            Object.hasOwn(res.data.user.result, "verification_info") &&
            Object.hasOwn(res.data.user.result.verification_info, "reason")
          ) {
            if (
              !muskists ||
              !muskists.includes(res.data.user.result.legacy.screen_name)
            ) {
              localStorage.setItem(
                "muskists",
                `${muskistsStr ? `${muskistsStr},` : ""}${res.data.user.result.legacy.screen_name}`,
              );
              setGlobalCss();
            }
            res.data.user.result.is_blue_verified = true;
            // res.data.user.result.legacy.verified = true;
            // res.data.user.result.verification_info.is_identity_verified = true;
            // res.data.user.result.has_hidden_subscriptions_on_profile = false;
            setHovercardCss();
            response.text = JSON.stringify(res);
          } else if (
            res.data.user.result.highlights_info.can_highlight_tweets ===
              true ||
            res.data.user.result.has_hidden_subscriptions_on_profile === true ||
            res.data.user.result.has_hidden_likes_on_profile === true
          ) {
            if (
              !muskists ||
              !muskists.includes(res.data.user.result.legacy.screen_name)
            ) {
              localStorage.setItem(
                "muskists",
                `${muskistsStr ? `${muskistsStr},` : ""}${res.data.user.result.legacy.screen_name}`,
              );
              setGlobalCss();
            }
            res.data.user.result.is_blue_verified = true;

            setHovercardCss();
            response.text = JSON.stringify(res);
          } else {
            if (muskists.includes(res.data.user.result.legacy.screen_name)) {
              localStorage.setItem(
                "muskists",
                muskists
                  .filter((x) => x !== res.data.user.result.legacy.screen_name)
                  .join(","),
              );
            }
          }
        }
      } catch (e) {
        console.error(`Error with ${request.url}: ${e}`);
      }
    } else if (Object.keys(timelineKeys).some((key) => apiPath === key)) {
      // timeline
      try {
        const res = JSON.parse(response.text);
        const timeline = getTimeline(res, apiPath);
        processTimeline(timeline);
        response.text = JSON.stringify(res);
      } catch (e) {
        console.error(`Error with ${request.url}: ${e}`);
      }
    } else if (apiPath === "UsersByRestIds") {
      // user lists
      try {
        const res = JSON.parse(response.text);
        for (const user of res.data.users) {
          if (
            Object.hasOwn(user, "result") &&
            muskists?.includes(user.result.legacy.screen_name)
          ) {
            user.result.is_blue_verified = true;
          }
        }
        response.text = JSON.stringify(res);
      } catch (e) {
        console.error(`Error with ${request.url}: ${e}`);
      }
    } else if (apiPath === "TweetResultByRestId") {
      // tweet detail
      try {
        const res = JSON.parse(response.text);
        if (
          muskists?.includes(
            res.data.tweetResult.result.core.user_results.result.legacy
              .screen_name,
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
        const res = JSON.parse(response.text);
        if (Object.keys(res.globalObjects).length !== 0) {
          for (const [key] of Object.entries(res.globalObjects.users)) {
            if (muskists?.includes(res.globalObjects.users[key].screen_name)) {
              res.globalObjects.users[key].ext_is_blue_verified = true;
            }
          }
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
        const res = JSON.parse(response.text);
        for (const item of res) {
          if (muskists?.includes(item.user.screen_name)) {
            item.user.ext_is_blue_verified = true;
          }
        }
        response.text = JSON.stringify(res);
      } catch (e) {
        console.error(`Error with ${request.url}: ${e}`);
      }
    } else if (url.pathname === "/i/api/1.1/friends/following/list.json") {
      // following list
      try {
        const res = JSON.parse(response.text);
        for (const user of res.users) {
          if (muskists?.includes(user.screen_name)) {
            user.ext_is_blue_verified = true;
          }
        }
      } catch (e) {
        console.error(`Error with ${request.url}: ${e}`);
      }
    } else if (url.pathname === "/i/api/1.1/search/typeahead.json") {
      // search suggestions
      try {
        const res = JSON.parse(response.text);
        for (const [key] of Object.entries(res.users)) {
          if (muskists?.includes(res.users[key].screen_name)) {
            res.users[key].ext_is_blue_verified = true;
          }
        }
        response.text = JSON.stringify(res);
      } catch (e) {
        console.error(`Error with ${request.url}: ${e}`);
      }
    } else if (url.pathname === "/i/api/1.1/dm/inbox_initial_state.json") {
      // DM inbox
      try {
        const res = JSON.parse(response.text);
        for (const [key] of Object.entries(res.inbox_initial_state.users)) {
          if (
            muskists?.includes(res.inbox_initial_state.users[key].screen_name)
          ) {
            res.inbox_initial_state.users[key].is_blue_verified = true;
          }
        }
        response.text = JSON.stringify(res);
      } catch (e) {
        console.error(`Error with ${request.url}: ${e}`);
      }
    }
  }
});
