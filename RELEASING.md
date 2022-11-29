# Releasing

Notes on how to release changes.

Last updated 2022/11/29

## Typescript changes/`expo publish`able:

- Verify the continous deployment github-action is working. It should auto-publish the changes. https://github.com/erosson/freecbt/actions/workflows/deploy.yml
  - That is, _do nothing_: the master branch is auto-published.
- You can also manually run `yarn deploy`

## Complex changes/not `expo publish`able:

Releasing a new build with big updates/that requires a new appstore deployment

- `yarn build:android`
  - TODO: https://play.google.com/console/
  - pretty easy iirc, but manual
- `yarn build:ios`
  - TODO: build and sign and upload. requires a mac...
  - I used to use https://macincloud.com/ , but they ate my remaining pay-as-you-go credit and it's minimum $30 to get more
  - open-source signers exist now, but it looks fragile: https://github.com/sauce-archives/isign
  - `eas submit` might be our ticket? https://docs.expo.dev/submit/introduction/
- `yarn build:apk`
  - Upload to the releases page. https://github.com/erosson/freecbt/releases
  - There's a github-action that should automate this, but it's been broken for a while (since our big expo 47 update). https://github.com/erosson/freecbt/blob/master/.github/workflows/apk.yml
