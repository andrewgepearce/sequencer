////////////////////////////////////////////////////////////////////////////////
/**
 * A SortedMap is a Map-like data structure that maintains its entries in sorted order by key.
 * It supports all standard Map operations and ensures that the keys are always sorted.
 *
 * Performance Analysis:
 * - Insertion, deletion, and lookup operations are O(n log n) due to the need to maintain sorted order.
 * - Iteration over the entries is O(n) as it simply traverses the sorted entries.
 *
 * Complexity:
 * - Space Complexity: O(n), where n is the number of entries in the map.
 * - Time Complexity:
 *   - Insertion: O(n log n)
 *   - Deletion: O(n log n)
 *   - Lookup: O(1)
 *   - Iteration: O(n)
 */
class SortedMap {
	/**
	 * Creates a new SortedMap instance.
	 *
	 * @param {Array} [entries=[]] - An optional array of key-value pairs to initialize the map with.
	 */
	constructor(entries = []) {
		this.map = new Map();
		entries.forEach(([key, value]) => this.set(key, value));
		this.firstElements = []; // To store multiple guaranteed first elements
		this.lastElements = []; // To store multiple guaranteed last elements
	}

	/**
	 * Adds or updates an entry in the map.
	 *
	 * @param {*} key - The key of the entry.
	 * @param {*} value - The value of the entry.
	 * @returns {SortedMap} The SortedMap instance.
	 */
	set(key, value) {
		this.map.set(key, value);
		this._sortKeys(); // Maintain sorted order
		return this;
	}

	/**
	 * Adds an entry that is guaranteed to be the first element when iterating.
	 *
	 * @param {*} key - The key of the entry.
	 * @param {*} value - The value of the entry.
	 */
	setFirst(key, value) {
		this.firstElements.push({ key, value });
	}

	/**
	 * Adds an entry that is guaranteed to be the last element when iterating.
	 *
	 * @param {*} key - The key of the entry.
	 * @param {*} value - The value of the entry.
	 */
	setLast(key, value) {
		this.lastElements.push({ key, value });
	}

	/**
	 * Retrieves a value by key.
	 *
	 * @param {*} key - The key of the entry to retrieve.
	 * @returns {*} The value associated with the key, or undefined if the key does not exist.
	 */
	get(key) {
		const firstElement = this.firstElements.find((el) => el.key === key);
		if (firstElement) return firstElement.value;

		const lastElement = this.lastElements.find((el) => el.key === key);
		return lastElement ? lastElement.value : this.map.get(key);
	}

	/**
	 * Checks if a key exists in the map.
	 *
	 * @param {*} key - The key to check for.
	 * @returns {boolean} True if the key exists, false otherwise.
	 */
	has(key) {
		return this.map.has(key) || this.firstElements.some((el) => el.key === key) || this.lastElements.some((el) => el.key === key);
	}

	/**
	 * Deletes an entry from the map.
	 *
	 * @param {*} key - The key of the entry to delete.
	 * @returns {boolean} True if the entry was deleted, false if the key does not exist.
	 */
	delete(key) {
		let index = this.firstElements.findIndex((el) => el.key === key);
		if (index !== -1) {
			this.firstElements.splice(index, 1);
			return true;
		}

		index = this.lastElements.findIndex((el) => el.key === key);
		if (index !== -1) {
			this.lastElements.splice(index, 1);
			return true;
		}

		const result = this.map.delete(key);
		if (result) this._sortKeys();
		return result;
	}

	/**
	 * Clears all entries from the map.
	 */
	clear() {
		this.map.clear();
		this.firstElements = [];
		this.lastElements = [];
	}

	/**
	 * Gets the number of entries in the map.
	 *
	 * @returns {number} The number of entries in the map.
	 */
	get size() {
		return this.map.size + this.firstElements.length + this.lastElements.length;
	}

	/**
	 * Sorts the map entries by key.
	 *
	 * @private
	 */
	_sortKeys() {
		const sortedEntries = [...this.map.entries()].sort(([keyA], [keyB]) => {
			if (typeof keyA === "number" && typeof keyB === "number") {
				return keyA - keyB; // Numeric sort
			}
			return String(keyA).localeCompare(String(keyB)); // Lexical sort for strings
		});
		this.map = new Map(sortedEntries);
	}

	/**
	 * Returns an iterator over the entries in the map.
	 *
	 * @returns {Iterator} An iterator over the entries in the map.
	 */
	[Symbol.iterator]() {
		const firstIterator = this.firstElements[Symbol.iterator]();
		const mapIterator = this.map[Symbol.iterator]();
		const lastIterator = this.lastElements[Symbol.iterator]();

		return {
			next() {
				let result = firstIterator.next();
				if (!result.done) return { value: [result.value.key, result.value.value], done: false };

				result = mapIterator.next();
				if (!result.done) return result;

				result = lastIterator.next();
				if (!result.done) return { value: [result.value.key, result.value.value], done: false };

				return { done: true };
			},
		};
	}

	/**
	 * Executes a provided function once for each map entry.
	 *
	 * @param {Function} callback - Function to execute for each entry.
	 * @param {*} [thisArg] - Value to use as `this` when executing the callback.
	 */
	forEach(callback, thisArg) {
		this.firstElements.forEach((el) => callback.call(thisArg, el.value, el.key, this));
		this.map.forEach(callback, thisArg);
		this.lastElements.forEach((el) => callback.call(thisArg, el.value, el.key, this));
	}

	/**
	 * Returns an iterator over the keys in the map.
	 *
	 * @returns {Iterator} An iterator over the keys in the map.
	 */
	keys() {
		return [...this.firstElements.map((el) => el.key), ...this.map.keys(), ...this.lastElements.map((el) => el.key)].values();
	}

	/**
	 * Returns an iterator over the values in the map.
	 *
	 * @returns {Iterator} An iterator over the values in the map.
	 */
	values() {
		return [...this.firstElements.map((el) => el.value), ...this.map.values(), ...this.lastElements.map((el) => el.value)].values();
	}

	/**
	 * Returns an iterator over the entries in the map.
	 *
	 * @returns {Iterator} An iterator over the entries in the map.
	 */
	entries() {
		return [
			...this.firstElements.map((el) => [el.key, el.value]),
			...this.map.entries(),
			...this.lastElements.map((el) => [el.key, el.value]),
		].values();
	}
}

module.exports = SortedMap;
