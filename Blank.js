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
let Actor = require("./Actor.js");
let Comment = require("./Comment.js");

module.exports = class Blank {
	/**
	 * Creates an instance of Terminate.
	 * @param {*} ctx
	 * @param {*} line
	 * @memberof Terminate
	 */
	constructor(ctx, line, working) {
		this._ctx = ctx;
		this._line = line;
	}

	/**
	 *
	 *
	 * @param {*} working
	 * @param {*} starty
	 * @param {*} mimic
	 */
	draw(working, starty, mimic) {
		////////////////////////////////
		// Draw blank line (without timelines) if there is no line object
		if (this._line == null || typeof this._line != "object") {
			return {
				x: 0,
				y: starty + working.globalSpacing,
			};
		}

		if (!working.postdata) {
			working.postdata = {};
		}
		if (!working.postdata.params) {
			working.postdata.params = {};
		}
		if (!working.postdata.params.terminate) {
			working.postdata.params.terminate = {};
		}

		let currentActiveAboveThisFragment = 0;
		if (Array.isArray(working.activeFragments)) {
			currentActiveAboveThisFragment = working.activeFragments.length;
		}

		let ctx = this._ctx;
		let width = Utilities.isNumber(this._line.width) && this._line.width > 0 ? this._line.width : 0;
		let height = Utilities.isNumber(this._line.height) && this._line.height > 0 ? this._line.height : 0;
		let xoffset = Utilities.isNumber(this._line.xoffset) && this._line.xoffset > 0 ? this._line.xoffset : 0;
		let blankleft = working.windowPadding + currentActiveAboveThisFragment * working.fragmentSpacing + xoffset;
		let blankRight = blankleft + width;
		let blankTop = starty;
		let blankBottom = starty + height;
		let commentxy = null;
		let comment = null;
		if (this._line.comment != null) {
			comment = new Comment(ctx, this._line.comment);
			commentxy = comment.draw(working, blankleft + 2 * working.globalSpacing, blankTop + working.globalSpacing, 0, 0, true);
			blankBottom = commentxy.y + height + 1;
		}
		let xy = Actor.drawTimelines(working, ctx, starty, blankBottom - blankTop, true);
		let finalHeightOfAllLine = xy.y - starty;

		///////////////////////////////////
		// Height now calculated .. not draw the items in order
		// 1. Background fragments
		// 2. Time lines
		// 3. Comment

		///////////////////////////////////
		// 1. Background fragments
		Utilities.drawActiveFragments(working, this._ctx, starty, finalHeightOfAllLine, mimic);

		///////////////////////////////////
		// 2. Time lines
		xy = Actor.drawTimelines(working, ctx, starty, finalHeightOfAllLine, mimic);

		///////////////////////////////////
		// 3. Comment
		if (comment != null) {
			commentxy = comment.draw(working, blankleft + 2 * working.globalSpacing, blankTop + working.globalSpacing, 0, 0, mimic);
		}

		working.manageMaxWidth(blankRight, blankBottom);
		return working.manageMaxWidth(0, starty + finalHeightOfAllLine);
	}
};
