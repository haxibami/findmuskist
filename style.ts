import { isTopTabPath } from "./constant";
import css from "data-text:~hovercard.css";

export const setHovercardCss = () => {
  if (isTopTabPath.test(location.href)) {
    const hovercardCss = document.getElementById("muskist-hovercard-css");
    if (!hovercardCss) {
      const badgeStyle = document.createElement("style");
      badgeStyle.id = "muskist-hovercard-css";
      badgeStyle.textContent = css;
      const target = document.head || document.documentElement;
      target.appendChild(badgeStyle);
    }
  }
};

export const setGlobalCss = () => {
  let globalStyle = document.getElementById("muskist-global");
  if (!globalStyle) {
    globalStyle = document.createElement("style");
    globalStyle.id = "muskist-global";
    const target = document.head || document.documentElement;
    target.appendChild(globalStyle);
  }
  const users = localStorage.getItem("muskists")?.split(",") ?? [];
  const badgeQueries = users
    .map(
      (user) =>
        `a[href="/${user}"],
          html:has(link[href="https://twitter.com/${user}"][rel="canonical"]) :is(div[data-testid="UserName"], h2[role="heading"], div[role="group"] div[data-testid="HoverCard"]),
          div[data-testid="Tweet-User-Avatar"]:has(div[data-testid="UserAvatar-Container-${user}"]) + div,
          div[id^="typeaheadDropdown"] div:has(>div[data-testid="UserAvatar-Container-${user}"]) + div`,
    )
    .join(", ");
  globalStyle.textContent = `:is(${badgeQueries}) :is(svg[data-testid="icon-verified"], svg[data-testid="verificationBadge"]) {color: red;}`;
};
