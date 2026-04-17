////////////////////////////////////////////////////////////////////////////////
class SortedMap {
	constructor(entries = []) {
		this.map = new Map();
		entries.forEach(([key, value]) => this.set(key, value));
		this.firstElements = []; // To store multiple guaranteed first elements
		this.lastElements = []; // To store multiple guaranteed last elements
	}

	set(key, value) {
		this.map.set(key, value);
		this._sortKeys(); // Maintain sorted order
		return this;
	}

	setFirst(key, value) {
		this.firstElements.push({ key, value });
	}

	setLast(key, value) {
		this.lastElements.push({ key, value });
	}

	get(key) {
		const firstElement = this.firstElements.find((el) => el.key === key);
		if (firstElement) return firstElement.value;

		const lastElement = this.lastElements.find((el) => el.key === key);
		return lastElement ? lastElement.value : this.map.get(key);
	}

	has(key) {
		return this.map.has(key) || this.firstElements.some((el) => el.key === key) || this.lastElements.some((el) => el.key === key);
	}

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

	clear() {
		this.map.clear();
		this.firstElements = [];
		this.lastElements = [];
	}

	get size() {
		return this.map.size + this.firstElements.length + this.lastElements.length;
	}

	_sortKeys() {
		const sortedEntries = [...this.map.entries()].sort(([keyA], [keyB]) => {
			if (typeof keyA === "number" && typeof keyB === "number") {
				return keyA - keyB; // Numeric sort
			}
			return String(keyA).localeCompare(String(keyB)); // Lexical sort for strings
		});
		this.map = new Map(sortedEntries);
	}

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

	forEach(callback, thisArg) {
		this.firstElements.forEach((el) => callback.call(thisArg, el.value, el.key, this));
		this.map.forEach(callback, thisArg);
		this.lastElements.forEach((el) => callback.call(thisArg, el.value, el.key, this));
	}

	keys() {
		return [...this.firstElements.map((el) => el.key), ...this.map.keys(), ...this.lastElements.map((el) => el.key)].values();
	}

	values() {
		return [...this.firstElements.map((el) => el.value), ...this.map.values(), ...this.lastElements.map((el) => el.value)].values();
	}

	entries() {
		return [
			...this.firstElements.map((el) => [el.key, el.value]),
			...this.map.entries(),
			...this.lastElements.map((el) => [el.key, el.value]),
		].values();
	}
}

module.exports = SortedMap;
