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

module.exports = class Terminate {
	/**
	 * Creates an instance of Terminate.
	 * @param {*} ctx
	 * @param {*} line
	 * @memberof Terminate
	 */
	constructor(ctx, line, working) {
		this._ctx = ctx;
		this._line = line;
		this._startx = null;
		this._endx = null;
		this._actorFromClass = null;
		this._callCount = ++working.callCount;
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
		if (this._line == null || typeof this._line != "object" || typeof this._line.from != "string") {
			return {
				x: 0,
				y: starty + working.globalSpacing
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

		let ctx = this._ctx;

		//////////////////
		// Get the terminate TMD
		let terminatetmd = TextMetadata.getTextMetadataFromObject(
			working,
			this._line,
			working.postdata.params.terminate,
			Terminate.getDefaultTerminateTmd()
		);
		let calltmd = TextMetadata.getTextMetadataFromObject(working, this._line, working.postdata.params.call, Terminate.getDefaultCallTmd());
		calltmd.bgColour = "rgba(0,0,0,0)";

		///////////////////////
		// Get the line dash
		let lineDash =
			Array.isArray(this._line.lineDash) && Utilities.isAllNumber(this._line.lineDash)
				? this._line.lineDash
				: this._line.return === true
				? [6, 3]
				: working.postdata.params &&
				  working.postdata.params.terminate &&
				  Array.isArray(working.postdata.params.terminate.lineDash) &&
				  Utilities.isAllNumber(working.postdata.params.terminate.lineDash)
				? working.postdata.params.terminate.lineDash
				: [];

		///////////////////////
		// Get the line width
		let lineWidth =
			Utilities.isNumber(this._line.lineWidth) && this._line.lineWidth > 0
				? this._line.lineWidth
				: working.postdata.params &&
				  working.postdata.params.terminate &&
				  Utilities.isNumber(working.postdata.params.terminate.lineWidth) &&
				  working.postdata.params.terminate.lineWidth > 0
				? working.postdata.params.terminate.lineWidth
				: 1;

		///////////////////////
		// Get the line colour
		let lineColour = Utilities.validColour(this._line.lineColour)
			? this._line.lineColour
			: working.postdata.params && working.postdata.params.terminate && Utilities.validColour(working.postdata.params.terminate.lineColour)
			? working.postdata.params.terminate.lineColour
			: "rgb(0, 0, 0)";

		///////////////////////
		// Get the arrow size - default zero size for terminate
		let arrowSizeY =
			Utilities.isNumber(this._line.arrowSize) && this._line.arrowSize > 0
				? this._line.arrowSize
				: working.postdata.params &&
				  working.postdata.params.terminate &&
				  Utilities.isNumber(working.postdata.params.terminate.arrowSize) &&
				  working.postdata.params.terminate.arrowSize > 0
				? working.postdata.params.terminate.arrowSize
				: 0;

		////////////////////////////////
		// Should we break the to or from flows
		const breakFromFlow = this._line.breakFromFlow === false ? false : true;

		//////////////////////////
		// Calculate text size
		let gapToText = this._line.comment != null ? 2 * working.globalSpacing : working.globalSpacing;
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

		let wh = Utilities.getTextWidthAndHeight(ctx, calltmd, textToPrint, working.tags);
		const textlen = wh.w;
		const textheight = wh.h;

		let terminatetxt = [];
		if (Utilities.isString(this._line.terminatetxt)) {
			terminatetxt = this._line.terminatetxt.split("\n");
		} else if (Utilities.isAllStrings(this._line.terminatetxt)) {
			terminatetxt = this._line.terminatetxt;
		}
		const extraLines = [""];

		////////////////////////////////
		// Get startx and endx for the call
		working.postdata.actors.forEach((actor) => {
			if (actor.alias === this._line.from) {
				this._startx = actor.clinstance.middle;
				this._actorFromClass = actor.clinstance;
			}
		});
		if (!Utilities.isNumberGtEq0(this._startx)) {
			throw new Error('There is no matching actor "alias" for the string indciated in the "from" field');
		}
		this._endx = this._startx + gapToText + textlen + 3 * arrowSizeY;

		/////////////
		// Calculate height of terminate line
		let startxAfterFlow, endxAfterFlow;
		let commentxy = null;
		let comment = null;
		let topOfRefBox = null;
		let callLineY = null;
		let callTextY = null;
		startxAfterFlow = this._startx + this._actorFromClass.flowWidth / 2;
		endxAfterFlow = this._endx;
		if (this._line.comment != null) {
			comment = new Comment(ctx, this._line.comment);
			commentxy = comment.draw(
				working,
				startxAfterFlow + working.globalSpacing,
				starty + working.globalSpacing,
				textheight,
				working.globalSpacing,
				true
			);
			topOfRefBox = commentxy.y;
		} else {
			topOfRefBox = starty + working.globalSpacing;
		}
		const refwh = Utilities.getTextWidthAndHeight(ctx, terminatetmd, extraLines.concat(terminatetxt), working.tags);
		const refBoxHeight = refwh.h;
		callLineY = topOfRefBox + refBoxHeight / 2;
		callTextY = callLineY - textheight;
		let xy = Actor.drawTimelines(working, ctx, starty, topOfRefBox + refBoxHeight - starty + 1, true);
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
		let virtualArrowSize = arrowSizeY;
		if (virtualArrowSize == 0) virtualArrowSize = 5;
		if (!breakFromFlow) {
			this._actorFromClass.flowStartYPos = topOfRefBox + refBoxHeight / 2 - virtualArrowSize;
			this._actorFromClass.flowEndYPos = null;
		} else {
			this._actorFromClass.flowStartYPos = topOfRefBox + refBoxHeight / 2 - virtualArrowSize;
			this._actorFromClass.flowEndYPos = callLineY + virtualArrowSize;
		}
		xy = Actor.drawTimelines(working, ctx, starty, finalHeightOfAllLine, mimic);

		///////////////////////////////////
		// 3. Comment
		if (comment != null) {
			commentxy = comment.draw(
				working,
				startxAfterFlow + working.globalSpacing,
				starty + working.globalSpacing,
				textheight + refBoxHeight / 2,
				working.globalSpacing,
				mimic
			);
		}

		///////////////////////////////////
		// 4. Draw the call line text
		let calltextxy = Utilities.drawTextRectangleNoBorderOrBg(
			ctx,
			textToPrint,
			calltmd,
			callTextY,
			startxAfterFlow + gapToText,
			null,
			null,
			mimic
		);
		working.manageMaxWidthXy(calltextxy);

		///////////////////////////////////
		// 5a. Draw the call line
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = lineColour;
		ctx.setLineDash(lineDash);
		ctx.beginPath();
		ctx.moveTo(startxAfterFlow, callLineY);
		Utilities.drawOrMovePath(ctx, endxAfterFlow, callLineY, mimic);
		ctx.stroke();

		//////////////////////
		// 5a. Draw the call arrow
		ctx.beginPath();
		ctx.moveTo(endxAfterFlow, callLineY);
		if (this._line.async != true) {
			Utilities.drawOrMovePath(ctx, endxAfterFlow - arrowSizeY * 2, callLineY - arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow - arrowSizeY * 2, callLineY + arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow, callLineY, false);
			ctx.fillStyle = lineColour;
			ctx.fill();
		} else {
			Utilities.drawOrMovePath(ctx, endxAfterFlow - arrowSizeY * 2, callLineY - arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow, callLineY, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow - arrowSizeY * 2, callLineY + arrowSizeY, false);
			ctx.strokeStyle = lineColour;
			ctx.stroke();
		}

		//////////////////////
		// Draw the terminate box
		if (terminatetxt.length == 0) {
			let diameter = Terminate.getDefaultTerminateTmd().fontSizePx;
			ctx.beginPath();
			ctx.arc(endxAfterFlow + diameter / 2, callLineY, diameter / 2, 0, 2 * Math.PI);
			ctx.fill();
			working.manageMaxWidth(endxAfterFlow + diameter, callLineY + diameter / 2);
		} else {
			let refboxxy = Utilities.drawTextRectangle(
				ctx,
				extraLines.concat(terminatetxt),
				terminatetmd,
				topOfRefBox,
				endxAfterFlow,
				null,
				null,
				0,
				true,
				true,
				true,
				true,
				false,
				refwh,
				working.tags
			);
			working.manageMaxWidthXy(refboxxy);
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
	static getDefaultCallTmd() {
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
			borderDash: []
		};
		return defaultCallTmd;
	}

	/**
	 * Create a text metadata object using default values for a return
	 *
	 * @static
	 * @returns
	 * @memberof Call
	 */
	static getDefaultTerminateTmd() {
		const defaultTermTmd = {
			fontFamily: "sans-serif",
			fontSizePx: 14,
			fgColour: "rgb(255,255,255)",
			bgColour: "rgb(0,0,0)",
			padding: 10,
			spacing: 1,
			align: "left",
			borderColour: "rgb(0,0,0)",
			borderWidth: 1,
			borderDash: [],
			bold: false
		};
		return defaultTermTmd;
	}
};
