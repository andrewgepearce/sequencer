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

module.exports = class Comment {
	/**
	 *Creates an instance of Comment.
	 * @param {*} ctx
	 * @param {*} lines
	 * @param {*} x
	 * @param {*} y
	 * @param {*} borderColour
	 * @param {*} textMetadata
	 * @memberof Comment
	 */
	constructor(ctx, line) {
		this._ctx = ctx;
		this._line = line;
		this._fgColour = null;
		this._bgColour = null;
		this._borderColour = null;
		this._lineColour = null;
		this._borderDash = null;
		this._lineDash = null;
		this._borderWidth = null;
		this._lineWidth = null;
		this._spacing = null;
		this._padding = null;
		this._fontFamily = null;
		this._fontSizePx = null;
		this._foldSizePx = null;
		this._lineRadius = null;
	}

	/**
	 * Draw a comment and connecting line
	 *
	 * @param {*} startx The top left X axis position
	 * @param {*} starty The top left Y axis position
	 * @param {*} gapBelow The gap between the bottom of the comment and the bottom of the connecting line
	 * @param {*} gapRight The gap between the connecting line and the right hand side of the comment
	 * @param {*} mimic Mimmic drawing
	 * @memberof Comment
	 */
	draw(working, startx, starty, gapBelow, gapRight, mimic, returnWidth) {
		if (!working.postdata) {
			working.postdata = {};
		}
		if (!working.postdata.params) {
			working.postdata.params = {};
		}
		if (!working.postdata.params.comment) {
			working.postdata.params.comment = {};
		}
		if (!Utilities.isNumber(startx) || !Utilities.isNumber(starty) || startx < 0 || starty < 0) {
			return {
				x: startx,
				y: starty,
			};
		}
		if (!Utilities.isNumber(gapBelow) || !Utilities.isNumber(gapRight) || gapBelow < 0 || gapRight < 0) {
			return {
				x: startx,
				y: starty,
			};
		}

		if (Utilities.isAllStrings(this._line) || Utilities.isString(this._line)) {
			let val = this._line;
			this._line = {};
			this._line.text = val;
		}

		if (!Utilities.isObject(this._line) && !Utilities.isString(this._line.text) && !Array.isArray(this._line.text)) {
			return {
				x: startx,
				y: starty,
			};
		}

		///////////////////////
		// Get the fg colour
		this._fgColour = Utilities.validColour(this._line.fgColour)
			? this._line.fgColour
			: working.postdata.params && working.postdata.params.comment && Utilities.validColour(working.postdata.params.comment.fgColour)
			? working.postdata.params.comment.fgColour
			: "rgb(0, 0, 0)";

		///////////////////////
		// Get the bg colour
		this._bgColour = Utilities.validColour(this._line.bgColour)
			? this._line.bgColour
			: working.postdata.params && working.postdata.params.comment && Utilities.validColour(working.postdata.params.comment.bgColour)
			? working.postdata.params.comment.bgColour
			: "rgb(0, 255, 50)";

		///////////////////////
		// Get the border colour
		this._borderColour = Utilities.validColour(this._line.borderColour)
			? this._line.borderColour
			: working.postdata.params && working.postdata.params.comment && Utilities.validColour(working.postdata.params.comment.borderColour)
			? working.postdata.params.comment.borderColour
			: "rgb(0, 0, 0)";

		///////////////////////
		// Get the connecting line colour
		this._lineColour = Utilities.validColour(this._line.lineColour)
			? this._line.lineColour
			: working.postdata.params && working.postdata.params.comment && Utilities.validColour(working.postdata.params.comment.lineColour)
			? working.postdata.params.comment.lineColour
			: "rgb(0, 0, 0)";

		///////////////////////
		// Get the border dash
		this._borderDash =
			Array.isArray(this._line.borderDash) && Utilities.isAllNumber(this._line.borderDash)
				? this._line.borderDash
				: working.postdata.params &&
				  working.postdata.params.comment &&
				  Array.isArray(working.postdata.params.comment.borderDash) &&
				  Utilities.isAllNumber(working.postdata.params.comment.borderDash)
				? working.postdata.params.comment.borderDash
				: [];

		///////////////////////
		// Get the line dash
		this._lineDash =
			Array.isArray(this._line.lineDash) && Utilities.isAllNumber(this._line.lineDash)
				? this._line.lineDash
				: working.postdata.params &&
				  working.postdata.params.comment &&
				  Array.isArray(working.postdata.params.comment.lineDash) &&
				  Utilities.isAllNumber(working.postdata.params.comment.lineDash)
				? working.postdata.params.comment.lineDash
				: [4, 2];

		///////////////////////
		// Get the border width
		this._borderWidth =
			Utilities.isNumber(this._line.borderWidth) && this._line.borderWidth >= 0
				? this._line.borderWidth
				: working.postdata.params &&
				  working.postdata.params.comment &&
				  Utilities.isNumber(working.postdata.params.comment.borderWidth) &&
				  working.postdata.params.comment.borderWidth >= 0
				? working.postdata.params.comment.borderWidth
				: 1;

		///////////////////////
		// Get the line width
		this._lineWidth =
			Utilities.isNumber(this._line.lineWidth) && this._line.lineWidth >= 0
				? this._line.lineWidth
				: working.postdata.params &&
				  working.postdata.params.comment &&
				  Utilities.isNumber(working.postdata.params.comment.lineWidth) &&
				  working.postdata.params.comment.lineWidth >= 0
				? working.postdata.params.comment.lineWidth
				: 1;

		///////////////////////
		// Get the font family
		this._fontFamily = working.isValidFont(this._line.fontFamily)
			? this._line.fontFamily + ",sans-serif"
			: working.postdata.params && working.postdata.params.comment && working.isValidFont(working.postdata.params.comment.fontFamily)
			? working.postdata.params.comment.fontFamily + ",sans-serif"
			: "sans-serif";

		///////////////////////
		// Get the font size
		this._fontSizePx =
			Utilities.isNumber(this._line.fontSizePx) && this._line.fontSizePx >= 6
				? this._line.fontSizePx
				: working.postdata.params &&
				  working.postdata.params.comment &&
				  Utilities.isNumber(working.postdata.params.comment.fontSizePx) &&
				  working.postdata.params.comment.fontSizePx >= 6
				? working.postdata.params.comment.fontSizePx
				: 14;

		///////////////////////
		// Get the padding
		this._padding = Utilities.isNumberGtEq0(this._line.padding)
			? this._line.padding
			: working.postdata.params && working.postdata.params.comment && Utilities.isNumberGtEq0(working.postdata.params.comment.padding)
			? working.postdata.params.comment.padding
			: 15;

		///////////////////////
		// Get the spacing
		this._spacing =
			Utilities.isNumber(this._line.spacing) && this._line.spacing >= 1
				? this._line.spacing
				: working.postdata.params &&
				  working.postdata.params.comment &&
				  Utilities.isNumber(working.postdata.params.comment.spacing) &&
				  working.postdata.params.comment.spacing >= 0
				? working.postdata.params.comment.spacing
				: 1;

		///////////////////////
		// Get the fold size
		this._foldSizePx =
			Utilities.isNumber(this._line.foldSizePx) && this._line.foldSizePx >= 1
				? this._line.foldSizePx
				: working.postdata.params &&
				  working.postdata.params.comment &&
				  Utilities.isNumber(working.postdata.params.comment.foldSizePx) &&
				  working.postdata.params.comment.foldSizePx >= 1
				? working.postdata.params.comment.foldSizePx
				: 10;

		///////////////////////
		// Get the line radius
		this._lineRadius =
			Utilities.isNumber(this._line.radius) && this._line.radius >= 1
				? this._line.radius
				: working.postdata.params &&
				  working.postdata.params.comment &&
				  Utilities.isNumber(working.postdata.params.comment.radius) &&
				  working.postdata.params.comment.radius > 0
				? working.postdata.params.comment.radius
				: 5;

		if (gapRight > 0 && gapRight < this._lineRadius + 1)
			return {
				x: startx,
				y: starty,
			};
		if (gapBelow < 0)
			return {
				x: startx,
				y: starty,
			};

		//////////////////
		// Create comment metadata
		let commenttmd = new TextMetadata(
			this._fontFamily,
			this._fontSizePx,
			this._padding,
			this._spacing,
			this._fgColour,
			this._bgColour,
			"left",
			this._borderColour,
			this._borderWidth,
			this._borderDash
		);

		////////////////
		// Get comment box starting parameters
		const wh = Utilities.getTextWidthAndHeight(this._ctx, commenttmd, this._line.text, working.tags);
		let width = wh.w; //commenttmd.getBoxWidth(this._ctx, this._line.text);
		let height = wh.h; //commenttmd.getBoxHeight(this._line.text);
		this._foldSizePx = this._foldSizePx > width / 4 ? width / 4 : this._foldSizePx;
		this._foldSizePx = this._foldSizePx > height / 4 ? height / 4 : this._foldSizePx;
		this._foldSizePx = this._foldSizePx > 30 ? 30 : this._foldSizePx;
		let commentx = startx + gapRight;
		let commenty = starty;

		///////////////////
		// Draw drop shadow
		let commentx_drop = commentx + 3;
		let commenty_drop = commenty + 3;
		this._ctx.beginPath();
		this._ctx.moveTo(commentx_drop, commenty_drop);
		mimic
			? this._ctx.moveTo(commentx_drop + width - this._foldSizePx, commenty_drop)
			: this._ctx.lineTo(commentx_drop + width - this._foldSizePx, commenty_drop);
		mimic
			? this._ctx.moveTo(commentx_drop + width, commenty_drop + this._foldSizePx)
			: this._ctx.lineTo(commentx_drop + width, commenty_drop + this._foldSizePx);
		mimic
			? this._ctx.moveTo(commentx_drop + width, commenty_drop + height)
			: this._ctx.lineTo(commentx_drop + width, commenty_drop + height);
		mimic ? this._ctx.moveTo(commentx_drop, commenty_drop + height) : this._ctx.lineTo(commentx_drop, commenty_drop + height);
		mimic ? this._ctx.moveTo(commentx_drop, commenty_drop) : this._ctx.lineTo(commentx_drop, commenty_drop);
		this._ctx.fillStyle = "rgb(210,210,210)";
		this._ctx.fill();
		working.manageMaxWidth(commentx_drop + width, commenty_drop + height);

		//////////////////////
		// Draw comment background and border
		this._ctx.beginPath();
		this._ctx.moveTo(commentx, commenty);
		mimic
			? this._ctx.moveTo(commentx + width - this._foldSizePx, commenty)
			: this._ctx.lineTo(commentx + width - this._foldSizePx, commenty);
		mimic
			? this._ctx.moveTo(commentx + width - this._foldSizePx, commenty + this._foldSizePx)
			: this._ctx.lineTo(commentx + width - this._foldSizePx, commenty + this._foldSizePx);
		mimic
			? this._ctx.moveTo(commentx + width, commenty + this._foldSizePx)
			: this._ctx.lineTo(commentx + width, commenty + this._foldSizePx);
		mimic ? this._ctx.moveTo(commentx + width, commenty + height) : this._ctx.lineTo(commentx + width, commenty + height);
		mimic ? this._ctx.moveTo(commentx, commenty + height) : this._ctx.lineTo(commentx, commenty + height);
		mimic ? this._ctx.moveTo(commentx, commenty) : this._ctx.lineTo(commentx, commenty);
		this._ctx.fillStyle = this._bgColour;
		this._ctx.fill();
		this._ctx.beginPath();
		this._ctx.moveTo(commentx, commenty);
		mimic
			? this._ctx.moveTo(commentx + width - this._foldSizePx, commenty)
			: this._ctx.lineTo(commentx + width - this._foldSizePx, commenty);
		mimic
			? this._ctx.moveTo(commentx + width - this._foldSizePx, commenty + this._foldSizePx)
			: this._ctx.lineTo(commentx + width - this._foldSizePx, commenty + this._foldSizePx);
		mimic
			? this._ctx.moveTo(commentx + width, commenty + this._foldSizePx)
			: this._ctx.lineTo(commentx + width, commenty + this._foldSizePx);
		this._ctx.moveTo(commentx + width - this._foldSizePx, commenty);
		mimic
			? this._ctx.moveTo(commentx + width, commenty + this._foldSizePx)
			: this._ctx.lineTo(commentx + width, commenty + this._foldSizePx);
		mimic ? this._ctx.moveTo(commentx + width, commenty + height) : this._ctx.lineTo(commentx + width, commenty + height);
		mimic ? this._ctx.moveTo(commentx, commenty + height) : this._ctx.lineTo(commentx, commenty + height);
		mimic ? this._ctx.moveTo(commentx, commenty) : this._ctx.lineTo(commentx, commenty);
		this._ctx.strokeStyle = this._borderColour;
		this._ctx.setLineDash(this._borderDash);
		this._ctx.lineWidth = this._borderWidth;
		this._ctx.stroke();
		if (!mimic) {
			Utilities.drawTextRectangleNoBorderOrBg(this._ctx, this._line.text, commenttmd, commenty, commentx, null, null, false, wh);
		}
		working.manageMaxWidth(commentx + width, commenty + height);

		/////////////////
		// Draw the connecting line
		let destinationX = startx;
		let destinationY = commenty + height + gapBelow;

		if (gapRight > 0 && gapBelow > 0) {
			this._ctx.beginPath();
			this._ctx.lineWidth = this._lineWidth;
			this._ctx.strokeStyle = this._lineColour;
			this._ctx.setLineDash(this._lineDash);
			this._ctx.moveTo(commentx, commenty + height / 2);
			mimic
				? this._ctx.moveTo(destinationX + this._lineRadius, commenty + height / 2)
				: this._ctx.lineTo(destinationX + this._lineRadius, commenty + height / 2);
			mimic
				? this._ctx.moveTo(destinationX, commenty + height / 2 + this._lineRadius)
				: this._ctx.arcTo(destinationX, commenty + height / 2, destinationX, commenty + height / 2 + this._lineRadius, this._lineRadius);
			mimic ? this._ctx.moveTo(destinationX, destinationY) : this._ctx.lineTo(destinationX, destinationY);
			this._ctx.stroke();
		}

		if (mimic && returnWidth) return width;
		else return working.manageMaxWidth(commentx + width, destinationY);
	}

	/**
	 * Create a text metadata object using default values for a call
	 *
	 * @static
	 * @returns
	 * @memberof Call
	 */
	static getDefaultTmd() {
		const defaultCommentTmd = {
			fontFamily: "sans-serif",
			fontSizePx: 10,
			fgColour: "rgb(0,0,0)",
			bgColour: "rgb(0,255,50)",
			padding: 10,
			spacing: 1,
			align: "left",
			borderColour: "rgb(0,0,0)",
			borderWidth: 1,
			borderDash: [],
		};
		return defaultCommentTmd;
	}
};
