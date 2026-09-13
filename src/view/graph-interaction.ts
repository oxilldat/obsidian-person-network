import type { Component } from "obsidian";
import type { GhostNode, PersonNode } from "../data/types";
import { t } from "../i18n";
import { CENTER_NODE_ID, type CanvasRenderer } from "../render/canvas-renderer";
import type { Tooltip } from "./tooltip";

export function personTooltipLines(person: PersonNode): string[] {
	const lines = [person.displayName];
	if (person.company) lines.push(t("tooltip.company", { value: person.company }));
	if (person.relationType) lines.push(t("tooltip.relation", { value: person.relationType }));
	lines.push(t("tooltip.position", { value: person.positionScore }));
	return lines;
}

export function ghostTooltipLines(ghost: GhostNode): string[] {
	return [ghost.displayName, t("tooltip.ghostHint")];
}

export interface GraphInteractionCallbacks {
	/** Fired for a real (non-center) node when the pointer went down and up without dragging. */
	onNodeClick(id: string): void;
	onNodeContextMenu?(id: string, event: MouseEvent): void;
	onViewChanged?(): void;
	/** Lines for the hover tooltip, or null to show none for this node. */
	getTooltipLines(id: string): string[] | null;
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
	let pointerDownPos = { x: 0, y: 0 };
	let lastPointer = { x: 0, y: 0 };

	const getPointerPosition = (event: { clientX: number; clientY: number }): { x: number; y: number } => {
		const rect = canvas.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	};

	const updateTooltip = (hitId: string | undefined, pos: { x: number; y: number }): void => {
		if (!hitId || hitId === CENTER_NODE_ID) {
			tooltip.hide();
			return;
		}
		const lines = callbacks.getTooltipLines(hitId);
		if (lines && lines.length > 0) tooltip.show(lines, pos.x, pos.y);
		else tooltip.hide();
	};

	component.registerDomEvent(canvas, "pointerdown", (event: PointerEvent) => {
		if (event.button !== 0) return;
		const pos = getPointerPosition(event);
		const hitId = renderer.pick(pos.x, pos.y);

		lastPointer = pos;
		pointerDownPos = pos;
		pointerDownId = hitId ?? null;

		if (hitId) {
			canvas.setPointerCapture(event.pointerId);
			draggingId = hitId;
			renderer.beginDrag(hitId);
		} else {
			isPanning = true;
			renderer.notifyUserInteraction();
		}
	});

	component.registerDomEvent(canvas, "pointermove", (event: PointerEvent) => {
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

	const finishPointer = (event?: PointerEvent): void => {
		if (draggingId) renderer.endDrag(draggingId);

		const moved = Math.hypot(lastPointer.x - pointerDownPos.x, lastPointer.y - pointerDownPos.y);
		if (pointerDownId && pointerDownId !== CENTER_NODE_ID && moved < CLICK_MOVE_THRESHOLD) {
			callbacks.onNodeClick(pointerDownId);
		}

		draggingId = null;
		isPanning = false;
		pointerDownId = null;
		callbacks.onViewChanged?.();
		if (event && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
	};
	component.registerDomEvent(canvas.win, "pointerup", finishPointer);
	component.registerDomEvent(canvas.win, "pointercancel", finishPointer);

	component.registerDomEvent(canvas, "wheel", (event: WheelEvent) => {
		event.preventDefault();
		const pos = getPointerPosition(event);
		const factor = event.deltaY < 0 ? 1.1 : 0.9;
		renderer.notifyUserInteraction();
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
		if (hitId && hitId !== CENTER_NODE_ID) {
			event.preventDefault();
			callbacks.onNodeContextMenu?.(hitId, event);
		}
	});
	component.registerDomEvent(canvas, "pointerleave", () => tooltip.hide());
}
