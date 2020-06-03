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

// https://www.jsonschemavalidator.net
let base = "http://www.markthepage.com/sequencer/schema/";
let _rgb = "rgb\\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\\)";
let _rgba = "rgba\\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3},(0|1|(0.[0-9]+)|(.[0-9]+))\\)";
let _multiLineText = {
	description: "Multi-line text representation",
	oneOf: [{type: "string"}, {type: "array", items: {type: "string"}}]
};
let _stringEmptyByDefault = {
	type: "string",
	minLength: 0,
	description: "A string that can be empty",
	default: ""
};
let _alias = {
	type: "string",
	description: "The name used to reference the actor in the document",
	minLength: 1
};
let _gapToNext = {
	type: "number",
	description: "The gap in pixels between this actor and the following actor",
	minimum: 0,
	default: 200
};
let _centerAlign = {
	type: "string",
	description: "Whether the text is left or canter aligned",
	enum: ["center", "left"],
	default: "center"
};
let _leftAlign = {
	type: "string",
	description: "Whether the text is left or canter aligned",
	enum: ["center", "left"],
	default: "left"
};
let _line = {
	anyOf: [{$ref: base + "call"}, {$ref: base + "fragment"}]
};
function _bgColour(defValue) {
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
}
function _fgColour(defValue) {
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
}
function _lineColour(defValue) {
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
}
function _borderColour(defValue) {
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
		default: defValue == undefined ? "rgb(0,0,0)" : defValue
	};
}
function _radius(defValue) {
	return {
		type: "number",
		description: "The radius in pixels between for corners",
		minimum: 0,
		default: defValue
	};
}
function _flowWidth(defValue) {
	return {
		type: "number",
		description: "The width in pixels of active flow on the actor timline",
		minimum: 1,
		default: defValue
	};
}
function _borderWidth(defValue) {
	return {
		type: "number",
		description: "The width in pixels of active flow on the actor timline",
		minimum: 1,
		default: defValue == undefined ? 1 : defValue
	};
}
function _lineWidth(defValue) {
	return {
		type: "number",
		description: "The width in pixels of the line",
		minimum: 1,
		default: defValue == undefined ? 1 : defValue
	};
}
function _borderDash(defValue) {
	return {
		type: "array",
		items: {
			type: "string"
		},
		description:
			"An array of numbers indicating the number of pixels drawn followed by number of pixels not drawn on the border (i.e. the gap). If empty, a solid line",
		default: defValue == undefined ? [] : defValue
	};
}
function _lineDash(defValue) {
	return {
		type: "array",
		items: {
			type: "string"
		},
		description:
			"An array of numbers indicating the number of pixels drawn followed by number of pixels not drawn on the line (i.e. the gap). If empty, a solid line",
		default: defValue == undefined ? [4, 2] : defValue
	};
}
function _timelineDash(defValue) {
	return {
		type: "array",
		items: {
			type: "string"
		},
		description: "An array of numbers indicating the number of pixels drawn followed by number of pixels not drawn (i.e. the gap)",
		default: defValue == undefined ? [3, 3] : defValue
	};
}
function _timelineWidth(defValue) {
	return {
		type: "number",
		description: "The width in pixels of the actor timline",
		minimum: 1,
		default: defValue
	};
}
function _fontFamily(defValue) {
	return {
		type: "string",
		minLength: 1,
		description: "A font family supported by the Sequencer. The list of fonts can be found at " + base + "fonts",
		default: defValue
	};
}
function _fontSizePx(defValue) {
	return {
		type: "number",
		description: "The size of the text in pixels",
		minimum: 1,
		default: defValue
	};
}
function _padding(defValue) {
	return {
		type: "number",
		description: "The size of the padding around the text in pixels",
		minimum: 1,
		default: defValue
	};
}
function _spacing(defValue) {
	return {
		type: "number",
		description:
			"The size of the line spacing between lines of text. If a fontSize is 20px, and this value is 1.5, then the gap between baselines will be 30px",
		minimum: 1,
		default: defValue == undefined ? 1 : defValue
	};
}
function _arrowSizeY(defValue) {
	return {
		type: "number",
		description: "The size of arrow above and below the line on the call in pixels",
		minimum: 1,
		default: defValue == undefined ? 5 : defValue
	};
}
function _breakFromFlow(defValue) {
	return {
		type: "boolean",
		description: "Should the flow be broken in the called actor?",
		default: typeof defValue != "boolean" ? false : defValue
	};
}
function _breakToFlow(defValue) {
	return {
		type: "boolean",
		description: "Should the flow be broken from the calling actor?",
		default: typeof defValue != "boolean" ? false : defValue
	};
}
function _async(defValue) {
	return {
		type: "boolean",
		description: "Should the call be asyncronous?",
		default: typeof defValue != "boolean" ? false : defValue
	};
}
let _breakToFlowTrue = {
	type: "boolean",
	description: "Should the flow be broken in the calling actor?",
	default: true
};

let _comment = {
	title: "Comment Schema",
	decription: "Definition of an comment JSON object withing a Sequencer document",
	oneOf: [
		{
			description: "Multi-line text representation",
			oneOf: [{type: "string"}, {type: "array", items: {type: "string"}}]
		},
		{
			type: "object",
			description: "Multi-line text representation with specifics for comment look and feel",
			type: "object",
			properties: {
				fontFamily: _fontFamily("sans-serif"),
				fontSizePx: _fontSizePx(14),
				padding: _padding(15),
				spacing: _spacing(1),
				align: _leftAlign,
				fgColour: _fgColour("rgb(0,0,0"),
				bgColour: _bgColour("rgb(0, 255, 50)"),
				borderColour: _borderColour("rgb(0, 0, 0)"),
				borderWidth: _borderWidth(1),
				borderDash: _borderDash([]),
				lineWidth: _lineWidth(1),
				lineColour: _lineColour("rgb(0,0,0)"),
				lineDash: _lineDash([4, 2]),
				radius: _radius(5),
				foldSizePx: {
					type: "number",
					description: "The size in pixels of the fold on the comment",
					minimum: 0,
					default: 10
				},
				text: _multiLineText
			},
			required: ["text"]
		}
	]
};

///////////////////////
let schema = {
	actor: {
		$schema: "http://json-schema.org/draft-07/schema#",
		$id: base + "actor",
		title: "Actor Schema",
		decription: "Definition of an actor JSON object withing a Sequencer document",
		type: "object",
		properties: {
			name: {
				description: "The presented name of the actor",
				oneOf: [
					{
						type: "string"
					},
					{
						type: "array",
						items: {
							type: "string"
						}
					}
				]
			},
			alias: _alias,
			gapToNext: _gapToNext,
			radius: _radius(5),
			flowWidth: _flowWidth(5),
			timelineWidth: _timelineWidth(1),
			timelineDash: _timelineDash([3, 3]),
			fontFamily: _fontFamily("sans-serif"),
			fontSizePx: _fontSizePx(18),
			padding: _padding(18),
			spacing: _spacing(1.1),
			align: _centerAlign,
			fgColour: _fgColour("rgb(0,0,0)"),
			bgColour: _bgColour("rgb(204,255,153)"),
			borderColour: _borderColour("rgb(0, 0, 0)"),
			borderWidth: _borderWidth(1),
			borderDash: _borderDash([])
		},
		required: ["name", "alias"]
	},
	call: {
		$schema: "http://json-schema.org/draft-07/schema#",
		$id: base + "actor",
		title: "Call Schema",
		decription: "Definition of an Call JSON object withing a Sequencer document",
		type: "object",
		properties: {
			fontFamily: _fontFamily("sans-serif"),
			fontSizePx: _fontSizePx(14),
			fgColour: _fgColour("rgb(0,0,0)"),
			padding: _padding(20),
			spacing: _spacing(1),
			align: _leftAlign,
			borderColour: _borderColour("rgba(255,255,255,0)"),
			borderWidth: _borderWidth(0),
			borderDash: _borderDash([]),
			lineWidth: _lineWidth(1),
			lineColour: _lineColour("rgb(0,0,0)"),
			radius: _radius(5),
			arrowSizeY: _arrowSizeY(5),
			breakFromFlow: _breakFromFlow(false),
			breakToFlow: _breakToFlow(false),
			async: _async(false),
			text: _multiLineText,
			comment: _comment,
			type: {
				type: "string",
				description: 'The type of the object - fixed to "call"',
				const: "call"
			},
			from: {
				type: "string",
				description: "The alias of the actor from which this call is made",
				minLength: 1
			},
			to: {
				type: "string",
				description: "The alias of the actor from which this call is made",
				minLength: 1
			}
		},
		required: ["type", "from", "to", "text"]
	},
	comment: {
		$schema: "http://json-schema.org/draft-07/schema#",
		$id: base + "comment",
		title: "Comment Schema",
		decription: "Definition of an comment JSON object withing a Sequencer document",
		oneOf: _comment.oneOf
	},
	fragment: {
		$schema: "http://json-schema.org/draft-07/schema#",
		$id: base + "comment",
		title: "Fragment Schema",
		decription: "Definition of an fragment JSON object withing a Sequencer document",
		type: "object",
		properties: {
			bgColour: _bgColour("rgb(255,255,255)"),
			borderColour: _borderColour("rgb(0, 0, 0)"),
			borderDash: _borderDash([]),
			borderWidth: _borderWidth(1),
			fragmentType: {
				type: "string"
			},
			title: {
				decription: "The title given to the fragment",
				oneOf: [
					{
						decription: "The title given to the fragment",
						type: "object",
						properties: {
							bgColour: _bgColour("rgba(200,200,0,0.8)"),
							fgColour: _fgColour("rgb(0,0,0)"),
							fontFamily: _fontFamily("sans-serif"),
							fontSizePx: _fontSizePx(14),
							padding: _padding(10),
							spacing: _spacing(1),
							align: _leftAlign,
							borderColour: _borderColour("rgba(255,255,255,0)"),
							borderWidth: _borderWidth(0),
							borderDash: _borderDash([]),
							text: _stringEmptyByDefault
						}
					},
					_stringEmptyByDefault
				]
			},
			condition: {
				decription: "The condition of the first part of the fragment",
				oneOf: [
					{
						decription: "The condition given to the fragment",
						type: "object",
						properties: {
							fontFamily: _fontFamily("sans-serif"),
							fontSizePx: _fontSizePx(14),
							bgColour: _bgColour("rgba(200,200,0,0)"),
							fgColour: _fgColour("rgb(0,0,0)"),
							padding: _padding(10),
							spacing: _spacing(1),
							align: _leftAlign,
							borderColour: _borderColour("rgba(255,255,255,0)"),
							borderWidth: _borderWidth(0),
							borderDash: _borderDash([]),
							text: _stringEmptyByDefault
						}
					},
					_stringEmptyByDefault
				]
			},
			lines: {
				type: "array",
				items: {
					anyOf: [{$ref: base + "call"}, {$ref: base + "fragment"}]
				}
			}
		},
		required: ["type", "fragmentType", "title", "condition", "lines"]
	}
};

module.exports = schema;
