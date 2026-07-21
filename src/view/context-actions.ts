import { Modal, Notice, type App } from "obsidian";
import type { GhostNode, PersonNode, PluginSettings } from "../data/types";
import { createNoteForGhostName } from "../ghost/ghost-note-creator";
import { t } from "../i18n";

class ConfirmCreateNoteModal extends Modal {
	constructor(
		app: App,
		private readonly name: string,
		private readonly onConfirm: () => void,
	) {
		super(app);
	}

	override onOpen(): void {
		this.titleEl.setText(t("ghost.confirmTitle", { name: this.name }));
		this.contentEl.createEl("p", { text: t("ghost.confirmBody", { name: this.name }) });

		const buttons = this.contentEl.createDiv({ cls: "person-network-modal-buttons" });
		buttons
			.createEl("button", { text: t("common.cancel") })
			.addEventListener("click", () => this.close());

		const createButton = buttons.createEl("button", { text: t("common.create"), cls: "mod-cta" });
		createButton.addEventListener("click", () => {
			this.onConfirm();
			this.close();
		});
	}

	override onClose(): void {
		this.contentEl.empty();
	}
}

/** Routes a node click: a real person opens their note; a ghost offers to create one. */
export function handleNodeClick(
	app: App,
	settings: PluginSettings,
	id: string,
	peopleById: Map<string, PersonNode>,
	ghostsById: Map<string, GhostNode>,
): void {
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
				new Notice(t("ghost.noticeCreated", { name: ghost.displayName }));
				void app.workspace.getLeaf("tab").openFile(file);
			} else {
				new Notice(t("ghost.noticeFailed", { name: ghost.displayName }));
			}
		});
	}).open();
}
