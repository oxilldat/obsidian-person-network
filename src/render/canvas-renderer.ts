import type { App } from "obsidian";
import type { GraphSnapshot } from "../data/store";
import type { PhotoCropSettings, PluginSettings, RingStyle } from "../data/types";
import { t } from "../i18n";
import { Simulation, type SimNode } from "../sim/simulation";
import { clamp, easeInCubic, easeOutCubic, lerp } from "../utils/geometry";
import { Camera } from "./camera";
import { ImageCache } from "./image-cache";
import { pickNode, type Pickable } from "./picking";
import { resolveRelationStyle } from "./relation-style";
import { ThemeColorCache } from "./theme-colors";

export interface FilterState {
	search: string;
	relationTypes: Set<string> | null; // null = show all
	companies: Set<string> | null; // null = show all
	showEdges: boolean;
	showGhosts: boolean;
}

export interface ForcesState {
	linkDistance: number;
	repulsionStrength: number;
	linkStrength: number;
	centerStrength: number;
}

export interface DisplayState {
	nodeScale: number;
	edgeWidth: number;
}

const DEFAULT_DISPLAY: DisplayState = { nodeScale: 1, edgeWidth: 1.4 };

type NodeKind = "person" | "ghost" | "center";

interface RenderMeta {
	kind: NodeKind;
	displayName: string;
	photoPath?: string;
	relationType?: string;
	company?: string;
	photoCrop?: PhotoCropSettings;
}

const PERSON_RADIUS = 26;
const CENTER_RADIUS = 32;
const GHOST_RADIUS = 18;
const MIN_ORBIT = 60;
const MAX_ORBIT = 420;
const GHOST_ORBIT_SCORE = 3;
export const CENTER_NODE_ID = "__center__";
const CENTER_ID = CENTER_NODE_ID;

/** Pop-in: how long a node's grow/fade takes, and the extra delay between successive nodes. */
const POP_IN_MS = 520;
const POP_IN_STAGGER_MS = 24;
const POP_IN_STAGGER_CAP_MS = 700;
const POP_IN_START_SCALE = 0.2;
/** Edges fade in only after the node pop-in wave finishes, over this long. */
const EDGE_FADE_MS = 420;
const FIT_PADDING = 60;
const FIT_TWEEN_MS = 340;

interface CameraTween {
	startScale: number;
	startX: number;
	startY: number;
	targetScale: number;
	targetX: number;
	targetY: number;
	startTime: number;
}

function scoreToOrbitRadius(score: number): number {
	const clamped = clamp(score, 1, 10);
	return MAX_ORBIT - ((clamped - 1) / 9) * (MAX_ORBIT - MIN_ORBIT);
}

function roundedSquarePath(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, cornerRadius: number): void {
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

function drawSilhouette(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string): void {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(cx, cy - radius * 0.28, radius * 0.32, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(cx, cy + radius * 0.5, radius * 0.5, radius * 0.36, 0, 0, Math.PI * 2);
	ctx.fill();
}

function setRingDash(ctx: CanvasRenderingContext2D, ringStyle: RingStyle): void {
	if (ringStyle === "dashed") ctx.setLineDash([6, 4]);
	else if (ringStyle === "dotted") ctx.setLineDash([1.5, 3.5]);
	else ctx.setLineDash([]);
}

function drawEdge(ctx: CanvasRenderingContext2D, source: { x: number; y: number }, target: { x: number; y: number }): void {
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

export class CanvasRenderer {
	readonly camera = new Camera();
	readonly simulation = new Simulation();
	filter: FilterState = { search: "", relationTypes: null, companies: null, showEdges: true, showGhosts: true };
	display: DisplayState = { ...DEFAULT_DISPLAY };

	private readonly container: HTMLElement;
	private readonly getSettings: () => PluginSettings;
	/** The window owning this canvas, so animation frames work in popout windows too. */
	private readonly win: Window;

	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private readonly resizeObserver: ResizeObserver;
	private readonly imageCache: ImageCache;
	private readonly themeColors: ThemeColorCache;
	private readonly requestedPhotos = new Set<string>();

	private width = 1;
	private height = 1;
	private ratio = window.devicePixelRatio || 1;
	private rafHandle: number | null = null;
	private destroyed = false;
	private cameraInitialized = false;

	private renderMeta = new Map<string, RenderMeta>();
	private pickables: Pickable[] = [];
	private lastStructureKey = "";
	private lastRadiiKey = "";
	/** id -> timestamp (ms) at which this node's pop-in should begin; removed once done. */
	private bornAt = new Map<string, number>();
	/** Timestamp (ms) at which edges start fading in — set to after the node wave lands. */
	private edgesRevealAt = 0;
	private cameraTween: CameraTween | null = null;
	/** Fit the graph into view once the layout first settles, unless the user took over the camera. */
	private autoFitPending = false;
	private userMovedCamera = false;

	constructor(container: HTMLElement, app: App, getSettings: () => PluginSettings) {
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

	getCanvasElement(): HTMLCanvasElement {
		return this.canvas;
	}

	getCameraState(): { scale: number; x: number; y: number } {
		return { scale: this.camera.scale, x: this.camera.x, y: this.camera.y };
	}

	restoreCamera(state: { scale: number; x: number; y: number }): void {
		this.camera.scale = clamp(state.scale, this.camera.minScale, this.camera.maxScale);
		this.camera.x = state.x;
		this.camera.y = state.y;
		this.userMovedCamera = true;
		this.autoFitPending = false;
		this.requestRedraw();
	}

	hasVisibleContent(): boolean {
		return this.simulation.nodes.length > 1;
	}

	onThemeChange(): void {
		this.themeColors.invalidate();
		this.requestRedraw();
	}

	onPhotoModified(path: string): void {
		this.imageCache.invalidate(path);
		this.requestedPhotos.delete(path);
		this.requestRedraw();
	}

	resetCamera(): void {
		this.camera.reset(this.width / 2, this.height / 2);
		this.requestRedraw();
	}

	setGraph(snapshot: GraphSnapshot): void {
		const settings = this.getSettings();
		const priorPositions = new Map(this.simulation.nodes.map((node) => [node.id, node]));

		const nodes: SimNode[] = [];
		const nodeById = new Map<string, SimNode>();
		const renderMeta = new Map<string, RenderMeta>();

		const selfPerson = snapshot.people.find((person) => person.isSelf);

		const centerNode: SimNode = {
			id: CENTER_ID,
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			fx: 0,
			fy: 0,
			radius: CENTER_RADIUS,
			targetRadius: 0,
			isCenter: true,
		};
		nodes.push(centerNode);
		nodeById.set(CENTER_ID, centerNode);
		if (selfPerson) nodeById.set(selfPerson.id, centerNode);
		renderMeta.set(CENTER_ID, {
			kind: "center",
			displayName: selfPerson?.displayName ?? settings.centerLabel ?? t("view.defaultCenterLabel"),
			photoPath: selfPerson?.photoPath,
			photoCrop: selfPerson ? settings.photoCrops?.[selfPerson.id] : undefined,
		});

		for (const person of snapshot.people) {
			if (person.id === selfPerson?.id) continue;
			const prior = priorPositions.get(person.id);
			const node: SimNode = {
				id: person.id,
				x: prior?.x ?? (Math.random() - 0.5) * 240,
				y: prior?.y ?? (Math.random() - 0.5) * 240,
				vx: 0,
				vy: 0,
				fx: null,
				fy: null,
				radius: PERSON_RADIUS,
				targetRadius: scoreToOrbitRadius(person.positionScore),
				isCenter: false,
			};
			nodes.push(node);
			nodeById.set(person.id, node);
			renderMeta.set(person.id, {
				kind: "person",
				displayName: person.displayName,
				photoPath: person.photoPath,
				relationType: person.relationType,
				company: person.company,
				photoCrop: settings.photoCrops?.[person.id],
			});
		}

		for (const ghost of snapshot.ghosts) {
			const prior = priorPositions.get(ghost.id);
			const node: SimNode = {
				id: ghost.id,
				x: prior?.x ?? (Math.random() - 0.5) * 320,
				y: prior?.y ?? (Math.random() - 0.5) * 320,
				vx: 0,
				vy: 0,
				fx: null,
				fy: null,
				radius: GHOST_RADIUS,
				targetRadius: scoreToOrbitRadius(GHOST_ORBIT_SCORE),
				isCenter: false,
			};
			nodes.push(node);
			nodeById.set(ghost.id, node);
			renderMeta.set(ghost.id, { kind: "ghost", displayName: ghost.displayName });
		}

		const links = snapshot.edges
			.map((edge) => {
				const source = nodeById.get(edge.sourceId);
				const target = nodeById.get(edge.targetId);
				return source && target ? { source, target } : undefined;
			})
			.filter((link): link is { source: SimNode; target: SimNode } => link !== undefined);

		// Reheat proportionally to what actually changed, so frequent data
		// refreshes (e.g. Bases onDataUpdated) don't keep the layout jiggling:
		// new/removed nodes or edges -> full settle; only orbit radii changed
		// (role edits) -> gentle drift; metadata-only changes -> redraw.
		const structureKey =
			nodes.map((node) => node.id).sort().join("\n") +
			"||" +
			links.map((link) => `${link.source.id}>${link.target.id}`).sort().join("\n");
		const radiiKey = nodes.map((node) => `${node.id}:${Math.round(node.targetRadius)}`).sort().join("\n");

		this.renderMeta = renderMeta;
		this.simulation.setGraph(nodes, links);

		// Nodes that weren't in the previous layout get a staggered pop-in
		// (closest-to-center first). Nodes carried over keep their appearance.
		const newNodes = nodes.filter((node) => !node.isCenter && !priorPositions.has(node.id));
		this.schedulePopIn(newNodes);

		if (structureKey !== this.lastStructureKey) {
			this.simulation.reheat(0.9);
			// New/removed nodes: re-fit once it settles (unless already panned).
			this.autoFitPending = true;
		} else if (radiiKey !== this.lastRadiiKey) {
			this.simulation.reheat(0.3);
		}
		this.lastStructureKey = structureKey;
		this.lastRadiiKey = radiiKey;
		this.requestRedraw();
	}

	/** Assigns staggered born-times so a batch of nodes fades/grows in one after another. */
	private schedulePopIn(nodes: SimNode[]): void {
		if (nodes.length === 0) return;
		const now = performance.now();
		const ordered = [...nodes].sort((a, b) => a.targetRadius - b.targetRadius);
		let lastStagger = 0;
		ordered.forEach((node, index) => {
			const stagger = Math.min(index * POP_IN_STAGGER_MS, POP_IN_STAGGER_CAP_MS);
			lastStagger = stagger;
			this.bornAt.set(node.id, now + stagger);
		});
		// Hold edges back until the last node has finished popping in.
		this.edgesRevealAt = now + lastStagger + POP_IN_MS;
	}

	/** Grow/fade factor for a node's pop-in; {scale:1, alpha:1} once finished. */
	private popIn(id: string, now: number): { scale: number; alpha: number } {
		const born = this.bornAt.get(id);
		if (born === undefined) return { scale: 1, alpha: 1 };

		const elapsed = now - born;
		if (elapsed <= 0) return { scale: 0, alpha: 0 }; // still waiting out its stagger delay
		if (elapsed >= POP_IN_MS) {
			this.bornAt.delete(id);
			return { scale: 1, alpha: 1 };
		}
		const p = easeInCubic(elapsed / POP_IN_MS);
		return { scale: POP_IN_START_SCALE + (1 - POP_IN_START_SCALE) * p, alpha: p };
	}

	/** Scatters every non-center node to a fresh random position and replays the settle + pop-in animation. */
	replayAnimation(): void {
		const scattered: SimNode[] = [];
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
		// An explicit replay re-earns an auto-fit even if the user had panned.
		this.userMovedCamera = false;
		this.autoFitPending = true;
		this.requestRedraw();
	}

	/** Smoothly frames all nodes within the viewport. */
	fitToContent(animate = true): void {
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
				startTime: performance.now(),
			};
		} else {
			this.camera.scale = target.scale;
			this.camera.x = target.x;
			this.camera.y = target.y;
		}
		this.requestRedraw();
	}

	/** Cancels any running fit tween and blocks the pending auto-fit — the user is driving now. */
	notifyUserInteraction(): void {
		this.cameraTween = null;
		this.userMovedCamera = true;
	}

	private computeBounds(): { minX: number; minY: number; maxX: number; maxY: number } | null {
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

	private advanceCameraTween(now: number): void {
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

	setForces(forces: ForcesState): void {
		Object.assign(this.simulation.config, forces);
		this.simulation.reheat(0.7);
		this.requestRedraw();
	}

	getForces(): ForcesState {
		const c = this.simulation.config;
		return {
			linkDistance: c.linkDistance,
			repulsionStrength: c.repulsionStrength,
			linkStrength: c.linkStrength,
			centerStrength: c.centerStrength,
		};
	}

	setDisplay(display: DisplayState): void {
		this.display = { ...display };
		this.requestRedraw();
	}

	getDisplay(): DisplayState {
		return { ...this.display };
	}

	pick(screenX: number, screenY: number): string | undefined {
		const world = this.camera.toWorld(screenX, screenY);
		return pickNode(this.pickables, world.x, world.y);
	}

	worldPointFromScreen(screenX: number, screenY: number): { x: number; y: number } {
		return this.camera.toWorld(screenX, screenY);
	}

	beginDrag(id: string): void {
		const node = this.findNode(id);
		if (!node || node.isCenter) return;
		node.fx = node.x;
		node.fy = node.y;
		this.simulation.reheat(0.6);
		this.requestRedraw();
	}

	dragTo(id: string, worldX: number, worldY: number): void {
		const node = this.findNode(id);
		if (!node || node.isCenter) return;
		node.fx = worldX;
		node.fy = worldY;
		this.requestRedraw();
	}

	endDrag(id: string): void {
		const node = this.findNode(id);
		if (!node || node.isCenter) return;
		node.fx = null;
		node.fy = null;
		this.simulation.reheat(0.3);
		this.requestRedraw();
	}

	requestRedraw(): void {
		if (this.destroyed || this.rafHandle !== null) return;
		this.rafHandle = this.win.requestAnimationFrame(this.loop);
	}

	destroy(): void {
		this.destroyed = true;
		this.resizeObserver.disconnect();
		if (this.rafHandle !== null) this.win.cancelAnimationFrame(this.rafHandle);
		this.imageCache.clear();
		this.canvas.remove();
	}

	private findNode(id: string): SimNode | undefined {
		return this.simulation.nodes.find((node) => node.id === id);
	}

	private handleResize(): void {
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

	private loop = (): void => {
		this.rafHandle = null;
		if (this.destroyed) return;
		const now = performance.now();
		if (!this.simulation.isSettled()) this.simulation.tick();
		this.advanceCameraTween(now);
		this.draw();

		// Once the layout first settles, frame the whole graph (unless the user
		// already grabbed the camera). Runs on this same tick so the tween it
		// starts keeps the loop alive below.
		if (this.autoFitPending && this.simulation.isSettled() && this.bornAt.size === 0 && !this.userMovedCamera) {
			this.autoFitPending = false;
			this.fitToContent(true);
		}

		// Keep animating while physics is live, nodes pop in, edges fade in, or the camera is tweening.
		const edgesAnimating = now < this.edgesRevealAt + EDGE_FADE_MS;
		if (!this.simulation.isSettled() || this.bornAt.size > 0 || this.cameraTween || edgesAnimating) {
			this.requestRedraw();
		}
	};

	private getPhotoBitmap(path: string): ImageBitmap | undefined {
		const cached = this.imageCache.get(path);
		if (cached) return cached;
		// A path that already failed to decode must not be re-requested — that
		// would fire load()->redraw()->load() forever and pin the RAF loop.
		if (this.imageCache.hasFailed(path)) return undefined;
		if (!this.requestedPhotos.has(path)) {
			this.requestedPhotos.add(path);
			void this.imageCache.load(path).then(() => {
				this.requestedPhotos.delete(path);
				this.requestRedraw();
			});
		}
		return undefined;
	}

	private isVisible(meta: RenderMeta): boolean {
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

	private draw(): void {
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
		const pickables: Pickable[] = [];

		// Visible world rect (+ margin for node radius and labels below nodes),
		// so large graphs only pay for what's actually on screen.
		const topLeft = this.camera.toWorld(0, 0);
		const bottomRight = this.camera.toWorld(this.width, this.height);
		const margin = 80;
		const viewMinX = topLeft.x - margin;
		const viewMinY = topLeft.y - margin;
		const viewMaxX = bottomRight.x + margin;
		const viewMaxY = bottomRight.y + margin;
		const nodeVisible = (x: number, y: number): boolean =>
			x >= viewMinX && x <= viewMaxX && y >= viewMinY && y <= viewMaxY;

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
				// Cull edges whose bounding box doesn't overlap the viewport.
				if (
					Math.max(link.source.x, link.target.x) < viewMinX ||
					Math.min(link.source.x, link.target.x) > viewMaxX ||
					Math.max(link.source.y, link.target.y) < viewMinY ||
					Math.min(link.source.y, link.target.y) > viewMaxY
				) {
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
			const bitmap = meta.kind !== "ghost" && meta.photoPath ? this.getPhotoBitmap(meta.photoPath) : undefined;

			roundedSquarePath(ctx, node.x, node.y, size, cornerRadius);
			ctx.save();
			ctx.clip();
			if (bitmap) {
				const cropSettings = meta.photoCrop;
				const zoom = clamp(cropSettings?.zoom ?? 1, 1, 4);
				const crop = Math.min(bitmap.width, bitmap.height) / zoom;
				const centerX = clamp(cropSettings?.centerX ?? 0.5, 0, 1) * bitmap.width;
				const centerY = clamp(cropSettings?.centerY ?? 0.5, 0, 1) * bitmap.height;
				const sx = clamp(centerX - crop / 2, 0, bitmap.width - crop);
				const sy = clamp(centerY - crop / 2, 0, bitmap.height - crop);
				ctx.drawImage(bitmap, sx, sy, crop, crop, node.x - radius, node.y - radius, size, size);
			} else {
				ctx.fillStyle = secondaryBg;
				ctx.fillRect(node.x - radius, node.y - radius, size, size);
				drawSilhouette(ctx, node.x, node.y, radius, mutedColor);
			}
			ctx.restore();

			let ringColor = accentColor;
			let ringStyle: RingStyle = "solid";
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

		// Expire pop-ins for nodes that never got drawn (filtered out / removed),
		// so a hidden node can't keep the animation loop alive forever.
		if (this.bornAt.size > 0) {
			for (const [id, born] of this.bornAt) {
				if (now - born >= POP_IN_MS) this.bornAt.delete(id);
			}
		}
	}
}
