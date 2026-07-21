import { easeInCubic } from "../utils/geometry";
import {
	applyCenterForce,
	applyCollisionForce,
	applyLinkForce,
	applyRadialPositionForce,
	applyRepulsionForce,
} from "./forces";
import { SpatialGrid } from "./spatial-grid";
import type { SimLink, SimNode } from "./types";

export type { SimLink, SimNode } from "./types";

const ALPHA_MIN = 0.001;
const ALPHA_DECAY = 0.02;
const VELOCITY_DECAY = 0.6;
/** Caps per-tick displacement so a fresh reheat can't teleport nodes. */
const MAX_SPEED = 14;
/** Ticks the ease-in warm-up takes to reach peak alpha (~0.5s at 60fps). */
const RAMP_TICKS = 32;
const GRID_CELL_SIZE = 140;

export interface SimulationConfig {
	linkDistance: number;
	repulsionStrength: number;
	linkStrength: number;
	centerStrength: number;
}

const DEFAULT_CONFIG: SimulationConfig = {
	linkDistance: 110,
	repulsionStrength: 2200,
	linkStrength: 0.5,
	centerStrength: 0.05,
};

/**
 * A small, dependency-free force simulation: link/spring, pairwise repulsion
 * (via a spatial grid broad phase), centering, radial "position score"
 * placement, and collision separation. Runs to rest and reports isSettled()
 * so the caller (canvas-renderer) can stop its animation loop entirely while
 * idle, instead of ticking forever.
 *
 * A reheat doesn't jump straight to peak energy: alpha ramps up along an
 * ease-in curve (slow start, accelerating), then decays as usual — so layout
 * changes glide in instead of snapping.
 */
export class Simulation {
	nodes: SimNode[] = [];
	links: SimLink[] = [];
	centerX = 0;
	centerY = 0;
	alpha = 0;
	alphaTarget = 0;
	config: SimulationConfig;

	private rampT = 1;
	private rampPeak = 0;
	private readonly grid = new SpatialGrid(GRID_CELL_SIZE);

	constructor(config: Partial<SimulationConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	setGraph(nodes: SimNode[], links: SimLink[]): void {
		this.nodes = nodes;
		this.links = links;
	}

	setCenter(x: number, y: number): void {
		this.centerX = x;
		this.centerY = y;
	}

	reheat(alpha = 0.6): void {
		this.rampPeak = Math.max(alpha, this.alpha);
		this.rampT = 0;
		// Keep alpha just above the settle threshold so the loop starts ticking.
		if (this.alpha < 0.01) this.alpha = 0.01;
	}

	isSettled(): boolean {
		return this.alpha < ALPHA_MIN;
	}

	tick(): void {
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
}
