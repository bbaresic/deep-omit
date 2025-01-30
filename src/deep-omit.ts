import { cloneDeep } from "lodash-es";

export const pathEndsWith = (fullPath: string[], suffix: string[]): boolean => {
	if (suffix.length > fullPath.length) return false;
	const offset = fullPath.length - suffix.length;
	for (let i = 0; i < suffix.length; i++) {
		if (fullPath[offset + i] !== suffix[i]) return false;
	}
	return true;
};

/**
 * Recursively omits:
 *   - single-segment keys (e.g. "one", "three") from any object at any depth
 *   - multi-segment dotted paths (e.g. "two.x", "foo.bar.baz") by removing
 *     the final segment from an object whose path ends in the earlier segments
 *
 * Also removes `undefined` values and prunes empty objects/arrays (returning
 * `undefined` if the entire structure is empty).
 *
 * @param obj - The object to omit keys from
 * @param keysToOmit - The keys to omit
 * @returns The object with the keys omitted
 */
export const deepOmit = <T extends Record<string, any>>(obj: T, keysToOmit: string[]): T => {
	const cloned = cloneDeep(obj);
	const omitPaths = keysToOmit.map((key) => key.split("."));
	const singleSegments: string[] = [];
	const multiSegments: string[][] = [];

	for (const segments of omitPaths) {
		if (segments.length === 1) {
			singleSegments.push(segments[0]);
		} else {
			multiSegments.push(segments);
		}
	}

	const _deepOmit = (value: any, pathSoFar: string[]): any => {
		if (Array.isArray(value)) {
			const newArr = value
				.map((item) => _deepOmit(item, pathSoFar))
				.filter((item) => {
					if (item === undefined) return false;
					if (Array.isArray(item) && item.length === 0) return false;
					if (typeof item === "object" && item !== null && Object.keys(item).length === 0) {
						return false;
					}
					return true;
				});
			return newArr.length === 0 ? undefined : newArr;
		}

		if (typeof value === "object" && value !== null) {
			for (const key of Object.keys(value)) {
				if (singleSegments.includes(key)) {
					delete value[key];
					continue;
				}

				for (const segments of multiSegments) {
					if (segments.length >= 2) {
						const prefix = segments.slice(0, -1);
						const lastKey = segments[segments.length - 1];

						if (pathEndsWith(pathSoFar, prefix) && key === lastKey) {
							delete value[key];
						}
					}
				}

				const childValue = value[key];
				if (childValue === undefined) {
					delete value[key];
					continue;
				}

				const sanitizedChild = _deepOmit(childValue, [...pathSoFar, key]);

				if (
					sanitizedChild === undefined ||
					(Array.isArray(sanitizedChild) && sanitizedChild.length === 0) ||
					(typeof sanitizedChild === "object" && sanitizedChild !== null && Object.keys(sanitizedChild).length === 0)
				) {
					delete value[key];
				} else {
					value[key] = sanitizedChild;
				}
			}

			return Object.keys(value).length === 0 ? undefined : value;
		}

		return value;
	};

	const result = _deepOmit(cloned, []);
	return (result ?? {}) as T;
};
