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
  const hrefs = users
    .map(
      (user) =>
        `a[href="/${user}"],
          div[data-testid^="typeahead"] div:has(>div[data-testid="UserAvatar-Container-${user}"]) + div,
          div[data-testid="Tweet-User-Avatar"]:has(div[data-testid="UserAvatar-Container-${user}"]) + div`,
    )
    .join(", ");
  globalStyle.textContent = `:is(${hrefs}) svg[data-testid="icon-verified"] {color: red;}`;
};
