# Changelog

## 1.2.1

- Fixed the layer button and layer panel appearing above the open graph controls.
- Opening either graph controls or layers now closes the other panel.

## 1.2.0

- Added configurable visual layers with independent definitions for the standalone graph and each Bases view.
- Added layer assignment through a shared frontmatter list and the person context menu.
- Added translucent overlapping layer areas, custom colors, Obsidian icons, labels, drawing priority, and separate controls for hiding areas or members.
- Added company-based attraction with an adjustable graph physics control.
- Added a compact searchable icon picker and collapsible layer settings.
- Updated Russian and English documentation for the current feature set.

## 1.1.5

- Added a compact author card at the end of the settings page with links to Telegram, Boosty and YouTube.
- Added localized Russian and English call-to-action text and a responsive layout for narrow settings panes.

## 1.1.4

- Improved photo sharpness in cropped portraits, at high graph zoom and on high-DPI displays by retaining more source image detail in the bitmap cache.

## 1.1.3

- Fixed the photo framing editor for the central `is_self` person. The editor is now available from the self node's context menu in both the standard graph and Bases view.

## 1.1.2

- Fixed plugin unload behavior so Person Network leaves keep their workspace position when the plugin is reloaded.
- Removed deprecated dynamic slider tooltips from the photo framing editor.
- Removed an unnecessary `!important` override from the photo editor canvas styles.

## 1.1.1

- Added a non-destructive photo framing editor opened from the person context menu. Drag and zoom the image to select the square shown in the graph; framing settings are stored in plugin data without modifying the original image.
- Added persistent graph filters, camera position, display options and physics settings.
- Added warnings for multiple `is_self` notes, duplicate person names and unknown roles.
- Fixed relationship links that use note paths or aliases, unsafe ghost-note names and YAML values, empty display names, Bases name-property mapping, pop-out window dragging and stale asynchronous photo cache results.
- Improved empty states and collapsible controls.

## 1.1.0

- Added persistent graph filters, camera position, display options and force settings.
- Added a non-destructive photo framing editor. Crop position and zoom are stored in plugin data; image files remain unchanged.
- Added warnings for duplicate person names, unknown roles and multiple `is_self` notes.
- Fixed contact links that use note paths or aliases.
- Fixed note creation for names containing YAML and filesystem-sensitive characters.
- Fixed empty display names, Bases name-property mapping, pop-out window dragging and asynchronous photo cache invalidation.
- Improved empty-state presentation and collapse controls.

## 1.0.1

- Maintenance release.
