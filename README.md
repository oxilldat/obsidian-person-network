# Person Network

Person Network turns person notes in an Obsidian vault into an interactive relationship map. It reads people, photos, roles, companies, contacts, and layers from frontmatter and renders them on a fast canvas graph. Use it as a standalone view or as a native view inside Bases.

[Русская версия](README.ru.md)

![Person Network graph](image/graph-overview.gif)

## Features

- Detect people by a configurable tag and frontmatter fields.
- Show photos, names, companies, roles, relationship lines, and potential contacts.
- Place people by role and attract people from the same company toward one another.
- Organize people into transparent, overlapping layers with custom names, identifiers, colors, and Obsidian icons.
- Configure independent layer sets for the standalone graph and each Bases view.
- Search and filter by role or company directly on the graph.
- Adjust node size, line width, and graph physics. Filters, physics, display settings, and camera position are saved automatically.
- Pan, zoom, drag nodes, fit the graph to the window, and export the current view to PNG.
- Frame portraits non-destructively with drag and zoom controls.
- Warn about duplicate names, unknown roles, and multiple notes marked `is_self`.
- Create notes for potential contacts from a configurable folder and template.
- Use Russian or English automatically, following the Obsidian interface language.

The force simulation and drawing loop stop after the layout settles, so an idle graph does not keep using CPU.

## Installation

Install **Person Network** from **Settings → Community plugins → Browse**.

For manual installation:

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest GitHub release.
2. Create `.obsidian/plugins/person-network/` inside your vault.
3. Copy the three files into that folder.
4. Enable Person Network under Community plugins.

## Quick start

Create one note per person and add frontmatter like this:

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
  - work
  - close-circle
---
```

Open the graph from the ribbon or run **Open person network** from the command palette. Add `is_self: true` to your own note to use it as the center node.

![Person frontmatter](image/frontmatter.gif)

## Frontmatter

| Property | Type | Purpose |
| --- | --- | --- |
| recognition tag | tag | Includes the note in Person Network. Default: `person`. |
| `name` | text | Display name. The file name is used when this is empty. |
| `photo` | text | Vault-relative path to an image. |
| `relation` | text | Selects a role configured in plugin settings. |
| `company` | text | Displays the company, enables company filtering, and applies company attraction. |
| `potential_contacts` | list | Names or wikilinks. Existing people become connections; missing people become potential-contact nodes. |
| `layers` | list | Layer identifiers assigned to this person, such as `[work, family]`. |
| `is_self` | boolean | Makes this person the center node. |

The recognition tag and the `name`, `photo`, `relation`, `potential_contacts`, and `layers` property names are configurable. `company` and `is_self` are fixed.

## Roles

A role controls a person's ring and radial position. Each role has a ring color, a solid/dashed/dotted style, and a position score from 1 to 10. A higher score places the person closer to the center. The value of the relation property must match the role name. Unmatched values use the default role and produce a warning.

![Role settings](image/settings-roles.gif)

## Layers

Layers visually group people without changing graph physics. Create a layer in **Settings → Person Network → Layers**, give it a unique identifier, then add that identifier to the shared layer property in person notes:

```yaml
layers:
  - family
  - project-alpha
```

Each layer has a name, identifier, color, Obsidian icon, priority, label visibility, and icon visibility. A layer with at least two visible people is drawn as a translucent rounded area. Areas can overlap, and priority controls their drawing order.

The layer button on the graph opens a compact panel. The eye button hides only the area; the person button hides the layer members. Right-click a person to add or remove them from a layer. This updates the shared frontmatter list.

Layer definitions are independent for the standalone graph and each Bases view. Choose the target with **View** in the Layers settings. Membership always comes from the same shared frontmatter property.

## Graph controls

Open the control panel with the gear button:

- **Filters** — search people and filter by role or company.
- **Display** — show or hide relationship lines and potential contacts; change node size and line thickness.
- **Forces** — change link distance, repulsion, link strength, center attraction, and company attraction.

The wand button replays the appearance animation. Double-click empty graph space to fit visible nodes into the window. Controls and camera position are stored automatically.

![Graph controls](image/control-panel.gif)

## Contacts and connections

Add names or wikilinks to the contacts property. Person Network resolves note paths and aliases before matching display names. A matching person becomes a connection. A missing person becomes a potential-contact node; click it to create a note using the configured folder and template.

## Photo framing

Right-click a person and choose **Edit photo crop**. Drag the image inside the square, adjust zoom, and save. Person Network stores only framing values in its local `data.json`; it does not modify or duplicate the image. The editor also works for the central `is_self` person.

## Bases integration

With the Bases core plugin enabled, select **Person Network** as a Bases view. Base filters determine which notes appear, while view options map the name, photo, relation, and contacts properties. Each Bases view has its own layer definitions. Bases integration can be disabled in settings and requires a plugin or Obsidian reload to apply.

![Person Network in Bases](image/bases-view.gif)

## Privacy

Person Network works locally inside your vault. It makes no network requests, requires no account, displays no ads, and collects no telemetry.
