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

const _schemaUtils = require("./schemaUtils.js");
module.exports._comment = {
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
				fontFamily: _schemaUtils._fontFamily("sans-serif"),
				fontSizePx: _schemaUtils._fontSizePx(14),
				padding: _schemaUtils._padding(15),
				spacing: _schemaUtils._spacing(1),
				align: _schemaUtils._leftAlign,
				fgColour: _schemaUtils._fgColour("rgb(0,0,0"),
				bgColour: _schemaUtils._bgColour("rgb(0, 255, 50)"),
				borderColour: _schemaUtils._borderColour("rgb(0, 0, 0)"),
				borderWidth: _schemaUtils._borderWidth(1),
				borderDash: _schemaUtils._borderDash([]),
				lineWidth: _schemaUtils._lineWidth(1),
				lineColour: _schemaUtils._lineColour("rgb(0,0,0)"),
				lineDash: _schemaUtils._lineDash([4, 2]),
				radius: _schemaUtils._radius(5),
				foldSizePx: {
					type: "number",
					description: "The size in pixels of the fold on the comment",
					minimum: 0,
					default: 10
				},
				text: _schemaUtils._multiLineText
			},
			required: ["text"]
		}
	]
};