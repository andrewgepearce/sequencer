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

module.exports = class TextMetadata {
	constructor(fontFamily, fontSizePx, padding, spacing, fgColour, bgColour, align, borderColour, borderWidth, borderDash, vpadding) {
		this._fontFamily = Utilities.isString(fontFamily) ? fontFamily : "serif";
		this._fontSizePx = Utilities.isNumber(fontSizePx) && fontSizePx > 0 ? fontSizePx : 10;
		this._padding = Utilities.isNumber(padding) && padding > 0 ? padding : 0;
		this._vpadding = Utilities.isNumber(vpadding) && vpadding >= 0 ? vpadding : undefined;
		this._spacing = Utilities.isNumber(spacing) && spacing > 0 ? spacing : 1;
		this._fgColour = Utilities.validColour(fgColour) ? fgColour : "rgb(0,0,0)";
		this._bgColour = Utilities.validColour(bgColour) ? bgColour : "rgba(255,255,255,0)";
		this._align = Utilities.isString(align) ? align : "left";
		this._borderColour = Utilities.validColour(borderColour) ? borderColour : "rgb(0,0,0)";
		this._borderWidth = Utilities.isNumber(borderWidth) && borderWidth >= 0 ? borderWidth : 1;
		this._borderDash = Array.isArray(borderDash) ? borderDash : [];
		this._bold = false;
		this._italic = false;
	}
	get fontFamily() {
		return this._fontFamily;
	}
	get fontSizePx() {
		return this._fontSizePx;
	}
	get padding() {
		return this._padding;
	}
	get vpadding() {
		return this._vpadding;
	}
	get spacing() {
		return this._spacing;
	}
	get fgColour() {
		return this._fgColour;
	}
	set fgColour(value) {
		this._fgColour = value;
	}
	get bgColour() {
		return this._bgColour;
	}
	set bgColour(value) {
		this._bgColour = value;
	}
	get align() {
		return this._align;
	}
	set align(alignstr) {
		if (Utilities.isString(alignstr)) this._align = alignstr;
	}
	set padding(p) {
		if (Utilities.isNumber(p)) this._padding = p;
	}
	set vpadding(value) {
		if (Utilities.isNumber(value)) this._vpadding = value;
	}
	get borderColour() {
		return this._borderColour;
	}
	set borderColour(value) {
		if (typeof value == "string") this._borderColour = value;
	}
	get borderWidth() {
		return this._borderWidth;
	}
	set borderWidth(value) {
		if (typeof value == "number" && value >= 0) this._borderWidth = value;
	}
	get borderDash() {
		return this._borderDash;
	}
	set borderDash(value) {
		if (Array.isArray(value)) this._borderDash = value;
	}
	set bold(value) {
		if (value === true || value === false) this._bold = value;
	}
	get bold() {
		return this._bold;
	}
	set italic(value) {
		if (value === true || value === false) this._italic = value;
	}
	get italic() {
		return this._italic;
	}

	/**
	 *
	 *
	 * @param {object} ctx
	 * @param {string} str
	 * @param {number} plannedWidth
	 * @returns The string reduced to a matching length to meet the planned width
	 * @memberof TextMetadata
	 */
	reduceStringToFitWidth(ctx, str, plannedWidth) {
		return Utilities.reduceStringToFitWidth(ctsx, str, plannedWidth);
	}

	/**
	 *
	 *
	 * @static
	 * @param {object} obj Obhect to define text metadata parameters
	 * @param {object} defaultObj Default object to define fallbacktext metadata parameters
	 * @returns TextMetadata object
	 * @memberof TextMetadata
	 */
	static getTextMetadataFromObject(working, obj, defaultObj, finalFallback) {
		if (obj == null || typeof obj != "object") {
			obj = {};
		}

		if (defaultObj == null || typeof defaultObj != "object") {
			defaultObj = {};
		}

		if (finalFallback == null || typeof finalFallback != "object") {
			finalFallback = {};
		}

		return new TextMetadata(
			working.isValidFont(obj.fontFamily)
				? obj.fontFamily
				: working.isValidFont(defaultObj.fontFamily)
				? defaultObj.fontFamily
				: working.isValidFont(finalFallback.fontFamily)
				? finalFallback.fontFamily
				: "sourceCodePro",
			Utilities.isNumberGt0(obj.fontSizePx) ? obj.fontSizePx : Utilities.isNumberGt0(defaultObj.fontSizePx) ? defaultObj.fontSizePx : Utilities.isNumberGt0(finalFallback.fontSizePx) ? finalFallback.fontSizePx : 10,
			Utilities.isNumberGtEq0(obj.padding) ? obj.padding : Utilities.isNumberGtEq0(defaultObj.padding) ? defaultObj.padding : Utilities.isNumberGtEq0(finalFallback.padding) ? finalFallback.padding : 10,
			Utilities.isNumberGtEq0(obj.spacing) ? obj.spacing : Utilities.isNumberGtEq0(defaultObj.spacing) ? defaultObj.spacing : Utilities.isNumberGtEq0(finalFallback.spacing) ? finalFallback.spacing : 1,
			Utilities.validColour(obj.fgColour) ? obj.fgColour : Utilities.validColour(defaultObj.fgColour) ? defaultObj.fgColour : Utilities.validColour(finalFallback.fgColour) ? finalFallback.fgColour : "rgb(0, 0, 0)",
			Utilities.validColour(obj.bgColour)
				? obj.bgColour
				: Utilities.validColour(defaultObj.bgColour)
				? defaultObj.bgColour
				: Utilities.validColour(finalFallback.bgColour)
				? finalFallback.bgColour
				: "rgba(255,255,255,0)",
			Utilities.isString(obj.align) ? obj.align : Utilities.isString(defaultObj.align) ? defaultObj.align : Utilities.isString(finalFallback.align) ? finalFallback.align : "left",
			Utilities.validColour(obj.borderColour)
				? obj.borderColour
				: Utilities.validColour(defaultObj.borderColour)
				? defaultObj.borderColour
				: Utilities.validColour(finalFallback.borderColour)
				? finalFallback.borderColour
				: "rgba(255,255,255,0)",
			Utilities.isNumberGtEq0(obj.borderWidth)
				? obj.borderWidth
				: Utilities.isNumberGtEq0(defaultObj.borderWidth)
				? defaultObj.borderWidth
				: Utilities.isNumberGtEq0(finalFallback.borderWidth)
				? finalFallback.borderWidth
				: 0,
			Utilities.isAllNumber(obj.borderDash) ? obj.borderDash : Utilities.isAllNumber(defaultObj.borderDash) ? defaultObj.borderDash : Utilities.isAllNumber(finalFallback.borderDash) ? finalFallback.borderDash : [],
			Utilities.isNumberGtEq0(obj.vpadding) ? obj.vpadding : Utilities.isNumberGtEq0(defaultObj.vpadding) ? defaultObj.vpadding : Utilities.isNumberGtEq0(finalFallback.vpadding) ? finalFallback.vpadding : undefined
		);
	}

	/**
	 * Create a text metadata object using default values for a call
	 *
	 * @static
	 * @returns
	 * @memberof Call
	 */
	static getDefaultTmd() {
		const defaultTmd = {
			fontFamily: "sans-serif",
			fontSizePx: 14,
			fgColour: "rgb(0,0,0)",
			bgColour: "rgba(0,0,0,0)",
			padding: 10,
			spacing: 1.2,
			align: "left",
			borderColour: null,
			borderWidth: 0,
         borderDash: [],
         vpadding: undefined,
		};
		return defaultTmd;
	}
};
