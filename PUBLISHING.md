# Publishing Person Network

Person Network is already listed in the Obsidian Community directory. Updates are delivered through GitHub Releases; do not create another directory submission.

Repository: https://github.com/oxilldat/obsidian-person-network

## Release process

1. Commit the reviewed source to the default `main` branch.
2. Confirm that `package.json`, `package-lock.json` and `manifest.json` use the same version, and that `versions.json` maps it to the required Obsidian version.
3. Push `main` to GitHub.
4. Create a tag matching the manifest version from that exact commit and push the tag.
5. GitHub Actions runs tests, verifies the tag, creates a minified production build and publishes the release.
6. Verify that the release contains `main.js`, `manifest.json` and `styles.css` as three individual downloadable assets.
7. Open https://community.obsidian.md/plugins/person-network and confirm that the new version becomes available.

The workflow can safely be rerun for the same tag: it replaces the three release assets without deleting the release.

For every later release, increment the semantic version, update `versions.json` and `CHANGELOG.md`, merge to `main`, then push a matching tag. The Community directory reads updates from GitHub automatically.
