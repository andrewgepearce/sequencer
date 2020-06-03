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

let _base = "http://www.markthepage.com/sequencer/schema/";
let _rgb = "rgb\\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\\)";
let _rgba = "rgba\\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3},(0|1|(0.[0-9]+)|(.[0-9]+))\\)";
module.exports._base = _base;
module.exports._rgb = _rgb;
module.exports._rgba = _rgba;
module.exports._multiLineText = {
	description: "Multi-line text representation",
	oneOf: [{type: "string"}, {type: "array", items: {type: "string"}}]
};
module.exports._stringEmptyByDefault = {
	type: "string",
	minLength: 0,
	description: "A string that can be empty",
	default: ""
};
module.exports._stringNonEmpty = {
	type: "string",
	minLength: 1,
	description: "A string that cannot be empty"
};
module.exports._alias = {
	type: "string",
	description: "The name used to reference the actor in the document",
	minLength: 1
};
module.exports._gapToNext = {
	type: "number",
	description: "The gap in pixels between this actor and the following actor",
	minimum: 0,
	default: 200
};
module.exports._centerAlign = {
	type: "string",
	description: "Whether the text is left or canter aligned",
	enum: ["center", "left"],
	default: "center"
};
module.exports._leftAlign = {
	type: "string",
	description: "Whether the text is left or canter aligned",
	enum: ["center", "left"],
	default: "left"
};
module.exports._line = {
	anyOf: [{$ref: _base + "call"}, {$ref: _base + "fragment"}]
};
module.exports._breakToFlowTrue = {
	type: "boolean",
	description: "Should the flow be broken in the calling actor?",
	default: true
};
///////////
module.exports._align = function _align(defValue) {
	return {
		type: "string",
		description: "Whether the text is left or center aligned",
		enum: ["center", "left"],
		default: defValue == undefined ? "left" : defValue
	};
};
///////////
module.exports._bgColour = function _bgColour(defValue) {
	return {
		type: "string",
		description: "The background colour of the comment",
		oneOf: [
			{
				pattern: _rgba
			},
			{
				pattern: _rgb
			}
		],
		default: defValue == undefined ? "rgba(255,255,255, 0)" : defValue
	};
};
/////////
module.exports._fgColour = function _fgColour(defValue) {
	return {
		type: "string",
		description: "The foreground colour of the text",
		oneOf: [
			{
				pattern: _rgba
			},
			{
				pattern: _rgb
			}
		],
		default: defValue == undefined ? "rgb(0,0,0)" : defValue
	};
};
/////////
module.exports._lineColour = function _lineColour(defValue) {
	return {
		type: "string",
		description: "The line colour",
		oneOf: [
			{
				pattern: _rgba
			},
			{
				pattern: _rgb
			}
		],
		default: defValue == undefined ? "rgb(0,0,0)" : defValue
	};
};
module.exports._borderColour = function _borderColour(defValue) {
	return {
		type: "string",
		description: "The border colour",
		oneOf: [
			{
				pattern: _rgba
			},
			{
				pattern: _rgb
			}
		],
		default: defValue == undefined || typeof defValue != "string" ? "rgb(0,0,0)" : defValue
	};
};
module.exports._radius = function _radius(defValue) {
	if (defValue != undefined && typeof defValue == "number" && defValue >= 0)
		return {
			type: "number",
			description: "The radius in pixels between for corners",
			minimum: 0,
			default: defValue
		};
	else
		return {
			type: "number",
			description: "The radius in pixels between for corners",
			minimum: 0
		};
};
module.exports._flowWidth = function _flowWidth(defValue) {
	return {
		type: "number",
		description: "The width in pixels of active flow on the actor timline",
		minimum: 1,
		default: defValue
	};
};
module.exports._borderWidth = function _borderWidth(defValue) {
	return {
		type: "number",
		description: "The width in pixels of active flow on the actor timline",
		minimum: 1,
		default: defValue == undefined ? 1 : defValue
	};
};
module.exports._lineWidth = function _lineWidth(defValue) {
	return {
		type: "number",
		description: "The width in pixels of the line",
		minimum: 1,
		default: defValue == undefined ? 1 : defValue
	};
};
module.exports._borderDash = function _borderDash(defValue) {
	return {
		type: "array",
		items: {
			type: "string"
		},
		description:
			"An array of numbers indicating the number of pixels drawn followed by number of pixels not drawn on the border (i.e. the gap). If empty, a solid line",
		default: defValue == undefined ? [] : defValue
	};
};
module.exports._lineDash = function _lineDash(defValue) {
	return {
		type: "array",
		items: {
			type: "string"
		},
		description:
			"An array of numbers indicating the number of pixels drawn followed by number of pixels not drawn on the line (i.e. the gap). If empty, a solid line",
		default: defValue == undefined ? [4, 2] : defValue
	};
};
module.exports._timelineDash = function _timelineDash(defValue) {
	return {
		type: "array",
		items: {
			type: "string"
		},
		description: "An array of numbers indicating the number of pixels drawn followed by number of pixels not drawn (i.e. the gap)",
		default: defValue == undefined ? [3, 3] : defValue
	};
};
module.exports._timelineWidth = function _timelineWidth(defValue) {
	return {
		type: "number",
		description: "The width in pixels of the actor timline",
		minimum: 1,
		default: defValue
	};
};
module.exports._fontFamily = function _fontFamily(defValue) {
	return {
		type: "string",
		minLength: 1,
		description: "A font family supported by the Sequencer. The list of fonts can be found at " + _base + "fonts",
		default: defValue
	};
};
module.exports._fontSizePx = function _fontSizePx(defValue) {
	return {
		type: "number",
		description: "The size of the text in pixels",
		minimum: 1,
		default: defValue
	};
};
module.exports._padding = function _padding(defValue) {
	return {
		type: "number",
		description: "The size of the padding around the text in pixels",
		minimum: 1,
		default: defValue
	};
};
module.exports._spacing = function _spacing(defValue) {
	return {
		type: "number",
		description:
			"The size of the line spacing between lines of text. If a fontSize is 20px, and this value is 1.5, then the gap between baselines will be 30px",
		minimum: 1,
		default: defValue == undefined ? 1 : defValue
	};
};
module.exports._arrowSizeY = function _arrowSizeY(defValue) {
	return {
		type: "number",
		description: "The size of arrow above and below the line on the call in pixels",
		minimum: 1,
		default: defValue == undefined ? 5 : defValue
	};
};
module.exports._breakFromFlow = function _breakFromFlow(defValue) {
	return {
		type: "boolean",
		description: "Should the flow be broken in the called actor?",
		default: typeof defValue != "boolean" ? false : defValue
	};
};
module.exports._breakToFlow = function _breakToFlow(defValue) {
	return {
		type: "boolean",
		description: "Should the flow be broken from the calling actor?",
		default: typeof defValue != "boolean" ? false : defValue
	};
};
module.exports._async = function _async(defValue) {
	return {
		type: "boolean",
		description: "Should the call be asyncronous?",
		default: typeof defValue != "boolean" ? false : defValue
	};
};
module.exports._trWidth = function _trWidth(defValue) {
	if (defValue == undefined || typeof defValue != "number" || defValue < 0)
		return {
			type: "number",
			description: "The width of the text rectangle, may be undefined in which case width is to fit text"
		};
	else
		return {
			type: "number",
			description: "The width of the text rectangle",
			default: defValue
		};
};
module.exports._trHeight = function _trHeight(defValue) {
	if (defValue == undefined || typeof defValue != "number" || defValue < 0)
		return {
			type: "number",
			description: "The height of the text rectangle, may be undefined in which case height is to fit text"
		};
	else
		return {
			type: "number",
			description: "The height of the text rectangle, may be undefined in which case height is to fit text",
			default: defValue
		};
};
module.exports._boolean = function _boolean(defValue, description) {
	let ret = {
		type: "boolean"
	};
	if (description != undefined && typeof description == "string") {
		ret.description = description;
	}
	if (defValue != undefined && typeof defValue == "boolean") {
		ret.default = defValue;
	}
	return ret;
};

module.exports._extendPropertiesWithTextMetadata = function _extendPropertiesWithTextMetadata(propertiesObject, textMetaData) {
	if (typeof propertiesObject != "object") return propertiesObject;
	if (typeof textMetaData != "object") return propertiesObject;
	// TODO check for missing values from TMD
	propertiesObject.fontFamily = this._fontFamily(textMetaData.fontFamily);
	propertiesObject.fontSizePx = this._fontSizePx(textMetaData.fontSizePx);
	propertiesObject.fgColour = this._fgColour(textMetaData.fgColour);
	propertiesObject.padding = this._padding(textMetaData.padding);
	propertiesObject.spacing = this._spacing(textMetaData.spacing);
	propertiesObject.align = this._align(textMetaData.align);
	propertiesObject.borderColour = this._borderColour(textMetaData.borderColour);
	propertiesObject.borderWidth = this._borderWidth(textMetaData.borderWidth);
	propertiesObject.borderDash = this._borderDash(textMetaData.borderDash);
	propertiesObject.lineWidth = this._lineWidth(textMetaData.lineWidth);
	propertiesObject.lineColour = this._lineColour(textMetaData.lineColour);
	return propertiesObject;
};

module.exports._extendPropertiesWithTextRectangle = function _extendPropertiesWithTextRectangle(
	propertiesObject,
	textMetaData,
	widthDefValue,
	heightDefValue,
	cornerRadiusDefValue,
	borderTopDefValue,
	borderRightDefValue,
	borderBottomDefValue,
	borderLeftDefValue
) {
	if (typeof propertiesObject != "object") return propertiesObject;
	if (typeof textMetaData != "object") return propertiesObject;
	propertiesObject = this._extendPropertiesWithTextMetadata(propertiesObject, textMetaData);
	propertiesObject.width = this._trWidth(widthDefValue);
	propertiesObject.height = this._trHeight(heightDefValue);
	propertiesObject.cornerRedius = this._radius(cornerRadiusDefValue);
	propertiesObject.drawTopBorder = this._boolean(borderTopDefValue, "Should the top border be drawn for the text rectangle");
	propertiesObject.drawRightBorder = this._boolean(borderRightDefValue, "Should the right border be drawn for the text rectangle");
	propertiesObject.drawBottomBorder = this._boolean(borderBottomDefValue, "Should the bottom border be drawn for the text rectangle");
	propertiesObject.drawLeftBorder = this._boolean(borderLeftDefValue, "Should the left border be drawn for the text rectangle");
	return propertiesObject;
};
