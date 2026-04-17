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

const Utilities = require("./Utilities.js");
const Working = require("./Working.js");
const TextMetadata = require("./TextMetadata.js");
const Actor = require("./Actor.js");
const Fragment = require("./Fragment.js");
const SvgContext = require("./SvgContext.js");
const FontManager = require("./FontManager.js");
const ErrorLine = require("./ErrorLine.js");
const InputDocumentError = require("./InputDocumentError.js");

const MARGIN = 10;
const MAX_ITERATIONS = 5;

module.exports = class SvgStart {
	constructor() {
		this._className = "SvgStart";
		this._fontManager = new FontManager();
		this._fontManager.loadDefaults();
		this._working = new Working(this._fontManager);
	}

	get working() {
		return this._working;
	}

	get fontManager() {
		return this._fontManager;
	}

	debug(value) {
		console.log(this._className + ": " + value);
	}

	draw(postdata, stringpostdata, debug, id, nocovertext) {
		this.working.debug = debug;
		this.working.postdata = postdata;
		this.working.id = id;

		const ctx = new SvgContext(this._fontManager);
		let canvasWidth = 100;
		let canvasHeight = 100;

		let iterations = 0;
		while (iterations < MAX_ITERATIONS) {
			iterations++;
			this.working.init();
			this.working.canvasWidth = canvasWidth;
			this.working.canvasHeight = canvasHeight;
			ctx.reset();
			this.working.callCount = 0;

			this._render(ctx, stringpostdata, nocovertext);

			this.working.maxWidth += this.working.windowPadding;
			this.working.maxWidth += this.working.maxFragDepth * this.working.fragmentSpacing;
			this.working.maxHeight += this.working.windowPadding;

			if (this.working.maxWidth > this.working.canvasWidth || this.working.maxHeight > this.working.canvasHeight) {
				canvasWidth = Math.ceil(Math.max(canvasWidth, this.working.maxWidth));
				canvasHeight = Math.ceil(Math.max(canvasHeight, this.working.maxHeight));
				this.working.logDebug(`SvgStart: re-rendering at ${canvasWidth}x${canvasHeight} (iteration ${iterations})`);
				continue;
			}
			break;
		}

		const finalWidth = Math.ceil(this.working.canvasWidth) + MARGIN;
		const finalHeight = Math.ceil(this.working.canvasHeight) + MARGIN;
		return ctx.toBuffer(finalWidth, finalHeight);
	}

	_render(ctx, stringpostdata, nocovertext) {
		// White background
		Utilities.drawRectangle(
			ctx,
			0,
			null,
			null,
			"rgb(255, 255, 255)",
			0,
			0,
			this.working.canvasWidth,
			this.working.canvasHeight,
			0,
			false,
			false,
			false,
			false,
			false
		);

		let starty = this.working.startY;
		this.working.logDebug("Drawing started, y:" + starty);
		let xy = null;

		// Title
		let titleArr = [];
		if (Utilities.isObject(this.working.postdata.title) && Utilities.isString(this.working.postdata.title.text)) {
			titleArr.push("<hang>" + this.working.postdata.title.text);
		} else if (Utilities.isString(this.working.postdata.title)) {
			titleArr.push("<hang>" + this.working.postdata.title);
		} else if (Utilities.isObject(this.working.postdata.title) && Utilities.isAllStrings(this.working.postdata.title)) {
			for (let i = 0; i < this.working.postdata.title.length; i++) {
				titleArr.push("<hang>" + this.working.postdata.title[i].valueOf());
			}
		} else if (Utilities.isObject(this.working.postdata.title) && Utilities.isAllStrings(this.working.postdata.title.text)) {
			for (let i = 0; i < this.working.postdata.title.text.length; i++) {
				titleArr.push("<hang>" + this.working.postdata.title.text[i].valueOf());
			}
		}
		if (titleArr.length > 0 && !nocovertext) {
			titleArr.unshift("<b>Title:</b> ");
			let titletmd = TextMetadata.getTextMetadataFromObject(
				this.working,
				this.working.postdata.title,
				this.working.postdata.params.title,
				TextMetadata.getDefaultTmd()
			);
			let titleParams = {};
			if (typeof this.working.postdata.params.title == "object") titleParams = this.working.postdata.params.title;
			xy = Utilities.drawTextRectangle(
				ctx,
				titleArr,
				titletmd,
				starty,
				this.working.startX,
				typeof titleParams.width == "number" && titleParams.width > 0 ? titleParams.width : undefined,
				typeof titleParams.height == "number" && titleParams.height > 0 ? titleParams.height : undefined,
				typeof titleParams.cornerRadius == "number" && titleParams.cornerRadius > 0 ? titleParams.cornerRadius : 0,
				typeof titleParams.drawTopBorder == "boolean" ? titleParams.drawTopBorder : false,
				typeof titleParams.drawRightBorder == "boolean" ? titleParams.drawRightBorder : false,
				typeof titleParams.drawBottomBorder == "boolean" ? titleParams.drawBottomBorder : false,
				typeof titleParams.drawLeftBorder == "boolean" ? titleParams.drawLeftBorder : false,
				false,
				undefined,
				this.working.tags
			);
			this.working.manageMaxWidthXy(xy);
			starty = xy.y;
		}

		// Version
		let versionArr = [];
		if (Utilities.isObject(this.working.postdata.version) && Utilities.isString(this.working.postdata.version.text)) {
			versionArr.push("<hang>" + this.working.postdata.version.text);
		} else if (Utilities.isString(this.working.postdata.version)) {
			versionArr.push("<hang>" + this.working.postdata.version);
		} else if (Utilities.isObject(this.working.postdata.version) && Utilities.isAllStrings(this.working.postdata.version)) {
			for (let i = 0; i < this.working.postdata.version.length; i++) {
				versionArr.push("<hang>" + this.working.postdata.version[i].valueOf());
			}
		} else if (Utilities.isObject(this.working.postdata.version) && Utilities.isAllStrings(this.working.postdata.version.text)) {
			for (let i = 0; i < this.working.postdata.version.text.length; i++) {
				versionArr.push("<hang>" + this.working.postdata.version.text[i].valueOf());
			}
		}
		if (versionArr.length > 0 && !nocovertext) {
			versionArr.unshift("<b>Version:</b> ");
			let versiontmd = TextMetadata.getTextMetadataFromObject(
				this.working,
				this.working.postdata.version,
				this.working.postdata.params.version,
				TextMetadata.getDefaultTmd()
			);
			let versionParams = {};
			if (typeof this.working.postdata.params.version == "object") versionParams = this.working.postdata.params.version;
			xy = Utilities.drawTextRectangle(
				ctx,
				versionArr,
				versiontmd,
				starty,
				this.working.startX,
				typeof versionParams.width == "number" && versionParams.width > 0 ? versionParams.width : undefined,
				typeof versionParams.height == "number" && versionParams.height > 0 ? versionParams.height : undefined,
				typeof versionParams.cornerRadius == "number" && versionParams.cornerRadius > 0 ? versionParams.cornerRadius : 0,
				typeof versionParams.drawTopBorder == "boolean" ? versionParams.drawTopBorder : false,
				typeof versionParams.drawRightBorder == "boolean" ? versionParams.drawRightBorder : false,
				typeof versionParams.drawBottomBorder == "boolean" ? versionParams.drawBottomBorder : false,
				typeof versionParams.drawLeftBorder == "boolean" ? versionParams.drawLeftBorder : false,
				false,
				undefined,
				this.working.tags
			);
			this.working.manageMaxWidthXy(xy);
			starty = xy.y;
		}

		// Description
		let descriptionArr = [];
		if (Utilities.isObject(this.working.postdata.description) && Utilities.isString(this.working.postdata.description.text)) {
			descriptionArr.push("<hang>" + this.working.postdata.description.text);
		} else if (Utilities.isString(this.working.postdata.description)) {
			descriptionArr.push("<hang>" + this.working.postdata.description);
		} else if (Utilities.isObject(this.working.postdata.description) && Utilities.isAllStrings(this.working.postdata.description)) {
			for (let i = 0; i < this.working.postdata.description.length; i++) {
				descriptionArr.push("<hang>" + this.working.postdata.description[i].valueOf());
			}
		} else if (Utilities.isObject(this.working.postdata.description) && Utilities.isAllStrings(this.working.postdata.description.text)) {
			for (let i = 0; i < this.working.postdata.description.text.length; i++) {
				descriptionArr.push("<hang>" + this.working.postdata.description.text[i].valueOf());
			}
		}
		if (descriptionArr.length > 0 && !nocovertext) {
			descriptionArr.unshift("<b>Description:</b> ");
			let descriptiontmd = TextMetadata.getTextMetadataFromObject(
				this.working,
				this.working.postdata.description,
				this.working.postdata.params.description,
				TextMetadata.getDefaultTmd()
			);
			let descriptionParams = {};
			if (typeof this.working.postdata.params.description == "object") descriptionParams = this.working.postdata.params.description;
			xy = Utilities.drawTextRectangle(
				ctx,
				descriptionArr,
				descriptiontmd,
				starty,
				this.working.startX,
				typeof descriptionParams.width == "number" && descriptionParams.width > 0 ? descriptionParams.width : undefined,
				typeof descriptionParams.height == "number" && descriptionParams.height > 0 ? descriptionParams.height : undefined,
				typeof descriptionParams.cornerRadius == "number" && descriptionParams.cornerRadius > 0 ? descriptionParams.cornerRadius : 0,
				typeof descriptionParams.drawTopBorder == "boolean" ? descriptionParams.drawTopBorder : false,
				typeof descriptionParams.drawRightBorder == "boolean" ? descriptionParams.drawRightBorder : false,
				typeof descriptionParams.drawBottomBorder == "boolean" ? descriptionParams.drawBottomBorder : false,
				typeof descriptionParams.drawLeftBorder == "boolean" ? descriptionParams.drawLeftBorder : false,
				false,
				undefined,
				this.working.tags
			);
			this.working.manageMaxWidthXy(xy);
			starty = xy.y;
		}

		// Spacing if any cover text was drawn
		if (starty != this.working.startY) {
			starty += this.working.globalSpacing;
		}

		// Actors, lines, timelines
		try {
			xy = Actor.drawAllActors(this.working, ctx, starty);
			xy = Fragment.drawLines(this.working, ctx, xy.y, this.working.postdata.lines);
			Actor.clearAllFlows(this.working, xy.y);
			xy = Actor.drawTimelines(this.working, ctx, xy.y, 20, false);
		} catch (error) {
			if (error instanceof InputDocumentError) {
				xy = this._drawInputDocumentError(ctx, starty, xy, error);
			} else {
				throw error;
			}
		}

		// Optional pretty-printed source dump
		if (Utilities.isString(stringpostdata)) {
			let tmd = TextMetadata.getDefaultTmd();
			tmd.fontFamily = "monospace";
			tmd.fontSizePx = 12;
			let tmccl = TextMetadata.getTextMetadataFromObject(this.working, null, null, tmd);
			xy = Utilities.drawTextRectangle(
				ctx,
				stringpostdata,
				tmccl,
				xy.y + this.working.globalSpacing,
				this.working.globalSpacing,
				null,
				null,
				null,
				false,
				false,
				false,
				false,
				false,
				undefined,
				this.working.tags
			);
			this.working.manageMaxWidthXy(xy);
		}
	}

	_drawInputDocumentError(ctx, starty, xy, error) {
		const errorTop = xy && Utilities.isNumber(xy.y) ? xy.y : starty;
		const offendingObject = error.offendingObject != null ? error.offendingObject : this.working.postdata;
		return ErrorLine.draw(this.working, ctx, errorTop, error.reason || error.message, offendingObject, false);
	}
};
