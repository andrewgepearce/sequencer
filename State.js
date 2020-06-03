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
let TextMetadata = require("./TextMetadata.js");
let Actor = require("./Actor.js");
let Comment = require("./Comment.js");

module.exports = class State {
	/**
	 * Creates an instance of State.
	 * @param {*} ctx
	 * @param {*} line
	 * @memberof State
	 */
	constructor(ctx, line) {
		this._ctx = ctx;
		this._line = line;
	}

	/**
	 *
	 *
	 * @param {*} starty
	 * @param {*} mimic
	 * @returns
	 * @memberof State
	 */
	draw(working, starty, mimic) {
		if (!working.postdata) {
			working.postdata = {};
		}
		if (!working.postdata.params) {
			working.postdata.params = {};
		}
		if (!working.postdata.params.state) {
			working.postdata.params.state = {};
		}
		let statetmd = TextMetadata.getTextMetadataFromObject(working, this._line, working.postdata.params.state, State.getDefaultTmd());

		///////////////////////
		// Get the corner radius
		let radius = Utilities.isNumberGtEq0(this._line.radius)
			? this._line.radius
			: working.postdata.params && working.postdata.params.state && Utilities.isNumberGtEq0(working.postdata.params.state.radius)
			? working.postdata.params.state.radius
			: 5;

		/////////////
		// Calculate height of state line
		let ctx = this._ctx;
		let stateTop = null;
		let commentxy = null;
		let comment = null;
		const wh = Utilities.getTextWidthAndHeight(ctx, statetmd, this._line.text, working.tags);
		let swidth = wh.w; //statetmd.getBoxWidth(ctx, this._line.text);
		let amiddle = null;
		working.postdata.actors.forEach((actor) => {
			if (this._line.actor == actor.alias) {
				amiddle = actor.clinstance.middle;
			}
		});
		if (amiddle == null) {
			amiddle = working.maxWidth / 2;
		}
		if (!Utilities.isNumber(amiddle) || amiddle < 0) {
			return {
				x: 0,
				y: 0
			};
		}
		let stateStartX = amiddle - swidth / 2;

		if (this._line.comment != null) {
			comment = new Comment(ctx, this._line.comment);
			commentxy = comment.draw(
				working,
				stateStartX + working.globalSpacing,
				starty + working.globalSpacing,
				working.globalSpacing,
				working.globalSpacing,
				true
			);
			stateTop = commentxy.y;
		} else {
			stateTop = starty + working.globalSpacing;
		}

		if (stateStartX < working.negativeX) {
			working.negativeX = stateStartX;
			working.negativeX -= 10;
		}

		let textxy = Utilities.drawTextRectangle(
			ctx,
			this._line.text,
			statetmd,
			stateTop,
			stateStartX,
			null,
			null,
			radius,
			true,
			true,
			true,
			true,
			true,
			wh,
			working.tags
		);
		let xy = Actor.drawTimelines(working, ctx, starty, textxy.y - starty + 1, true);

		let finalHeightOfAllLine = xy.y - starty;

		///////////////////////////////////
		// Height now calculated .. not draw the items in order
		// 1. Background fragments
		// 2. Time lines
		// 3. Comment
		// 4. State

		///////////////////////////////////
		// 1. Background fragments

		Utilities.drawActiveFragments(working, this._ctx, starty, finalHeightOfAllLine, mimic);

		///////////////////////////////////
		// 2. Time lines
		xy = Actor.drawTimelines(working, ctx, starty, finalHeightOfAllLine, mimic);

		///////////////////////////////////
		// 3. Comment
		if (comment != null) {
			commentxy = comment.draw(
				working,
				stateStartX + working.globalSpacing,
				starty + working.globalSpacing,
				working.globalSpacing,
				working.globalSpacing,
				mimic
			);
		}

		///////////////////////////////////
		// 4. State
		textxy = Utilities.drawTextRectangle(
			ctx,
			this._line.text,
			statetmd,
			stateTop,
			stateStartX,
			null,
			null,
			radius,
			true,
			true,
			true,
			true,
			mimic,
			wh,
			working.tags
		);
		return working.manageMaxWidth(textxy.x, starty + finalHeightOfAllLine);
	}

	/**
	 * Create a text metadata object using default values for a state block
	 *
	 * @static
	 * @returns
	 * @memberof Call
	 */
	static getDefaultTmd() {
		const defaultCommentTmd = {
			fontFamily: "sans-serif",
			fontSizePx: 14,
			fgColour: "rgb(0,0,0)",
			bgColour: "rgb(255,255,0)",
			padding: 10,
			spacing: 1,
			align: "left",
			borderColour: "rgb(0,0,0)",
			borderWidth: 1,
			borderDash: []
		};
		return defaultCommentTmd;
	}
};
