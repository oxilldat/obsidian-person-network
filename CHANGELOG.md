# Changelog

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
