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

/**
 * Class to provide stateful working parameters as the post data is parsed
 *
 * @class Working
 */
module.exports = class Working {
	constructor(fontManager) {
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
		this._fontManager = fontManager;
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

	get activeFragments() {
		return this._activeFragments;
	}

	get timelineDash() {
		return this._timelineDash;
	}

	get maxWidth() {
		return this._maxWidth;
	}

	set maxWidth(value) {
		this._maxWidth = value;
	}

	get maxHeight() {
		return this._maxHeight;
	}

	set maxHeight(value) {
		this._maxHeight = value;
	}

	get actorSpacing() {
		return this._actorSpacing;
	}

	get startY() {
		return this._startY;
	}

	get startX() {
		return this._startX;
	}

	get fragmentSpacing() {
		return this._fragmentSpacing;
	}

	get maxFragDepth() {
		return this._maxFragDepth;
	}

	get scratchPad() {
		return this._scratchPad;
	}

	get postdata() {
		return this._postdata;
	}

	set postdata(value) {
		this._postdata = value;
	}

	get globalSpacing() {
		return this._globalSpacing;
	}

	get canvasWidth() {
		return this._canvasWidth;
	}

	set canvasWidth(value) {
		this._canvasWidth = value;
	}

	get canvasHeight() {
		return this._canvasHeight;
	}

	set canvasHeight(value) {
		this._canvasHeight = value;
	}

	get windowPadding() {
		return this._windowPadding;
	}

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

	isValidFont(fontname) {
		return this._fontManager.isValidFont(fontname);
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
