import type { Component } from "obsidian";
import type { GhostNode, GraphLayer, PersonNode } from "../data/types";
import { t } from "../i18n";
import { CENTER_NODE_ID, type CanvasRenderer } from "../render/canvas-renderer";
import type { Tooltip, TooltipData } from "./tooltip";

export function personTooltipLines(person: PersonNode, groups: GraphLayer[] = []): TooltipData {
	const lines = [person.displayName];
	if (person.company) lines.push(person.company);
	if (person.relationType) lines.push(`${person.relationType} (${person.positionScore}/10)`);
	return { lines, groups: groups.map((group) => ({ name: group.name, color: group.color })) };
}

export function ghostTooltipLines(ghost: GhostNode): TooltipData {
	return { lines: [ghost.displayName, t("tooltip.ghostHint")] };
}

export interface GraphInteractionCallbacks {
	/** Fired for a real (non-center) node when the pointer went down and up without dragging. */
	onNodeClick(id: string): void;
	onNodeContextMenu?(id: string, event: MouseEvent): void;
	onViewChanged?(): void;
	/** Lines for the hover tooltip, or null to show none for this node. */
	getTooltipLines(id: string): TooltipData | null;
}

const CLICK_MOVE_THRESHOLD = 5;

/**
 * Wires the full pointer/zoom/drag/tooltip behavior of a graph canvas.
 * Shared between the standalone ItemView and the Bases view so the two
 * modes can't drift apart; `component.registerDomEvent` ties listener
 * lifetimes to whichever view owns the canvas.
 */
export function wireGraphInteraction(
	component: Component,
	renderer: CanvasRenderer,
	tooltip: Tooltip,
	callbacks: GraphInteractionCallbacks,
): void {
	const canvas = renderer.getCanvasElement();

	let draggingId: string | null = null;
	let isPanning = false;
	let pointerDownId: string | null = null;
	let activePointerId: number | null = null;
	let pointerDownPos = { x: 0, y: 0 };
	let lastPointer = { x: 0, y: 0 };
	let maxPointerDistance = 0;
	let hoveredHitId: string | undefined;
	let pointerInside = false;
	let shiftPressed = false;

	const getPointerPosition = (event: { clientX: number; clientY: number }): { x: number; y: number } => {
		const rect = canvas.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	};

	const updateTooltip = (hitId: string | undefined, pos: { x: number; y: number }): void => {
		if (!hitId) {
			tooltip.hide();
			return;
		}
		const lines = callbacks.getTooltipLines(hitId);
		if (lines && lines.lines.length > 0) tooltip.show(lines, pos.x, pos.y);
		else tooltip.hide();
	};

	component.registerDomEvent(canvas, "pointerdown", (event: PointerEvent) => {
		if (event.button !== 0) return;
		const pos = getPointerPosition(event);
		const hitId = renderer.pick(pos.x, pos.y);

		lastPointer = pos;
		pointerDownPos = pos;
		maxPointerDistance = 0;
		activePointerId = event.pointerId;
		pointerDownId = hitId ?? null;
		// Keep the whole gesture on our canvas. Bases installs its own pointer
		// handlers around custom views and may consume the matching pointerup
		// before a window-level listener sees it.
		canvas.setPointerCapture(event.pointerId);
		renderer.setHover(null, null);
		hoveredHitId = undefined;
		tooltip.hide();

		if (hitId) {
			draggingId = hitId;
			renderer.beginDrag(hitId);
		} else {
			isPanning = true;
			renderer.notifyUserInteraction();
		}
	});

	component.registerDomEvent(canvas, "pointermove", (event: PointerEvent) => {
		const pos = getPointerPosition(event);
		pointerInside = true;
		if (activePointerId !== null && event.pointerId !== activePointerId) return;
		maxPointerDistance = Math.max(maxPointerDistance, Math.hypot(pos.x - pointerDownPos.x, pos.y - pointerDownPos.y));

		if (draggingId) {
			const world = renderer.worldPointFromScreen(pos.x, pos.y);
			renderer.dragTo(draggingId, world.x, world.y);
		} else if (isPanning) {
			renderer.camera.pan(pos.x - lastPointer.x, pos.y - lastPointer.y);
			renderer.requestRedraw();
		} else {
			const company = renderer.pickCompany(pos.x, pos.y);
			const hitId = company ? undefined : renderer.pick(pos.x, pos.y);
			hoveredHitId = hitId;
			renderer.setHover(hitId ?? null, company ?? null);
			canvas.style.cursor = company || (hitId && hitId !== CENTER_NODE_ID) ? "pointer" : "default";
			if (shiftPressed || event.shiftKey) tooltip.hide();
			else updateTooltip(hitId, pos);
		}

		lastPointer = pos;
	});

	const finishPointer = (event: PointerEvent, cancelled = false): void => {
		if (activePointerId === null || event.pointerId !== activePointerId) return;
		const pos = getPointerPosition(event);
		maxPointerDistance = Math.max(maxPointerDistance, Math.hypot(pos.x - pointerDownPos.x, pos.y - pointerDownPos.y));
		if (draggingId) renderer.endDrag(draggingId);

		if (!cancelled && pointerDownId && pointerDownId !== CENTER_NODE_ID && maxPointerDistance < CLICK_MOVE_THRESHOLD) {
			callbacks.onNodeClick(pointerDownId);
		}

		draggingId = null;
		isPanning = false;
		pointerDownId = null;
		activePointerId = null;
		callbacks.onViewChanged?.();
		if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
	};
	component.registerDomEvent(canvas, "pointerup", (event: PointerEvent) => finishPointer(event));
	component.registerDomEvent(canvas, "pointercancel", (event: PointerEvent) => finishPointer(event, true));

	component.registerDomEvent(canvas.win, "keydown", (event: KeyboardEvent) => {
		if (event.key !== "Shift") return;
		shiftPressed = true;
		tooltip.hide();
	});
	component.registerDomEvent(canvas.win, "keyup", (event: KeyboardEvent) => {
		if (event.key !== "Shift") return;
		shiftPressed = false;
		if (pointerInside && !draggingId && !isPanning) updateTooltip(hoveredHitId, lastPointer);
	});
	component.registerDomEvent(canvas.win, "blur", () => {
		shiftPressed = false;
		tooltip.hide();
	});

	component.registerDomEvent(canvas, "wheel", (event: WheelEvent) => {
		event.preventDefault();
		const pos = getPointerPosition(event);
		const factor = event.deltaY < 0 ? 1.1 : 0.9;
		renderer.notifyUserInteraction();
		renderer.setHover(null, null);
		tooltip.hide();
		renderer.camera.zoomAt(pos.x, pos.y, factor);
		renderer.requestRedraw();
		callbacks.onViewChanged?.();
	}, { passive: false });

	component.registerDomEvent(canvas, "dblclick", () => {
		renderer.fitToContent(true);
		callbacks.onViewChanged?.();
	});
	component.registerDomEvent(canvas, "contextmenu", (event: MouseEvent) => {
		const pos = getPointerPosition(event);
		const hitId = renderer.pick(pos.x, pos.y);
		if (hitId) {
			event.preventDefault();
			callbacks.onNodeContextMenu?.(hitId, event);
		}
	});
	component.registerDomEvent(canvas, "pointerleave", () => {
		pointerInside = false;
		hoveredHitId = undefined;
		tooltip.hide();
		renderer.setHover(null, null);
		canvas.style.cursor = "default";
	});
}
