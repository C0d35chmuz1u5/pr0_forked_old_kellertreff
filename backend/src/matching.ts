import type { UserTagSet, TagList } from "./shared/typebox.js";
import { getTagsFromTagList } from "./shared/types.js";

function getSimilaritiesFactor(a: PairabilityUser, b: PairabilityUser): number {
	/*
		We want to measure the similarity of the two sets of tags.
		This seems not to be so easy. As we don't trust this, we only use it as a 20% factor of pairability.

		Tag lists can be seen as sets of strings. The similarity of sets can be computed using several methods. For example:
		- Jaccard Index: https://en.wikipedia.org/wiki/Jaccard_index
		- Sørensen–Dice Coefficient: https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient
		- Overlap Coefficient: https://en.wikipedia.org/wiki/Overlap_coefficient
		- Tversky Index: https://en.wikipedia.org/wiki/Tversky_index

		However, these methods expect sets that contain well-defined elements.
		Our tag lists have user-input that may vary in spelling etc.

		We may need to come up with something different, based on probabilistic or heuristic methods.

		One option is to take the levenshtein distance [1] into account when computing set similarity with one of the methods mentioned above.
		Even though this seems like an appropriate measure, the levenshtein distance does not take semantics into account.
		For example, the common tags:
			1: "richtig fette titten"
			2: "derbe brachiale ultramelonen"
			3: "gut bebrüstet"
		have nearly equivalent semantic meaning.
		However, their levenshtein distance is (according to the implementation at [2]):
			1<->2: 21
			1<->3: 15
			2<->3: 23
		...pretty big (the distance relation is symmetric).
		This may result in the tags being treated not equal even though they can be seen as pretty equivalent.

		At this point, we think it's more meaningful to take a data analysis and use the "relatedness" of tags as an equality measure.
		This measure can then be used for set similarity.

		As this requires some fancy data analysis work that has yet to be done (we have some data, but we need to figure out what to do with it, lol),
		this is left for future work.

		[1]: https://en.wikipedia.org/wiki/Levenshtein_distance
		[2]: https://planetcalc.com/1721/
	*/

	/*
		Also interesting measures, like ELO:
		- https://en.wikipedia.org/wiki/TrueSkill
		- https://en.wikipedia.org/wiki/Glicko_rating_system
		- https://en.wikipedia.org/wiki/Elo_rating_system
	*/

	// Throw people with only one tag in the same bin
	if (a.tags.length === 1) {
		return b.tags.length === 1 ? 1 : 0;
	}
	if (b.tags.length === 1) {
		return 0;
	}

	// For now, we just return 1 if the users have a similar tag
	// We're not using ES6 sets because we only have like 15 entries
	return a.tags.some(tag => b.tagList.includes(tag)) ||
		b.tags.some(tag => a.tagList.includes(tag))
		? 1
		: Math.random();
}

export interface PairabilityUser {
	readonly tagList: TagList;
	readonly tags: UserTagSet;
	// readonly tagsSet: Set<Tag>;
}

export function pairability(user_a_tags: TagList, user_b_tags: TagList): number {
	const tagsA = getTagsFromTagList(user_a_tags, true);
	const a: PairabilityUser = {
		tagList: user_a_tags,
		tags: tagsA,
		// tagsSet: new Set(tagsA),
	};

	const tagsB = getTagsFromTagList(user_b_tags, true);
	const b: PairabilityUser = {
		tagList: user_b_tags,
		tags: tagsB,
		// tagsSet: new Set(tagsB),
	};

	return 0.2 * Math.random() + 0.8 * getSimilaritiesFactor(a, b);
}
