import { App, Modal, Notice, PluginSettingTab, Setting } from "obsidian";
import type { PluginSettings, RingStyle } from "../data/types";
import { t, type TranslationKey } from "../i18n";
import type PersonNetworkPlugin from "../main";
import { DEFAULT_SETTINGS } from "./defaults";
import { MarkdownFileSuggest } from "./file-suggest";
import { TagSuggest } from "./tag-suggest";

const RING_STYLES: RingStyle[] = ["solid", "dashed", "dotted"];
const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function toHex(value: string, fallback: string): string {
	return HEX_COLOR.test(value.trim()) ? value.trim() : fallback;
}

class ConfirmResetRolesModal extends Modal {
	constructor(app: App, private readonly onConfirm: () => void) {
		super(app);
	}

	override onOpen(): void {
		this.titleEl.setText(t("settings.resetRolesConfirmTitle"));
		this.contentEl.createEl("p", { text: t("settings.resetRolesConfirmBody") });

		const buttons = this.contentEl.createDiv({ cls: "person-network-modal-buttons" });
		buttons
			.createEl("button", { text: t("common.cancel") })
			.addEventListener("click", () => this.close());

		const resetButton = buttons.createEl("button", { text: t("common.reset"), cls: "mod-warning" });
		resetButton.addEventListener("click", () => {
			this.onConfirm();
			this.close();
		});
	}

	override onClose(): void {
		this.contentEl.empty();
	}
}

export class PersonNetworkSettingTab extends PluginSettingTab {
	private readonly plugin: PersonNetworkPlugin;

	constructor(app: App, plugin: PersonNetworkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.renderGeneralSection(containerEl);
		this.renderNewNoteSection(containerEl);
		this.renderRolesSection(containerEl);
		this.renderPersonDetectionSection(containerEl);
	}

	private async save(): Promise<void> {
		await this.plugin.saveSettings();
	}

	private resetRolesToDefaults(): void {
		const settings = this.plugin.settings;
		settings.roles = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.roles)) as PluginSettings["roles"];
		settings.defaultRole = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.defaultRole)) as PluginSettings["defaultRole"];
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
	private heading(containerEl: HTMLElement, headingKey: TranslationKey, descKey: TranslationKey): HTMLElement {
		new Setting(containerEl).setName(t(headingKey)).setHeading().setDesc(t(descKey));
		return containerEl.createDiv({ cls: "person-network-settings-group" });
	}

	/** A compact +/- stepper, clamped to 1-10, used for a role's position score. */
	private addPositionStepper(setting: Setting, initial: number, onChange: (value: number) => void): void {
		let value = initial;
		const wrapper = setting.controlEl.createDiv({ cls: "person-network-stepper" });
		const minusButton = wrapper.createEl("button", {
			cls: "person-network-stepper-btn",
			text: "−",
			attr: { type: "button" },
		});
		const valueEl = wrapper.createSpan({ cls: "person-network-stepper-value", text: String(value) });
		const plusButton = wrapper.createEl("button", {
			cls: "person-network-stepper-btn",
			text: "+",
			attr: { type: "button" },
		});

		const update = (next: number): void => {
			value = Math.min(10, Math.max(1, next));
			valueEl.setText(String(value));
			onChange(value);
		};
		minusButton.addEventListener("click", () => update(value - 1));
		plusButton.addEventListener("click", () => update(value + 1));
	}

	private renderGeneralSection(containerEl: HTMLElement): void {
		const group = this.heading(containerEl, "settings.generalHeading", "settings.generalDesc");
		const settings = this.plugin.settings;

		new Setting(group)
			.setName(t("settings.centerLabel.name"))
			.setDesc(t("settings.centerLabel.desc"))
			.addText((text) =>
				text
					.setPlaceholder(t("view.defaultCenterLabel"))
					.setValue(settings.centerLabel)
					.onChange(async (value) => {
						settings.centerLabel = value;
						await this.save();
					}),
			);

		new Setting(group)
			.setName(t("settings.enableBases.name"))
			.setDesc(t("settings.enableBases.desc"))
			.addToggle((toggle) =>
				toggle.setValue(settings.enableBases).onChange(async (value) => {
					settings.enableBases = value;
					await this.save();
					new Notice(t("settings.enableBases.reloadNotice"));
				}),
			);
	}

	private renderNewNoteSection(containerEl: HTMLElement): void {
		const group = this.heading(containerEl, "settings.newNoteHeading", "settings.newNoteDesc");
		const settings = this.plugin.settings;

		new Setting(group)
			.setName(t("settings.newNoteFolder.name"))
			.setDesc(t("settings.newNoteFolder.desc"))
			.addText((text) =>
				text.setValue(settings.newNoteFolder).onChange(async (value) => {
					settings.newNoteFolder = value;
					await this.save();
				}),
			);

		new Setting(group)
			.setName(t("settings.newNoteTemplatePath.name"))
			.setDesc(t("settings.newNoteTemplatePath.desc"))
			.addText((text) => {
				text
					.setPlaceholder(t("settings.newNoteTemplatePath.placeholder"))
					.setValue(settings.newNoteTemplatePath)
					.onChange(async (value) => {
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

	private renderRolesSection(containerEl: HTMLElement): void {
		const group = this.heading(containerEl, "settings.rolesHeading", "settings.rolesDesc");
		const settings = this.plugin.settings;

		let newRoleName = "";
		new Setting(group)
			.addText((text) =>
				text.setPlaceholder(t("settings.newRolePlaceholder")).onChange((value) => {
					newRoleName = value.trim();
				}),
			)
			.addButton((button) =>
				button.setButtonText(t("settings.addRole")).onClick(async () => {
					if (!newRoleName || settings.roles[newRoleName]) return;
					settings.roles[newRoleName] = { color: "#9e9e9e", ringStyle: "solid", positionScore: 5 };
					await this.save();
					this.display();
				}),
			);

		const defaultRow = new Setting(group).setName(t("settings.defaultRoleName"));
		this.addPositionStepper(defaultRow, settings.defaultRole.positionScore, (value) => {
			settings.defaultRole.positionScore = value;
			void this.save();
		});
		defaultRow.addColorPicker((picker) =>
			picker.setValue(toHex(settings.defaultRole.color, "#8a8a8a")).onChange(async (value) => {
				settings.defaultRole.color = value;
				await this.save();
			}),
		);
		defaultRow.addDropdown((dropdown) => {
			for (const ringStyle of RING_STYLES) {
				dropdown.addOption(ringStyle, t(`settings.ringStyle.${ringStyle}`));
			}
			dropdown.setValue(settings.defaultRole.ringStyle).onChange(async (value) => {
				settings.defaultRole.ringStyle = value as RingStyle;
				await this.save();
			});
		});
		defaultRow.addExtraButton((button) => {
			button
				.setIcon("trash")
				.setTooltip(t("settings.resetRolesTooltip"))
				.onClick(() => {
					new ConfirmResetRolesModal(this.app, () => this.resetRolesToDefaults()).open();
				});
			button.extraSettingsEl.addClass("person-network-danger-icon");
		});

		for (const relationType of Object.keys(settings.roles)) {
			const role = settings.roles[relationType];
			const row = new Setting(group).setName(relationType);

			this.addPositionStepper(row, role.positionScore, (value) => {
				role.positionScore = value;
				void this.save();
			});

			row.addColorPicker((picker) =>
				picker.setValue(toHex(role.color, "#9e9e9e")).onChange(async (value) => {
					role.color = value;
					await this.save();
				}),
			);

			row.addDropdown((dropdown) => {
				for (const ringStyle of RING_STYLES) {
					dropdown.addOption(ringStyle, t(`settings.ringStyle.${ringStyle}`));
				}
				dropdown.setValue(role.ringStyle).onChange(async (value) => {
					role.ringStyle = value as RingStyle;
					await this.save();
				});
			});

			row.addExtraButton((button) =>
				button
					.setIcon("trash")
					.setTooltip(t("common.remove"))
					.onClick(async () => {
						delete settings.roles[relationType];
						await this.save();
						this.display();
					}),
			);
		}
	}

	private renderPersonDetectionSection(containerEl: HTMLElement): void {
		const group = this.heading(containerEl, "settings.personDetectionHeading", "settings.personDetectionDesc");
		const settings = this.plugin.settings;

		new Setting(group)
			.setName(t("settings.personTag.name"))
			.setDesc(t("settings.personTag.desc"))
			.addText((text) => {
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

		type PlainStringKey = "nameField" | "photoField" | "relationField" | "potentialContactsField" | "excludePaths";
		type StringSettingKey = {
			[K in PlainStringKey]: PluginSettings[K] extends string ? K : never;
		}[PlainStringKey];

		const fieldRows: Array<[StringSettingKey, TranslationKey, TranslationKey]> = [
			["nameField", "settings.nameField.name", "settings.nameField.desc"],
			["photoField", "settings.photoField.name", "settings.photoField.desc"],
			["relationField", "settings.relationField.name", "settings.relationField.desc"],
			[
				"potentialContactsField",
				"settings.potentialContactsField.name",
				"settings.potentialContactsField.desc",
			],
			["excludePaths", "settings.excludePaths.name", "settings.excludePaths.desc"],
		];

		for (const [key, nameKey, descKey] of fieldRows) {
			new Setting(group)
				.setName(t(nameKey))
				.setDesc(t(descKey))
				.addText((text) =>
					text.setValue(settings[key]).onChange(async (value) => {
						settings[key] = value;
						await this.save();
					}),
				);
		}
	}
}
