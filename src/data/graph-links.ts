import { ghostId, normalizeName } from "./name-matching";
import type { GhostNode, GraphEdge, PersonNode } from "./types";

export interface LinkBuildResult {
	edges: GraphEdge[];
	ghosts: GhostNode[];
}

/**
 * Builds edges + ghost nodes from each person's contact name list.
 * A name matching a person in `people` becomes an edge; otherwise it becomes
 * a ghost node — unless `shouldSkipUnmatched` says to drop it (Bases mode
 * uses this for names whose note exists in the vault but is filtered out of
 * the query: not an edge target, but not a true ghost either).
 */
export function buildContactLinks(
	people: PersonNode[],
	shouldSkipUnmatched?: (name: string) => boolean,
): LinkBuildResult {
	// Keep the first person per normalized name, so a duplicate display name
	// resolves deterministically (vault file order) instead of last-wins.
	const byNormalizedName = new Map<string, PersonNode>();
	const ambiguousNames = new Set<string>();
	for (const person of people) {
		const key = normalizeName(person.displayName);
		if (byNormalizedName.has(key)) ambiguousNames.add(key);
		else byNormalizedName.set(key, person);
	}
	const byPath = new Map<string, PersonNode>();
	for (const person of people) {
		const filePath = person.file.path || person.id;
		byPath.set(normalizeName(filePath.replace(/\.md$/i, "")), person);
		const basename = person.file.basename || person.id.replace(/\.md$/i, "").split("/").pop() || "";
		byPath.set(normalizeName(basename), person);
	}

	const edges: GraphEdge[] = [];
	const seenEdgeKeys = new Set<string>();
	const ghostsByKey = new Map<string, GhostNode>();

	for (const person of people) {
		for (const rawRef of person.ghostRefs) {
			const refKey = normalizeName(rawRef.replace(/\.md$/i, ""));
			const realTarget = byPath.get(refKey) ?? (ambiguousNames.has(refKey) ? undefined : byNormalizedName.get(refKey));

			if (realTarget) {
				// Matched a real person: an edge (or nothing, if it's a
				// self-reference) — never a ghost.
				if (realTarget.id !== person.id) {
					const key = [person.id, realTarget.id].sort().join("|");
					if (!seenEdgeKeys.has(key)) {
						seenEdgeKeys.add(key);
						edges.push({ sourceId: person.id, targetId: realTarget.id });
					}
				}
				continue;
			}

			if (shouldSkipUnmatched?.(rawRef)) continue;

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
