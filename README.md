# Person Network

Person Network turns notes about people into an interactive relationship map in Obsidian. It works locally, reads data from frontmatter, and can be opened as a standalone graph or as a custom view inside Bases.

[Русская версия](README.ru.md)

![Person Network graph](image/graph-overview.gif)

## Features

- Two layouts: rotating planetary orbits and a free spatial layout with group circles.
- Photos, names, companies, roles, connections, and potential contacts.
- A personal note selected in the plugin settings, with no special frontmatter flag required.
- Filters for any frontmatter property with all/any matching.
- Independent group sets for the standalone graph and every Bases view.
- Smooth focus for a person's connections or members of the same company on hover.
- Non-destructive photo framing that leaves the original image unchanged.
- Automatic persistence of filters, zoom, camera position, and display options.
- PNG export of the current graph.
- Russian and English interface matching the Obsidian language.

## Installation

Install **Person Network** from **Settings → Community plugins → Browse**.

For manual installation:

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest GitHub release.
2. Create `.obsidian/plugins/person-network/` inside your vault.
3. Copy the three files into that folder.
4. Enable Person Network under Community plugins.

## Quick start

Create one note per person and add frontmatter:

```yaml
---
tags:
  - person
name: Jane Doe
photo: attachments/jane.jpg
company: Acme Corp
relation: friend
potential_contacts:
  - John Smith
  - "[[People/Kyle Reese|Kyle Reese]]"
layers:
  - family
  - work
---
```

Open the graph from the ribbon or run **Open person network** from the command palette. Then select your personal note in the plugin settings.

![Person note properties](image/frontmatter.png)

## Note data

| Property | Type | Purpose |
| --- | --- | --- |
| recognition tag | tag | Includes the note in the graph. Default: `person`. |
| `name` | text | Name displayed on the card. The file name is used when empty. |
| `photo` | text | Vault-relative path to an image. |
| `relation` | text | A role configured in the plugin settings. |
| `company` | text | Company displayed below the person's name. |
| `potential_contacts` | list | Names or wikilinks of connected people. |
| `layers` | list | Group identifiers assigned to the person. |

The recognition tag and the `name`, `photo`, `relation`, `potential_contacts`, and `layers` property names are configurable. The `company` property name is fixed.

## Layouts

### Orbit

The personal note stays in the center. Everyone else is placed on rings according to the role position score from 1 to 10. People from the same company occupy neighboring sections of an orbit. Cards rotate with their connections; rotation can be disabled in the **Display** panel.

The orbital layout uses fixed geometry and does not depend on force simulation. Group controls are hidden in this layout.

### Space

The personal note becomes a regular graph member. Visible groups are drawn as translucent Euler circles: a member of one group remains inside that circle, a shared member stays in the intersection, and a person without a visible group remains outside all circles.

The two highest-priority visible groups are drawn at the same time. A group with only one visible member remains in the list but does not draw a circle.

## Roles

A role controls the card border color and style. Its position score from 1 to 10 also selects the person's orbit: a higher value places the person closer to the center.

The `relation` value must match a configured role name. An unknown value uses the default style and produces a warning.

![Role settings](image/settings-roles.png)

## Groups

Groups are configured for the **Space** layout. Each group has a name, unique identifier, color, and priority. Assign members through the shared frontmatter list:

```yaml
layers:
  - family
  - project-alpha
```

The groups button opens a compact graph panel. The eye button hides the circle, while the person button hides all group members. Group definitions are independent for the standalone graph and each Bases view; membership always comes from the shared frontmatter property.

## Filters and display

Open the graph panel with the gear button.

- **Filters** searches people and creates conditions for any frontmatter property. Conditions can match all rules or any rule.
- **Display** switches the layout, relationship lines, and potential contacts, and adjusts card size and line thickness. Orbit rotation is also controlled here.

![Filters and display settings](image/control-panel.gif)

Hover over a person to fade unrelated cards and reveal their connections. Hover over a company name to focus people from that company. Hold `Shift` when the tooltip covers useful graph content.

Double-click empty space to fit the graph into the view. Use the mouse wheel to zoom and drag empty space to pan.

## Contacts

The contacts property accepts plain names and wikilinks. Person Network resolves note paths and aliases. A matched person becomes a connection; an unmatched name becomes a potential contact.

Click a potential contact to create a note. The destination folder and template note are configurable. Use `{{name}}` inside the template to insert the person's name.

## Photos

Right-click a person and choose **Edit photo crop**. Move the photo inside the square and adjust zoom. Person Network stores only framing values in `data.json`; it does not modify or duplicate the source image.

The editor is also available for the personal note at the center of the orbital layout.

## Bases

With the Bases core plugin enabled, select **Person Network** as a Bases view. Bases filters determine which notes appear, while view options map the name, photo, relation, and contacts properties. Every Bases view has its own group definitions and saved graph state.

Bases integration can be disabled in the Person Network settings. Reload the plugin or Obsidian after changing this option.

![Person Network in Bases](image/bases-view.png)

## Privacy

Person Network works locally inside the vault. It makes no network requests, requires no account, displays no ads, and collects no telemetry.
