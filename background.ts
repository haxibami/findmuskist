export {};

// When tab URL is updated, send message to content script
let lastVisitedProfUrl: string | null = null;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  const reservedPaths = [
    "home",
    "explore",
    "notifications",
    "messages",
    "i",
    "settings",
    "compose",
    "search",
  ];
  const userTopTabPaths = ["with_replies", "media", "highlights", "likes"];
  const userTopPaths = [
    "followers",
    "following",
    "verified_followers",
    "followers_you_follow",
    "lists",
    "moments",
    "topics",
  ];

  // match: https://twitter.com/username
  // match: https://twitter.com/username/{userTopTabPaths}
  // match: https://twitter.com/username/{userTopPaths}
  // not match: https://twitter.com/{reservedPaths}
  const isMovingToProf = new RegExp(
    `^https:\/\/twitter\.com\/(?!(?:${reservedPaths.join(
      "|",
    )})$)([a-zA-Z0-9_]+)(?:\/(${userTopTabPaths.join(
      "|",
    )}))?(?:\/(${userTopPaths.join("|")}))?$`,
  );

  // match: https://twitter.com/username/{userTopPaths}
  // not match: https://twitter.com/username
  // not match: https://twitter.com/username/{userTopTabPaths}
  const regex2 = new RegExp(
    `^https:\/\/twitter\.com\/(?!(?:${reservedPaths.join(
      "|",
    )})$)([a-zA-Z0-9_]+)\/(${userTopPaths.join("|")})$`,
  );

  if (changeInfo.status === "complete" && isMovingToProf.test(tab.url)) {
    if (lastVisitedProfUrl !== tab.url) {
      if (lastVisitedProfUrl) {
        const lastVisitedUserName = lastVisitedProfUrl.split("/")[3];
        const currentUserName = tab.url.split("/")[3];
        if (lastVisitedUserName !== currentUserName || regex2.test(tab.url)) {
          chrome.tabs.sendMessage(tabId, {
            type: "movedToProfile",
            url: tab.url,
          });
        }
      } else {
        if (regex2.test(tab.url)) {
          chrome.tabs.sendMessage(tabId, {
            type: "movedToProfile",
            url: tab.url,
          });
        }
      }
      lastVisitedProfUrl = tab.url;
    } else {
      if (regex2.test(tab.url)) {
        chrome.tabs.sendMessage(tabId, {
          type: "movedToProfile",
          url: tab.url,
        });
      }
    }
  }
});
