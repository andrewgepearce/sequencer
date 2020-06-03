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
let Call = require("./Call.js");
let ReturnCall = require("./ReturnCall.js");
let State = require("./State.js");
let TextMetadata = require("./TextMetadata.js");
let Comment = require("./Comment.js");
let FragmentCondition = require("./FragmentCondition.js");
let Reference = require("./Reference.js");
let Terminate = require("./Terminate.js");
let Blank = require("./Blank.js");

module.exports = class Fragment {
	constructor(ctx, line) {
		this._ctx = ctx;
		this._line = line;
		this._titleTmd = null;
		this._conditionTmd = null;
		this._fragmentStartX = null;
		this._fragmentEndX = null;
		this._colour = null;
		this._borderDash = null;
		this._borderWidth = null;
		this._borderColour = null;
	}

	get colour() {
		return this._colour;
	}
	get borderDash() {
		return this._borderDash;
	}
	get borderWidth() {
		return this._borderWidth;
	}
	get borderColour() {
		return this._borderColour;
	}
	get fragmentStartX() {
		return this._fragmentStartX;
	}
	get fragmentEndX() {
		return this._fragmentEndX;
	}

	/**
	 *
	 *
	 * @param {*} params
	 * @param {*} starty
	 * @param {*} part
	 * @param {*} mimic
	 * @returns
	 * @memberof Fragment
	 */
	draw(working, starty, mimic) {
		let currentActiveAboveThisFragment = 0;
		if (Array.isArray(working.activeFragments)) {
			currentActiveAboveThisFragment = working.activeFragments.length;
		} else {
			working.activeFragments = [];
		}
		if (!working.postdata) {
			working.postdata = [];
		}
		if (!working.postdata.params) {
			working.postdata.params = [];
		}
		if (!working.postdata.params.fragment) {
			working.postdata.params.fragment = [];
		}

		///////////////////////
		// Get the fragment colour
		this._colour = Utilities.validColour(this._line.bgColour)
			? this._line.bgColour
			: working.postdata.params &&
			  working.postdata.params.fragment &&
			  Array.isArray(working.postdata.params.fragment.bgColours) &&
			  Utilities.validColour(working.postdata.params.fragment.bgColours[currentActiveAboveThisFragment])
			? working.postdata.params.fragment.bgColours[currentActiveAboveThisFragment]
			: "rgb(255, 255, 255)";

		///////////////////////
		// Get the title bar colour
		let titleBgColour =
			Utilities.isObject(this._line.title) && this._line.title.bgColour && Utilities.validColour(this._line.title.bgColour)
				? this._line.title.bgColour
				: working.postdata.params &&
				  working.postdata.params.fragment &&
				  working.postdata.params.fragment.title &&
				  working.postdata.params.fragment.title.bgColour &&
				  Utilities.validColour(working.postdata.params.fragment.title.bgColour)
				? working.postdata.params.fragment.title.bgColour
				: "rgba(200,200,0,0.8)";

		///////////////////////
		// Get the title bar  fg colour
		let titleFgColour =
			Utilities.isObject(this._line.title) && this._line.title.fgColour && Utilities.validColour(this._line.title.fgColour)
				? this._line.title.fgColour
				: working.postdata.params &&
				  working.postdata.params.fragment &&
				  working.postdata.params.fragment.title &&
				  working.postdata.params.fragment.title.fgColour &&
				  Utilities.validColour(working.postdata.params.fragment.title.fgColour)
				? working.postdata.params.fragment.title.fgColour
				: "rgb(0,0,0)";

		///////////////////////
		// Get the border colour
		this._borderColour = Utilities.validColour(this._line.borderColour)
			? this._line.borderColour
			: working.postdata.params && working.postdata.params.fragment && Utilities.validColour(working.postdata.params.fragment.borderColour)
			? working.postdata.params.fragment.borderColour
			: "rgb(0, 0, 0)";

		///////////////////////
		// Get the border dash
		this._borderDash =
			Array.isArray(this._line.borderDash) && Utilities.isAllNumber(this._line.borderDash)
				? this._line.borderDash
				: working.postdata.params &&
				  working.postdata.params.fragment &&
				  Array.isArray(working.postdata.params.fragment.borderDash) &&
				  Utilities.isAllNumber(working.postdata.params.fragment.borderDash)
				? working.postdata.params.fragment.borderDash
				: [];

		///////////////////////
		// Get the border width
		this._borderWidth =
			Utilities.isNumber(this._line.borderWidth) && this._line.borderWidth >= 0
				? this._line.borderWidth
				: working.postdata.params &&
				  working.postdata.params.fragment &&
				  Utilities.isNumber(working.postdata.params.fragment.borderWidth) &&
				  working.postdata.params.fragment.borderWidth >= 0
				? working.postdata.params.fragment.borderWidth
				: 1;

		/////////////////////
		// Get fragment type
		let type = Utilities.isString(this._line.fragmentType) ? this._line.fragmentType : "";

		/////////////////////
		// Get fragment title
		let title = Utilities.isString(this._line.title)
			? this._line.title
			: this._line.title == "object" && Utilities.isString(this._line.title.text)
			? this._line.title.text
			: "";

		/////////////////////
		// Get fragment condition
		let condition = Utilities.isString(this._line.condition)
			? this._line.condition
			: this._line.condition == "object" && Utilities.isString(this._line.condition.text)
			? this._line.condition.text
			: "";

		///////////////////////////////
		// Create text metadata objects
		const titleTmd = Utilities.isObject(this._line.title)
			? TextMetadata.getTextMetadataFromObject(
					working,
					this._line.title,
					working.postdata.params.fragment.title,
					Fragment.getDefaultTitleTmd()
			  )
			: TextMetadata.getTextMetadataFromObject(working, this._line, working.postdata.params.fragment.title, Fragment.getDefaultTitleTmd());
		titleTmd.fgColour = titleFgColour;
		titleTmd.bgColour = "rgba(0,0,0,0)";
		const conditionTmd = Utilities.isObject(this._line.condition)
			? TextMetadata.getTextMetadataFromObject(
					working,
					this._line.condition,
					working.postdata.params.fragment.condition,
					Fragment.getDefaultConditionTmd()
			  )
			: TextMetadata.getTextMetadataFromObject(
					working,
					this._line,
					working.postdata.params.fragment.condition,
					Fragment.getDefaultConditionTmd()
			  );
		conditionTmd.bgColour = "rgba(255,255,255,0)";

		/////////////
		// Calculate height of fragment start line
		let ctx = this._ctx;
		let fragmentStartX = working.windowPadding + currentActiveAboveThisFragment * working.fragmentSpacing;
		let fragmentEndX = working.canvasWidth - working.windowPadding - currentActiveAboveThisFragment * working.fragmentSpacing;
		this._fragmentStartX = fragmentStartX;
		this._fragmentEndX = fragmentEndX;
		let fragmentTop = null;
		let commentxy = null;
		let comment = null;
		let gapRight = 1.5 * working.globalSpacing;
		if (this._line.comment != null) {
			comment = new Comment(ctx, this._line.comment);
			commentxy = comment.draw(
				working,
				fragmentStartX + working.globalSpacing,
				starty + working.globalSpacing,
				working.globalSpacing,
				gapRight,
				true
			);
		}
		fragmentTop = Utilities.isObject(commentxy) && Utilities.isNumber(commentxy.y) ? commentxy.y : starty + working.globalSpacing;
		let textxy = Utilities.drawTextRectangleNoBorderOrBg(
			this._ctx,
			type + " " + title,
			titleTmd,
			fragmentTop,
			fragmentStartX,
			null,
			null,
			true
		);
		let conditionxy = Utilities.drawTextRectangleNoBorderOrBg(
			this._ctx,
			condition,
			conditionTmd,
			textxy.y,
			fragmentStartX,
			null,
			null,
			true
		);
		let xy = Actor.drawTimelines(working, this._ctx, starty, conditionxy.y - starty, false);
		let finalHeightOfAllLine = xy.y - starty;
		let finalHeightAboveFragmentInLine = fragmentTop - starty;
		let finalHeightOfFragmentRectangle = finalHeightOfAllLine - finalHeightAboveFragmentInLine;
		let blankWidth = conditionxy.x > textxy.x ? conditionxy.x : textxy.x;

		///////////////////////////////////
		// Height now calculated .. now draw the items in order
		// 1. Backgorund fragments
		// 2. Current Fragment rectangle
		// 3. Time lines
		// 4. Type and Title rectangle
		// 5. Type and title text
		// 6. Condition text
		// 7. Comment

		///////////////////////////////////
		// 1. Background fragments
		Utilities.drawActiveFragments(working, this._ctx, starty, finalHeightOfAllLine, mimic);

		///////////////////////////////////
		// 2. Current Fragment rectangle
		xy = Utilities.drawRectangle(
			this._ctx,
			this._borderWidth,
			this._borderColour,
			this._borderDash,
			this._colour,
			fragmentTop, // top
			fragmentStartX, // left
			fragmentEndX - fragmentStartX > 0 ? fragmentEndX - fragmentStartX : working.globalSpacing, // width
			finalHeightOfFragmentRectangle, //height
			0,
			true,
			true,
			false,
			true,
			false
		);

		///////////////////////////////////
		// 3. Time lines
		xy = Actor.drawTimelines(working, ctx, starty, finalHeightOfAllLine, mimic);

		///////////////////////////////////
		// 4. Type and Title rectangle
		let offset = (textxy.y - fragmentTop) / 2;
		if (offset > 10) offset = 10;
		if (offset < 0) offset = 0;
		ctx.beginPath();
		ctx.moveTo(fragmentStartX, fragmentTop);
		ctx.lineTo(fragmentStartX, textxy.y);
		ctx.lineTo(textxy.x, textxy.y);
		ctx.lineTo(textxy.x + offset, textxy.y - offset);
		ctx.lineTo(textxy.x + offset, fragmentTop);
		ctx.lineTo(fragmentStartX, fragmentTop);
		ctx.fillStyle = titleBgColour;
		ctx.fill();
		ctx.setLineDash(this._borderDash);
		ctx.lineWidth = this._borderWidth;
		ctx.strokeStyle = this._borderColour;
		ctx.stroke();

		///////////////////////////////////
		// 5. Type and title text
		textxy = Utilities.drawTextRectangleNoBorderOrBg(
			this._ctx,
			type + " " + title,
			titleTmd,
			fragmentTop,
			fragmentStartX,
			null,
			null,
			mimic
		);

		///////////////////////////////////
		// 6. Condition text
		conditionxy = Utilities.drawTextRectangleNoBorderOrBg(this._ctx, condition, conditionTmd, textxy.y, fragmentStartX, null, null, mimic);

		///////////////////////////////////
		// 7. Comment
		if (comment != null) {
			commentxy = comment.draw(
				working,
				fragmentStartX + working.globalSpacing,
				starty + working.globalSpacing,
				working.globalSpacing,
				gapRight,
				mimic
			);
		}

		///////////////
		// Make this an active fragment
		working.activeFragments.push(this);

		//////////////////////////////////
		// Draw the lines of the fragment
		xy = Fragment.drawLines(working, ctx, xy.y, this._line.lines);

		// Draw a final blank line to make sure we have width
		let blank = new Blank(ctx, {type: "blank", width: blankWidth, height: 0});
		xy = blank.draw(working, xy.y, false);

		///////////////
		// Remove this active fragment
		working.activeFragments.pop();

		let endLineTop = xy.y;
		ctx.lineWidth = 1;
		ctx.setLineDash([2, 2]);
		ctx.strokeStyle = "rgb(0,0,0)";
		ctx.beginPath();
		ctx.moveTo(0, endLineTop);
		ctx.lineTo(working.canvasWidth, endLineTop);

		/////////////
		// DEBUG End Line
		if (working.debug) {
			ctx.stroke();
			let dbgtext = new TextMetadata("monospace", 8, 5, 1, "rgb(0,0,0)", "rgba(0,0,0,1)", "left");
			Utilities.drawTextRectangleNoBorderOrBg(ctx, "" + endLineTop, dbgtext, endLineTop + 5, 10, null, null, false);
			//dbgtext.writeLines(ctx, "" + endLineTop, 10, endLineTop + 5, null, null);
		}

		///////////////
		// Calculate the end line dimensions
		const heightOfEndRectangle = working.globalSpacing;
		const heightOfEndLine = heightOfEndRectangle + working.globalSpacing;
		const xyend = Actor.drawTimelines(working, ctx, endLineTop, heightOfEndLine, true);
		const finalHeightOfEndLine = xyend.y - endLineTop;
		const finalHeightOfEndRectangle = finalHeightOfEndLine - working.globalSpacing;

		///////////////////
		// Draw any active fragments
		Utilities.drawActiveFragments(working, this._ctx, endLineTop, finalHeightOfEndLine, mimic);

		//////////////////////////////////
		// Draw this end part of the fragment
		xy = Utilities.drawRectangle(
			this._ctx,
			this._borderWidth,
			this._borderColour,
			this._borderDash,
			this._colour,
			endLineTop,
			this._fragmentStartX,
			fragmentEndX - fragmentStartX > 0 ? fragmentEndX - fragmentStartX : working.globalSpacing, // width
			finalHeightOfEndRectangle,
			0,
			false,
			true,
			true,
			true,
			false
		);

		//////////////////
		// Draw the timelines for this fragment
		xy = Actor.drawTimelines(working, ctx, endLineTop, finalHeightOfEndLine, mimic);

		/////////////////
		// Do not manage max width HERE!!
		// max width should only consider no fragment drawings
		working.manageMaxWidth(0, xy.y);
		return xy;
	}

	/**
	 * Calculate the max depth of fragments in the provided line set
	 *
	 * @static
	 * @param {*} lines
	 * @param {*} reset Start the count from 0
	 * @returns The max depth of fragments in the line array
	 * @memberof Fragment
	 */
	calculateFragmentDepth(working, lines, reset) {
		if (typeof working.scratchPad.maxFragmentDepth != "number") {
			working.scratchPad.maxFragmentDepth = 0;
		}
		if (typeof working.scratchPad.curFragmentDepth != "number") {
			working.scratchPad.curFragmentDepth = 0;
		}
		if (!Array.isArray(lines)) {
			return working.scratchPad.maxFragmentDepth;
		}
		if (reset) {
			working.scratchPad.maxFragmentDepth = 0;
			working.scratchPad.curFragmentDepth = 0;
		}
		lines.forEach((line) => {
			if (line.type == "fragment") {
				working.scratchPad.curFragmentDepth++;
				if (working.scratchPad.curFragmentDepth > working.scratchPad.maxFragmentDepth) {
					working.scratchPad.maxFragmentDepth = working.scratchPad.curFragmentDepth;
				}
				this.calculateFragmentDepth(working, line.lines, false);
				working.scratchPad.curFragmentDepth--;
			}
		});
		return working.scratchPad.maxFragmentDepth;
	}

	/**
	 * Create a text metadata object using default values for a call
	 *
	 * @static
	 * @returns
	 * @memberof Call
	 */
	static getDefaultTitleTmd() {
		const defaultFragTitleTmd = {
			fontFamily: "sans-serif",
			fontSizePx: 14,
			fgColour: "rgb(0,0,0)",
			bgColour: "rgba(255,255,255,0)",
			padding: 10,
			spacing: 1,
			align: "left",
			borderColour: "rgba(255,255,255,0)",
			borderWidth: 0,
			borderDash: []
		};
		return defaultFragTitleTmd;
	}

	/**
	 *
	 *
	 * @static
	 * @returns
	 * @memberof Fragment
	 */
	static getDefaultConditionTmd() {
		const defaultFragConditionTmd = {
			fontFamily: "sans-serif",
			fontSizePx: 12,
			fgColour: "rgb(0,0,0)",
			bgColour: "rgba(200,200,0,0)",
			padding: 10,
			spacing: 1,
			align: "left",
			borderColour: "rgba(255,255,255,0)",
			borderWidth: 0,
			borderDash: []
		};
		return defaultFragConditionTmd;
	}

	/**
	 *
	 *
	 * @static
	 * @param {*} ctx
	 * @param {*} starty
	 * @param {*} lines
	 * @memberof Fragment
	 */
	static drawLines(working, ctx, starty, lines) {
		let xy = {
			x: 0,
			y: starty
		};
		if (!Array.isArray(lines) || lines.length == 0) {
			return xy;
		}

		lines.forEach((line) => {
			let linetop = xy.y;
			if (line.type == undefined) {
				working.logWarn("Processing undefined line type at y:" + xy.y + " - " + Utilities.objToString(line));
				let errorState = {
					type: "state",
					text: "<b>ERROR IN LINE - NO TYPE IDENTIFIER:</b> " + JSON.stringify(line),
					borderWidth: 3,
					borderColour: "rgb(255,0,0)"
				};
				let statecl = new State(ctx, errorState);
				xy = statecl.draw(working, xy.y, false);
			} else if (line.type.toLowerCase() == "blank" && Utilities.isNumberGtEq0(line.height)) {
				working.logDebug("Processing Blank line at y:" + xy.y + " - " + Utilities.objToString(line));
				let blank = new Blank(ctx, line);
				xy = blank.draw(working, xy.y, false);
			} else if (line.type.toLowerCase() == "fragment") {
				working.logDebug("Processing Fragment line at y:" + xy.y + " - " + Utilities.objToString(line));
				let frag = new Fragment(ctx, line);
				xy = frag.draw(working, xy.y, false);
			} else if (line.type.toLowerCase() == "state") {
				working.logDebug("Processing State line at y:" + xy.y + " - " + Utilities.objToString(line));
				let statecl = new State(ctx, line);
				xy = statecl.draw(working, xy.y, false);
			} else if (line.type.toLowerCase() == "condition") {
				working.logDebug("Processing Condition line at y:" + xy.y + " - " + Utilities.objToString(line));
				let fragmentCondition = new FragmentCondition(ctx, line);
				xy = fragmentCondition.draw(working, xy.y, false);
			} else if (line.type.toLowerCase() == "call") {
				working.logDebug("Processing Call line at y:" + xy.y + " - " + Utilities.objToString(line));
				let origXY = xy;
				let call = new Call(ctx, line, working);
				xy = call.draw(working, xy.y, false);
				if (xy.y == origXY.y) {
					// Nothing drawn
					let errorState = {
						type: "state",
						text: "<b>ERROR IN LINE:</b> " + JSON.stringify(line),
						borderWidth: 3,
						borderColour: "rgb(255,0,0)"
					};
					let statecl = new State(ctx, errorState);
					xy = statecl.draw(working, origXY.y, false);
				}
			} else if (line.type.toLowerCase() == "return") {
				working.logDebug("Processing Return line at y:" + xy.y + " - " + Utilities.objToString(line));
				let origXY = xy;
				let rcall = new ReturnCall(ctx, line, working);
				xy = rcall.draw(working, xy.y, false);
				if (xy.y == origXY.y) {
					// Nothing drawn
					let errorState = {
						type: "state",
						text: "<b>ERROR IN LINE:</b> " + JSON.stringify(line),
						borderWidth: 3,
						borderColour: "rgb(255,0,0)"
					};
					let statecl = new State(ctx, errorState);
					xy = statecl.draw(working, origXY.y, false);
				}
			} else if (line.type.toLowerCase() == "reference") {
				working.logDebug("Processing Reference line at y:" + xy.y + " - " + Utilities.objToString(line));
				let origXY = xy;
				let ref = new Reference(ctx, line, working);
				xy = ref.draw(working, xy.y, false);
				if (xy.y == origXY.y) {
					// Nothing drawn
					let errorState = {
						type: "state",
						text: "<b>ERROR IN LINE:</b> " + JSON.stringify(line),
						borderWidth: 3,
						borderColour: "rgb(255,0,0)"
					};
					let statecl = new State(ctx, errorState);
					xy = statecl.draw(working, origXY.y, false);
				}
			} else if (line.type.toLowerCase() == "terminate") {
				working.logDebug("Processing Terminate line at y:" + xy.y + " - " + Utilities.objToString(line));
				let origXY = xy;
				let term = new Terminate(ctx, line, working);
				xy = term.draw(working, xy.y, false);
				if (xy.y == origXY.y) {
					// Nothing drawn
					let errorState = {
						type: "state",
						text: "<b>ERROR IN LINE:</b> " + JSON.stringify(line),
						borderWidth: 3,
						borderColour: "rgb(255,0,0)"
					};
					let statecl = new State(ctx, errorState);
					xy = statecl.draw(working, origXY.y, false);
				}
			} else {
				working.logWarn("Processing unrecognised line type at y:" + xy.y + " - " + Utilities.objToString(line));
				let errorState = {
					type: "state",
					text: "<b>ERROR IN LINE - NO RECOGNISED TYPE IDENTIFIER:</b> " + Utilities.objToString(line),
					borderWidth: 3,
					borderColour: "rgb(255,0,0)"
				};
				let statecl = new State(ctx, errorState);
				xy = statecl.draw(working, xy.y, false);
			}

			if (working.debug) {
				ctx.lineWidth = 1;
				ctx.setLineDash([2, 2]);
				ctx.strokeStyle = "rgb(0,0,0)";
				ctx.beginPath();
				ctx.moveTo(0, linetop);
				ctx.lineTo(working.canvasWidth, linetop);
				ctx.stroke();
				let dbgtext = new TextMetadata("monospace", 8, 5, 1, "rgb(0,0,0)", "rgba(0,0,0,1)", "left", null, 0, null);
				if (Array.isArray(line.lines)) {
					let linecpy = Utilities.jsonCopy(line);
					linecpy.lines = "[...]";
					Utilities.drawTextRectangleNoBorderOrBg(
						ctx,
						linetop + ":" + JSON.stringify(linecpy),
						dbgtext,
						linetop + 5,
						10,
						null,
						null,
						false
					);
				} else {
					Utilities.drawTextRectangleNoBorderOrBg(ctx, linetop + ":" + JSON.stringify(line), dbgtext, linetop + 5, 10, null, null, false);
				}
			}
		});
		return working.manageMaxWidthXy(xy);
	}
};
