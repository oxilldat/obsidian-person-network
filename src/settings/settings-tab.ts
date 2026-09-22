import { App, Modal, Notice, PluginSettingTab, Setting, getIconIds, setIcon } from "obsidian";
import type { GraphLayer, PluginSettings, RingStyle } from "../data/types";
import { t, type TranslationKey } from "../i18n";
import type PersonNetworkPlugin from "../main";
import { DEFAULT_SETTINGS } from "./defaults";
import { MarkdownFileSuggest } from "./file-suggest";
import { TagSuggest } from "./tag-suggest";
import authorAvatar from "../../assets/ava.jpg";

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
	private selectedLayerScopeId: string | null = null;
	private readonly expandedLayers = new Set<string>();
	private closeIconPicker: (() => void) | null = null;

	constructor(app: App, plugin: PersonNetworkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		this.closeIconPicker?.();
		containerEl.empty();

		this.renderGeneralSection(containerEl);
		this.renderNewNoteSection(containerEl);
		this.renderRolesSection(containerEl);
		this.renderLayersSection(containerEl);
		this.renderPersonDetectionSection(containerEl);
		this.renderAuthorCard(containerEl);
	}

	private renderAuthorCard(containerEl: HTMLElement): void {
		const card = containerEl.createDiv({ cls: "person-network-author-card" });
		const top = card.createDiv({ cls: "person-network-author-top" });
		top.createEl("img", {
			cls: "person-network-author-avatar",
			attr: { src: authorAvatar, alt: "oxill" },
		});
		const copy = top.createDiv({ cls: "person-network-author-copy" });
		copy.createEl("h3", { text: t("settings.author.title") });
		copy.createEl("p", { text: t("settings.author.body") });

		const links = card.createDiv({ cls: "person-network-social-links" });
		this.addSocialButton(links, "telegram", "Telegram", "https://t.me/oxilldat",
			"M21.7 3.4 18.5 19c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9-8.1c.4-.4-.1-.6-.6-.2L6.1 12.8 1.3 11.3c-1-.3-1-1 .2-1.5L20.3 2.6c.9-.3 1.7.2 1.4.8Z");
		this.addSocialButton(links, "boosty", "Boosty", "https://boosty.to/oxilldat",
			"m13.1 2-3.8 7.4 2.5.1-3.7 6.7 3.4.1L9.7 22c5.5-1.8 9-5.2 9-9.2 0-2.8-1.8-4.8-4.5-5.5L16.6 2h-3.5Zm-.8 17.1 1.2-4.4-2.6-.1 3.4-6.2c1.6.5 2.6 1.8 2.6 3.7 0 2.7-1.7 5-4.6 7Z");
		this.addSocialButton(links, "youtube", "YouTube", "https://www.youtube.com/@oxilldat",
			"M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z");
	}

	private addSocialButton(parent: HTMLElement, brand: string, label: string, url: string, pathData: string): void {
		const link = parent.createEl("a", {
			cls: `person-network-social-button is-${brand}`,
			attr: { href: url, target: "_blank", rel: "noopener noreferrer", "aria-label": label, title: label },
		});
		const svg = parent.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "0 0 24 24");
		svg.setAttribute("aria-hidden", "true");
		const path = parent.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("d", pathData);
		svg.appendChild(path);
		link.appendChild(svg);
	}

	private async save(): Promise<void> {
		await this.plugin.saveSettings();
	}

	private redisplayPreservingScroll(): void {
		const positions: Array<{ element: HTMLElement; top: number }> = [];
		let element: HTMLElement | null = this.containerEl;
		while (element) {
			if (element.scrollHeight > element.clientHeight) positions.push({ element, top: element.scrollTop });
			element = element.parentElement;
		}
		this.display();
		const restore = (): void => positions.forEach(({ element: target, top }) => { target.scrollTop = top; });
		restore();
		window.requestAnimationFrame(restore);
	}

	private openIconPicker(anchor: HTMLElement, current: string, onChoose: (icon: string) => void): void {
		this.closeIconPicker?.();
		const popup = document.body.createDiv({ cls: "person-network-icon-picker" });
		const search = popup.createEl("input", {
			cls: "person-network-icon-picker-search",
			attr: { type: "search", placeholder: t("settings.layer.iconPlaceholder") },
		});
		const grid = popup.createDiv({ cls: "person-network-icon-picker-grid" });
		const footer = popup.createDiv({ cls: "person-network-icon-picker-footer" });
		const icons = getIconIds();
		const render = (): void => {
			const query = search.value.trim().toLowerCase();
			const matches = icons.filter((name) => !query || name.toLowerCase().includes(query));
			const visible = matches.slice(0, 240);
			grid.empty();
			for (const name of visible) {
				const button = grid.createEl("button", {
					cls: `person-network-icon-picker-item${name === current ? " is-selected" : ""}`,
					attr: { type: "button", title: name, "aria-label": name },
				});
				setIcon(button, name);
				button.addEventListener("click", () => { onChoose(name); close(); });
			}
			footer.setText(t("settings.layer.iconCount", { shown: String(visible.length), total: String(matches.length) }));
		};
		const rect = anchor.getBoundingClientRect();
		popup.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 400))}px`;
		popup.style.top = `${Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 490))}px`;
		const close = (): void => {
			document.removeEventListener("pointerdown", outside, true);
			document.removeEventListener("keydown", escape);
			popup.remove();
			if (this.closeIconPicker === close) this.closeIconPicker = null;
		};
		const outside = (event: PointerEvent): void => {
			if (!popup.contains(event.target as Node) && !anchor.contains(event.target as Node)) close();
		};
		const escape = (event: KeyboardEvent): void => { if (event.key === "Escape") close(); };
		this.closeIconPicker = close;
		search.addEventListener("input", render);
		render();
		window.setTimeout(() => {
			document.addEventListener("pointerdown", outside, true);
			document.addEventListener("keydown", escape);
			search.focus();
		}, 0);
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

		type PlainStringKey = "nameField" | "photoField" | "relationField" | "potentialContactsField" | "layerField" | "excludePaths";
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
			["layerField", "settings.layerField.name", "settings.layerField.desc"],
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

	private renderLayersSection(containerEl: HTMLElement): void {
		new Setting(containerEl).setName(t("settings.layersHeading")).setHeading().setDesc(t("settings.layersDesc"));
		const scopes = Object.values(this.plugin.settings.layerScopes ?? {});
		if (scopes.length === 0) return;
		this.selectedLayerScopeId = scopes.some((scope) => scope.id === this.selectedLayerScopeId)
			? this.selectedLayerScopeId : scopes[0].id;
		const scope = scopes.find((candidate) => candidate.id === this.selectedLayerScopeId) ?? scopes[0];
		const commonGroup = containerEl.createDiv({ cls: "person-network-settings-group person-network-layer-add" });
		if (scopes.length > 1) {
			new Setting(commonGroup).setName(t("settings.layer.scope")).setDesc(t("settings.layer.scopeDesc")).addDropdown((dropdown) => {
				for (const candidate of scopes) dropdown.addOption(candidate.id, candidate.label);
				dropdown.setValue(scope.id).onChange((value) => { this.selectedLayerScopeId = value; this.redisplayPreservingScroll(); });
			});
		}

		let newName = "";
		let newIdentifier = "";
		new Setting(commonGroup)
			.addText((text) => text.setPlaceholder(t("settings.layer.namePlaceholder")).onChange((value) => { newName = value.trim(); }))
			.addText((text) => text.setPlaceholder(t("settings.layer.identifierPlaceholder")).onChange((value) => { newIdentifier = value.trim(); }))
			.addButton((button) => button.setButtonText(t("settings.layer.add")).setCta().onClick(async () => {
				if (!newName || !newIdentifier || scope.layers.some((layer) => layer.identifier === newIdentifier)) return;
				const layer: GraphLayer = {
					id: `layer:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`,
					name: newName, identifier: newIdentifier, icon: "users", color: "#7b6cd9",
					priority: scope.layers.length, showLabel: true, showIcon: true, showArea: true, showMembers: true,
				};
				scope.layers.push(layer);
				this.expandedLayers.add(layer.id);
				await this.save();
				this.redisplayPreservingScroll();
			}));

		for (const layer of [...scope.layers].sort((a, b) => b.priority - a.priority)) {
			const layerGroup = containerEl.createDiv({ cls: "person-network-settings-group person-network-layer-settings" });
			this.renderLayerEditor(layerGroup, scope.layers, layer);
		}
	}

	private renderLayerEditor(card: HTMLElement, layers: GraphLayer[], layer: GraphLayer): void {
		const expanded = this.expandedLayers.has(layer.id);
		card.toggleClass("is-expanded", expanded);
		const header = card.createDiv({ cls: "person-network-layer-settings-header" });
		const chevron = header.createSpan({ cls: "person-network-layer-chevron" });
		setIcon(chevron, "chevron-right");
		const icon = header.createSpan({ cls: "person-network-layer-header-icon" });
		setIcon(icon, layer.icon || "layers");
		const title = header.createDiv({ cls: "person-network-layer-header-title" });
		const headerName = title.createDiv({ cls: "person-network-layer-header-name", text: layer.name });
		title.createDiv({ cls: "person-network-layer-header-id", text: layer.identifier });
		const color = header.createSpan({ cls: "person-network-layer-color" });
		color.style.backgroundColor = layer.color;
		header.addEventListener("click", () => {
			const isExpanded = card.hasClass("is-expanded");
			if (isExpanded) this.expandedLayers.delete(layer.id); else this.expandedLayers.add(layer.id);
			card.toggleClass("is-expanded", !isExpanded);
		});
		const body = card.createDiv({ cls: "person-network-layer-settings-body" });
		const nameRow = new Setting(body).setName(t("settings.layer.name"));
		nameRow.addText((text) => text.setValue(layer.name).onChange(async (value) => {
			layer.name = value.trim() || t("settings.layer.defaultName");
			headerName.setText(layer.name);
			await this.save();
		}));
		nameRow.addColorPicker((picker) => picker.setValue(toHex(layer.color, "#7b6cd9")).onChange(async (value) => {
			layer.color = value;
			color.style.backgroundColor = value;
			await this.save();
		}));
		nameRow.addExtraButton((button) => button.setIcon("arrow-up").setTooltip(t("settings.layer.raise")).onClick(async () => {
			layer.priority += 1;
			await this.save();
			this.redisplayPreservingScroll();
		}));
		nameRow.addExtraButton((button) => button.setIcon("arrow-down").setTooltip(t("settings.layer.lower")).onClick(async () => {
			layer.priority -= 1;
			await this.save();
			this.redisplayPreservingScroll();
		}));
		nameRow.addExtraButton((button) => button.setIcon("trash").setTooltip(t("common.remove")).onClick(async () => {
			layers.splice(layers.indexOf(layer), 1);
			await this.save();
			this.redisplayPreservingScroll();
		}));

		new Setting(body).setName(t("settings.layer.identifier")).addText((text) => text
			.setValue(layer.identifier).onChange(async (value) => {
				const identifier = value.trim();
				if (!identifier || layers.some((candidate) => candidate !== layer && candidate.identifier === identifier)) return;
				layer.identifier = identifier;
				await this.save();
			}));

		new Setting(body).setName(t("settings.layer.icon")).addButton((button) => {
			button.setIcon(layer.icon || "layers").setButtonText(layer.icon || "layers");
			button.onClick(() => this.openIconPicker(button.buttonEl, layer.icon || "layers", (selected) => {
				layer.icon = selected;
				button.setIcon(selected).setButtonText(selected);
				setIcon(icon, selected);
				void this.save();
			}));
		});

		new Setting(body).setName(t("settings.layer.showLabel")).addToggle((toggle) => toggle
			.setValue(layer.showLabel).onChange(async (value) => { layer.showLabel = value; await this.save(); }));
		new Setting(body).setName(t("settings.layer.showIcon")).addToggle((toggle) => toggle
			.setValue(layer.showIcon).onChange(async (value) => { layer.showIcon = value; await this.save(); }));
	}
}
