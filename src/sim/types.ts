export interface SimNode {
	id: string;
	x: number;
	y: number;
	vx: number;
	vy: number;
	/** Non-null pins the node at this coordinate (dragging, or the fixed center node). */
	fx: number | null;
	fy: number | null;
	radius: number;
	/** Desired distance from the graph center, driven by positionScore. */
	targetRadius: number;
	isCenter: boolean;
}

export interface SimLink {
	source: SimNode;
	target: SimNode;
}
