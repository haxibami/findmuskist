(function (xhr) {
  var XHR = XMLHttpRequest.prototype;

  var open = XHR.open;
  var send = XHR.send;
  var setRequestHeader = XHR.setRequestHeader;

  XHR.open = function (method, url) {
    this._method = method;
    this._url = url;
    this._requestHeaders = {};
    this._startTime = new Date().toISOString();

    return open.apply(this, arguments);
  };

  XHR.setRequestHeader = function (header, value) {
    this._requestHeaders[header] = value;
    return setRequestHeader.apply(this, arguments);
  };

  XHR.send = function (postData) {
    this.addEventListener("load", function () {
      var endTime = new Date().toISOString();

      var myUrl = this._url;
      if (myUrl && myUrl.includes("UserByScreenName")) {
        var responseHeaders = this.getAllResponseHeaders();

        if (this.responseType != "blob" && this.responseText) {
          try {
            var arr = this.responseText;

            console.log(this._url);
            // JSON.parse(arr).data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.core.user_results.result.
            const vf_info =
              // JSON.parse(arr).data.user.result.highlights_info.can_highlight_tweets;
              JSON.parse(arr).data.user.result.verification_info;
            console.log(vf_info);
            if (
              Object.keys(vf_info).length !== 0 &&
              document.querySelectorAll("[data-testid='icon-verified']")
                .length == 0
            ) {
              const userNameEl = document.querySelectorAll(
                "[data-testid='UserName']",
              )[0].children[0].children[0].children[0].children[0].children[0]
                .children[0].lastChild.children[0].children[0];
              const injectEl = document.createElement("div");
              injectEl.style =
                "display:inline-flex; align-items: stretch; box-sizing: border-box; flex-basis: auto; flex-direction: column; flex-shrink: 0";
              const boxEl = document.createElement("div");
              // boxEl.className = "hoge";
              boxEl.style =
                "margin-left: 2px; outline-style: none; display: flex; align-items: stretch; box-sizing: border-box; flex-basis: auto; flex-direction: column; flex-shrink: 0; cursor: pointer;";
              boxEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-label="認証済みアカウント" role="img" class="" data-testid="icon-verified" style="max-width: 20px; max-height: 20px; user-select: none; vertical-align: text-bottom; position: relative; height: 1.25em; display: inline-block; color:red" viewBox="0 0 22 22">
  <path d="M20.396 11a3.487 3.487 0 0 0-2.008-3.062 3.474 3.474 0 0 0-.742-3.584 3.474 3.474 0 0 0-3.584-.742A3.468 3.468 0 0 0 11 1.604a3.463 3.463 0 0 0-3.053 2.008 3.472 3.472 0 0 0-1.902-.14c-.635.13-1.22.436-1.69.882a3.461 3.461 0 0 0-.734 3.584A3.49 3.49 0 0 0 1.604 11a3.496 3.496 0 0 0 2.017 3.062 3.471 3.471 0 0 0 .733 3.584 3.49 3.49 0 0 0 3.584.742A3.487 3.487 0 0 0 11 20.396a3.476 3.476 0 0 0 3.062-2.007 3.335 3.335 0 0 0 4.326-4.327A3.487 3.487 0 0 0 20.396 11zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
</svg>`;
              injectEl.appendChild(boxEl);
              userNameEl.appendChild(injectEl);
            }
          } catch (err) {
            console.log("Error in parsing API response");
            console.log(err);
          }
        }
      }
    });

    return send.apply(this, arguments);
  };
})(XMLHttpRequest);
