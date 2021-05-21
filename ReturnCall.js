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

module.exports = class ReturnCall {
	/**
	 *Creates an instance of ReturnCall.
	 * @param {*} ctx
	 * @param {*} line
	 * @memberof ReturnCall
	 */
	constructor(ctx, line, working) {
		this._ctx = ctx;
		this._line = line;
		this._startx = null;
		this._endx = null;
		this._actorFromClass = null;
		this._actorToClass = null;
		this._callCount = ++working.callCount;
	}

	/**
	 *
	 *
	 * @param {*} starty
	 * @param {*} mimic
	 * @returns
	 * @memberof ReturnCall
	 */
	draw(working, starty, mimic) {
		// TODO: Add support for "break to flow" if a ret line is added

		////////////////////////////////
		// Draw blank line (without timelines) if there is no line object
		if (this._line == null || typeof this._line != "object") {
			return {
				x: 0,
				y: starty,
			};
		}

		if (!working.postdata) {
			working.postdata = {};
		}
		if (!working.postdata.params) {
			working.postdata.params = {};
		}
		if (!working.postdata.params.return) {
			working.postdata.params.return = {};
		}

		//////////////////
		// Get the call TMD
		let returntmd = TextMetadata.getTextMetadataFromObject(working, this._line, working.postdata.params.return, ReturnCall.getDefaultTmd());
		returntmd.bgColour = "rgba(0,0,0,0)";

		///////////////////////
		// Get the line dash
		let lineDash =
			Array.isArray(this._line.lineDash) && Utilities.isAllNumber(this._line.lineDash)
				? this._line.lineDash
				: working.postdata.params &&
				  working.postdata.params.return &&
				  Array.isArray(working.postdata.params.return.lineDash) &&
				  Utilities.isAllNumber(working.postdata.params.return.lineDash)
				? working.postdata.params.return.lineDash
				: [6, 3];

		///////////////////////
		// Get the line width
		let lineWidth =
			Utilities.isNumber(this._line.lineWidth) && this._line.lineWidth > 0
				? this._line.lineWidth
				: working.postdata.params &&
				  working.postdata.params.return &&
				  Utilities.isNumber(working.postdata.params.return.lineWidth) &&
				  working.postdata.params.return.lineWidth > 0
				? working.postdata.params.return.lineWidth
				: 1;

		///////////////////////
		// Get the line colour
		let lineColour = Utilities.validColour(this._line.lineColour)
			? this._line.lineColour
			: working.postdata.params && working.postdata.params.return && Utilities.validColour(working.postdata.params.return.lineColour)
			? working.postdata.params.return.lineColour
			: "rgb(0, 0, 0)";

		///////////////////////
		// Get the arrow size
		let arrowSizeY =
			Utilities.isNumber(this._line.arrowSize) && this._line.arrowSize > 0
				? this._line.arrowSize
				: working.postdata.params &&
				  working.postdata.params.return &&
				  Utilities.isNumber(working.postdata.params.return.arrowSize) &&
				  working.postdata.params.return.arrowSize > 0
				? working.postdata.params.return.arrowSize
				: 5;

		////////////////////////////////
		// Get startx and endx for the call
		working.postdata.actors.forEach((actor) => {
			if (actor.alias === this._line.from) {
				this._startx = actor.clinstance.middle;
				this._actorFromClass = actor.clinstance;
			}
			if (actor.alias === this._line.to) {
				this._endx = actor.clinstance.middle;
				this._actorToClass = actor.clinstance;
			}
		});

		////////////////////////////////
		// Should we break the to or from flows
		const continueFromFlow = this._line.continueFromFlow === true ? true : false;
		const breakToFlow = this._line.breakToFlow === true ? true : false;

		////////////////////////////////
		// Ignore line if start and enx are not numbers
		if (typeof this._startx != "number" || typeof this._endx != "number") {
			return {
				x: 0,
				y: starty,
			};
		}

		////////////////////////////////
		// Ignore line if the return is to the same actor
		if (this._endx == this._startx) {
			return {
				x: 0,
				y: starty,
			};
		}

		/////////////
		// Calculate height of fragment condition line
		let startxAfterFlow, endxAfterFlow;
		const ctx = this._ctx;
		let commentxy = null;
		let comment = null;
		let calltexty = null;
		let callliney = null;
		let commentOnStartx = true;

		let textToPrint = null;
		if (Utilities.isAllStrings(this._line.text)) {
			textToPrint = this._line.text.slice();
			for (let i = 0; i < textToPrint.length; i++) {
				textToPrint[i] = "<hang>" + textToPrint[i];
			}
			textToPrint.unshift("" + this._callCount + ". ");
		} else if (Utilities.isString(this._line.text)) {
			textToPrint = this._callCount + ". " + this._line.text;
		} else {
			textToPrint = this._callCount + ". ";
		}

		let wh = Utilities.getTextWidthAndHeight(ctx, returntmd, textToPrint, working.tags);
		const textheight = wh.h;
		if (this._startx < this._endx) {
			startxAfterFlow = this._startx + this._actorFromClass.flowWidth / 2;
			endxAfterFlow = this._endx - this._actorToClass.flowWidth / 2;
		} else {
			startxAfterFlow = this._startx - this._actorFromClass.flowWidth / 2;
			endxAfterFlow = this._endx + this._actorToClass.flowWidth / 2;
			commentOnStartx = false;
		}
		if (this._line.comment != null) {
			comment = new Comment(ctx, this._line.comment);

			if (commentOnStartx) {
				commentxy = comment.draw(
					working,
					startxAfterFlow + working.globalSpacing,
					starty + working.globalSpacing,
					textheight,
					working.globalSpacing,
					true
				);
			} else {
				commentxy = comment.draw(
					working,
					endxAfterFlow + 2 * arrowSizeY + working.globalSpacing,
					starty + working.globalSpacing,
					textheight,
					working.globalSpacing,
					true
				);
			}
			callliney = commentxy.y;
			calltexty = callliney - textheight;
		} else {
			callliney = starty + textheight + working.globalSpacing;
			calltexty = callliney - textheight;
		}

		let xy = Actor.drawTimelines(working, ctx, starty, callliney + arrowSizeY - starty + 1, true);
		let finalHeightOfAllLine = xy.y - starty;

		///////////////////////////////////
		// Height now calculated .. not draw the items in order
		// 1. Background fragments
		// 2. Time lines
		// 3. Comment
		// 4. Call text
		// 5a. Call line
		// 5b. Call line arrow

		///////////////////////////////////
		// 1. Background fragments

		Utilities.drawActiveFragments(working, this._ctx, starty, finalHeightOfAllLine, mimic);

		///////////////////////////////////
		// 2. Time lines
		if (continueFromFlow) {
			this._actorFromClass.flowStartYPos = callliney - arrowSizeY;
			this._actorFromClass.flowEndYPos = null;
		} else {
			this._actorFromClass.flowStartYPos = callliney - arrowSizeY;
			this._actorFromClass.flowEndYPos = callliney + arrowSizeY;
		}
		if (breakToFlow) {
			this._actorToClass.flowStartYPos = callliney - arrowSizeY;
			this._actorToClass.flowEndYPos = callliney + arrowSizeY;
		} else {
			this._actorToClass.flowStartYPos = callliney - arrowSizeY;
			this._actorToClass.flowEndYPos = null;
		}
		xy = Actor.drawTimelines(working, ctx, starty, finalHeightOfAllLine, mimic);

		///////////////////////////////////
		// 3. Comment
		if (comment != null) {
			if (commentOnStartx) {
				commentxy = comment.draw(
					working,
					startxAfterFlow + working.globalSpacing,
					starty + working.globalSpacing,
					textheight,
					working.globalSpacing,
					mimic
				);
			} else {
				commentxy = comment.draw(
					working,
					endxAfterFlow + 2 * arrowSizeY + working.globalSpacing,
					starty + working.globalSpacing,
					textheight,
					working.globalSpacing,
					mimic
				);
			}
		}

		///////////////////////////////////
		// 4. Draw the call line text
		let gapToText = comment != null ? 2 * working.globalSpacing : working.globalSpacing;
		if (commentOnStartx) {
			let calltextxy = Utilities.drawTextRectangleNoBorderOrBg(
				ctx,
				textToPrint,
				returntmd,
				calltexty,
				startxAfterFlow + gapToText,
				null,
				null,
				mimic,
				wh
			);
			working.manageMaxWidth(calltextxy.x, calltextxy.y);
		} else {
			let calltextxy = Utilities.drawTextRectangleNoBorderOrBg(
				ctx,
				textToPrint,
				returntmd,
				calltexty,
				endxAfterFlow + 2 * arrowSizeY + gapToText,
				null,
				null,
				mimic,
				wh
			);
			working.manageMaxWidth(calltextxy.x, calltextxy.y);
		}

		///////////////////////////////////
		// 5a. Draw the call line
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = lineColour;
		ctx.setLineDash(lineDash);
		ctx.beginPath();
		ctx.moveTo(startxAfterFlow, callliney);
		Utilities.drawOrMovePath(ctx, endxAfterFlow, callliney, mimic);
		ctx.stroke();

		//////////////////////
		// 5a. Draw the call arrow
		ctx.beginPath();
		ctx.moveTo(endxAfterFlow, callliney);
		ctx.setLineDash([]);
		if (this._startx < this._endx) {
			Utilities.drawOrMovePath(ctx, endxAfterFlow - arrowSizeY * 2, callliney, false);
			ctx.moveTo(endxAfterFlow, callliney);
			Utilities.drawOrMovePath(ctx, endxAfterFlow - arrowSizeY * 2, callliney - arrowSizeY, false);
			ctx.moveTo(endxAfterFlow, callliney);
			Utilities.drawOrMovePath(ctx, endxAfterFlow - arrowSizeY * 2, callliney + arrowSizeY, false);
			ctx.stroke();
		} else if (this._startx > this._endx) {
			Utilities.drawOrMovePath(ctx, endxAfterFlow + arrowSizeY * 2, callliney, false);
			ctx.moveTo(endxAfterFlow, callliney);
			Utilities.drawOrMovePath(ctx, endxAfterFlow + arrowSizeY * 2, callliney - arrowSizeY, false);
			ctx.moveTo(endxAfterFlow, callliney);
			Utilities.drawOrMovePath(ctx, endxAfterFlow + arrowSizeY * 2, callliney + arrowSizeY, false);
			ctx.stroke();
		}
		return working.manageMaxWidth(0, starty + finalHeightOfAllLine);
	}

	/**
	 * Create a text metadata object using default values for a return
	 *
	 * @static
	 * @returns
	 * @memberof Call
	 */
	static getDefaultTmd() {
		const defaultCallTmd = {
			fontFamily: "sans-serif",
			fontSizePx: 14,
			fgColour: "rgb(0,0,0)",
			bgColour: "rgba(255,255,255,0)",
			padding: 15,
			spacing: 1,
			align: "left",
			borderColour: "rgba(255,255,255,0)",
			borderWidth: 0,
			borderDash: [6, 3],
		};
		return defaultCallTmd;
	}
};
