# findmuskist

## TL;DR

Identify users who hide their blue checkmark.

## What is this?

The bird has gone, but the resisters have not.

Despite the addition of `Hide your blue checkmark` option, it's still possible to see whether a user is subscribed to ~~Twitter~~ X by simply reading API response.

This extension does that and shows red checkmark for hidden Muskists - users who subscribe to X but hide the blue checkmark.

![sample](https://raw.githubusercontent.com/haxibami/findmuskist/main/asset/sample.png)

## Limitations

Currently you can identify Muskists only on **profile page** (by `/UserByScreenName` GraphQL response), but not on timeline.

## Development / Build

```sh
pnpm i
pnpm run build
```

You can load the extension from `./dist` directory.

Note: On Firefox, you may need to grant some permissions from `about:addons` page.
