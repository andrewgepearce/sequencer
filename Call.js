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
const schema = require("./schema.js");

module.exports = class Call {
	/**
	 *Creates an instance of Call.
	 * @param {*} ctx
	 * @param {*} line
	 * @memberof Call
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
	 * @param {*} params
	 * @param {*} starty
	 * @param {*} mimic
	 * @returns
	 * @memberof Call
	 */
	draw(working, starty, mimic) {
		////////////////////////////////
		// Draw blank line (without timelines) if there is no line object
		if (this._line == null || typeof this._line != "object") {
			return {
				x: 0,
				y: starty
			};
		}

		if (!working.postdata) {
			working.postdata = {};
		}
		if (!working.postdata.params) {
			working.postdata.params = {};
		}
		if (!working.postdata.params.call) {
			working.postdata.params.call = {};
		}
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
		if (typeof this._startx != "number" || typeof this._endx != "number") {
			return {
				x: 0,
				y: starty
			};
		}
		if (this._endx != this._startx) {
			return this.drawDifferentActor(working, starty, mimic);
		} else if (this._endx == this._startx) {
			return this.drawSameActor(working, starty, mimic);
		}
	}

	/**
	 *
	 *
	 * @param {*} params
	 * @param {*} starty
	 * @param {*} mimic
	 * @returns
	 * @memberof Call
	 */
	drawSameActor(working, starty, mimic) {
		//////////////////
		// Get the call TMD
		let calltmd = TextMetadata.getTextMetadataFromObject(working, this._line, working.postdata.params.call, Call.getSelfCallDefaultTmd());
		calltmd.bgColour = "rgba(0,0,0,0)";

		///////////////////////
		// Get the line dash
		let lineDash = Array.isArray(this._line.lineDash) && Utilities.isAllNumber(this._line.lineDash) ? this._line.lineDash : [];

		///////////////////////
		// Get the line width
		let lineWidth = Utilities.isNumberGt0(this._line.lineWidth)
			? this._line.lineWidth
			: working.postdata.params && working.postdata.params.call && Utilities.isNumberGt0(working.postdata.params.call.lineWidth)
			? working.postdata.params.call.lineWidth
			: 1;

		///////////////////////
		// Get the line colour
		let lineColour = Utilities.validColour(this._line.lineColour)
			? this._line.lineColour
			: working.postdata.params && working.postdata.params.call && Utilities.validColour(working.postdata.params.call.lineColour)
			? working.postdata.params.call.lineColour
			: "rgb(0, 0, 0)";

		///////////////////////
		// Get the arrow size
		let arrowSizeY = Utilities.isNumberGt0(this._line.arrowSize)
			? this._line.arrowSize
			: working.postdata.params && working.postdata.params.call && Utilities.isNumberGt0(working.postdata.params.call.arrowSize)
			? working.postdata.params.call.arrowSize
			: 5;

		///////////////////////
		// Get the radius
		let radius = Utilities.isNumberGtEq0(this._line.radius)
			? this._line.radius
			: working.postdata.params && working.postdata.params.call && Utilities.isNumberGtEq0(working.postdata.params.call.radius)
			? working.postdata.params.call.radius
			: 5;

		/////////////
		// Calculate height of fragment condition line
		let startxAfterFlow;
		const ctx = this._ctx;
		let commentxy = null;
		let comment = null;
		let callliney = null;
		startxAfterFlow = this._startx + this._actorFromClass.flowWidth / 2;
		if (this._line.comment != null) {
			comment = new Comment(ctx, this._line.comment);
			commentxy = comment.draw(
				working,
				startxAfterFlow + working.globalSpacing,
				starty + working.globalSpacing,
				working.globalSpacing,
				working.globalSpacing,
				true
			);
			callliney = commentxy.y;
		} else {
			callliney = starty + working.globalSpacing;
		}

		//let xy = Actor.drawTimelines(ctx, starty, (callliney + (2 * lineWidth) + working.globalSpacing + arrowSizeY - starty) + working.globalSpacing, true);
		let xy = Actor.drawTimelines(working, ctx, starty, callliney + 2 * lineWidth + working.globalSpacing + arrowSizeY - starty, true);
		let finalHeightOfAllLine = xy.y - starty;

		///////////////////////////////////
		// Height now calculated .. not draw the items in order
		// 1. Background fragments
		// 2. Time lines
		// 3. Comment
		// 4. Call line
		// 4a. Call line arrow
		// 5a. Call text

		///////////////////////////////////
		// 1. Background fragments
		Utilities.drawActiveFragments(working, this._ctx, starty, finalHeightOfAllLine, mimic);

		///////////////////////////////////
		// 2. Time lines
		this._actorFromClass.flowStartYPos = callliney;
		if (this._line.breakFromFlow === true || this._line.breakFlow === true || this._line.breakToFlow === true) {
			this._actorFromClass.flowEndYPos = callliney + working.globalSpacing + arrowSizeY;
		}
		if (this._line.async != true) {
			xy = Actor.drawTimelines(working, ctx, starty, finalHeightOfAllLine, mimic);
		} else {
			let gapForBreak = working.globalSpacing / 2 > 0 ? working.globalSpacing / 2 : 0;
			let breakAtYPos = callliney + working.globalSpacing / 2;
			let breakAtYPosForActor = this._actorFromClass.alias;
			xy = Actor.drawTimelinesWithBreak(working, ctx, starty, finalHeightOfAllLine, breakAtYPos, breakAtYPosForActor, gapForBreak, mimic);
		}

		///////////////////////////////////
		// 3. Comment
		if (comment != null) {
			commentxy = comment.draw(
				working,
				startxAfterFlow + working.globalSpacing,
				starty + working.globalSpacing,
				working.globalSpacing,
				working.globalSpacing,
				mimic
			);
		}

		///////////////////////////////////
		// 4. Draw the line
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = lineColour;
		ctx.setLineDash(lineDash);
		ctx.beginPath();
		ctx.moveTo(startxAfterFlow, callliney);
		Utilities.drawOrMovePath(ctx, startxAfterFlow + 2 * working.globalSpacing - radius, callliney, mimic);
		Utilities.drawOrMoveArcTo(
			ctx,
			startxAfterFlow + 2 * working.globalSpacing,
			callliney, // x1, y1
			startxAfterFlow + 2 * working.globalSpacing,
			callliney + radius, //x2, y2
			radius, // radius
			mimic
		);
		Utilities.drawOrMovePath(ctx, startxAfterFlow + 2 * working.globalSpacing, callliney + working.globalSpacing - radius, mimic);
		Utilities.drawOrMoveArcTo(
			ctx,
			startxAfterFlow + 2 * working.globalSpacing,
			callliney + working.globalSpacing, // x1, y1
			startxAfterFlow + 2 * working.globalSpacing - radius,
			callliney + working.globalSpacing, //x2, y2
			radius,
			mimic
		);
		Utilities.drawOrMovePath(ctx, startxAfterFlow, callliney + working.globalSpacing, mimic);
		ctx.stroke();

		///////////////////////////////////
		// 4. Draw the line arrow
		ctx.beginPath();
		ctx.moveTo(startxAfterFlow, callliney + working.globalSpacing);
		if (this._line.async === true) {
			Utilities.drawOrMovePath(ctx, startxAfterFlow + arrowSizeY * 2, callliney + working.globalSpacing - arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, startxAfterFlow, callliney + working.globalSpacing, false);
			Utilities.drawOrMovePath(ctx, startxAfterFlow + arrowSizeY * 2, callliney + working.globalSpacing + arrowSizeY, false);
			ctx.strokeStyle = lineColour;
			ctx.stroke();
		} else {
			Utilities.drawOrMovePath(ctx, startxAfterFlow + arrowSizeY * 2, callliney + working.globalSpacing - arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, startxAfterFlow + arrowSizeY * 2, callliney + working.globalSpacing + arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, startxAfterFlow, callliney + working.globalSpacing, false);
			ctx.fillStyle = lineColour;
			ctx.fill();
		}

		///////////////////////////////////
		// 5. Draw the call line text
		let textToPrint = null;
		if (Utilities.isAllStrings(this._line.text)) {
			textToPrint = this._line.text.slice();
			let s = textToPrint[0];
			textToPrint[0] = this._callCount + ". " + s;
		} else if (Utilities.isString(this._line.text)) {
			textToPrint = this._callCount + ". " + this._line.text;
		} else {
			textToPrint = this._callCount + ". ";
		}
		let calltextxy = Utilities.drawTextRectangleNoBorderOrBg(
			ctx,
			textToPrint,
			calltmd,
			callliney,
			startxAfterFlow + 2 * working.globalSpacing,
			null,
			null,
			mimic
		);
		// let calltextxy = Utilities.drawTextRectangle(ctx, textToPrint,
		//    calltmd, callliney, startxAfterFlow + (2 * working.globalSpacing), null, null, 0, false, false, false, false, mimic);
		working.manageMaxWidth(calltextxy.x, calltextxy.y);
		return working.manageMaxWidth(0, starty + finalHeightOfAllLine);
	}

	/**
	 *
	 *
	 * @param {*} params
	 * @param {*} starty
	 * @param {*} mimic
	 * @returns
	 * @memberof Call
	 */
	drawDifferentActor(working, starty, mimic) {
		//////////////////
		// Get the call TMD
		let calltmd = TextMetadata.getTextMetadataFromObject(working, this._line, working.postdata.params.call, Call.getDefaultTmd());
		calltmd.bgColour = "rgba(0,0,0,0)";

		///////////////////////
		// Get the line dash
		let lineDash = [];

		///////////////////////
		// Get the line width
		let lineWidth =
			Utilities.isNumber(this._line.lineWidth) && this._line.lineWidth > 0
				? this._line.lineWidth
				: working.postdata.params &&
				  working.postdata.params.call &&
				  Utilities.isNumber(working.postdata.params.call.lineWidth) &&
				  working.postdata.params.call.lineWidth > 0
				? working.postdata.params.call.lineWidth
				: 1;

		///////////////////////
		// Get the line colour
		let lineColour = Utilities.validColour(this._line.lineColour)
			? this._line.lineColour
			: working.postdata.params && working.postdata.params.call && Utilities.validColour(working.postdata.params.call.lineColour)
			? working.postdata.params.call.lineColour
			: "rgb(0, 0, 0)";

		///////////////////////
		// Get the arrow size
		let arrowSizeY =
			Utilities.isNumber(this._line.arrowSize) && this._line.arrowSize > 0
				? this._line.arrowSize
				: working.postdata.params &&
				  working.postdata.params.call &&
				  Utilities.isNumber(working.postdata.params.call.arrowSize) &&
				  working.postdata.params.call.arrowSize > 0
				? working.postdata.params.call.arrowSize
				: 5;

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
		let wh = Utilities.getTextWidthAndHeight(ctx, calltmd, textToPrint, working.tags);
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

		let xy = Actor.drawTimelines(working, ctx, starty, callliney + arrowSizeY - starty + working.globalSpacing / 3, true);
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
		this._actorFromClass.flowStartYPos = callliney;
		this._actorToClass.flowStartYPos = callliney;
		if (this._line.breakFromFlow === true) {
			this._actorFromClass.flowEndYPos = callliney + working.globalSpacing / 3;
		}
		if (this._line.breakToFlow === true) {
			this._actorToClass.flowEndYPos = callliney + working.globalSpacing / 3;
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
				calltmd,
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
				calltmd,
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
		if (this._startx < this._endx && this._line.async != true) {
			Utilities.drawOrMovePath(ctx, endxAfterFlow - arrowSizeY * 2, callliney - arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow - arrowSizeY * 2, callliney + arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow, callliney, false);
			ctx.fillStyle = lineColour;
			ctx.fill();
		} else if (this._startx > this._endx && this._line.async != true) {
			Utilities.drawOrMovePath(ctx, endxAfterFlow + arrowSizeY * 2, callliney - arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow + arrowSizeY * 2, callliney + arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow, callliney, false);
			ctx.fillStyle = lineColour;
			ctx.fill();
		} else if (this._startx < this._endx && this._line.async === true) {
			Utilities.drawOrMovePath(ctx, endxAfterFlow - arrowSizeY * 2, callliney - arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow, callliney, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow - arrowSizeY * 2, callliney + arrowSizeY, false);
			ctx.strokeStyle = lineColour;
			ctx.stroke();
		} else if (this._startx > this._endx && this._line.async === true) {
			Utilities.drawOrMovePath(ctx, endxAfterFlow + arrowSizeY * 2, callliney - arrowSizeY, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow, callliney, false);
			Utilities.drawOrMovePath(ctx, endxAfterFlow + arrowSizeY * 2, callliney + arrowSizeY, false);
			ctx.strokeStyle = lineColour;
			ctx.stroke();
		}
		return working.manageMaxWidth(0, starty + finalHeightOfAllLine);
	}

	/**
	 * Create a text metadata object using default values for a call
	 *
	 * @static
	 * @returns
	 * @memberof Call
	 */
	static getDefaultTmd() {
		const defaultCallTmd = {
			fontFamily: schema.call.properties.fontFamily.default,
			fontSizePx: schema.call.properties.fontSizePx.default,
			fgColour: schema.call.properties.fgColour.default,
			bgColour: "rgba(0,0,0,0)",
			padding: schema.call.properties.padding.default,
			spacing: schema.call.properties.spacing.default,
			align: schema.call.properties.align.default,
			borderColour: schema.call.properties.borderColour.default,
			borderWidth: schema.call.properties.borderWidth.default,
			borderDash: schema.call.properties.borderDash.default
		};
		return defaultCallTmd;
	}

	/**
	 * Create a text metadata object using default values for a call
	 *
	 * @static
	 * @returns
	 * @memberof Call
	 */
	static getSelfCallDefaultTmd() {
		const defaultCallTmd = {
			fontFamily: schema.call.properties.fontFamily.default,
			fontSizePx: schema.call.properties.fontSizePx.default,
			fgColour: schema.call.properties.fgColour.default,
			bgColour: "rgba(0,0,0,0)",
			padding: schema.call.properties.padding.default,
			spacing: schema.call.properties.spacing.default,
			align: schema.call.properties.align.default,
			borderColour: schema.call.properties.borderColour.default,
			borderWidth: schema.call.properties.borderWidth.default,
			borderDash: schema.call.properties.borderDash.default,
			vpadding: 0
		};
		return defaultCallTmd;
	}
};
