// Copyright (C) 2019 Mark The Page

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

let Utilities = require("./Utilities.js");
const fonts = require("./fonts.js");

/**
 * Class to provide stateful working parameters as the post data is parsed
 *
 * @class Working
 */
module.exports = class Working {
	constructor(canvasClass) {
		this._postdata = null;
		this._globalSpacing = null;
		this._windowPadding = null;
		this._maxWidth = -1;
		this._maxHeight = -1;
		this._canvasWidth = 0;
		this._canvasHeight = 0;
		this._scratchPad = {};
		this._maxFragDepth = 0;
		this._fragmentSpacing = 0;
		this._startX = 0;
		this._startY = 0;
		this._actorSpacing = 0;
		this._timelineDash = [3, 3];
		this._activeFragments = [];
		this._callCount = 0;
		this._negativeX = 0;
		this._id = undefined;
		this._debug = false;
		this._tags = [];

		// Normal Fonts
		this._normalFonts = fonts.normal;
		this._normalFonts.forEach((font) => {
			canvasClass.registerFont(font.file, {
				family: font.name,
			});
		});
		// Bold Fonts
		this._boldFonts = fonts.bold;
		this._boldFonts.forEach((font) => {
			canvasClass.registerFont(font.file, {
				family: font.name,
				weight: "bold",
			});
		});
		// italic fonts
		this._italicFonts = fonts.italic;
		this._italicFonts.forEach((font) => {
			canvasClass.registerFont(font.file, {
				family: font.name,
				style: "italic",
			});
		});
		// Bold & Italic fonts
		this._boldItalicFonts = fonts.boldItalic;
		this._italicFonts.forEach((font) => {
			canvasClass.registerFont(font.file, {
				family: font.name,
				weight: "bold",
				style: "italic",
			});
		});
	}

	get tags() {
		return this._tags;
	}

	set tags(value) {
		this._tags = value;
	}

	get id() {
		return this._id;
	}

	set id(value) {
		this._id = value;
	}

	get negativeX() {
		return this._negativeX;
	}

	set negativeX(value) {
		this._negativeX = value;
	}

	get debug() {
		return this._debug;
	}

	set debug(value) {
		this._debug = value;
	}

	get callCount() {
		return this._callCount;
	}

	set callCount(value) {
		this._callCount = value;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get activeFragments() {
		return this._activeFragments;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get timelineDash() {
		return this._timelineDash;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get maxWidth() {
		return this._maxWidth;
	}

	/**
	 *
	 *
	 * @memberof Working
	 */
	set maxWidth(value) {
		this._maxWidth = value;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get maxHeight() {
		return this._maxHeight;
	}

	/**
	 *
	 *
	 * @memberof Working
	 */
	set maxHeight(value) {
		this._maxHeight = value;
	}
	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get actorSpacing() {
		return this._actorSpacing;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get startY() {
		return this._startY;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get startX() {
		return this._startX;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get fragmentSpacing() {
		return this._fragmentSpacing;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get maxFragDepth() {
		return this._maxFragDepth;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get scratchPad() {
		return this._scratchPad;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get postdata() {
		return this._postdata;
	}

	/**
	 * Set the postdata value
	 *
	 */
	set postdata(value) {
		this._postdata = value;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get globalSpacing() {
		return this._globalSpacing;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get canvasWidth() {
		return this._canvasWidth;
	}

	/**
	 *
	 *
	 */
	set canvasWidth(value) {
		this._canvasWidth = value;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get canvasHeight() {
		return this._canvasHeight;
	}

	/**
	 *
	 *
	 */
	set canvasHeight(value) {
		this._canvasHeight = value;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof Working
	 */
	get windowPadding() {
		return this._windowPadding;
	}

	/**
	 *
	 *
	 * @param {*} lines
	 * @param {*} reset
	 * @returns
	 */
	calculateFragmentDepth(lines, reset) {
		if (typeof this.scratchPad.maxFragmentDepth != "number") {
			this.scratchPad.maxFragmentDepth = 0;
		}
		if (typeof this.scratchPad.curFragmentDepth != "number") {
			this.scratchPad.curFragmentDepth = 0;
		}
		if (!Array.isArray(lines)) {
			return this.scratchPad.maxFragmentDepth;
		}
		if (reset) {
			this.scratchPad.maxFragmentDepth = 0;
			this.scratchPad.curFragmentDepth = 0;
		}
		lines.forEach((line) => {
			if (Utilities.isObject(line) && line.type == "fragment") {
				this.scratchPad.curFragmentDepth++;
				if (this.scratchPad.curFragmentDepth > this.scratchPad.maxFragmentDepth) {
					this.scratchPad.maxFragmentDepth = this.scratchPad.curFragmentDepth;
				}
				this.calculateFragmentDepth(line.lines, false);
				this.scratchPad.curFragmentDepth--;
			}
		});
		return this.scratchPad.maxFragmentDepth;
	}

	/**
	 *
	 *
	 * @param {*} canvasWidth
	 * @param {*} canvasHeight
	 * @memberof Working
	 */
	init() {
		if (typeof this.postdata != "object" || this.postdata == null) {
			this.postdata = {};
		}
		if (typeof this.postdata.params != "object" || this.postdata.params == null) {
			this.postdata.params = {};
		}
		if (!Array.isArray(this.postdata.lines)) {
			this.postdata.lines = [];
		}
		this._canvasWidth = 0;
		this._canvasHeight = 0;
		this._maxWidth = 0;
		this._maxHeight = 0;
		this._globalSpacing =
			Utilities.isNumber(this.postdata.params.globalSpacing) && this.postdata.params.globalSpacing >= 0
				? this.postdata.params.globalSpacing
				: 30;
		this._windowPadding =
			Utilities.isNumber(this.postdata.params.windowPadding) && this.postdata.params.windowPadding >= 0
				? this.postdata.params.windowPadding
				: this._globalSpacing;
		this._fragmentSpacing =
			this.postdata.params.fragment &&
			Utilities.isNumber(this.postdata.params.fragment.fragmentSpacing) &&
			this.postdata.params.fragmentSpacing >= 0
				? this.postdata.params.fragment.fragmentSpacing
				: this._globalSpacing;
		this._maxFragDepth = this.calculateFragmentDepth(this.postdata.lines, true);
		let shiftToTheRight = this._negativeX < 0 ? -this._negativeX + this._windowPadding : 0;
		this._startX =
			this._windowPadding + shiftToTheRight + (Utilities.isNumber(this._maxFragDepth) ? this._maxFragDepth * this._fragmentSpacing : 0);
		this._startY = this._windowPadding;
		this._actorSpacing =
			Utilities.isNumber(this.postdata.params.actorSpacing) && this.postdata.params.actorSpacing >= 0
				? this.postdata.params.actorSpacing
				: 150;
		this._tags = Utilities.isAllStrings(this.postdata.params.tags) ? this.postdata.params.tags : [];
		if (this.tags.length > 0) {
			this.logDebug("Using tags array of " + this.tags);
		}
	}

	/**
	 *
	 *
	 * @static
	 * @param {*} maxx
	 * @param {*} maxy
	 * @returns
	 * @memberof Working
	 */
	manageMaxWidth(maxx, maxy) {
		if (Utilities.isNumber(maxx)) this._maxWidth = maxx > this._maxWidth ? maxx : this._maxWidth;
		if (Utilities.isNumber(maxy)) this._maxHeight = maxy > this._maxHeight ? maxy : this._maxHeight;
		return {
			x: maxx,
			y: maxy,
		};
	}

	manageMaxWidthXy(xy) {
		return this.manageMaxWidth(xy.x, xy.y);
	}

	debug() {
		return this._debug;
	}

	/**
	 *
	 *
	 * @param {*} font
	 * @returns
	 */
	isValidFont(fontname) {
		for (let i = 0; i < this._normalFonts.length; i++) {
			if (this._normalFonts[i].name === fontname) {
				return true;
			}
		}
		for (let i = 0; i < this._boldFonts.length; i++) {
			if (this._boldFonts[i].name === fontname) {
				return true;
			}
		}
		for (let i = 0; i < this._italicFonts.length; i++) {
			if (this._italicFonts[i].name === fontname) {
				return true;
			}
		}
		for (let i = 0; i < this._boldItalicFonts.length; i++) {
			if (this._boldItalicFonts[i].name === fontname) {
				return true;
			}
		}
		if (fontname === "monospace" || fontname === "sans-serif" || fontname === "serif") return true;
		return false;
	}

	logInfo(message) {
		if (typeof message != "string") return;
		message = typeof this.id == "string" ? this.id + " : " + message : message;
		this.logger != undefined
			? this.logger.info(message)
			: console.error(
					JSON.stringify({
						date: new Date().toISOString(),
						level: "info",
						message: message,
					})
			  );
	}

	logDebug(message) {
		if (typeof message != "string") return;
		if (!this.debug) return;
		message = typeof this.id == "string" ? this.id + " : " + message : message;
		this.logger != undefined
			? this.logger.debug(message)
			: console.error(
					JSON.stringify({
						date: new Date().toISOString(),
						level: "debug",
						message: message,
					})
			  );
	}

	logError(message) {
		if (typeof message != "string") return;
		message = typeof this.id == "string" ? this.id + " : " + message : message;
		this.logger != undefined
			? this.logger.error(message)
			: console.error(
					JSON.stringify({
						date: new Date().toISOString(),
						level: "error",
						message: message,
					})
			  );
	}

	logWarn(message) {
		if (typeof message != "string") return;
		message = typeof this.id == "string" ? this.id + " : " + message : message;
		this.logger != undefined
			? this.logger.warning(message)
			: console.error(
					JSON.stringify({
						date: new Date().toISOString(),
						level: "warning",
						message: message,
					})
			  );
	}
};
