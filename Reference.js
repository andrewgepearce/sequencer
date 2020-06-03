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

module.exports = class Reference {
	/**
	 *Creates an instance of ReturnCall.
	 * @param {*} ctx
	 * @param {*} line
	 * @memberof Reference
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
				y: starty
			};
		}

		if (!Utilities.isAllStrings(this._line.reference) && !Utilities.isString(this._line.reference)) {
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
		if (!working.postdata.params.reference) {
			working.postdata.params.reference = {};
		}

		let ctx = this._ctx;

		//////////////////
		// Get the reference TMD
		let referencetmd = TextMetadata.getTextMetadataFromObject(
			working,
			this._line,
			working.postdata.params.reference,
			Reference.getDefaultReferenceTmd()
		);
		let calltmd = TextMetadata.getTextMetadataFromObject(working, this._line, working.postdata.params.call, Reference.getDefaultCallTmd());
		calltmd.bgColour = "rgba(0,0,0,0)";

		///////////////////////
		// Get the line dash
		let lineDash =
			Array.isArray(this._line.lineDash) && Utilities.isAllNumber(this._line.lineDash)
				? this._line.lineDash
				: this._line.return === true
				? [6, 3]
				: working.postdata.params &&
				  working.postdata.params.reference &&
				  Array.isArray(working.postdata.params.reference.lineDash) &&
				  Utilities.isAllNumber(working.postdata.params.reference.lineDash)
				? working.postdata.params.reference.lineDash
				: [];

		///////////////////////
		// Get the line width
		let lineWidth =
			Utilities.isNumber(this._line.lineWidth) && this._line.lineWidth > 0
				? this._line.lineWidth
				: working.postdata.params &&
				  working.postdata.params.reference &&
				  Utilities.isNumber(working.postdata.params.reference.lineWidth) &&
				  working.postdata.params.reference.lineWidth > 0
				? working.postdata.params.reference.lineWidth
				: 1;

		///////////////////////
		// Get the line colour
		let lineColour = Utilities.validColour(this._line.lineColour)
			? this._line.lineColour
			: working.postdata.params && working.postdata.params.reference && Utilities.validColour(working.postdata.params.reference.lineColour)
			? working.postdata.params.reference.lineColour
			: "rgb(0, 0, 0)";

		///////////////////////
		// Get the arrow size
		let arrowSizeY =
			Utilities.isNumber(this._line.arrowSize) && this._line.arrowSize > 0
				? this._line.arrowSize
				: working.postdata.params &&
				  working.postdata.params.reference &&
				  Utilities.isNumber(working.postdata.params.reference.arrowSize) &&
				  working.postdata.params.reference.arrowSize > 0
				? working.postdata.params.reference.arrowSize
				: 5;

		////////////////////////////////
		// Should we break the to or from flows
		const breakFromFlow = this._line.breakFromFlow === true ? true : false;

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
			// let s = textToPrint[0];
			// textToPrint[0] = this._callCount + ". " + s;
		} else if (Utilities.isString(this._line.text)) {
			textToPrint = this._callCount + ". " + this._line.text;
		} else {
			textToPrint = this._callCount + ". ";
		}

		// if (!Utilities.isString(this._line.text))
		//    this._line.text = "";
		// let text = this._callCount + ". " + this._line.text;
		let wh = Utilities.getTextWidthAndHeight(ctx, calltmd, textToPrint, working.tags);
		const textlen = wh.w; //Utilities.getBoxWidth(ctx, textToPrint, calltmd.fontSizePx, calltmd.fontFamily, false, false, calltmd.padding);
		const textheight = wh.h; //Utilities.getBoxHeight(textToPrint, calltmd.fontSizePx, calltmd.spacing, calltmd.padding);

		let reference = null;
		if (!Array.isArray(this._line.reference)) {
			if (Utilities.isString(this._line.reference)) {
				reference = this._line.reference.split("\n");
			} else {
				reference = [];
			}
		} else {
			reference = this._line.reference;
		}
		//const reflen = referencetmd.getBoxWidth(ctx, reference);
		//const refheight = referencetmd.getBoxHeight(reference);
		const extraLines = ["<b>Ref:"];

		////////////////////////////////
		// Get startx and endx for the call
		working.postdata.actors.forEach((actor) => {
			if (actor.alias === this._line.from) {
				this._startx = actor.clinstance.middle;
				this._actorFromClass = actor.clinstance;
			}
		});
		if (!Utilities.isNumberGtEq0(this._startx)) {
			return {
				x: 0,
				y: starty
			};
			//throw new Error('There is no matching actor "alias" for the string indciated in the "from" field');
		}
		this._endx = this._startx + gapToText + textlen + 3 * arrowSizeY;

		/////////////
		// Calculate height of reference line
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
		//const refBoxHeight = Utilities.getBoxHeight(extraLines.concat(reference), referencetmd.fontSizePx, referencetmd.spacing, referencetmd.padding);
		const refwh = Utilities.getTextWidthAndHeight(ctx, referencetmd, extraLines.concat(reference), working.tags);
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
		if (!breakFromFlow) {
			this._actorFromClass.flowStartYPos = topOfRefBox + refBoxHeight / 2 - arrowSizeY;
			this._actorFromClass.flowEndYPos = null;
		} else {
			this._actorFromClass.flowStartYPos = topOfRefBox + refBoxHeight / 2 - arrowSizeY;
			this._actorFromClass.flowEndYPos = callLineY + arrowSizeY;
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
		// Draw the reference box
		let refboxxy = Utilities.drawTextRectangle(
			ctx,
			extraLines.concat(reference),
			referencetmd,
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
	static getDefaultReferenceTmd() {
		const defaultRefTmd = {
			fontFamily: "sans-serif",
			fontSizePx: 14,
			fgColour: "rgb(0,0,0)",
			bgColour: "rgba(80,160,240,1)",
			padding: 15,
			spacing: 1,
			align: "left",
			borderColour: "rgb(0,0,0)",
			borderWidth: 1,
			borderDash: [],
			bold: false
		};
		return defaultRefTmd;
	}
};
