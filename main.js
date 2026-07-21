/* Person Network — bundled build. Source: src/ in this repository. */

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PersonNetworkPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian14 = require("obsidian");

// src/bases/graph-bases-view.ts
var import_obsidian4 = require("obsidian");

// src/i18n/en.ts
var en = {
  "common.cancel": "Cancel",
  "common.create": "Create",
  "common.remove": "Remove",
  "common.reset": "Reset",
  "common.close": "Close",
  "view.displayName": "Person network",
  "view.ribbonTooltip": "Open person network",
  "view.openCommand": "Open person network",
  "view.exportAction": "Export as PNG",
  "view.filterAction": "Filters",
  "view.defaultCenterLabel": "You",
  "view.emptyTitle": "No people found",
  "view.emptyBody": 'Looking for notes tagged "#{{value}}".',
  "view.emptyHint": "Make sure your notes have matching frontmatter, for example:",
  "view.notice.exportFailed": "Export failed \u2014 nothing to export yet.",
  "view.notice.exportSuccess": "Graph exported as PNG.",
  "bases.viewName": "Person network",
  "tooltip.company": "Company: {{value}}",
  "tooltip.relation": "Relation: {{value}}",
  "tooltip.position": "Position score: {{value}}/10",
  "tooltip.ghostHint": "No note yet \u2014 click to create one",
  "panel.searchPlaceholder": "Search people\u2026",
  "panel.replayAnimation": "Replay appear animation",
  "panel.resetTooltip": "Restore default settings",
  "panel.filtersHeading": "Filters",
  "panel.relationHeading": "Relation type",
  "panel.companyHeading": "Company",
  "panel.displayHeading": "Display",
  "panel.showEdges": "Show relationship lines",
  "panel.showGhosts": "Show potential contacts",
  "panel.forcesHeading": "Forces",
  "panel.linkDistance": "Link distance",
  "panel.repulsion": "Repel force",
  "panel.linkStrength": "Link force",
  "panel.centerStrength": "Center force",
  "panel.nodeSize": "Node size",
  "panel.edgeThickness": "Line thickness",
  "ghost.confirmTitle": "Create a note for {{name}}?",
  "ghost.confirmBody": "{{name}} was listed as a potential contact but doesn't have a note yet. Create one now?",
  "ghost.noticeCreated": "Created a note for {{name}}.",
  "ghost.noticeFailed": "Couldn't create a note for {{name}}.",
  "settings.personDetectionHeading": "Person detection",
  "settings.personDetectionDesc": "Controls which notes in your vault are treated as people.",
  "settings.personTag.name": "Recognition tag",
  "settings.personTag.desc": "A note is included in the graph when it has this tag. Existing tags are suggested as you type.",
  "settings.nameField.name": "Name field",
  "settings.nameField.desc": "Frontmatter field for the display name (falls back to the filename).",
  "settings.photoField.name": "Photo field",
  "settings.photoField.desc": "Frontmatter field with the vault-relative photo path.",
  "settings.relationField.name": "Relation type field",
  "settings.relationField.desc": "Frontmatter field naming this person's role \u2014 see Roles below.",
  "settings.potentialContactsField.name": "Contacts field",
  "settings.potentialContactsField.desc": "Frontmatter list field of people's names. A name with its own person note becomes a connection line; a name without one appears as a ghost node.",
  "settings.excludePaths.name": "Exclude paths",
  "settings.excludePaths.desc": "Comma-separated folders or files to skip.",
  "settings.rolesHeading": "Roles",
  "settings.rolesDesc": "Each role sets a ring color and stroke style, plus how close that person orbits the center (1-10).",
  "settings.newRolePlaceholder": "Role name (e.g. friend)",
  "settings.addRole": "Add role",
  "settings.defaultRoleName": "Default (unset / unmatched)",
  "settings.resetRolesTooltip": "Reset all roles to defaults",
  "settings.resetRolesConfirmTitle": "Reset roles to defaults?",
  "settings.resetRolesConfirmBody": "This replaces all your custom roles and the default role's color/style with the plugin's built-in defaults. This can't be undone.",
  "settings.ringStyle.solid": "Solid",
  "settings.ringStyle.dashed": "Dashed",
  "settings.ringStyle.dotted": "Dotted",
  "settings.generalHeading": "General",
  "settings.generalDesc": "Overall appearance of the graph.",
  "settings.centerLabel.name": "Center node label",
  "settings.centerLabel.desc": "Used for the center node when no note is marked is_self.",
  "settings.enableBases.name": "Bases integration",
  "settings.enableBases.desc": "Offer the graph as a view type inside Bases (requires the Bases core plugin).",
  "settings.enableBases.reloadNotice": "Reload the plugin (or Obsidian) to apply.",
  "settings.newNoteHeading": "New notes from potential contacts",
  "settings.newNoteDesc": "Used when you click a potential contact that doesn't have a note yet.",
  "settings.newNoteFolder.name": "Folder for new notes",
  "settings.newNoteFolder.desc": "Left empty creates the note in the vault root.",
  "settings.newNoteTemplatePath.name": "Template note",
  "settings.newNoteTemplatePath.desc": "Pick an existing note whose content is used as the frontmatter template; leave empty for a built-in default. Use {{name}} inside it as a placeholder for the person's name.",
  "settings.newNoteTemplatePath.placeholder": "Search a note\u2026"
};
var en_default = en;

// src/i18n/ru.ts
var ru = {
  "common.cancel": "\u041E\u0442\u043C\u0435\u043D\u0430",
  "common.create": "\u0421\u043E\u0437\u0434\u0430\u0442\u044C",
  "common.remove": "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
  "common.reset": "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C",
  "common.close": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
  "view.displayName": "\u0413\u0440\u0430\u0444 \u043B\u044E\u0434\u0435\u0439",
  "view.ribbonTooltip": "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0433\u0440\u0430\u0444 \u043B\u044E\u0434\u0435\u0439",
  "view.openCommand": "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0433\u0440\u0430\u0444 \u043B\u044E\u0434\u0435\u0439",
  "view.exportAction": "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0432 PNG",
  "view.filterAction": "\u0424\u0438\u043B\u044C\u0442\u0440\u044B",
  "view.defaultCenterLabel": "\u0412\u044B",
  "view.emptyTitle": "\u041B\u044E\u0434\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B",
  "view.emptyBody": "\u0418\u0449\u0443\u0442\u0441\u044F \u0437\u0430\u043C\u0435\u0442\u043A\u0438 \u0441 \u0442\u0435\u0433\u043E\u043C \xAB#{{value}}\xBB.",
  "view.emptyHint": "\u0423\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044C, \u0447\u0442\u043E \u0432 \u0437\u0430\u043C\u0435\u0442\u043A\u0430\u0445 \u0435\u0441\u0442\u044C \u043F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0438\u0439 frontmatter, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440:",
  "view.notice.exportFailed": "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u043D\u0435 \u0443\u0434\u0430\u043B\u0441\u044F \u2014 \u043F\u043E\u043A\u0430 \u043D\u0435\u0447\u0435\u0433\u043E \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C.",
  "view.notice.exportSuccess": "\u0413\u0440\u0430\u0444 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D \u0432 PNG.",
  "bases.viewName": "\u0413\u0440\u0430\u0444 \u043B\u044E\u0434\u0435\u0439",
  "tooltip.company": "\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u044F: {{value}}",
  "tooltip.relation": "\u0421\u0432\u044F\u0437\u044C: {{value}}",
  "tooltip.position": "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u0438: {{value}}/10",
  "tooltip.ghostHint": "\u0417\u0430\u043C\u0435\u0442\u043A\u0438 \u0435\u0449\u0451 \u043D\u0435\u0442 \u2014 \u043D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u0441\u043E\u0437\u0434\u0430\u0442\u044C",
  "panel.searchPlaceholder": "\u041F\u043E\u0438\u0441\u043A \u043B\u044E\u0434\u0435\u0439\u2026",
  "panel.replayAnimation": "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u044E \u043F\u043E\u044F\u0432\u043B\u0435\u043D\u0438\u044F",
  "panel.resetTooltip": "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E",
  "panel.filtersHeading": "\u0424\u0438\u043B\u044C\u0442\u0440\u044B",
  "panel.relationHeading": "\u0422\u0438\u043F \u0441\u0432\u044F\u0437\u0438",
  "panel.companyHeading": "\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u044F",
  "panel.displayHeading": "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435",
  "panel.showEdges": "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0441\u0432\u044F\u0437\u0438",
  "panel.showGhosts": "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u044B",
  "panel.forcesHeading": "\u0421\u0438\u043B\u044B",
  "panel.linkDistance": "\u0414\u043B\u0438\u043D\u0430 \u0441\u0432\u044F\u0437\u0435\u0439",
  "panel.repulsion": "\u0421\u0438\u043B\u0430 \u043E\u0442\u0442\u0430\u043B\u043A\u0438\u0432\u0430\u043D\u0438\u044F",
  "panel.linkStrength": "\u0421\u0438\u043B\u0430 \u0441\u0432\u044F\u0437\u0435\u0439",
  "panel.centerStrength": "\u0421\u0438\u043B\u0430 \u043F\u0440\u0438\u0442\u044F\u0436\u0435\u043D\u0438\u044F",
  "panel.nodeSize": "\u0420\u0430\u0437\u043C\u0435\u0440 \u0443\u0437\u043B\u043E\u0432",
  "panel.edgeThickness": "\u0422\u043E\u043B\u0449\u0438\u043D\u0430 \u0441\u0432\u044F\u0437\u0435\u0439",
  "ghost.confirmTitle": "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u043C\u0435\u0442\u043A\u0443 \u0434\u043B\u044F \xAB{{name}}\xBB?",
  "ghost.confirmBody": "\xAB{{name}}\xBB \u0443\u043A\u0430\u0437\u0430\u043D(\u0430) \u043A\u0430\u043A \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0430\u043A\u0442, \u043D\u043E \u0441\u0432\u043E\u0435\u0439 \u0437\u0430\u043C\u0435\u0442\u043A\u0438 \u0435\u0449\u0451 \u043D\u0435\u0442. \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441?",
  "ghost.noticeCreated": "\u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u0434\u043B\u044F \xAB{{name}}\xBB \u0441\u043E\u0437\u0434\u0430\u043D\u0430.",
  "ghost.noticeFailed": "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u043C\u0435\u0442\u043A\u0443 \u0434\u043B\u044F \xAB{{name}}\xBB.",
  "settings.personDetectionHeading": "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043B\u044E\u0434\u0435\u0439",
  "settings.personDetectionDesc": "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0435\u0442, \u043A\u0430\u043A\u0438\u0435 \u0437\u0430\u043C\u0435\u0442\u043A\u0438 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0441\u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u043B\u044E\u0434\u044C\u043C\u0438.",
  "settings.personTag.name": "\u0422\u0435\u0433 \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u0432\u0430\u043D\u0438\u044F",
  "settings.personTag.desc": "\u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u043F\u043E\u043F\u0430\u0434\u0430\u0435\u0442 \u0432 \u0433\u0440\u0430\u0444, \u0435\u0441\u043B\u0438 \u0443 \u043D\u0435\u0451 \u0435\u0441\u0442\u044C \u044D\u0442\u043E\u0442 \u0442\u0435\u0433. \u0421\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u0442\u0435\u0433\u0438 \u043F\u043E\u0434\u0441\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u043F\u0440\u0438 \u0432\u0432\u043E\u0434\u0435.",
  "settings.nameField.name": "\u041F\u043E\u043B\u0435 \u0438\u043C\u0435\u043D\u0438",
  "settings.nameField.desc": "\u041F\u043E\u043B\u0435 frontmatter \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u043C\u043E\u0433\u043E \u0438\u043C\u0435\u043D\u0438 (\u0438\u043D\u0430\u0447\u0435 \u2014 \u0438\u043C\u044F \u0444\u0430\u0439\u043B\u0430).",
  "settings.photoField.name": "\u041F\u043E\u043B\u0435 \u0444\u043E\u0442\u043E",
  "settings.photoField.desc": "\u041F\u043E\u043B\u0435 frontmatter \u0441 \u043F\u0443\u0442\u0451\u043C \u043A \u0444\u043E\u0442\u043E \u0432\u043D\u0443\u0442\u0440\u0438 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430.",
  "settings.relationField.name": "\u041F\u043E\u043B\u0435 \u0442\u0438\u043F\u0430 \u0441\u0432\u044F\u0437\u0438",
  "settings.relationField.desc": "\u041F\u043E\u043B\u0435 frontmatter \u0441 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435\u043C \u0440\u043E\u043B\u0438 \u044D\u0442\u043E\u0433\u043E \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430 \u2014 \u0441\u043C. \xAB\u0420\u043E\u043B\u0438\xBB \u043D\u0438\u0436\u0435.",
  "settings.potentialContactsField.name": "\u041F\u043E\u043B\u0435 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043E\u0432",
  "settings.potentialContactsField.desc": "\u0421\u043F\u0438\u0441\u043E\u0447\u043D\u043E\u0435 \u043F\u043E\u043B\u0435 frontmatter \u0441 \u0424\u0418\u041E \u043B\u044E\u0434\u0435\u0439. \u0418\u043C\u044F \u0441 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0439 \u0437\u0430\u043C\u0435\u0442\u043A\u043E\u0439 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u043B\u0438\u043D\u0438\u0435\u0439 \u0441\u0432\u044F\u0437\u0438; \u0438\u043C\u044F \u0431\u0435\u0437 \u0437\u0430\u043C\u0435\u0442\u043A\u0438 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u0438\u0437\u0440\u0430\u0447\u043D\u044B\u043C \u0443\u0437\u043B\u043E\u043C.",
  "settings.excludePaths.name": "\u0418\u0441\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u0443\u0442\u0438",
  "settings.excludePaths.desc": "\u041F\u0430\u043F\u043A\u0438/\u0444\u0430\u0439\u043B\u044B \u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043D\u0443\u0436\u043D\u043E \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430\u0442\u044C.",
  "settings.rolesHeading": "\u0420\u043E\u043B\u0438",
  "settings.rolesDesc": "\u041A\u0430\u0436\u0434\u0430\u044F \u0440\u043E\u043B\u044C \u0437\u0430\u0434\u0430\u0451\u0442 \u0446\u0432\u0435\u0442 \u0438 \u0441\u0442\u0438\u043B\u044C \u043E\u0431\u0432\u043E\u0434\u043A\u0438, \u0430 \u0442\u0430\u043A\u0436\u0435 \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0431\u043B\u0438\u0437\u043A\u043E \u0447\u0435\u043B\u043E\u0432\u0435\u043A \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u043A \u0446\u0435\u043D\u0442\u0440\u0443 (1\u201310).",
  "settings.newRolePlaceholder": "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0440\u043E\u043B\u0438 (\u043D\u0430\u043F\u0440. \u0434\u0440\u0443\u0433)",
  "settings.addRole": "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0440\u043E\u043B\u044C",
  "settings.defaultRoleName": "\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E (\u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u043E / \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u043B\u043E)",
  "settings.resetRolesTooltip": "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u0441\u0435 \u0440\u043E\u043B\u0438 \u043A \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F\u043C \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E",
  "settings.resetRolesConfirmTitle": "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0440\u043E\u043B\u0438 \u043A \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F\u043C \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E?",
  "settings.resetRolesConfirmBody": "\u042D\u0442\u043E \u0437\u0430\u043C\u0435\u043D\u0438\u0442 \u0432\u0441\u0435 \u0432\u0430\u0448\u0438 \u0440\u043E\u043B\u0438 \u0438 \u0446\u0432\u0435\u0442/\u0441\u0442\u0438\u043B\u044C \u0440\u043E\u043B\u0438 \xAB\u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E\xBB \u0432\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u044B\u043C\u0438 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F\u043C\u0438 \u043F\u043B\u0430\u0433\u0438\u043D\u0430. \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043D\u0435\u043B\u044C\u0437\u044F \u043E\u0442\u043C\u0435\u043D\u0438\u0442\u044C.",
  "settings.ringStyle.solid": "\u0421\u043F\u043B\u043E\u0448\u043D\u0430\u044F",
  "settings.ringStyle.dashed": "\u041F\u0443\u043D\u043A\u0442\u0438\u0440\u043D\u0430\u044F",
  "settings.ringStyle.dotted": "\u0422\u043E\u0447\u0435\u0447\u043D\u0430\u044F",
  "settings.generalHeading": "\u041E\u0431\u0449\u0435\u0435",
  "settings.generalDesc": "\u041E\u0431\u0449\u0438\u0439 \u0432\u0438\u0434 \u0433\u0440\u0430\u0444\u0430.",
  "settings.centerLabel.name": "\u041F\u043E\u0434\u043F\u0438\u0441\u044C \u0446\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0443\u0437\u043B\u0430",
  "settings.centerLabel.desc": "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0434\u043B\u044F \u0446\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0443\u0437\u043B\u0430, \u0435\u0441\u043B\u0438 \u043D\u0438 \u043E\u0434\u043D\u0430 \u0437\u0430\u043C\u0435\u0442\u043A\u0430 \u043D\u0435 \u043F\u043E\u043C\u0435\u0447\u0435\u043D\u0430 is_self.",
  "settings.enableBases.name": "\u0418\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u044F \u0441 Bases",
  "settings.enableBases.desc": "\u041F\u0440\u0435\u0434\u043B\u0430\u0433\u0430\u0442\u044C \u0433\u0440\u0430\u0444 \u043A\u0430\u043A \u0432\u0438\u0434 \u0432\u043D\u0443\u0442\u0440\u0438 Bases (\u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u0432\u043A\u043B\u044E\u0447\u0451\u043D\u043D\u044B\u0439 core-\u043F\u043B\u0430\u0433\u0438\u043D Bases).",
  "settings.enableBases.reloadNotice": "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u043F\u043B\u0430\u0433\u0438\u043D (\u0438\u043B\u0438 Obsidian), \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C.",
  "settings.newNoteHeading": "\u041D\u043E\u0432\u044B\u0435 \u0437\u0430\u043C\u0435\u0442\u043A\u0438 \u0438\u0437 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0445 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043E\u0432",
  "settings.newNoteDesc": "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043F\u0440\u0438 \u043A\u043B\u0438\u043A\u0435 \u043D\u0430 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0430\u043A\u0442, \u0443 \u043A\u043E\u0442\u043E\u0440\u043E\u0433\u043E \u0435\u0449\u0451 \u043D\u0435\u0442 \u0437\u0430\u043C\u0435\u0442\u043A\u0438.",
  "settings.newNoteFolder.name": "\u041F\u0430\u043F\u043A\u0430 \u0434\u043B\u044F \u043D\u043E\u0432\u044B\u0445 \u0437\u0430\u043C\u0435\u0442\u043E\u043A",
  "settings.newNoteFolder.desc": "\u041F\u0443\u0441\u0442\u043E \u2014 \u0437\u0430\u043C\u0435\u0442\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u0451\u0442\u0441\u044F \u0432 \u043A\u043E\u0440\u043D\u0435 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430.",
  "settings.newNoteTemplatePath.name": "\u0417\u0430\u043C\u0435\u0442\u043A\u0430-\u0448\u0430\u0431\u043B\u043E\u043D",
  "settings.newNoteTemplatePath.desc": "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0443\u044E \u0437\u0430\u043C\u0435\u0442\u043A\u0443, \u0447\u044C\u0451 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u0441\u0442\u0430\u043D\u0435\u0442 \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u043C frontmatter; \u043F\u0443\u0441\u0442\u043E \u2014 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0432\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u044B\u0439 \u0448\u0430\u0431\u043B\u043E\u043D \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 {{name}} \u0432\u043D\u0443\u0442\u0440\u0438 \u043D\u0435\u0451 \u043A\u0430\u043A \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0443 \u0438\u043C\u0435\u043D\u0438 \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430.",
  "settings.newNoteTemplatePath.placeholder": "\u041F\u043E\u0438\u0441\u043A \u0437\u0430\u043C\u0435\u0442\u043A\u0438\u2026"
};
var ru_default = ru;

// src/i18n/index.ts
var dictionaries = { en: en_default, ru: ru_default };
var activeLocale = "en";
function readGlobalMomentLocale() {
  var _a;
  const globalWithMoment = globalThis;
  try {
    return (_a = globalWithMoment.moment) == null ? void 0 : _a.locale();
  } catch (e) {
    return void 0;
  }
}
function resolveLocale(preference) {
  var _a;
  if (preference === "en" || preference === "ru") return preference;
  const detected = (_a = readGlobalMomentLocale()) != null ? _a : typeof navigator !== "undefined" ? navigator.language : void 0;
  return (detected == null ? void 0 : detected.toLowerCase().startsWith("ru")) ? "ru" : "en";
}
function setLocale(preference) {
  activeLocale = resolveLocale(preference);
}
function t(key, params) {
  var _a, _b;
  const text = (_b = (_a = dictionaries[activeLocale][key]) != null ? _a : dictionaries.en[key]) != null ? _b : key;
  if (!params) return text;
  return Object.entries(params).reduce(
    (result, [paramKey, value]) => result.split(`{{${paramKey}}}`).join(String(value)),
    text
  );
}

// src/utils/geometry.ts
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function lerp(a, b, t2) {
  return a + (b - a) * t2;
}
function easeInCubic(t2) {
  return t2 * t2 * t2;
}
function easeOutCubic(t2) {
  const inv = 1 - t2;
  return 1 - inv * inv * inv;
}

// src/sim/forces.ts
var MIN_DISTANCE_SQ = 0.01;
function applyLinkForce(links, restingDistance, alpha, strength = 0.5) {
  for (const link of links) {
    const { source, target } = link;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const pull = (dist - restingDistance) / dist * alpha * strength;
    if (source.fx === null) {
      source.vx += dx * pull;
      source.vy += dy * pull;
    }
    if (target.fx === null) {
      target.vx -= dx * pull;
      target.vy -= dy * pull;
    }
  }
}
function applyRepulsionForce(nodes, grid, strength, alpha) {
  for (const node of nodes) {
    if (node.fx !== null) continue;
    const neighbors = grid.queryNear(node.x, node.y);
    for (const other of neighbors) {
      if (other === node) continue;
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const distSq = Math.max(dx * dx + dy * dy, MIN_DISTANCE_SQ);
      const dist = Math.sqrt(distSq);
      const push = strength * alpha / distSq;
      node.vx += dx / dist * push;
      node.vy += dy / dist * push;
    }
  }
}
function applyCenterForce(nodes, centerX, centerY, alpha, strength = 0.05) {
  if (nodes.length === 0) return;
  let sumX = 0;
  let sumY = 0;
  for (const node of nodes) {
    sumX += node.x;
    sumY += node.y;
  }
  const offsetX = sumX / nodes.length - centerX;
  const offsetY = sumY / nodes.length - centerY;
  for (const node of nodes) {
    if (node.fx !== null) continue;
    node.vx -= offsetX * strength * alpha;
    node.vy -= offsetY * strength * alpha;
  }
}
function applyRadialPositionForce(nodes, centerX, centerY, alpha) {
  for (const node of nodes) {
    if (node.fx !== null || node.isCenter) continue;
    const dx = node.x - centerX;
    const dy = node.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const diff = dist - node.targetRadius;
    const strength = alpha * 0.12;
    node.vx -= dx / dist * diff * strength;
    node.vy -= dy / dist * diff * strength;
  }
}
function applyCollisionForce(nodes, grid, alpha, padding = 34) {
  for (const node of nodes) {
    const neighbors = grid.queryNear(node.x, node.y);
    for (const other of neighbors) {
      if (other === node) continue;
      const minDist = node.radius + other.radius + padding;
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      if (dist >= minDist) continue;
      const overlap = (minDist - dist) / dist * alpha * 0.5;
      const pushX = dx * overlap;
      const pushY = dy * overlap;
      if (node.fx === null) {
        node.vx += pushX;
        node.vy += pushY;
      }
      if (other.fx === null) {
        other.vx -= pushX;
        other.vy -= pushY;
      }
    }
  }
}

// src/sim/spatial-grid.ts
var SpatialGrid = class {
  constructor(cellSize) {
    this.buckets = /* @__PURE__ */ new Map();
    this.cellSize = cellSize;
  }
  key(cellX, cellY) {
    return `${cellX}:${cellY}`;
  }
  rebuild(nodes) {
    this.buckets = /* @__PURE__ */ new Map();
    for (const node of nodes) {
      const cellX = Math.floor(node.x / this.cellSize);
      const cellY = Math.floor(node.y / this.cellSize);
      const key = this.key(cellX, cellY);
      const bucket = this.buckets.get(key);
      if (bucket) bucket.push(node);
      else this.buckets.set(key, [node]);
    }
  }
  /** Returns nodes in the 3x3 block of cells around (x, y) — a superset of true neighbors. */
  queryNear(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    const result = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const bucket = this.buckets.get(this.key(cellX + dx, cellY + dy));
        if (bucket) result.push(...bucket);
      }
    }
    return result;
  }
};

// src/sim/simulation.ts
var ALPHA_MIN = 1e-3;
var ALPHA_DECAY = 0.02;
var VELOCITY_DECAY = 0.6;
var MAX_SPEED = 14;
var RAMP_TICKS = 32;
var GRID_CELL_SIZE = 140;
var DEFAULT_CONFIG = {
  linkDistance: 110,
  repulsionStrength: 2200,
  linkStrength: 0.5,
  centerStrength: 0.05
};
var Simulation = class {
  constructor(config = {}) {
    this.nodes = [];
    this.links = [];
    this.centerX = 0;
    this.centerY = 0;
    this.alpha = 0;
    this.alphaTarget = 0;
    this.rampT = 1;
    this.rampPeak = 0;
    this.grid = new SpatialGrid(GRID_CELL_SIZE);
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  setGraph(nodes, links) {
    this.nodes = nodes;
    this.links = links;
  }
  setCenter(x, y) {
    this.centerX = x;
    this.centerY = y;
  }
  reheat(alpha = 0.6) {
    this.rampPeak = Math.max(alpha, this.alpha);
    this.rampT = 0;
    if (this.alpha < 0.01) this.alpha = 0.01;
  }
  isSettled() {
    return this.alpha < ALPHA_MIN;
  }
  tick() {
    if (this.isSettled()) return;
    if (this.rampT < 1) {
      this.rampT = Math.min(1, this.rampT + 1 / RAMP_TICKS);
      this.alpha = Math.max(this.alpha, this.rampPeak * Math.max(easeInCubic(this.rampT), 0.02));
    } else {
      this.alpha += (this.alphaTarget - this.alpha) * ALPHA_DECAY;
    }
    this.grid.rebuild(this.nodes);
    applyRepulsionForce(this.nodes, this.grid, this.config.repulsionStrength, this.alpha);
    applyLinkForce(this.links, this.config.linkDistance, this.alpha, this.config.linkStrength);
    applyCenterForce(this.nodes, this.centerX, this.centerY, this.alpha, this.config.centerStrength);
    applyRadialPositionForce(this.nodes, this.centerX, this.centerY, this.alpha);
    applyCollisionForce(this.nodes, this.grid, this.alpha);
    for (const node of this.nodes) {
      const speed = Math.hypot(node.vx, node.vy);
      if (speed > MAX_SPEED) {
        const scale = MAX_SPEED / speed;
        node.vx *= scale;
        node.vy *= scale;
      }
      if (node.fx !== null) {
        node.x = node.fx;
        node.vx = 0;
      } else {
        node.vx *= VELOCITY_DECAY;
        node.x += node.vx;
      }
      if (node.fy !== null) {
        node.y = node.fy;
        node.vy = 0;
      } else {
        node.vy *= VELOCITY_DECAY;
        node.y += node.vy;
      }
    }
  }
};

// src/render/camera.ts
var Camera = class {
  constructor() {
    this.scale = 1;
    this.x = 0;
    this.y = 0;
    this.minScale = 0.2;
    this.maxScale = 5;
  }
  reset(screenCenterX, screenCenterY) {
    this.scale = 1;
    this.x = screenCenterX;
    this.y = screenCenterY;
  }
  toWorld(screenX, screenY) {
    return { x: (screenX - this.x) / this.scale, y: (screenY - this.y) / this.scale };
  }
  toScreen(worldX, worldY) {
    return { x: worldX * this.scale + this.x, y: worldY * this.scale + this.y };
  }
  pan(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
  /** Zooms by `factor`, keeping the world point currently under (screenX, screenY) fixed on screen. */
  zoomAt(screenX, screenY, factor) {
    const worldBefore = this.toWorld(screenX, screenY);
    this.scale = clamp(this.scale * factor, this.minScale, this.maxScale);
    this.x = screenX - worldBefore.x * this.scale;
    this.y = screenY - worldBefore.y * this.scale;
  }
  /** Camera state that fits the given world bounds into a viewport with padding on all sides. */
  computeFit(bounds, viewportWidth, viewportHeight, padding) {
    const worldWidth = Math.max(bounds.maxX - bounds.minX, 1);
    const worldHeight = Math.max(bounds.maxY - bounds.minY, 1);
    const scale = clamp(
      Math.min(
        (viewportWidth - padding * 2) / worldWidth,
        (viewportHeight - padding * 2) / worldHeight
      ),
      this.minScale,
      this.maxScale
    );
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    return {
      scale,
      x: viewportWidth / 2 - centerX * scale,
      y: viewportHeight / 2 - centerY * scale
    };
  }
};

// src/render/image-cache.ts
var import_obsidian = require("obsidian");
var MAX_BITMAP_SIZE = 128;
var ImageCache = class {
  constructor(app) {
    this.bitmaps = /* @__PURE__ */ new Map();
    this.pending = /* @__PURE__ */ new Map();
    this.failed = /* @__PURE__ */ new Set();
    this.app = app;
  }
  get(path) {
    return this.bitmaps.get(path);
  }
  /** True once a path has failed to decode — the caller should stop retrying it. */
  hasFailed(path) {
    return this.failed.has(path);
  }
  invalidate(path) {
    var _a;
    (_a = this.bitmaps.get(path)) == null ? void 0 : _a.close();
    this.bitmaps.delete(path);
    this.pending.delete(path);
    this.failed.delete(path);
  }
  /** Frees every decoded bitmap — call when the owning view closes. */
  clear() {
    for (const bitmap of this.bitmaps.values()) bitmap.close();
    this.bitmaps.clear();
    this.pending.clear();
    this.failed.clear();
  }
  load(path) {
    const cached = this.bitmaps.get(path);
    if (cached) return Promise.resolve(cached);
    if (this.failed.has(path)) return Promise.resolve(void 0);
    const pending = this.pending.get(path);
    if (pending) return pending;
    const promise = this.decode(path).then((bitmap) => {
      this.pending.delete(path);
      if (bitmap) this.bitmaps.set(path, bitmap);
      else this.failed.add(path);
      return bitmap;
    });
    this.pending.set(path, promise);
    return promise;
  }
  async decode(path) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian.TFile)) return void 0;
    try {
      const buffer = await this.app.vault.readBinary(file);
      return await this.decodeBlob(new Blob([buffer]));
    } catch (e) {
      return void 0;
    }
  }
  async decodeBlob(blob) {
    const probe = await createImageBitmap(blob);
    const { width, height } = probe;
    const longest = Math.max(width, height);
    if (longest <= MAX_BITMAP_SIZE) return probe;
    const scale = MAX_BITMAP_SIZE / longest;
    probe.close();
    return createImageBitmap(blob, {
      resizeWidth: Math.round(width * scale),
      resizeHeight: Math.round(height * scale),
      resizeQuality: "high"
    });
  }
};

// src/render/picking.ts
function pickNode(pickables, worldX, worldY) {
  for (let i = pickables.length - 1; i >= 0; i--) {
    const node = pickables[i];
    const dx = worldX - node.x;
    const dy = worldY - node.y;
    if (dx * dx + dy * dy <= node.radius * node.radius) return node.id;
  }
  return void 0;
}

// src/render/relation-style.ts
var VAR_TOKEN = /^var\((--[\w-]+)\)$/;
function resolveColorToken(token, themeColors, fallback = "#9e9e9e") {
  const trimmed = token.trim();
  const match = VAR_TOKEN.exec(trimmed);
  if (match) return themeColors.get(match[1], fallback);
  return trimmed || fallback;
}
function resolveRelationStyle(relationType, settings, themeColors) {
  const role = relationType && settings.roles[relationType] || settings.defaultRole;
  return { color: resolveColorToken(role.color, themeColors), ringStyle: role.ringStyle };
}

// src/render/theme-colors.ts
var ThemeColorCache = class {
  constructor(probeEl) {
    this.cache = /* @__PURE__ */ new Map();
    this.probeEl = probeEl;
  }
  get(variableName, fallback = "") {
    const cached = this.cache.get(variableName);
    if (cached !== void 0) return cached || fallback;
    const value = getComputedStyle(this.probeEl).getPropertyValue(variableName).trim();
    this.cache.set(variableName, value);
    return value || fallback;
  }
  invalidate() {
    this.cache.clear();
  }
};

// src/render/canvas-renderer.ts
var DEFAULT_DISPLAY = { nodeScale: 1, edgeWidth: 1.4 };
var PERSON_RADIUS = 26;
var CENTER_RADIUS = 32;
var GHOST_RADIUS = 18;
var MIN_ORBIT = 60;
var MAX_ORBIT = 420;
var GHOST_ORBIT_SCORE = 3;
var CENTER_NODE_ID = "__center__";
var CENTER_ID = CENTER_NODE_ID;
var POP_IN_MS = 520;
var POP_IN_STAGGER_MS = 24;
var POP_IN_STAGGER_CAP_MS = 700;
var POP_IN_START_SCALE = 0.2;
var EDGE_FADE_MS = 420;
var FIT_PADDING = 60;
var FIT_TWEEN_MS = 340;
function scoreToOrbitRadius(score) {
  const clamped = clamp(score, 1, 10);
  return MAX_ORBIT - (clamped - 1) / 9 * (MAX_ORBIT - MIN_ORBIT);
}
function roundedSquarePath(ctx, cx, cy, size, cornerRadius) {
  const half = size / 2;
  const x = cx - half;
  const y = cy - half;
  const r = Math.min(cornerRadius, half);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + size, y, x + size, y + size, r);
  ctx.arcTo(x + size, y + size, x, y + size, r);
  ctx.arcTo(x, y + size, x, y, r);
  ctx.arcTo(x, y, x + size, y, r);
  ctx.closePath();
}
function drawSilhouette(ctx, cx, cy, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy - radius * 0.28, radius * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + radius * 0.5, radius * 0.5, radius * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
}
function setRingDash(ctx, ringStyle) {
  if (ringStyle === "dashed") ctx.setLineDash([6, 4]);
  else if (ringStyle === "dotted") ctx.setLineDash([1.5, 3.5]);
  else ctx.setLineDash([]);
}
function drawEdge(ctx, source, target) {
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.hypot(dx, dy) || 1;
  const bow = Math.min(length * 0.12, 24);
  const normalX = -dy / length;
  const normalY = dx / length;
  ctx.beginPath();
  ctx.moveTo(source.x, source.y);
  ctx.quadraticCurveTo(midX + normalX * bow, midY + normalY * bow, target.x, target.y);
  ctx.stroke();
}
var CanvasRenderer = class {
  constructor(container, app, getSettings) {
    this.camera = new Camera();
    this.simulation = new Simulation();
    this.filter = { search: "", relationTypes: null, companies: null, showEdges: true, showGhosts: true };
    this.display = { ...DEFAULT_DISPLAY };
    this.requestedPhotos = /* @__PURE__ */ new Set();
    this.width = 1;
    this.height = 1;
    this.ratio = window.devicePixelRatio || 1;
    this.rafHandle = null;
    this.destroyed = false;
    this.cameraInitialized = false;
    this.renderMeta = /* @__PURE__ */ new Map();
    this.pickables = [];
    this.lastStructureKey = "";
    this.lastRadiiKey = "";
    /** id -> timestamp (ms) at which this node's pop-in should begin; removed once done. */
    this.bornAt = /* @__PURE__ */ new Map();
    /** Timestamp (ms) at which edges start fading in — set to after the node wave lands. */
    this.edgesRevealAt = 0;
    this.cameraTween = null;
    /** Fit the graph into view once the layout first settles, unless the user took over the camera. */
    this.autoFitPending = false;
    this.userMovedCamera = false;
    this.loop = () => {
      this.rafHandle = null;
      if (this.destroyed) return;
      const now = performance.now();
      if (!this.simulation.isSettled()) this.simulation.tick();
      this.advanceCameraTween(now);
      this.draw();
      if (this.autoFitPending && this.simulation.isSettled() && this.bornAt.size === 0 && !this.userMovedCamera) {
        this.autoFitPending = false;
        this.fitToContent(true);
      }
      const edgesAnimating = now < this.edgesRevealAt + EDGE_FADE_MS;
      if (!this.simulation.isSettled() || this.bornAt.size > 0 || this.cameraTween || edgesAnimating) {
        this.requestRedraw();
      }
    };
    this.container = container;
    this.getSettings = getSettings;
    this.win = container.win;
    this.canvas = container.createEl("canvas", { cls: "person-network-canvas" });
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context is unavailable");
    this.ctx = ctx;
    this.imageCache = new ImageCache(app);
    this.themeColors = new ThemeColorCache(container);
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);
    this.handleResize();
  }
  getCanvasElement() {
    return this.canvas;
  }
  hasVisibleContent() {
    return this.simulation.nodes.length > 1;
  }
  onThemeChange() {
    this.themeColors.invalidate();
    this.requestRedraw();
  }
  onPhotoModified(path) {
    this.imageCache.invalidate(path);
    this.requestedPhotos.delete(path);
    this.requestRedraw();
  }
  resetCamera() {
    this.camera.reset(this.width / 2, this.height / 2);
    this.requestRedraw();
  }
  setGraph(snapshot) {
    var _a, _b, _c, _d, _e, _f;
    const settings = this.getSettings();
    const priorPositions = new Map(this.simulation.nodes.map((node) => [node.id, node]));
    const nodes = [];
    const nodeById = /* @__PURE__ */ new Map();
    const renderMeta = /* @__PURE__ */ new Map();
    const selfPerson = snapshot.people.find((person) => person.isSelf);
    const centerNode = {
      id: CENTER_ID,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      fx: 0,
      fy: 0,
      radius: CENTER_RADIUS,
      targetRadius: 0,
      isCenter: true
    };
    nodes.push(centerNode);
    nodeById.set(CENTER_ID, centerNode);
    if (selfPerson) nodeById.set(selfPerson.id, centerNode);
    renderMeta.set(CENTER_ID, {
      kind: "center",
      displayName: (_b = (_a = selfPerson == null ? void 0 : selfPerson.displayName) != null ? _a : settings.centerLabel) != null ? _b : t("view.defaultCenterLabel"),
      photoPath: selfPerson == null ? void 0 : selfPerson.photoPath
    });
    for (const person of snapshot.people) {
      if (person.isSelf) continue;
      const prior = priorPositions.get(person.id);
      const node = {
        id: person.id,
        x: (_c = prior == null ? void 0 : prior.x) != null ? _c : (Math.random() - 0.5) * 240,
        y: (_d = prior == null ? void 0 : prior.y) != null ? _d : (Math.random() - 0.5) * 240,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        radius: PERSON_RADIUS,
        targetRadius: scoreToOrbitRadius(person.positionScore),
        isCenter: false
      };
      nodes.push(node);
      nodeById.set(person.id, node);
      renderMeta.set(person.id, {
        kind: "person",
        displayName: person.displayName,
        photoPath: person.photoPath,
        relationType: person.relationType,
        company: person.company
      });
    }
    for (const ghost of snapshot.ghosts) {
      const prior = priorPositions.get(ghost.id);
      const node = {
        id: ghost.id,
        x: (_e = prior == null ? void 0 : prior.x) != null ? _e : (Math.random() - 0.5) * 320,
        y: (_f = prior == null ? void 0 : prior.y) != null ? _f : (Math.random() - 0.5) * 320,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        radius: GHOST_RADIUS,
        targetRadius: scoreToOrbitRadius(GHOST_ORBIT_SCORE),
        isCenter: false
      };
      nodes.push(node);
      nodeById.set(ghost.id, node);
      renderMeta.set(ghost.id, { kind: "ghost", displayName: ghost.displayName });
    }
    const links = snapshot.edges.map((edge) => {
      const source = nodeById.get(edge.sourceId);
      const target = nodeById.get(edge.targetId);
      return source && target ? { source, target } : void 0;
    }).filter((link) => link !== void 0);
    const structureKey = nodes.map((node) => node.id).sort().join("\n") + "||" + links.map((link) => `${link.source.id}>${link.target.id}`).sort().join("\n");
    const radiiKey = nodes.map((node) => `${node.id}:${Math.round(node.targetRadius)}`).sort().join("\n");
    this.renderMeta = renderMeta;
    this.simulation.setGraph(nodes, links);
    const newNodes = nodes.filter((node) => !node.isCenter && !priorPositions.has(node.id));
    this.schedulePopIn(newNodes);
    if (structureKey !== this.lastStructureKey) {
      this.simulation.reheat(0.9);
      this.autoFitPending = true;
    } else if (radiiKey !== this.lastRadiiKey) {
      this.simulation.reheat(0.3);
    }
    this.lastStructureKey = structureKey;
    this.lastRadiiKey = radiiKey;
    this.requestRedraw();
  }
  /** Assigns staggered born-times so a batch of nodes fades/grows in one after another. */
  schedulePopIn(nodes) {
    if (nodes.length === 0) return;
    const now = performance.now();
    const ordered = [...nodes].sort((a, b) => a.targetRadius - b.targetRadius);
    let lastStagger = 0;
    ordered.forEach((node, index) => {
      const stagger = Math.min(index * POP_IN_STAGGER_MS, POP_IN_STAGGER_CAP_MS);
      lastStagger = stagger;
      this.bornAt.set(node.id, now + stagger);
    });
    this.edgesRevealAt = now + lastStagger + POP_IN_MS;
  }
  /** Grow/fade factor for a node's pop-in; {scale:1, alpha:1} once finished. */
  popIn(id, now) {
    const born = this.bornAt.get(id);
    if (born === void 0) return { scale: 1, alpha: 1 };
    const elapsed = now - born;
    if (elapsed <= 0) return { scale: 0, alpha: 0 };
    if (elapsed >= POP_IN_MS) {
      this.bornAt.delete(id);
      return { scale: 1, alpha: 1 };
    }
    const p = easeInCubic(elapsed / POP_IN_MS);
    return { scale: POP_IN_START_SCALE + (1 - POP_IN_START_SCALE) * p, alpha: p };
  }
  /** Scatters every non-center node to a fresh random position and replays the settle + pop-in animation. */
  replayAnimation() {
    const scattered = [];
    for (const node of this.simulation.nodes) {
      if (node.isCenter) continue;
      node.fx = null;
      node.fy = null;
      const spread = 260 + node.targetRadius;
      node.x = (Math.random() - 0.5) * spread;
      node.y = (Math.random() - 0.5) * spread;
      node.vx = 0;
      node.vy = 0;
      scattered.push(node);
    }
    this.schedulePopIn(scattered);
    this.simulation.reheat(1);
    this.userMovedCamera = false;
    this.autoFitPending = true;
    this.requestRedraw();
  }
  /** Smoothly frames all nodes within the viewport. */
  fitToContent(animate = true) {
    const bounds = this.computeBounds();
    if (!bounds) return;
    const target = this.camera.computeFit(bounds, this.width, this.height, FIT_PADDING);
    if (animate) {
      this.cameraTween = {
        startScale: this.camera.scale,
        startX: this.camera.x,
        startY: this.camera.y,
        targetScale: target.scale,
        targetX: target.x,
        targetY: target.y,
        startTime: performance.now()
      };
    } else {
      this.camera.scale = target.scale;
      this.camera.x = target.x;
      this.camera.y = target.y;
    }
    this.requestRedraw();
  }
  /** Cancels any running fit tween and blocks the pending auto-fit — the user is driving now. */
  notifyUserInteraction() {
    this.cameraTween = null;
    this.userMovedCamera = true;
  }
  computeBounds() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const node of this.simulation.nodes) {
      const meta = this.renderMeta.get(node.id);
      if (!meta || !this.isVisible(meta)) continue;
      minX = Math.min(minX, node.x - node.radius);
      minY = Math.min(minY, node.y - node.radius);
      maxX = Math.max(maxX, node.x + node.radius);
      maxY = Math.max(maxY, node.y + node.radius);
    }
    if (minX === Infinity) return null;
    return { minX, minY, maxX, maxY };
  }
  advanceCameraTween(now) {
    if (!this.cameraTween) return;
    const tween = this.cameraTween;
    const raw = (now - tween.startTime) / FIT_TWEEN_MS;
    if (raw >= 1) {
      this.camera.scale = tween.targetScale;
      this.camera.x = tween.targetX;
      this.camera.y = tween.targetY;
      this.cameraTween = null;
      return;
    }
    const e = easeOutCubic(raw);
    this.camera.scale = lerp(tween.startScale, tween.targetScale, e);
    this.camera.x = lerp(tween.startX, tween.targetX, e);
    this.camera.y = lerp(tween.startY, tween.targetY, e);
  }
  setForces(forces) {
    Object.assign(this.simulation.config, forces);
    this.simulation.reheat(0.7);
    this.requestRedraw();
  }
  getForces() {
    const c = this.simulation.config;
    return {
      linkDistance: c.linkDistance,
      repulsionStrength: c.repulsionStrength,
      linkStrength: c.linkStrength,
      centerStrength: c.centerStrength
    };
  }
  setDisplay(display) {
    this.display = { ...display };
    this.requestRedraw();
  }
  getDisplay() {
    return { ...this.display };
  }
  pick(screenX, screenY) {
    const world = this.camera.toWorld(screenX, screenY);
    return pickNode(this.pickables, world.x, world.y);
  }
  worldPointFromScreen(screenX, screenY) {
    return this.camera.toWorld(screenX, screenY);
  }
  beginDrag(id) {
    const node = this.findNode(id);
    if (!node || node.isCenter) return;
    node.fx = node.x;
    node.fy = node.y;
    this.simulation.reheat(0.6);
    this.requestRedraw();
  }
  dragTo(id, worldX, worldY) {
    const node = this.findNode(id);
    if (!node || node.isCenter) return;
    node.fx = worldX;
    node.fy = worldY;
    this.requestRedraw();
  }
  endDrag(id) {
    const node = this.findNode(id);
    if (!node || node.isCenter) return;
    node.fx = null;
    node.fy = null;
    this.simulation.reheat(0.3);
    this.requestRedraw();
  }
  requestRedraw() {
    if (this.destroyed || this.rafHandle !== null) return;
    this.rafHandle = this.win.requestAnimationFrame(this.loop);
  }
  destroy() {
    this.destroyed = true;
    this.resizeObserver.disconnect();
    if (this.rafHandle !== null) this.win.cancelAnimationFrame(this.rafHandle);
    this.imageCache.clear();
    this.canvas.remove();
  }
  findNode(id) {
    return this.simulation.nodes.find((node) => node.id === id);
  }
  handleResize() {
    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(rect.width, 1);
    this.height = Math.max(rect.height, 1);
    this.ratio = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(this.width * this.ratio);
    this.canvas.height = Math.round(this.height * this.ratio);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    if (!this.cameraInitialized) {
      this.camera.reset(this.width / 2, this.height / 2);
      this.cameraInitialized = true;
    }
    this.requestRedraw();
  }
  getPhotoBitmap(path) {
    const cached = this.imageCache.get(path);
    if (cached) return cached;
    if (this.imageCache.hasFailed(path)) return void 0;
    if (!this.requestedPhotos.has(path)) {
      this.requestedPhotos.add(path);
      void this.imageCache.load(path).then(() => {
        this.requestedPhotos.delete(path);
        this.requestRedraw();
      });
    }
    return void 0;
  }
  isVisible(meta) {
    if (meta.kind === "ghost") return this.filter.showGhosts;
    if (meta.kind === "person") {
      if (this.filter.relationTypes && (!meta.relationType || !this.filter.relationTypes.has(meta.relationType))) {
        return false;
      }
      if (this.filter.companies && (!meta.company || !this.filter.companies.has(meta.company))) {
        return false;
      }
    }
    return true;
  }
  draw() {
    const ctx = this.ctx;
    ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(this.camera.scale, this.camera.scale);
    const settings = this.getSettings();
    const fontFamily = this.themeColors.get("--font-interface", "sans-serif");
    const borderColor = this.themeColors.get("--background-modifier-border", "#88888840");
    const textColor = this.themeColors.get("--text-normal", "#dcddde");
    const mutedColor = this.themeColors.get("--text-muted", "#999999");
    const secondaryBg = this.themeColors.get("--background-secondary", "#2a2a2a");
    const accentColor = this.themeColors.get("--interactive-accent", "#7b6cd9");
    const searchQuery = this.filter.search.trim().toLowerCase();
    const now = performance.now();
    const pickables = [];
    const topLeft = this.camera.toWorld(0, 0);
    const bottomRight = this.camera.toWorld(this.width, this.height);
    const margin = 80;
    const viewMinX = topLeft.x - margin;
    const viewMinY = topLeft.y - margin;
    const viewMaxX = bottomRight.x + margin;
    const viewMaxY = bottomRight.y + margin;
    const nodeVisible = (x, y) => x >= viewMinX && x <= viewMaxX && y >= viewMinY && y <= viewMaxY;
    const edgeReveal = clamp((now - this.edgesRevealAt) / EDGE_FADE_MS, 0, 1);
    if (this.filter.showEdges && edgeReveal > 0) {
      ctx.save();
      ctx.globalAlpha = edgeReveal;
      ctx.lineWidth = this.display.edgeWidth;
      ctx.strokeStyle = borderColor;
      ctx.setLineDash([]);
      for (const link of this.simulation.links) {
        const sourceMeta = this.renderMeta.get(link.source.id);
        const targetMeta = this.renderMeta.get(link.target.id);
        if (!sourceMeta || !targetMeta) continue;
        if (!this.isVisible(sourceMeta) || !this.isVisible(targetMeta)) continue;
        if (Math.max(link.source.x, link.target.x) < viewMinX || Math.min(link.source.x, link.target.x) > viewMaxX || Math.max(link.source.y, link.target.y) < viewMinY || Math.min(link.source.y, link.target.y) > viewMaxY) {
          continue;
        }
        drawEdge(ctx, link.source, link.target);
      }
      ctx.restore();
    }
    for (const node of this.simulation.nodes) {
      const meta = this.renderMeta.get(node.id);
      if (!meta || !this.isVisible(meta)) continue;
      if (!nodeVisible(node.x, node.y)) continue;
      const matchesSearch = searchQuery.length === 0 || meta.displayName.toLowerCase().includes(searchQuery);
      const pop = this.popIn(node.id, now);
      ctx.save();
      ctx.globalAlpha = (matchesSearch ? 1 : 0.25) * pop.alpha;
      if (pop.scale !== 1) {
        ctx.translate(node.x, node.y);
        ctx.scale(pop.scale, pop.scale);
        ctx.translate(-node.x, -node.y);
      }
      const radius = node.radius * this.display.nodeScale;
      const size = radius * 2;
      const cornerRadius = radius * 0.4;
      const bitmap = meta.kind !== "ghost" && meta.photoPath ? this.getPhotoBitmap(meta.photoPath) : void 0;
      roundedSquarePath(ctx, node.x, node.y, size, cornerRadius);
      ctx.save();
      ctx.clip();
      if (bitmap) {
        ctx.drawImage(bitmap, node.x - radius, node.y - radius, size, size);
      } else {
        ctx.fillStyle = secondaryBg;
        ctx.fillRect(node.x - radius, node.y - radius, size, size);
        drawSilhouette(ctx, node.x, node.y, radius, mutedColor);
      }
      ctx.restore();
      let ringColor = accentColor;
      let ringStyle = "solid";
      if (meta.kind === "person") {
        const resolved = resolveRelationStyle(meta.relationType, settings, this.themeColors);
        ringColor = resolved.color;
        ringStyle = resolved.ringStyle;
      } else if (meta.kind === "ghost") {
        ringColor = mutedColor;
        ringStyle = "dashed";
      }
      roundedSquarePath(ctx, node.x, node.y, size, cornerRadius);
      ctx.lineWidth = meta.kind === "center" ? 3 : 2.2;
      ctx.strokeStyle = ringColor;
      setRingDash(ctx, ringStyle);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = "center";
      ctx.fillStyle = meta.kind === "ghost" ? mutedColor : textColor;
      const weight = meta.kind === "center" ? "bold " : "";
      const style = meta.kind === "ghost" ? "italic " : "";
      ctx.font = `${style}${weight}11px ${fontFamily}`;
      ctx.fillText(meta.displayName, node.x, node.y + radius + 14);
      if (meta.kind === "person" && meta.company) {
        ctx.fillStyle = mutedColor;
        ctx.font = `9px ${fontFamily}`;
        ctx.fillText(meta.company, node.x, node.y + radius + 26);
      }
      ctx.restore();
      pickables.push({ id: node.id, x: node.x, y: node.y, radius });
    }
    ctx.restore();
    this.pickables = pickables;
    if (this.bornAt.size > 0) {
      for (const [id, born] of this.bornAt) {
        if (now - born >= POP_IN_MS) this.bornAt.delete(id);
      }
    }
  }
};

// src/view/graph-interaction.ts
function personTooltipLines(person) {
  const lines = [person.displayName];
  if (person.company) lines.push(t("tooltip.company", { value: person.company }));
  if (person.relationType) lines.push(t("tooltip.relation", { value: person.relationType }));
  lines.push(t("tooltip.position", { value: person.positionScore }));
  return lines;
}
function ghostTooltipLines(ghost) {
  return [ghost.displayName, t("tooltip.ghostHint")];
}
var CLICK_MOVE_THRESHOLD = 5;
function wireGraphInteraction(component, renderer, tooltip, callbacks) {
  const canvas = renderer.getCanvasElement();
  let draggingId = null;
  let isPanning = false;
  let pointerDownId = null;
  let pointerDownPos = { x: 0, y: 0 };
  let lastPointer = { x: 0, y: 0 };
  const getPointerPosition = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const updateTooltip = (hitId, pos) => {
    if (!hitId || hitId === CENTER_NODE_ID) {
      tooltip.hide();
      return;
    }
    const lines = callbacks.getTooltipLines(hitId);
    if (lines && lines.length > 0) tooltip.show(lines, pos.x, pos.y);
    else tooltip.hide();
  };
  component.registerDomEvent(canvas, "pointerdown", (event) => {
    const pos = getPointerPosition(event);
    const hitId = renderer.pick(pos.x, pos.y);
    lastPointer = pos;
    pointerDownPos = pos;
    pointerDownId = hitId != null ? hitId : null;
    if (hitId) {
      draggingId = hitId;
      renderer.beginDrag(hitId);
    } else {
      isPanning = true;
      renderer.notifyUserInteraction();
    }
  });
  component.registerDomEvent(canvas, "pointermove", (event) => {
    const pos = getPointerPosition(event);
    if (draggingId) {
      const world = renderer.worldPointFromScreen(pos.x, pos.y);
      renderer.dragTo(draggingId, world.x, world.y);
    } else if (isPanning) {
      renderer.camera.pan(pos.x - lastPointer.x, pos.y - lastPointer.y);
      renderer.requestRedraw();
    } else {
      const hitId = renderer.pick(pos.x, pos.y);
      canvas.style.cursor = hitId && hitId !== CENTER_NODE_ID ? "pointer" : "default";
      updateTooltip(hitId, pos);
    }
    lastPointer = pos;
  });
  component.registerDomEvent(window, "pointerup", () => {
    if (draggingId) renderer.endDrag(draggingId);
    const moved = Math.hypot(lastPointer.x - pointerDownPos.x, lastPointer.y - pointerDownPos.y);
    if (pointerDownId && pointerDownId !== CENTER_NODE_ID && moved < CLICK_MOVE_THRESHOLD) {
      callbacks.onNodeClick(pointerDownId);
    }
    draggingId = null;
    isPanning = false;
    pointerDownId = null;
  });
  component.registerDomEvent(canvas, "wheel", (event) => {
    event.preventDefault();
    const pos = getPointerPosition(event);
    const factor = event.deltaY < 0 ? 1.1 : 0.9;
    renderer.notifyUserInteraction();
    renderer.camera.zoomAt(pos.x, pos.y, factor);
    renderer.requestRedraw();
  }, { passive: false });
  component.registerDomEvent(canvas, "dblclick", () => renderer.fitToContent(true));
  component.registerDomEvent(canvas, "pointerleave", () => tooltip.hide());
}

// src/view/tooltip.ts
var Tooltip = class {
  constructor(container) {
    this.el = container.createDiv({ cls: "person-network-tooltip" });
    this.hide();
  }
  show(lines, screenX, screenY) {
    this.el.empty();
    for (const line of lines) this.el.createDiv({ text: line });
    this.el.setCssStyles({
      left: `${screenX + 14}px`,
      top: `${screenY - 10}px`,
      display: "block"
    });
  }
  hide() {
    this.el.setCssStyles({ display: "none" });
  }
  destroy() {
    this.el.remove();
  }
};

// src/bases/entry-adapter.ts
var import_obsidian3 = require("obsidian");

// src/data/frontmatter-schema.ts
var FIXED_FIELDS = {
  company: "company",
  isSelf: "is_self"
};
var DEFAULT_FIELD_NAMES = {
  personTag: "person",
  nameField: "name",
  photoField: "photo",
  relationField: "relation",
  potentialContactsField: "potential_contacts"
};

// src/data/name-matching.ts
function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}
function ghostId(name) {
  return `ghost:${normalizeName(name)}`;
}

// src/data/graph-links.ts
function buildContactLinks(people, shouldSkipUnmatched) {
  const byNormalizedName = /* @__PURE__ */ new Map();
  for (const person of people) {
    const key = normalizeName(person.displayName);
    if (!byNormalizedName.has(key)) byNormalizedName.set(key, person);
  }
  const edges = [];
  const seenEdgeKeys = /* @__PURE__ */ new Set();
  const ghostsByKey = /* @__PURE__ */ new Map();
  for (const person of people) {
    for (const rawRef of person.ghostRefs) {
      const realTarget = byNormalizedName.get(normalizeName(rawRef));
      if (realTarget) {
        if (realTarget.id !== person.id) {
          const key = [person.id, realTarget.id].sort().join("|");
          if (!seenEdgeKeys.has(key)) {
            seenEdgeKeys.add(key);
            edges.push({ sourceId: person.id, targetId: realTarget.id });
          }
        }
        continue;
      }
      if (shouldSkipUnmatched == null ? void 0 : shouldSkipUnmatched(rawRef)) continue;
      const id = ghostId(rawRef);
      const existingGhost = ghostsByKey.get(id);
      if (existingGhost) {
        if (!existingGhost.sourceIds.includes(person.id)) {
          existingGhost.sourceIds.push(person.id);
        }
      } else {
        ghostsByKey.set(id, { id, displayName: rawRef, sourceIds: [person.id] });
      }
      const edgeKey = `${person.id}|${id}`;
      if (!seenEdgeKeys.has(edgeKey)) {
        seenEdgeKeys.add(edgeKey);
        edges.push({ sourceId: person.id, targetId: id });
      }
    }
  }
  return { edges, ghosts: [...ghostsByKey.values()] };
}

// src/data/parser.ts
var import_obsidian2 = require("obsidian");
function isExcluded(filePath, excludePaths) {
  const path = filePath.toLowerCase();
  const list = excludePaths.split(",").map((entry) => entry.trim().toLowerCase()).filter((entry) => entry.length > 0);
  return list.some((entry) => path === entry || path.startsWith(`${entry}/`));
}
function normalizeTag(tag) {
  return tag.trim().replace(/^#/, "").toLowerCase();
}
function matchesPersonTag(cache, personTag) {
  const normalized = normalizeTag(personTag);
  if (!normalized || !cache) return false;
  const tags = (0, import_obsidian2.getAllTags)(cache);
  if (!tags) return false;
  return tags.some((tag) => normalizeTag(tag) === normalized);
}
function stripWikilink(raw) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[[") && trimmed.endsWith("]]")) {
    const inner = trimmed.slice(2, -2);
    const pipeIndex = inner.indexOf("|");
    return pipeIndex >= 0 ? inner.slice(0, pipeIndex) : inner;
  }
  return trimmed;
}
function toStringList(raw) {
  if (Array.isArray(raw)) return raw.map((entry) => String(entry));
  if (typeof raw === "string" && raw.trim().length > 0) return [raw];
  return [];
}
function resolvePhotoPath(app, rawPath, sourcePath) {
  const cleaned = stripWikilink(rawPath);
  if (!cleaned) return void 0;
  const direct = app.vault.getAbstractFileByPath(cleaned);
  if (direct) return direct.path;
  const resolved = app.metadataCache.getFirstLinkpathDest(cleaned, sourcePath);
  return resolved ? resolved.path : cleaned;
}
function resolveRole(relationType, settings) {
  if (relationType && settings.roles[relationType]) return settings.roles[relationType];
  return settings.defaultRole;
}
function parsePerson(app, file, cache, settings) {
  var _a;
  if (!matchesPersonTag(cache, settings.personTag)) return null;
  const fm = (_a = cache == null ? void 0 : cache.frontmatter) != null ? _a : {};
  const rawName = fm[settings.nameField];
  const displayName = rawName !== void 0 ? String(rawName) : file.basename;
  const rawPhoto = fm[settings.photoField];
  const photoPath = rawPhoto ? resolvePhotoPath(app, String(rawPhoto), file.path) : void 0;
  const rawRelation = fm[settings.relationField];
  const relationType = rawRelation !== void 0 ? stripWikilink(String(rawRelation)) : void 0;
  const rawCompany = fm[FIXED_FIELDS.company];
  const company = rawCompany !== void 0 ? stripWikilink(String(rawCompany)) : void 0;
  const isSelfRaw = fm[FIXED_FIELDS.isSelf];
  const isSelf = isSelfRaw === true || isSelfRaw === "true";
  const ghostRefs = toStringList(fm[settings.potentialContactsField]).map(
    (entry) => stripWikilink(entry)
  ).filter((entry) => entry.length > 0);
  return {
    id: file.path,
    file,
    displayName,
    photoPath,
    relationType,
    company,
    positionScore: resolveRole(relationType, settings).positionScore,
    isSelf,
    ghostRefs
  };
}

// src/bases/entry-adapter.ts
function readString(entry, prop) {
  if (!prop) return void 0;
  const value = entry.getValue(prop);
  if (!value || !value.isTruthy()) return void 0;
  const str = value.toString().trim();
  return str.length > 0 ? str : void 0;
}
function readStringList(entry, prop) {
  if (!prop) return [];
  const value = entry.getValue(prop);
  if (!value || !value.isTruthy()) return [];
  if (value instanceof import_obsidian3.ListValue) {
    const items = [];
    for (let i = 0; i < value.length(); i++) {
      const item = value.get(i).toString().trim();
      if (item.length > 0) items.push(item);
    }
    return items;
  }
  const single = value.toString().trim();
  return single.length > 0 ? [single] : [];
}
function readBoolean(entry, prop) {
  var _a, _b;
  return (_b = (_a = entry.getValue(prop)) == null ? void 0 : _a.isTruthy()) != null ? _b : false;
}
function adaptEntries(app, entries, mapping, settings) {
  var _a;
  const isSelfProp = `note.${FIXED_FIELDS.isSelf}`;
  const companyProp = `note.${FIXED_FIELDS.company}`;
  const people = [];
  for (const entry of entries) {
    if (entry.file.extension !== "md") continue;
    const rawPhoto = readString(entry, mapping.photoProp);
    const rawRelation = readString(entry, mapping.relationProp);
    const relationType = rawRelation !== void 0 ? stripWikilink(rawRelation) : void 0;
    const rawCompany = readString(entry, companyProp);
    people.push({
      id: entry.file.path,
      file: entry.file,
      displayName: (_a = readString(entry, mapping.nameProp)) != null ? _a : entry.file.basename,
      photoPath: rawPhoto ? resolvePhotoPath(app, rawPhoto, entry.file.path) : void 0,
      relationType,
      company: rawCompany !== void 0 ? stripWikilink(rawCompany) : void 0,
      positionScore: resolveRole(relationType, settings).positionScore,
      isSelf: readBoolean(entry, isSelfProp),
      ghostRefs: readStringList(entry, mapping.contactsProp).map(stripWikilink).filter((name) => name.length > 0)
    });
  }
  const noteExistsInVault = (name) => app.metadataCache.getFirstLinkpathDest(name, "") !== null;
  const { edges, ghosts } = buildContactLinks(people, noteExistsInVault);
  return { people, ghosts, edges };
}

// src/bases/options.ts
var OPTION_KEYS = {
  nameProperty: "nameProperty",
  photoProperty: "photoProperty",
  relationProperty: "relationProperty",
  contactsProperty: "contactsProperty",
  showEdges: "showEdges",
  showGhosts: "showGhosts",
  linkDistance: "linkDistance"
};
var DEFAULT_LINK_DISTANCE = 110;
function buildBasesOptions(settings) {
  return [
    {
      type: "property",
      key: OPTION_KEYS.nameProperty,
      displayName: t("settings.nameField.name"),
      default: `note.${settings.nameField}`
    },
    {
      type: "property",
      key: OPTION_KEYS.photoProperty,
      displayName: t("settings.photoField.name"),
      default: `note.${settings.photoField}`
    },
    {
      type: "property",
      key: OPTION_KEYS.relationProperty,
      displayName: t("settings.relationField.name"),
      default: `note.${settings.relationField}`
    },
    {
      type: "property",
      key: OPTION_KEYS.contactsProperty,
      displayName: t("settings.potentialContactsField.name"),
      default: `note.${settings.potentialContactsField}`
    },
    {
      type: "toggle",
      key: OPTION_KEYS.showEdges,
      displayName: t("panel.showEdges"),
      default: true
    },
    {
      type: "toggle",
      key: OPTION_KEYS.showGhosts,
      displayName: t("panel.showGhosts"),
      default: true
    },
    {
      type: "slider",
      key: OPTION_KEYS.linkDistance,
      displayName: t("panel.linkDistance"),
      default: DEFAULT_LINK_DISTANCE,
      min: 40,
      max: 260,
      step: 5,
      instant: true
    }
  ];
}

// src/bases/graph-bases-view.ts
var BASES_VIEW_TYPE = "person-network";
var PersonNetworkBasesView = class extends import_obsidian4.BasesView {
  constructor(controller, parentEl, plugin) {
    super(controller);
    this.type = BASES_VIEW_TYPE;
    this.renderer = null;
    this.tooltip = null;
    this.peopleById = /* @__PURE__ */ new Map();
    this.ghostsById = /* @__PURE__ */ new Map();
    this.plugin = plugin;
    this.rootEl = parentEl.createDiv({ cls: "person-network-container person-network-bases" });
  }
  onload() {
    this.ensureUi();
  }
  onunload() {
    var _a, _b;
    (_a = this.renderer) == null ? void 0 : _a.destroy();
    (_b = this.tooltip) == null ? void 0 : _b.destroy();
    this.renderer = null;
    this.tooltip = null;
    this.rootEl.remove();
  }
  onDataUpdated() {
    const renderer = this.ensureUi();
    const snapshot = adaptEntries(this.app, this.data.data, this.readMapping(), this.plugin.settings);
    this.peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
    this.ghostsById = new Map(snapshot.ghosts.map((ghost) => [ghost.id, ghost]));
    renderer.filter = {
      search: "",
      relationTypes: null,
      companies: null,
      showEdges: this.readToggle(OPTION_KEYS.showEdges),
      showGhosts: this.readToggle(OPTION_KEYS.showGhosts)
    };
    const rawDistance = this.config.get(OPTION_KEYS.linkDistance);
    if (typeof rawDistance === "number" && rawDistance !== renderer.getForces().linkDistance) {
      renderer.setForces({ ...renderer.getForces(), linkDistance: rawDistance });
    }
    renderer.setGraph(snapshot);
  }
  ensureUi() {
    if (this.renderer) return this.renderer;
    this.renderer = new CanvasRenderer(this.rootEl, this.app, () => this.plugin.settings);
    this.tooltip = new Tooltip(this.rootEl);
    wireGraphInteraction(this, this.renderer, this.tooltip, {
      onNodeClick: (id) => this.handleClick(id),
      getTooltipLines: (id) => {
        const person = this.peopleById.get(id);
        if (person) return personTooltipLines(person);
        const ghost = this.ghostsById.get(id);
        if (ghost) return ghostTooltipLines(ghost);
        return null;
      }
    });
    this.registerEvent(this.app.workspace.on("css-change", () => {
      var _a;
      return (_a = this.renderer) == null ? void 0 : _a.onThemeChange();
    }));
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        var _a;
        if (file instanceof import_obsidian4.TFile) (_a = this.renderer) == null ? void 0 : _a.onPhotoModified(file.path);
      })
    );
    return this.renderer;
  }
  handleClick(id) {
    const person = this.peopleById.get(id);
    if (person) {
      void this.app.workspace.getLeaf("tab").openFile(person.file);
      return;
    }
    const ghost = this.ghostsById.get(id);
    if (ghost) {
      void this.createFileForView(ghost.displayName, (frontmatter) => {
        frontmatter[this.plugin.settings.nameField] = ghost.displayName;
      });
    }
  }
  readMapping() {
    var _a, _b, _c, _d;
    const settings = this.plugin.settings;
    return {
      nameProp: (_a = this.config.getAsPropertyId(OPTION_KEYS.nameProperty)) != null ? _a : `note.${settings.nameField}`,
      photoProp: (_b = this.config.getAsPropertyId(OPTION_KEYS.photoProperty)) != null ? _b : `note.${settings.photoField}`,
      relationProp: (_c = this.config.getAsPropertyId(OPTION_KEYS.relationProperty)) != null ? _c : `note.${settings.relationField}`,
      contactsProp: (_d = this.config.getAsPropertyId(OPTION_KEYS.contactsProperty)) != null ? _d : `note.${settings.potentialContactsField}`
    };
  }
  readToggle(key) {
    const raw = this.config.get(key);
    return typeof raw === "boolean" ? raw : true;
  }
};

// src/settings/defaults.ts
var DEFAULT_SETTINGS = {
  personTag: DEFAULT_FIELD_NAMES.personTag,
  nameField: DEFAULT_FIELD_NAMES.nameField,
  photoField: DEFAULT_FIELD_NAMES.photoField,
  relationField: DEFAULT_FIELD_NAMES.relationField,
  potentialContactsField: DEFAULT_FIELD_NAMES.potentialContactsField,
  excludePaths: "Templates",
  roles: {
    friend: { color: "#5b8def", ringStyle: "solid", positionScore: 8 },
    family: { color: "#e0607e", ringStyle: "solid", positionScore: 9 },
    colleague: { color: "#4caf50", ringStyle: "dashed", positionScore: 5 }
  },
  defaultRole: { color: "#8a8a8a", ringStyle: "dotted", positionScore: 3 },
  centerLabel: "",
  enableBases: true,
  newNoteFolder: "",
  newNoteTemplatePath: ""
};

// src/settings/settings-tab.ts
var import_obsidian7 = require("obsidian");

// src/settings/file-suggest.ts
var import_obsidian5 = require("obsidian");
var MarkdownFileSuggest = class extends import_obsidian5.AbstractInputSuggest {
  constructor(app, textInputEl) {
    super(app, textInputEl);
  }
  getSuggestions(query) {
    const q = query.trim().toLowerCase();
    const files = this.app.vault.getMarkdownFiles();
    const matches = q.length === 0 ? files : files.filter((file) => file.path.toLowerCase().includes(q));
    return matches.slice(0, 50);
  }
  renderSuggestion(file, el) {
    el.setText(file.path);
  }
};

// src/settings/tag-suggest.ts
var import_obsidian6 = require("obsidian");
var CACHE_TTL_MS = 1e4;
function collectVaultTags(app) {
  const tags = /* @__PURE__ */ new Set();
  for (const file of app.vault.getMarkdownFiles()) {
    const cache = app.metadataCache.getFileCache(file);
    const fileTags = cache ? (0, import_obsidian6.getAllTags)(cache) : null;
    if (!fileTags) continue;
    for (const tag of fileTags) tags.add(tag.replace(/^#/, ""));
  }
  return [...tags].sort();
}
var TagSuggest = class extends import_obsidian6.AbstractInputSuggest {
  constructor(app, textInputEl) {
    super(app, textInputEl);
    this.cachedTags = null;
    this.cachedAt = 0;
  }
  /** The full-vault scan is O(files), too heavy to repeat per keystroke — cache it briefly. */
  allTags() {
    const now = Date.now();
    if (!this.cachedTags || now - this.cachedAt > CACHE_TTL_MS) {
      this.cachedTags = collectVaultTags(this.app);
      this.cachedAt = now;
    }
    return this.cachedTags;
  }
  getSuggestions(query) {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    const tags = this.allTags();
    return (q.length === 0 ? tags : tags.filter((tag) => tag.toLowerCase().includes(q))).slice(0, 50);
  }
  renderSuggestion(tag, el) {
    el.setText(`#${tag}`);
  }
};

// src/settings/settings-tab.ts
var RING_STYLES = ["solid", "dashed", "dotted"];
var HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
function toHex(value, fallback) {
  return HEX_COLOR.test(value.trim()) ? value.trim() : fallback;
}
var ConfirmResetRolesModal = class extends import_obsidian7.Modal {
  constructor(app, onConfirm) {
    super(app);
    this.onConfirm = onConfirm;
  }
  onOpen() {
    this.titleEl.setText(t("settings.resetRolesConfirmTitle"));
    this.contentEl.createEl("p", { text: t("settings.resetRolesConfirmBody") });
    const buttons = this.contentEl.createDiv({ cls: "person-network-modal-buttons" });
    buttons.createEl("button", { text: t("common.cancel") }).addEventListener("click", () => this.close());
    const resetButton = buttons.createEl("button", { text: t("common.reset"), cls: "mod-warning" });
    resetButton.addEventListener("click", () => {
      this.onConfirm();
      this.close();
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var PersonNetworkSettingTab = class extends import_obsidian7.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    this.renderGeneralSection(containerEl);
    this.renderNewNoteSection(containerEl);
    this.renderRolesSection(containerEl);
    this.renderPersonDetectionSection(containerEl);
  }
  async save() {
    await this.plugin.saveSettings();
  }
  resetRolesToDefaults() {
    const settings = this.plugin.settings;
    settings.roles = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.roles));
    settings.defaultRole = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.defaultRole));
    void this.save();
    this.display();
  }
  /**
   * Heading (with its own description) sits outside the card. The rows
   * below it go inside our own `.person-network-settings-group` div, which
   * owns the background/border itself (see styles.css) and strips any
   * per-row background Obsidian/the active theme might apply to
   * `.setting-item` — so the card look no longer depends on guessing what
   * the current theme does natively.
   */
  heading(containerEl, headingKey, descKey) {
    new import_obsidian7.Setting(containerEl).setName(t(headingKey)).setHeading().setDesc(t(descKey));
    return containerEl.createDiv({ cls: "person-network-settings-group" });
  }
  /** A compact +/- stepper, clamped to 1-10, used for a role's position score. */
  addPositionStepper(setting, initial, onChange) {
    let value = initial;
    const wrapper = setting.controlEl.createDiv({ cls: "person-network-stepper" });
    const minusButton = wrapper.createEl("button", {
      cls: "person-network-stepper-btn",
      text: "\u2212",
      attr: { type: "button" }
    });
    const valueEl = wrapper.createSpan({ cls: "person-network-stepper-value", text: String(value) });
    const plusButton = wrapper.createEl("button", {
      cls: "person-network-stepper-btn",
      text: "+",
      attr: { type: "button" }
    });
    const update = (next) => {
      value = Math.min(10, Math.max(1, next));
      valueEl.setText(String(value));
      onChange(value);
    };
    minusButton.addEventListener("click", () => update(value - 1));
    plusButton.addEventListener("click", () => update(value + 1));
  }
  renderGeneralSection(containerEl) {
    const group = this.heading(containerEl, "settings.generalHeading", "settings.generalDesc");
    const settings = this.plugin.settings;
    new import_obsidian7.Setting(group).setName(t("settings.centerLabel.name")).setDesc(t("settings.centerLabel.desc")).addText(
      (text) => text.setPlaceholder(t("view.defaultCenterLabel")).setValue(settings.centerLabel).onChange(async (value) => {
        settings.centerLabel = value;
        await this.save();
      })
    );
    new import_obsidian7.Setting(group).setName(t("settings.enableBases.name")).setDesc(t("settings.enableBases.desc")).addToggle(
      (toggle) => toggle.setValue(settings.enableBases).onChange(async (value) => {
        settings.enableBases = value;
        await this.save();
        new import_obsidian7.Notice(t("settings.enableBases.reloadNotice"));
      })
    );
  }
  renderNewNoteSection(containerEl) {
    const group = this.heading(containerEl, "settings.newNoteHeading", "settings.newNoteDesc");
    const settings = this.plugin.settings;
    new import_obsidian7.Setting(group).setName(t("settings.newNoteFolder.name")).setDesc(t("settings.newNoteFolder.desc")).addText(
      (text) => text.setValue(settings.newNoteFolder).onChange(async (value) => {
        settings.newNoteFolder = value;
        await this.save();
      })
    );
    new import_obsidian7.Setting(group).setName(t("settings.newNoteTemplatePath.name")).setDesc(t("settings.newNoteTemplatePath.desc")).addText((text) => {
      text.setPlaceholder(t("settings.newNoteTemplatePath.placeholder")).setValue(settings.newNoteTemplatePath).onChange(async (value) => {
        settings.newNoteTemplatePath = value;
        await this.save();
      });
      new MarkdownFileSuggest(this.app, text.inputEl).onSelect(async (file) => {
        text.setValue(file.path);
        settings.newNoteTemplatePath = file.path;
        await this.save();
        text.inputEl.blur();
      });
    });
  }
  renderRolesSection(containerEl) {
    const group = this.heading(containerEl, "settings.rolesHeading", "settings.rolesDesc");
    const settings = this.plugin.settings;
    let newRoleName = "";
    new import_obsidian7.Setting(group).addText(
      (text) => text.setPlaceholder(t("settings.newRolePlaceholder")).onChange((value) => {
        newRoleName = value.trim();
      })
    ).addButton(
      (button) => button.setButtonText(t("settings.addRole")).onClick(async () => {
        if (!newRoleName || settings.roles[newRoleName]) return;
        settings.roles[newRoleName] = { color: "#9e9e9e", ringStyle: "solid", positionScore: 5 };
        await this.save();
        this.display();
      })
    );
    const defaultRow = new import_obsidian7.Setting(group).setName(t("settings.defaultRoleName"));
    this.addPositionStepper(defaultRow, settings.defaultRole.positionScore, (value) => {
      settings.defaultRole.positionScore = value;
      void this.save();
    });
    defaultRow.addColorPicker(
      (picker) => picker.setValue(toHex(settings.defaultRole.color, "#8a8a8a")).onChange(async (value) => {
        settings.defaultRole.color = value;
        await this.save();
      })
    );
    defaultRow.addDropdown((dropdown) => {
      for (const ringStyle of RING_STYLES) {
        dropdown.addOption(ringStyle, t(`settings.ringStyle.${ringStyle}`));
      }
      dropdown.setValue(settings.defaultRole.ringStyle).onChange(async (value) => {
        settings.defaultRole.ringStyle = value;
        await this.save();
      });
    });
    defaultRow.addExtraButton((button) => {
      button.setIcon("trash").setTooltip(t("settings.resetRolesTooltip")).onClick(() => {
        new ConfirmResetRolesModal(this.app, () => this.resetRolesToDefaults()).open();
      });
      button.extraSettingsEl.addClass("person-network-danger-icon");
    });
    for (const relationType of Object.keys(settings.roles)) {
      const role = settings.roles[relationType];
      const row = new import_obsidian7.Setting(group).setName(relationType);
      this.addPositionStepper(row, role.positionScore, (value) => {
        role.positionScore = value;
        void this.save();
      });
      row.addColorPicker(
        (picker) => picker.setValue(toHex(role.color, "#9e9e9e")).onChange(async (value) => {
          role.color = value;
          await this.save();
        })
      );
      row.addDropdown((dropdown) => {
        for (const ringStyle of RING_STYLES) {
          dropdown.addOption(ringStyle, t(`settings.ringStyle.${ringStyle}`));
        }
        dropdown.setValue(role.ringStyle).onChange(async (value) => {
          role.ringStyle = value;
          await this.save();
        });
      });
      row.addExtraButton(
        (button) => button.setIcon("trash").setTooltip(t("common.remove")).onClick(async () => {
          delete settings.roles[relationType];
          await this.save();
          this.display();
        })
      );
    }
  }
  renderPersonDetectionSection(containerEl) {
    const group = this.heading(containerEl, "settings.personDetectionHeading", "settings.personDetectionDesc");
    const settings = this.plugin.settings;
    new import_obsidian7.Setting(group).setName(t("settings.personTag.name")).setDesc(t("settings.personTag.desc")).addText((text) => {
      text.setValue(settings.personTag).onChange(async (value) => {
        settings.personTag = value.replace(/^#/, "");
        await this.save();
      });
      new TagSuggest(this.app, text.inputEl).onSelect(async (tag) => {
        text.setValue(tag);
        settings.personTag = tag;
        await this.save();
        text.inputEl.blur();
      });
    });
    const fieldRows = [
      ["nameField", "settings.nameField.name", "settings.nameField.desc"],
      ["photoField", "settings.photoField.name", "settings.photoField.desc"],
      ["relationField", "settings.relationField.name", "settings.relationField.desc"],
      [
        "potentialContactsField",
        "settings.potentialContactsField.name",
        "settings.potentialContactsField.desc"
      ],
      ["excludePaths", "settings.excludePaths.name", "settings.excludePaths.desc"]
    ];
    for (const [key, nameKey, descKey] of fieldRows) {
      new import_obsidian7.Setting(group).setName(t(nameKey)).setDesc(t(descKey)).addText(
        (text) => text.setValue(settings[key]).onChange(async (value) => {
          settings[key] = value;
          await this.save();
        })
      );
    }
  }
};

// src/utils/debounce.ts
var import_obsidian8 = require("obsidian");
function debounced(fn, timeoutMs = 200) {
  return (0, import_obsidian8.debounce)(fn, timeoutMs, true);
}

// src/view/graph-view.ts
var import_obsidian13 = require("obsidian");

// src/data/store.ts
var import_obsidian9 = require("obsidian");
var EMPTY_SNAPSHOT = { people: [], ghosts: [], edges: [] };
var DataStore = class extends import_obsidian9.Component {
  constructor(app, getSettings) {
    super();
    this.listeners = /* @__PURE__ */ new Set();
    this.snapshot = EMPTY_SNAPSHOT;
    this.app = app;
    this.getSettings = getSettings;
    this.requestReindex = debounced(() => this.reindex(), 250);
  }
  onload() {
    this.reindex();
    this.registerEvent(this.app.metadataCache.on("changed", () => this.requestReindex()));
    this.registerEvent(this.app.metadataCache.on("resolved", () => this.requestReindex()));
    this.registerEvent(this.app.vault.on("delete", () => this.requestReindex()));
    this.registerEvent(this.app.vault.on("rename", () => this.requestReindex()));
  }
  onunload() {
    this.listeners.clear();
  }
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }
  getSnapshot() {
    return this.snapshot;
  }
  reindex() {
    const settings = this.getSettings();
    const people = [];
    for (const file of this.app.vault.getMarkdownFiles()) {
      if (isExcluded(file.path, settings.excludePaths)) continue;
      const cache = this.app.metadataCache.getFileCache(file);
      const person = parsePerson(this.app, file, cache, settings);
      if (person) people.push(person);
    }
    const { edges, ghosts } = buildContactLinks(people);
    this.snapshot = { people, ghosts, edges };
    for (const listener of this.listeners) listener(this.snapshot);
  }
};

// src/export/png-export.ts
function exportCanvasAsPng(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

// src/view/context-actions.ts
var import_obsidian11 = require("obsidian");

// src/ghost/ghost-note-creator.ts
var import_obsidian10 = require("obsidian");
function fillTemplate(template, name) {
  return template.split("{{name}}").join(name);
}
function buildFallbackTemplate(settings) {
  return `---
tags:
  - ${settings.personTag}
${settings.nameField}: {{name}}
---
`;
}
async function loadTemplate(app, settings) {
  const path = settings.newNoteTemplatePath.trim();
  if (!path) return buildFallbackTemplate(settings);
  const file = app.vault.getAbstractFileByPath((0, import_obsidian10.normalizePath)(path));
  if (!(file instanceof import_obsidian10.TFile)) return buildFallbackTemplate(settings);
  try {
    return await app.vault.read(file);
  } catch (e) {
    return buildFallbackTemplate(settings);
  }
}
async function ensureFolderExists(app, folder) {
  const trimmed = folder.trim().replace(/\/+$/, "");
  if (!trimmed) return;
  const path = (0, import_obsidian10.normalizePath)(trimmed);
  if (!app.vault.getAbstractFileByPath(path)) {
    await app.vault.createFolder(path);
  }
}
async function findAvailablePath(app, folder, baseName) {
  const prefix = folder.trim().replace(/\/+$/, "");
  const folderPrefix = prefix ? `${prefix}/` : "";
  let attempt = 1;
  let candidate = (0, import_obsidian10.normalizePath)(`${folderPrefix}${baseName}.md`);
  while (app.vault.getAbstractFileByPath(candidate)) {
    attempt += 1;
    candidate = (0, import_obsidian10.normalizePath)(`${folderPrefix}${baseName} ${attempt}.md`);
  }
  return candidate;
}
async function createNoteForGhostName(app, settings, name) {
  try {
    await ensureFolderExists(app, settings.newNoteFolder);
    const path = await findAvailablePath(app, settings.newNoteFolder, name);
    const template = await loadTemplate(app, settings);
    const content = fillTemplate(template, name);
    return await app.vault.create(path, content);
  } catch (e) {
    return void 0;
  }
}

// src/view/context-actions.ts
var ConfirmCreateNoteModal = class extends import_obsidian11.Modal {
  constructor(app, name, onConfirm) {
    super(app);
    this.name = name;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    this.titleEl.setText(t("ghost.confirmTitle", { name: this.name }));
    this.contentEl.createEl("p", { text: t("ghost.confirmBody", { name: this.name }) });
    const buttons = this.contentEl.createDiv({ cls: "person-network-modal-buttons" });
    buttons.createEl("button", { text: t("common.cancel") }).addEventListener("click", () => this.close());
    const createButton = buttons.createEl("button", { text: t("common.create"), cls: "mod-cta" });
    createButton.addEventListener("click", () => {
      this.onConfirm();
      this.close();
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
function handleNodeClick(app, settings, id, peopleById, ghostsById) {
  const person = peopleById.get(id);
  if (person) {
    void app.workspace.getLeaf("tab").openFile(person.file);
    return;
  }
  const ghost = ghostsById.get(id);
  if (!ghost) return;
  new ConfirmCreateNoteModal(app, ghost.displayName, () => {
    void createNoteForGhostName(app, settings, ghost.displayName).then((file) => {
      if (file) {
        new import_obsidian11.Notice(t("ghost.noticeCreated", { name: ghost.displayName }));
        void app.workspace.getLeaf("tab").openFile(file);
      } else {
        new import_obsidian11.Notice(t("ghost.noticeFailed", { name: ghost.displayName }));
      }
    });
  }).open();
}

// src/view/filter-panel.ts
var import_obsidian12 = require("obsidian");
function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
function appendCollapseTriangle(parent) {
  const svg = parent.createSvg("svg", {
    attr: {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    },
    cls: "svg-icon right-triangle"
  });
  svg.createSvg("path", { attr: { d: "M3 8L12 17L21 8" } });
}
var FilterPanel = class {
  constructor(container, options) {
    /** Collapse state per section, so panel rebuilds don't reset what the user expanded. */
    this.expandedSections = /* @__PURE__ */ new Map();
    this.filter = { ...options.initialFilter };
    this.forces = { ...options.initialForces };
    this.display = { ...options.initialDisplay };
    this.defaultFilter = { ...options.initialFilter };
    this.defaultForces = { ...options.initialForces };
    this.defaultDisplay = { ...options.initialDisplay };
    this.relationTypes = options.relationTypes;
    this.companies = options.companies;
    this.onChange = options.onChange;
    this.onForcesChange = options.onForcesChange;
    this.onDisplayChange = options.onDisplayChange;
    this.onReplayAnimation = options.onReplayAnimation;
    this.rootEl = container.createDiv({ cls: "person-network-panel-root is-close" });
    this.createButton("mod-close", "x", t("common.close"), () => this.setOpen(false));
    this.createButton("mod-open", "settings", t("view.filterAction"), () => this.setOpen(true));
    this.createButton("mod-animate", "wand-2", t("panel.replayAnimation"), () => this.onReplayAnimation());
    this.createButton("mod-reset", "rotate-ccw", t("panel.resetTooltip"), () => this.resetToDefaults());
    this.sectionsHost = this.rootEl.createDiv({ cls: "person-network-panel-sections" });
    this.render();
  }
  updateAvailable(relationTypes, companies) {
    const unchanged = arraysEqual(this.relationTypes, relationTypes) && arraysEqual(this.companies, companies);
    this.relationTypes = relationTypes;
    this.companies = companies;
    if (!unchanged) this.render();
  }
  destroy() {
    this.rootEl.remove();
  }
  createButton(modClass, icon, tooltip, onClick) {
    const el = this.rootEl.createDiv({ cls: `clickable-icon graph-controls-button ${modClass}` });
    el.setAttribute("aria-label", tooltip);
    (0, import_obsidian12.setIcon)(el, icon);
    el.addEventListener("click", onClick);
  }
  setOpen(open) {
    this.rootEl.toggleClass("is-close", !open);
  }
  resetToDefaults() {
    this.filter = { ...this.defaultFilter };
    this.forces = { ...this.defaultForces };
    this.display = { ...this.defaultDisplay };
    this.emitChange();
    this.emitForcesChange();
    this.emitDisplayChange();
    this.render();
  }
  emitChange() {
    this.onChange({ ...this.filter });
  }
  emitDisplayChange() {
    this.onDisplayChange({ ...this.display });
  }
  emitForcesChange() {
    this.onForcesChange({ ...this.forces });
  }
  isAllowed(set, value) {
    return set === null || set.has(value);
  }
  /** null means "no filter" (everything allowed); we collapse back to null once nothing is excluded. */
  toggleValue(current, allValues, value, checked) {
    const next = current === null ? new Set(allValues) : new Set(current);
    if (checked) next.add(value);
    else next.delete(value);
    return next.size === allValues.length ? null : next;
  }
  renderSection(parent, headingKey, defaultExpanded, build) {
    var _a;
    const section = parent.createDiv({ cls: "tree-item graph-control-section" });
    const self = section.createDiv({ cls: "tree-item-self mod-collapsible" });
    const iconEl = self.createDiv({ cls: "tree-item-icon collapse-icon" });
    appendCollapseTriangle(iconEl);
    const inner = self.createDiv({ cls: "tree-item-inner" });
    inner.createEl("header", { cls: "graph-control-section-header", text: t(headingKey) });
    const content = section.createDiv({ cls: "tree-item-children" });
    let expanded = (_a = this.expandedSections.get(headingKey)) != null ? _a : defaultExpanded;
    const applyState = () => {
      section.toggleClass("is-collapsed", !expanded);
      iconEl.toggleClass("is-collapsed", !expanded);
    };
    self.addEventListener("click", () => {
      expanded = !expanded;
      this.expandedSections.set(headingKey, expanded);
      applyState();
    });
    applyState();
    build(content);
  }
  /** A slider row whose track sits on its own line under the label (native `.mod-slider` layout). */
  sliderRow(content, labelKey, range, value, onChange) {
    const setting = new import_obsidian12.Setting(content).setName(t(labelKey)).addSlider(
      (slider) => slider.setLimits(range.min, range.max, range.step).setValue(value).onChange(onChange)
    );
    setting.settingEl.addClass("mod-slider");
  }
  toggleRow(content, labelKey, value, onChange) {
    const setting = new import_obsidian12.Setting(content).setName(t(labelKey)).addToggle((toggle) => toggle.setValue(value).onChange(onChange));
    setting.settingEl.addClass("mod-toggle");
  }
  render() {
    this.sectionsHost.empty();
    this.renderSection(this.sectionsHost, "panel.filtersHeading", true, (content) => {
      new import_obsidian12.Setting(content).addSearch(
        (search) => search.setPlaceholder(t("panel.searchPlaceholder")).setValue(this.filter.search).onChange((value) => {
          this.filter.search = value;
          this.emitChange();
        })
      ).settingEl.addClass("mod-search-setting");
      if (this.relationTypes.length > 0) {
        new import_obsidian12.Setting(content).setName(t("panel.relationHeading")).setHeading();
        for (const relationType of this.relationTypes) {
          new import_obsidian12.Setting(content).setName(relationType).addToggle(
            (toggle) => toggle.setValue(this.isAllowed(this.filter.relationTypes, relationType)).onChange((value) => {
              this.filter.relationTypes = this.toggleValue(
                this.filter.relationTypes,
                this.relationTypes,
                relationType,
                value
              );
              this.emitChange();
            })
          );
        }
      }
      if (this.companies.length > 0) {
        new import_obsidian12.Setting(content).setName(t("panel.companyHeading")).setHeading();
        for (const company of this.companies) {
          new import_obsidian12.Setting(content).setName(company).addToggle(
            (toggle) => toggle.setValue(this.isAllowed(this.filter.companies, company)).onChange((value) => {
              this.filter.companies = this.toggleValue(this.filter.companies, this.companies, company, value);
              this.emitChange();
            })
          );
        }
      }
    });
    this.renderSection(this.sectionsHost, "panel.displayHeading", false, (content) => {
      this.toggleRow(content, "panel.showEdges", this.filter.showEdges, (value) => {
        this.filter.showEdges = value;
        this.emitChange();
      });
      this.toggleRow(content, "panel.showGhosts", this.filter.showGhosts, (value) => {
        this.filter.showGhosts = value;
        this.emitChange();
      });
      this.sliderRow(content, "panel.nodeSize", { min: 0.5, max: 1.8, step: 0.1 }, this.display.nodeScale, (value) => {
        this.display.nodeScale = value;
        this.emitDisplayChange();
      });
      this.sliderRow(content, "panel.edgeThickness", { min: 0.5, max: 4, step: 0.2 }, this.display.edgeWidth, (value) => {
        this.display.edgeWidth = value;
        this.emitDisplayChange();
      });
    });
    this.renderSection(this.sectionsHost, "panel.forcesHeading", true, (content) => {
      this.sliderRow(content, "panel.repulsion", { min: 400, max: 6e3, step: 100 }, this.forces.repulsionStrength, (value) => {
        this.forces.repulsionStrength = value;
        this.emitForcesChange();
      });
      this.sliderRow(content, "panel.linkStrength", { min: 0, max: 1, step: 0.05 }, this.forces.linkStrength, (value) => {
        this.forces.linkStrength = value;
        this.emitForcesChange();
      });
      this.sliderRow(content, "panel.linkDistance", { min: 40, max: 260, step: 5 }, this.forces.linkDistance, (value) => {
        this.forces.linkDistance = value;
        this.emitForcesChange();
      });
      this.sliderRow(content, "panel.centerStrength", { min: 0, max: 0.2, step: 0.01 }, this.forces.centerStrength, (value) => {
        this.forces.centerStrength = value;
        this.emitForcesChange();
      });
    });
  }
};

// src/view/graph-view.ts
var VIEW_TYPE_PERSON_NETWORK = "person-network-view";
var PersonNetworkView = class extends import_obsidian13.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.dataStore = null;
    this.renderer = null;
    this.filterPanel = null;
    this.tooltip = null;
    this.peopleById = /* @__PURE__ */ new Map();
    this.ghostsById = /* @__PURE__ */ new Map();
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_PERSON_NETWORK;
  }
  getDisplayText() {
    return t("view.displayName");
  }
  getIcon() {
    return "network";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("person-network-container");
    this.dataStore = new DataStore(this.app, () => this.plugin.settings);
    this.addChild(this.dataStore);
    this.renderer = new CanvasRenderer(container, this.app, () => this.plugin.settings);
    this.tooltip = new Tooltip(container);
    this.filterPanel = new FilterPanel(container, {
      initialFilter: this.renderer.filter,
      initialForces: this.renderer.getForces(),
      initialDisplay: this.renderer.getDisplay(),
      relationTypes: [],
      companies: [],
      onChange: (filter) => this.applyFilter(filter),
      onForcesChange: (forces) => {
        var _a;
        return (_a = this.renderer) == null ? void 0 : _a.setForces(forces);
      },
      onDisplayChange: (display) => {
        var _a;
        return (_a = this.renderer) == null ? void 0 : _a.setDisplay(display);
      },
      onReplayAnimation: () => {
        var _a;
        return (_a = this.renderer) == null ? void 0 : _a.replayAnimation();
      }
    });
    wireGraphInteraction(this, this.renderer, this.tooltip, {
      onNodeClick: (id) => handleNodeClick(this.app, this.plugin.settings, id, this.peopleById, this.ghostsById),
      getTooltipLines: (id) => {
        const person = this.peopleById.get(id);
        if (person) return personTooltipLines(person);
        const ghost = this.ghostsById.get(id);
        if (ghost) return ghostTooltipLines(ghost);
        return null;
      }
    });
    this.addAction("download", t("view.exportAction"), () => void this.exportPng());
    this.registerEvent(this.app.workspace.on("css-change", () => {
      var _a;
      return (_a = this.renderer) == null ? void 0 : _a.onThemeChange();
    }));
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        var _a;
        if (file instanceof import_obsidian13.TFile) (_a = this.renderer) == null ? void 0 : _a.onPhotoModified(file.path);
      })
    );
    this.dataStore.subscribe((snapshot) => this.onSnapshot(snapshot));
  }
  // eslint-disable-next-line @typescript-eslint/require-await -- ItemView requires an async signature
  async onClose() {
    var _a, _b, _c;
    (_a = this.renderer) == null ? void 0 : _a.destroy();
    (_b = this.filterPanel) == null ? void 0 : _b.destroy();
    (_c = this.tooltip) == null ? void 0 : _c.destroy();
  }
  /** Called by the plugin after settings change, so role edits etc. show up without reopening the view. */
  onSettingsChanged() {
    var _a, _b;
    (_a = this.dataStore) == null ? void 0 : _a.reindex();
    (_b = this.renderer) == null ? void 0 : _b.requestRedraw();
  }
  onSnapshot(snapshot) {
    var _a, _b;
    this.peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
    this.ghostsById = new Map(snapshot.ghosts.map((ghost) => [ghost.id, ghost]));
    (_a = this.renderer) == null ? void 0 : _a.setGraph(snapshot);
    const relationTypes = [
      ...new Set(snapshot.people.map((person) => person.relationType).filter((v) => !!v))
    ].sort();
    const companies = [
      ...new Set(snapshot.people.map((person) => person.company).filter((v) => !!v))
    ].sort();
    (_b = this.filterPanel) == null ? void 0 : _b.updateAvailable(relationTypes, companies);
    this.renderEmptyState(snapshot.people.length === 0);
  }
  renderEmptyState(isEmpty) {
    const container = this.containerEl.children[1];
    const existing = container.querySelector(".person-network-empty");
    if (!isEmpty) {
      existing == null ? void 0 : existing.remove();
      return;
    }
    if (existing) return;
    const settings = this.plugin.settings;
    const emptyEl = container.createDiv({ cls: "person-network-empty" });
    emptyEl.createEl("h4", { text: t("view.emptyTitle") });
    emptyEl.createEl("p", {
      text: t("view.emptyBody", { value: settings.personTag })
    });
    emptyEl.createEl("p", { text: t("view.emptyHint") });
    const code = emptyEl.createEl("pre");
    code.createEl("code", {
      text: `---
tags:
  - ${settings.personTag}
${settings.nameField}: Jane Doe
---`
    });
  }
  applyFilter(filter) {
    if (!this.renderer) return;
    this.renderer.filter = filter;
    this.renderer.requestRedraw();
  }
  async exportPng() {
    if (!this.renderer || !this.renderer.hasVisibleContent()) {
      new import_obsidian13.Notice(t("view.notice.exportFailed"));
      return;
    }
    const blob = await exportCanvasAsPng(this.renderer.getCanvasElement());
    if (!blob) {
      new import_obsidian13.Notice(t("view.notice.exportFailed"));
      return;
    }
    const url = URL.createObjectURL(blob);
    const anchor = createEl("a", { href: url });
    anchor.download = "person-network.png";
    anchor.click();
    URL.revokeObjectURL(url);
    new import_obsidian13.Notice(t("view.notice.exportSuccess"));
  }
};

// src/main.ts
var PersonNetworkPlugin = class extends import_obsidian14.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    /** Debounced because text settings save on every keystroke — one refresh per burst is enough. */
    this.refreshOpenViews = debounced(() => {
      for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_PERSON_NETWORK)) {
        if (leaf.view instanceof PersonNetworkView) leaf.view.onSettingsChanged();
      }
    }, 400);
  }
  async onload() {
    await this.loadSettings();
    setLocale("auto");
    this.registerView(VIEW_TYPE_PERSON_NETWORK, (leaf) => new PersonNetworkView(leaf, this));
    if (this.settings.enableBases && typeof this.registerBasesView === "function") {
      this.registerBasesView(BASES_VIEW_TYPE, {
        name: t("bases.viewName"),
        icon: "network",
        factory: (controller, containerEl) => new PersonNetworkBasesView(controller, containerEl, this),
        options: () => buildBasesOptions(this.settings)
      });
    }
    this.addRibbonIcon("network", t("view.ribbonTooltip"), () => {
      void this.activateView();
    });
    this.addSettingTab(new PersonNetworkSettingTab(this.app, this));
    this.addCommand({
      id: "open",
      name: t("view.openCommand"),
      callback: () => void this.activateView()
    });
  }
  onunload() {
  }
  async loadSettings() {
    const data = await this.loadData();
    const defaults = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    if (data) {
      const target = defaults;
      const source = data;
      for (const key of Object.keys(defaults)) {
        if (source[key] !== void 0) target[key] = source[key];
      }
    }
    this.settings = defaults;
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.refreshOpenViews();
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = null;
    const existingLeaves = workspace.getLeavesOfType(VIEW_TYPE_PERSON_NETWORK);
    if (existingLeaves.length > 0) {
      leaf = existingLeaves[0];
    } else {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: VIEW_TYPE_PERSON_NETWORK, active: true });
    }
    if (leaf) void workspace.revealLeaf(leaf);
  }
};
