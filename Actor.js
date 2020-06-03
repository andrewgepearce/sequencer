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
const schema = require("./schema.js");

module.exports = class Actor {
	constructor(ctx, actorObj) {
		this._ctx = ctx;
		this._actorObj = actorObj;
		this._name = null;
		this._alias = null;
		this._height = null;
		this._width = null;
		this._top = null;
		this._left = null;
		this._middle = null;
		this._tmd = null;
		this._startx = null;
		this._starty = null;
		this._flowStateContinue = false;
		this._flowStartYPos = null;
		this._flowEndYPos = null;
		this._height = null;
		this._width = null;
		this._middle = null;
		this._gapToNext = null;
		this._radius = null;
		this._flowWidth = null;
		this._timelineDash = null;
		this._timelineWidth = null;
		this._actorTmd = null;

		// this._height = this._tmd.getBoxHeight(this._lines);
		// this._width = this._tmd.getBoxWidth(this._ctx, this._lines);
		// this._middle = this._startx + (this._width / 2);
	}

	get actorTmd() {
		return this._actorTmd;
	}

	get timelineWidth() {
		return this._timelineWidth;
	}

	get timelineDash() {
		return this._timelineDash;
	}

	get flowWidth() {
		return this._flowWidth;
	}

	get ctx() {
		return this._ctx;
	}

	get radius() {
		return this._radius;
	}

	get actorObj() {
		return this._actorObj;
	}

	get gapToNext() {
		return this._gapToNext;
	}

	setFlowStateContinue() {
		this._flowStateContinue = true;
	}

	clearFlowStateContinue() {
		this._flowStateContinue = false;
	}

	isFlowStateContinue() {
		return this._flowStateContinue;
	}

	get flowStartYPos() {
		return this._flowStartYPos;
	}

	get flowEndYPos() {
		return this._flowEndYPos;
	}

	set flowStartYPos(value) {
		this._flowStartYPos = value;
	}

	set flowEndYPos(value) {
		this._flowEndYPos = value;
	}

	get colour() {
		return this._colour;
	}
	get name() {
		return this._name;
	}
	get alias() {
		return this._alias;
	}
	get middle() {
		return this._middle;
	}
	get left() {
		return this._left;
	}
	get right() {
		return this._right;
	}
	get x() {
		return this._startx;
	}
	get y() {
		return this._starty;
	}
	get tmd() {
		return this._tmd;
	}
	/**
	 * @param {number} x
	 */
	set startx(x) {
		this._startx = x;
	}
	/**
	 * @param {number} y
	 */
	set starty(y) {
		this._starty = y;
	}

	/**
    * Draw the actor 
    *
    * @param {boolean} mimic If true, pretend to draw the actor....
    * @memberof Actor
    * @return {object} The max X and Y  position after the draw, or 'undefined' if nothing drawn becuase of error

    */
	draw(working, startx, starty, mimic) {
		if (!Utilities.isObject(this._actorObj)) {
			throw new Error("Actor.draw: actor is not a valid JS object");
			// return {
			// 	x: 0,
			// 	y: 0
			// };
		}
		if (!Utilities.isString(this._actorObj.name) && !Array.isArray(this.actorObj.name)) {
			throw new Error("Actor.draw: no name defined for actor");
			// return {
			// 	x: 0,
			// 	y: 0
			// };
		} else {
			this._name = this.actorObj.name;
		}
		if (!Utilities.isString(this.actorObj.alias)) {
			throw new Error("Actor.draw: no alias defined for actor: " + JSON.stringify(this._name, undefined, 3));
			// return {
			//    x: 0,
			//    y: 0
			// };
		} else {
			this._alias = this.actorObj.alias;
		}
		if (!working.postdata) {
			working.postdata = {};
		}
		if (!working.postdata.params) {
			working.postdata.params = {};
		}
		if (!working.postdata.params.actor) {
			working.postdata.params.actor = {};
		}
		////////////////////////////////
		// Initialise drawing parameters
		let actortmd = TextMetadata.getTextMetadataFromObject(working, this.actorObj, working.postdata.params.actor, Actor.getDefaultTmd());
		this._actorTmd = actortmd;
		this._gapToNext =
			Utilities.isNumber(this.actorObj.gapToNext) && this.actorObj.gapToNext > 0
				? this.actorObj.gapToNext
				: working.postdata.params && working.postdata.params.actor && Utilities.isNumberGt0(working.postdata.params.actor.gapToNext)
				? working.postdata.params.actor.gapToNext
				: schema.actor.properties.gapToNext.default;
		this._radius = Utilities.isNumberGtEq0(this.actorObj.radius)
			? this.actorObj.radius
			: working.postdata.params && working.postdata.params.actor && Utilities.isNumberGtEq0(working.postdata.params.actor.radius)
			? working.postdata.params.actor.radius
			: schema.actor.properties.radius.default;
		this._flowWidth = Utilities.isNumberGt0(this.actorObj.flowWidth)
			? this.actorObj.flowWidth
			: working.postdata.params && working.postdata.params.actor && Utilities.isNumberGtEq0(working.postdata.params.actor.flowWidth)
			? working.postdata.params.actor.flowWidth
			: schema.actor.properties.flowWidth.default;
		this._timelineWidth = Utilities.isNumberGt0(this.actorObj.timelineWidth)
			? this.actorObj.timelineWidth
			: working.postdata.params && working.postdata.params.actor && Utilities.isNumberGtEq0(working.postdata.params.actor.timelineWidth)
			? working.postdata.params.actor.timelineWidth
			: schema.actor.properties.timelineWidth.default;
		this._timelineDash = Utilities.isAllNumber(this.actorObj.timelineDash)
			? this.actorObj.timelineDash
			: working.postdata.params && working.postdata.params.actor && Utilities.isAllNumber(working.postdata.params.actor.timelineDash)
			? working.postdata.params.actor.timelineDash
			: schema.actor.properties.timelineDash.default;

		///////////////////
		// Draw the actor, obeying the mimic request
		this._startx = startx;
		this._starty = starty;
		const wh = Utilities.getTextWidthAndHeight(this._ctx, actortmd, this._name, working.tags);

		this._height = wh.h; //actortmd.getBoxHeight(this._name);
		this._width = wh.w; //actortmd.getBoxWidth(this._ctx, this._name);
		this._middle = this._startx + this._width / 2;
		if (!Utilities.isNumber(working.scratchPad.maxActorHeight)) {
			working.scratchPad.maxActorHeight = 0;
		}
		if (this._height > working.scratchPad.maxActorHeight) {
			working.scratchPad.maxActorHeight = this._height;
		} else {
			this._height = working.scratchPad.maxActorHeight;
		}

		///////////////////
		// Draw drop shadow
		let xy = Utilities.drawRectangle(
			this._ctx,
			0,
			null,
			null,
			"rgb(210,210,210)",
			this._starty + 3,
			this._startx + 3,
			this._width,
			this._height,
			this._radius,
			false,
			false,
			false,
			false,
			mimic
		);
		working.manageMaxWidthXy(xy);

		//////////////////////
		// draw actual rectangle
		xy = Utilities.drawTextRectangle(
			this._ctx,
			this._name,
			actortmd,
			this._starty,
			this._startx,
			this._width,
			this._height,
			this._radius,
			true,
			true,
			true,
			true,
			mimic,
			wh,
			working.tags
		);

		///////////////
		// Return
		return working.manageMaxWidthXy(xy);
	}

	/**
	 *
	 *
	 * @static
	 * @memberof Actor
	 * @returns {object} The max X and Y  position after the draw, or 'undefined' if nothing drawn becuase of error
	 */
	static drawAllActors(working, ctx, starty) {
		let actorStartY = starty;
		let nextActorX = working.startX;
		let maxx = 0;
		let maxy = 0;

		if (!Array.isArray(working.postdata.actors) || working.postdata.actors.length == 0) {
			throw new Error("Actor.js: no actors in the posted data");
		}

		/////////////////////////
		// Initialise the actors with mimic=true, primarily to get the same height across all of them
		working.postdata.actors.forEach((actor) => {
			actor.clinstance = new Actor(ctx, actor);
			let xy = actor.clinstance.draw(working, nextActorX, actorStartY, true);
			nextActorX = xy.x + actor.clinstance.gapToNext;
			maxx = xy.x > maxx ? xy.x : maxx;
			maxy = xy.y > maxy ? xy.y : maxy;
		});

		////////////////////////
		// Now actually draw the actors
		nextActorX = working.startX;
		working.postdata.actors.forEach((actor) => {
			let xy = actor.clinstance.draw(working, nextActorX, actorStartY, false);
			nextActorX = xy.x + actor.clinstance.gapToNext;
			maxx = xy.x > maxx ? xy.x : maxx;
			maxy = xy.y > maxy ? xy.y : maxy;
		});
		return working.manageMaxWidth(maxx, maxy);
	}

	/**
	 *
	 *
	 * @static
	 * @param {*} starty
	 * @memberof Actor
	 */
	static clearAllFlows(working, starty) {
		working.postdata.actors.forEach((actor) => {
			if (actor.clinstance && actor.clinstance.isFlowStateContinue()) actor.clinstance.flowEndYPos = starty;
		});
	}

	/**
	 * Draw timelins at a particular Y point for a miniumum height
	 *
	 * @static
	 * @param {*} ctx
	 * @param {*} starty
	 * @param {*} minimumHeight
	 * @param {*} mimic
	 * @memberof Actor
	 * @returns The max X and Y position after the draw, or 'undefined' if nothing drawn becuase of error
	 */
	static drawTimelines(working, ctx, starty, minimumHeight, mimic) {
		return Actor.drawTimelinesWithBreak(working, ctx, starty, minimumHeight, null, null, null, mimic);
	}

	/**
	 *
	 *
	 * @static
	 * @param {*} ctx
	 * @param {*} starty
	 * @param {*} minimumHeight
	 * @param {*} breakAtYPos
	 * @param {*} mimic
	 * @returns
	 * @memberof Actor
	 */
	static drawTimelinesWithBreak(working, ctx, starty, minimumHeight, breakAtYPos, breakAtYPosForActor, gapForBreak, mimic) {
		let maxx = 0;
		let maxy = 0;
		working.postdata.actors.forEach((actor) => {
			const actorcl = actor.clinstance;
			let extra = actorcl.getExtraYToMeetTimeLineDash(minimumHeight);
			let actualHeight = minimumHeight + extra;
			ctx.lineWidth = actorcl.timelineWidth;
			ctx.setLineDash(actorcl.timelineDash);
			ctx.strokeStyle = "rgb(0,0,0)";
			ctx.beginPath();
			ctx.moveTo(actorcl.middle, starty);
			mimic ? ctx.moveTo(actorcl.middle, starty + actualHeight) : ctx.lineTo(actorcl.middle, starty + actualHeight);
			ctx.stroke();
			if (actorcl.middle > maxx) maxx = actorcl.middle;
			if (starty + actualHeight > maxy) maxy = starty + actualHeight;

			// Check if we need to break the flow on the calling actor
			let breakAtYPosStart = null;
			let breakAtYPosEnd = null;
			if (
				actorcl.alias === breakAtYPosForActor &&
				Utilities.isNumber(breakAtYPos) &&
				breakAtYPos - gapForBreak / 2 > starty &&
				breakAtYPos + gapForBreak / 2 < starty + actualHeight &&
				Utilities.isNumber(gapForBreak) &&
				gapForBreak > 0
			) {
				breakAtYPosStart = breakAtYPos - gapForBreak / 2;
				breakAtYPosEnd = breakAtYPos + gapForBreak / 2;
			}

			//////////////////////////
			// We have a start and an end and we have a break
			if (
				Utilities.isNumber(actorcl.flowStartYPos) &&
				Utilities.isNumber(actorcl.flowEndYPos) &&
				breakAtYPosStart != null &&
				breakAtYPosEnd != null
			) {
				let leftBlock = actorcl.middle - actorcl.flowWidth / 2;
				let widthBlock = actorcl.flowWidth;
				let rightBorder = true;
				let leftBorder = true;
				let radius = 0;
				if (breakAtYPosEnd < actorcl.flowEndYPos) {
					let topBlock1 = actorcl.isFlowStateContinue() ? starty : actorcl.flowStartYPos;
					let heightBlock1 = breakAtYPosStart - topBlock1;
					let topBorder = actorcl.isFlowStateContinue() ? false : true;
					let bottomBorder = true;
					Utilities.drawRectangle(
						ctx,
						1,
						"rgb(0, 0, 0)",
						[],
						actorcl.actorTmd.bgColour,
						topBlock1,
						leftBlock,
						widthBlock,
						heightBlock1,
						radius,
						topBorder,
						rightBorder,
						bottomBorder,
						leftBorder,
						mimic
					);
					let topBlock2 = breakAtYPosEnd;
					let heightBlock2 = actorcl.flowEndYPos - breakAtYPosEnd;
					topBorder = true;
					bottomBorder = true;
					Utilities.drawRectangle(
						ctx,
						1,
						"rgb(0, 0, 0)",
						[],
						actorcl.actorTmd.bgColour,
						topBlock2,
						leftBlock,
						widthBlock,
						heightBlock2,
						radius,
						topBorder,
						rightBorder,
						bottomBorder,
						leftBorder,
						mimic
					);
					actorcl.clearFlowStateContinue();
				} else {
					let topBlock = actorcl.isFlowStateContinue() ? starty : actorcl.flowStartYPos;
					let topBorder = actorcl.isFlowStateContinue() ? false : true;
					let bottomBorder = true;
					let height = actorcl.isFlowStateContinue() ? actualHeight : actualHeight - (actorcl.flowStartYPos - starty);
					Utilities.drawRectangle(
						ctx,
						1,
						"rgb(0, 0, 0)",
						[],
						actorcl.actorTmd.bgColour,
						topBlock,
						leftBlock,
						widthBlock,
						height,
						radius,
						topBorder,
						rightBorder,
						bottomBorder,
						leftBorder,
						mimic
					);
					actorcl.clearFlowStateContinue();
				}
			}
			//////////////////////////
			// We have a start and an end but we have no break
			else if (Utilities.isNumber(actorcl.flowStartYPos) && Utilities.isNumber(actorcl.flowEndYPos)) {
				let leftBlock = actorcl.middle - actorcl.flowWidth / 2;
				let widthBlock = actorcl.flowWidth;
				let heightBlock = actorcl.isFlowStateContinue() ? actorcl.flowEndYPos - starty : actorcl.flowEndYPos - actorcl.flowStartYPos;
				let topBlock = actorcl.isFlowStateContinue() ? starty : actorcl.flowStartYPos;
				let radius = 0;
				let topBorder = actorcl.isFlowStateContinue() ? false : true;
				let rightBorder = true;
				let bottomBorder = true;
				let leftBorder = true;
				Utilities.drawRectangle(
					ctx,
					1,
					"rgb(0, 0, 0)",
					[],
					actorcl.actorTmd.bgColour,
					topBlock,
					leftBlock,
					widthBlock,
					heightBlock,
					radius,
					topBorder,
					rightBorder,
					bottomBorder,
					leftBorder,
					mimic
				);
				// Clear the continue state
				actorcl.clearFlowStateContinue();
			}
			//////////////////////////
			// We have a start but no end, and we have a break
			else if (
				Utilities.isNumber(actorcl.flowStartYPos) &&
				!Utilities.isNumber(actorcl.flowEndYPos) &&
				breakAtYPosStart != null &&
				breakAtYPosEnd != null
			) {
				let topBlock = actorcl.isFlowStateContinue() ? starty : actorcl.flowStartYPos;
				let leftBlock = actorcl.middle - actorcl.flowWidth / 2;
				let widthBlock = actorcl.flowWidth;
				let rightBorder = true;
				let leftBorder = true;
				let radius = 0;
				if (breakAtYPosEnd < starty + actualHeight) {
					let heightBlock1 = breakAtYPosStart - topBlock;
					let topBorder = actorcl.isFlowStateContinue() ? false : true;
					let bottomBorder = true;
					Utilities.drawRectangle(
						ctx,
						1,
						"rgb(0, 0, 0)",
						[],
						actorcl.actorTmd.bgColour,
						topBlock,
						leftBlock,
						widthBlock,
						heightBlock1,
						radius,
						topBorder,
						rightBorder,
						bottomBorder,
						leftBorder,
						mimic
					);
					let topBlock2 = breakAtYPosEnd;
					let heightBlock2 = starty + actualHeight - breakAtYPosEnd;
					topBorder = true;
					bottomBorder = false;
					Utilities.drawRectangle(
						ctx,
						1,
						"rgb(0, 0, 0)",
						[],
						actorcl.actorTmd.bgColour,
						topBlock2,
						leftBlock,
						widthBlock,
						heightBlock2,
						radius,
						topBorder,
						rightBorder,
						bottomBorder,
						leftBorder,
						mimic
					);
					actorcl.setFlowStateContinue();
				} else {
					let topBorder = actorcl.isFlowStateContinue() ? false : true;
					let bottomBorder = false;
					let height = actorcl.isFlowStateContinue() ? actualHeight : actualHeight - (actorcl.flowStartYPos - starty);
					Utilities.drawRectangle(
						ctx,
						1,
						"rgb(0, 0, 0)",
						[],
						actorcl.actorTmd.bgColour,
						topBlock,
						leftBlock,
						widthBlock,
						height,
						radius,
						topBorder,
						rightBorder,
						bottomBorder,
						leftBorder,
						mimic
					);
					actorcl.setFlowStateContinue();
				}
			}
			//////////////////////////
			// We have a start but no end, and we DO NOT have a break
			else if (Utilities.isNumber(actorcl.flowStartYPos) && !Utilities.isNumber(actorcl.flowEndYPos)) {
				let leftBlock = actorcl.middle - actorcl.flowWidth / 2;
				let widthBlock = actorcl.flowWidth;
				let heightBlock = actorcl.isFlowStateContinue() ? actualHeight : actualHeight - (actorcl.flowStartYPos - starty);
				let topBlock = actorcl.isFlowStateContinue() ? starty : actorcl.flowStartYPos;
				let radius = 0;
				let topBorder = actorcl.isFlowStateContinue() ? false : true;
				let rightBorder = true;
				let bottomBorder = false;
				let leftBorder = true;
				Utilities.drawRectangle(
					ctx,
					1,
					"rgb(0, 0, 0)",
					[],
					actorcl.actorTmd.bgColour,
					topBlock,
					leftBlock,
					widthBlock,
					heightBlock,
					radius,
					topBorder,
					rightBorder,
					bottomBorder,
					leftBorder,
					mimic
				);
				actorcl.setFlowStateContinue();
			}
			/////////////////////////////////////////
			// We have no start but we do have an end and we have a break
			else if (
				!Utilities.isNumber(actorcl.flowStartYPos) &&
				Utilities.isNumber(actorcl.flowEndYPos) &&
				breakAtYPosStart != null &&
				breakAtYPosEnd != null
			) {
				let topBlock = starty;
				let leftBlock = actorcl.middle - actorcl.flowWidth / 2;
				let widthBlock = actorcl.flowWidth;
				let rightBorder = true;
				let leftBorder = true;
				let radius = 0;
				if (breakAtYPosEnd < actorcl.flowEndYPos) {
					let heightBlock1 = breakAtYPosStart - topBlock;
					let topBorder = actorcl.isFlowStateContinue() ? false : true;
					let bottomBorder = true;
					Utilities.drawRectangle(
						ctx,
						1,
						"rgb(0, 0, 0)",
						[],
						actorcl.actorTmd.bgColour,
						topBlock,
						leftBlock,
						widthBlock,
						heightBlock1,
						radius,
						topBorder,
						rightBorder,
						bottomBorder,
						leftBorder,
						mimic
					);
					let topBlock2 = breakAtYPosEnd;
					let heightBlock2 = actorcl.flowEndYPos - breakAtYPosEnd;
					topBorder = true;
					bottomBorder = true;
					Utilities.drawRectangle(
						ctx,
						1,
						"rgb(0, 0, 0)",
						[],
						actorcl.actorTmd.bgColour,
						topBlock2,
						leftBlock,
						widthBlock,
						heightBlock2,
						radius,
						topBorder,
						rightBorder,
						bottomBorder,
						leftBorder,
						mimic
					);
					actorcl.clearFlowStateContinue();
				} else {
					let topBorder = actorcl.isFlowStateContinue() ? false : true;
					let bottomBorder = true;
					let height = actualHeight - (actualHeight - (actorcl.flowEndYPos - starty));
					Utilities.drawRectangle(
						ctx,
						1,
						"rgb(0, 0, 0)",
						[],
						actorcl.actorTmd.bgColour,
						topBlock,
						leftBlock,
						widthBlock,
						height,
						radius,
						topBorder,
						rightBorder,
						bottomBorder,
						leftBorder,
						mimic
					);
					actorcl.clearFlowStateContinue();
				}
			}
			/////////////////////////////////////////
			// We have no start but we do have an end and we DO NOT have a break
			else if (!Utilities.isNumber(actorcl.flowStartYPos) && Utilities.isNumber(actorcl.flowEndYPos)) {
				let leftBlock = actorcl.middle - actorcl.flowWidth / 2;
				let widthBlock = actorcl.flowWidth;
				let heightBlock = actualHeight - (actualHeight - (actorcl.flowEndYPos - starty));
				let topBlock = starty;
				let radius = 0;
				let topBorder = actorcl.isFlowStateContinue() ? false : true;
				let rightBorder = true;
				let bottomBorder = true;
				let leftBorder = true;
				Utilities.drawRectangle(
					ctx,
					1,
					"rgb(0, 0, 0)",
					[],
					actorcl.actorTmd.bgColour,
					topBlock,
					leftBlock,
					widthBlock,
					heightBlock,
					radius,
					topBorder,
					rightBorder,
					bottomBorder,
					leftBorder,
					mimic
				);
				actorcl.clearFlowStateContinue();
			}
			////////////////////////////////////////////
			// We are marked to continue and have no number for either flowStartYPos or flowEndYPos
			else if (actorcl.isFlowStateContinue()) {
				Utilities.drawRectangle(
					ctx,
					1,
					"rgb(0, 0, 0)",
					[],
					actorcl.actorTmd.bgColour,
					starty, //top
					actorcl.middle - actorcl.flowWidth / 2, //left
					actorcl.flowWidth, // width
					actualHeight, // height
					0,
					false,
					true,
					false,
					true,
					mimic
				);
			}
			actorcl.flowStartYPos = null;
			actorcl.flowEndYPos = null;
		});
		return working.manageMaxWidth(maxx, maxy);
	}

	/**
	 * Timelines need to align to equal dash values. So, if the dash pattern is [4,4], and
	 * the minimum height is 6 we need an extra 2 pixels in the height to make an even count of the dash patterns
	 *
	 * @memberof Actor
	 * @returns The extra number of pixels to make the dash pattern whole
	 */
	getExtraYToMeetTimeLineDash(minimumHeight) {
		let count = 0;
		this._timelineDash.forEach((space) => {
			count += space;
		});

		if (minimumHeight < count) return count;
		else if (minimumHeight % count == 0) return 0;
		else return count - (minimumHeight % count);
	}

	static getDefaultTmd() {
		const defaultTmd = {
			fontFamily: schema.actor.properties.fontFamily.default,
			fontSizePx: schema.actor.properties.fontSizePx.default,
			fgColour: schema.actor.properties.fgColour.default,
			bgColour: schema.actor.properties.bgColour.default,
			padding: schema.actor.properties.padding.default,
			spacing: schema.actor.properties.spacing.default,
			align: schema.actor.properties.align.default,
			borderColour: schema.actor.properties.borderColour.default,
			borderWidth: schema.actor.properties.borderWidth.default,
			borderDash: schema.actor.properties.borderDash.default,
		};
		return defaultTmd;
	}
};
