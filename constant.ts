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
  "topics",
];

// match: https://twitter.com/username
// match: https://twitter.com/username/{userTopTabPaths}
// match: https://twitter.com/username/{userTopPaths}
// not match: https://twitter.com/{reservedPaths}
export const isMovingToProf = new RegExp(
  `^https:\/\/twitter\.com\/(?!(?:${reservedPaths.join(
    "|",
  )})$)([a-zA-Z0-9_]+)(?:\/(${userTopTabPaths.join(
    "|",
  )}))?(?:\/(${userTopPaths.join("|")}))?$`,
);

// match: https://twitter.com/username/{userTopPaths}
// not match: https://twitter.com/username
// not match: https://twitter.com/username/{userTopTabPaths}
export const isTopPath = new RegExp(
  `^https:\/\/twitter\.com\/(?!(?:${reservedPaths.join(
    "|",
  )})$)([a-zA-Z0-9_]+)\/(${userTopPaths.join("|")})$`,
);

// important => match: https://twitter.com/username
// match: https://twitter.com/username/{userTopTabPaths}
// not match: https://twitter.com/username/{userTopPaths}
export const isTopTabPath = new RegExp(
  `^https:\/\/twitter\.com\/(?!(?:${reservedPaths.join(
    "|",
  )})$)([a-zA-Z0-9_]+)(?:\/(${userTopTabPaths.join("|")}))?$`,
);
